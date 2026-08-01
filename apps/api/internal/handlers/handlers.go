package handlers

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/FraVelz/pye-learn/apps/api/internal/auth"
	"github.com/FraVelz/pye-learn/apps/api/internal/httpx"
	"github.com/FraVelz/pye-learn/apps/api/internal/middleware"
	"github.com/FraVelz/pye-learn/apps/api/internal/models"
	"github.com/FraVelz/pye-learn/apps/api/internal/store"
)

type API struct {
	Store          *store.Store
	JWTSecret      string
	CookieSecure   bool
	CookieSameSite http.SameSite
}

func (a *API) cookieOpts(maxAge time.Duration) auth.CookieOpts {
	return auth.CookieOpts{
		Secure:   a.CookieSecure,
		SameSite: a.CookieSameSite,
		MaxAge:   maxAge,
	}
}

const sessionTTL = 72 * time.Hour

type registerReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (a *API) Register(w http.ResponseWriter, r *http.Request) {
	var req registerReq
	if err := httpx.Decode(r, &req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid body")
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Name = strings.TrimSpace(req.Name)
	if req.Email == "" || len(req.Password) < 6 || req.Name == "" {
		httpx.Error(w, http.StatusBadRequest, "email, name and password (min 6) required")
		return
	}
	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not hash password")
		return
	}
	u, err := a.Store.CreateUser(r.Context(), req.Email, hash, req.Name, "student")
	if err != nil {
		httpx.Error(w, http.StatusConflict, "email already registered")
		return
	}
	token, err := auth.IssueToken(a.JWTSecret, u.ID, u.Email, u.Role, sessionTTL)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not issue token")
		return
	}
	auth.SetSessionCookie(w, token, a.cookieOpts(sessionTTL))
	httpx.JSON(w, http.StatusCreated, map[string]any{"user": u})
}

func (a *API) Login(w http.ResponseWriter, r *http.Request) {
	var req loginReq
	if err := httpx.Decode(r, &req); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid body")
		return
	}
	u, err := a.Store.GetUserByEmail(r.Context(), strings.TrimSpace(strings.ToLower(req.Email)))
	if err != nil || !auth.CheckPassword(u.PasswordHash, req.Password) {
		httpx.Error(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	token, err := auth.IssueToken(a.JWTSecret, u.ID, u.Email, u.Role, sessionTTL)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not issue token")
		return
	}
	auth.SetSessionCookie(w, token, a.cookieOpts(sessionTTL))
	httpx.JSON(w, http.StatusOK, map[string]any{"user": u})
}

func (a *API) Logout(w http.ResponseWriter, r *http.Request) {
	auth.ClearSessionCookie(w, a.cookieOpts(0))
	httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (a *API) Me(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFrom(r.Context())
	if !ok {
		httpx.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	u, err := a.Store.GetUserByID(r.Context(), claims.UserID)
	if err != nil {
		httpx.Error(w, http.StatusNotFound, "user not found")
		return
	}
	httpx.JSON(w, http.StatusOK, u)
}

func (a *API) ListCourses(w http.ResponseWriter, r *http.Request) {
	courses, err := a.Store.ListPublishedCourses(r.Context())
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not list courses")
		return
	}
	if courses == nil {
		courses = []models.Course{}
	}
	httpx.JSON(w, http.StatusOK, courses)
}

func (a *API) GetCourse(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	c, err := a.Store.GetCourseBySlug(r.Context(), slug)
	if errors.Is(err, store.ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "course not found")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not load course")
		return
	}
	if !c.IsPublished {
		claims, ok := middleware.ClaimsFrom(r.Context())
		if !ok || claims.Role != "admin" {
			httpx.Error(w, http.StatusNotFound, "course not found")
			return
		}
	}
	if claims, ok := middleware.ClaimsFrom(r.Context()); ok {
		enrolled, _ := a.Store.IsEnrolled(r.Context(), claims.UserID, c.ID)
		c.Enrolled = &enrolled
		if enrolled {
			done, _ := a.Store.CompletedLessonIDs(r.Context(), claims.UserID, c.ID)
			for i := range c.Modules {
				for j := range c.Modules[i].Lessons {
					v := done[c.Modules[i].Lessons[j].ID]
					c.Modules[i].Lessons[j].Completed = &v
				}
			}
		}
	}
	httpx.JSON(w, http.StatusOK, c)
}

func (a *API) Enroll(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFrom(r.Context())
	if !ok {
		httpx.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid course id")
		return
	}
	c, err := a.Store.GetCourseByID(r.Context(), id)
	if errors.Is(err, store.ErrNotFound) || !c.IsPublished {
		httpx.Error(w, http.StatusNotFound, "course not found")
		return
	}
	if err := a.Store.Enroll(r.Context(), claims.UserID, id); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not enroll")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]string{"status": "enrolled"})
}

func (a *API) MyEnrollments(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFrom(r.Context())
	if !ok {
		httpx.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	list, err := a.Store.ListEnrollments(r.Context(), claims.UserID)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not list enrollments")
		return
	}
	if list == nil {
		list = []models.Enrollment{}
	}
	httpx.JSON(w, http.StatusOK, list)
}

func (a *API) CompleteLesson(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFrom(r.Context())
	if !ok {
		httpx.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	lessonID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid lesson id")
		return
	}
	courseID, err := a.Store.CourseIDForLesson(r.Context(), lessonID)
	if errors.Is(err, store.ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "lesson not found")
		return
	}
	enrolled, err := a.Store.IsEnrolled(r.Context(), claims.UserID, courseID)
	if err != nil || !enrolled {
		httpx.Error(w, http.StatusForbidden, "enroll in the course first")
		return
	}
	if err := a.Store.CompleteLesson(r.Context(), claims.UserID, lessonID); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not complete lesson")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]string{"status": "completed"})
}

func (a *API) GetLesson(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFrom(r.Context())
	if !ok {
		httpx.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	lessonID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid lesson id")
		return
	}
	l, err := a.Store.GetLesson(r.Context(), lessonID)
	if errors.Is(err, store.ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "lesson not found")
		return
	}
	courseID, err := a.Store.CourseIDForLesson(r.Context(), lessonID)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not resolve course")
		return
	}
	enrolled, _ := a.Store.IsEnrolled(r.Context(), claims.UserID, courseID)
	if !enrolled && claims.Role != "admin" {
		httpx.Error(w, http.StatusForbidden, "enroll in the course first")
		return
	}
	done, _ := a.Store.LessonCompleted(r.Context(), claims.UserID, lessonID)
	l.Completed = &done
	httpx.JSON(w, http.StatusOK, l)
}

func (a *API) AdminCreateCourse(w http.ResponseWriter, r *http.Request) {
	var c models.Course
	if err := httpx.Decode(r, &c); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid body")
		return
	}
	if c.Slug == "" || c.Title == "" {
		httpx.Error(w, http.StatusBadRequest, "slug and title required")
		return
	}
	out, err := a.Store.CreateCourse(r.Context(), c)
	if err != nil {
		httpx.Error(w, http.StatusConflict, "could not create course")
		return
	}
	httpx.JSON(w, http.StatusCreated, out)
}

func (a *API) AdminUpdateCourse(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	var c models.Course
	if err := httpx.Decode(r, &c); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid body")
		return
	}
	out, err := a.Store.UpdateCourse(r.Context(), id, c)
	if errors.Is(err, store.ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "course not found")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not update course")
		return
	}
	httpx.JSON(w, http.StatusOK, out)
}

func (a *API) AdminCreateModule(w http.ResponseWriter, r *http.Request) {
	var m models.Module
	if err := httpx.Decode(r, &m); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid body")
		return
	}
	out, err := a.Store.CreateModule(r.Context(), m)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not create module")
		return
	}
	httpx.JSON(w, http.StatusCreated, out)
}

func (a *API) AdminCreateLesson(w http.ResponseWriter, r *http.Request) {
	var l models.Lesson
	if err := httpx.Decode(r, &l); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid body")
		return
	}
	out, err := a.Store.CreateLesson(r.Context(), l)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not create lesson")
		return
	}
	httpx.JSON(w, http.StatusCreated, out)
}
