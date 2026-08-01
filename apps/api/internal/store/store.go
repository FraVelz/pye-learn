package store

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/FraVelz/pye-learn/apps/api/internal/models"
)

var ErrNotFound = errors.New("not found")
var ErrConflict = errors.New("conflict")

type Store struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

func (s *Store) CreateUser(ctx context.Context, email, hash, name, role string) (models.User, error) {
	var u models.User
	err := s.pool.QueryRow(ctx, `
		INSERT INTO users (email, password_hash, name, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id, email, password_hash, name, role, created_at
	`, email, hash, name, role).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Name, &u.Role, &u.CreatedAt)
	if err != nil {
		return u, fmt.Errorf("create user: %w", err)
	}
	return u, nil
}

func (s *Store) GetUserByEmail(ctx context.Context, email string) (models.User, error) {
	var u models.User
	err := s.pool.QueryRow(ctx, `
		SELECT id, email, password_hash, name, role, created_at FROM users WHERE email = $1
	`, email).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Name, &u.Role, &u.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return u, ErrNotFound
	}
	return u, err
}

func (s *Store) GetUserByID(ctx context.Context, id uuid.UUID) (models.User, error) {
	var u models.User
	err := s.pool.QueryRow(ctx, `
		SELECT id, email, password_hash, name, role, created_at FROM users WHERE id = $1
	`, id).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Name, &u.Role, &u.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return u, ErrNotFound
	}
	return u, err
}

func (s *Store) ListPublishedCourses(ctx context.Context) ([]models.Course, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, slug, title, description, thumbnail_url, duration_minutes, is_published, is_free, created_at
		FROM courses WHERE is_published = true ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Course
	for rows.Next() {
		var c models.Course
		if err := rows.Scan(&c.ID, &c.Slug, &c.Title, &c.Description, &c.ThumbnailURL, &c.DurationMinutes, &c.IsPublished, &c.IsFree, &c.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

func (s *Store) GetCourseBySlug(ctx context.Context, slug string) (models.Course, error) {
	var c models.Course
	err := s.pool.QueryRow(ctx, `
		SELECT id, slug, title, description, thumbnail_url, duration_minutes, is_published, is_free, created_at
		FROM courses WHERE slug = $1
	`, slug).Scan(&c.ID, &c.Slug, &c.Title, &c.Description, &c.ThumbnailURL, &c.DurationMinutes, &c.IsPublished, &c.IsFree, &c.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return c, ErrNotFound
	}
	if err != nil {
		return c, err
	}
	mods, err := s.listModules(ctx, c.ID)
	if err != nil {
		return c, err
	}
	c.Modules = mods
	return c, nil
}

func (s *Store) GetCourseByID(ctx context.Context, id uuid.UUID) (models.Course, error) {
	var c models.Course
	err := s.pool.QueryRow(ctx, `
		SELECT id, slug, title, description, thumbnail_url, duration_minutes, is_published, is_free, created_at
		FROM courses WHERE id = $1
	`, id).Scan(&c.ID, &c.Slug, &c.Title, &c.Description, &c.ThumbnailURL, &c.DurationMinutes, &c.IsPublished, &c.IsFree, &c.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return c, ErrNotFound
	}
	return c, err
}

func (s *Store) listModules(ctx context.Context, courseID uuid.UUID) ([]models.Module, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, course_id, title, position FROM modules WHERE course_id = $1 ORDER BY position
	`, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var mods []models.Module
	for rows.Next() {
		var m models.Module
		if err := rows.Scan(&m.ID, &m.CourseID, &m.Title, &m.Position); err != nil {
			return nil, err
		}
		lessons, err := s.listLessons(ctx, m.ID)
		if err != nil {
			return nil, err
		}
		m.Lessons = lessons
		mods = append(mods, m)
	}
	return mods, rows.Err()
}

func (s *Store) listLessons(ctx context.Context, moduleID uuid.UUID) ([]models.Lesson, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, module_id, title, content_md, video_url, position, duration_minutes
		FROM lessons WHERE module_id = $1 ORDER BY position
	`, moduleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var lessons []models.Lesson
	for rows.Next() {
		var l models.Lesson
		if err := rows.Scan(&l.ID, &l.ModuleID, &l.Title, &l.ContentMD, &l.VideoURL, &l.Position, &l.DurationMinutes); err != nil {
			return nil, err
		}
		lessons = append(lessons, l)
	}
	return lessons, rows.Err()
}

func (s *Store) GetLesson(ctx context.Context, id uuid.UUID) (models.Lesson, error) {
	var l models.Lesson
	err := s.pool.QueryRow(ctx, `
		SELECT id, module_id, title, content_md, video_url, position, duration_minutes
		FROM lessons WHERE id = $1
	`, id).Scan(&l.ID, &l.ModuleID, &l.Title, &l.ContentMD, &l.VideoURL, &l.Position, &l.DurationMinutes)
	if errors.Is(err, pgx.ErrNoRows) {
		return l, ErrNotFound
	}
	return l, err
}

func (s *Store) Enroll(ctx context.Context, userID, courseID uuid.UUID) error {
	_, err := s.pool.Exec(ctx, `
		INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`, userID, courseID)
	return err
}

func (s *Store) IsEnrolled(ctx context.Context, userID, courseID uuid.UUID) (bool, error) {
	var exists bool
	err := s.pool.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2)
	`, userID, courseID).Scan(&exists)
	return exists, err
}

func (s *Store) ListEnrollments(ctx context.Context, userID uuid.UUID) ([]models.Enrollment, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT e.user_id, e.course_id, e.enrolled_at,
		       c.id, c.slug, c.title, c.description, c.thumbnail_url, c.duration_minutes, c.is_published, c.is_free, c.created_at
		FROM enrollments e
		JOIN courses c ON c.id = e.course_id
		WHERE e.user_id = $1
		ORDER BY e.enrolled_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Enrollment
	for rows.Next() {
		var e models.Enrollment
		var c models.Course
		if err := rows.Scan(&e.UserID, &e.CourseID, &e.EnrolledAt,
			&c.ID, &c.Slug, &c.Title, &c.Description, &c.ThumbnailURL, &c.DurationMinutes, &c.IsPublished, &c.IsFree, &c.CreatedAt); err != nil {
			return nil, err
		}
		e.Course = &c
		out = append(out, e)
	}
	return out, rows.Err()
}

func (s *Store) CompleteLesson(ctx context.Context, userID, lessonID uuid.UUID) error {
	_, err := s.pool.Exec(ctx, `
		INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at)
		VALUES ($1, $2, true, now())
		ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed = true, completed_at = now()
	`, userID, lessonID)
	return err
}

func (s *Store) LessonCompleted(ctx context.Context, userID, lessonID uuid.UUID) (bool, error) {
	var ok bool
	err := s.pool.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2 AND completed = true)
	`, userID, lessonID).Scan(&ok)
	return ok, err
}

func (s *Store) CompletedLessonIDs(ctx context.Context, userID uuid.UUID, courseID uuid.UUID) (map[uuid.UUID]bool, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT lp.lesson_id
		FROM lesson_progress lp
		JOIN lessons l ON l.id = lp.lesson_id
		JOIN modules m ON m.id = l.module_id
		WHERE lp.user_id = $1 AND m.course_id = $2 AND lp.completed = true
	`, userID, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[uuid.UUID]bool{}
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		out[id] = true
	}
	return out, rows.Err()
}

func (s *Store) CreateCourse(ctx context.Context, c models.Course) (models.Course, error) {
	err := s.pool.QueryRow(ctx, `
		INSERT INTO courses (slug, title, description, thumbnail_url, duration_minutes, is_published, is_free)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, slug, title, description, thumbnail_url, duration_minutes, is_published, is_free, created_at
	`, c.Slug, c.Title, c.Description, c.ThumbnailURL, c.DurationMinutes, c.IsPublished, c.IsFree).
		Scan(&c.ID, &c.Slug, &c.Title, &c.Description, &c.ThumbnailURL, &c.DurationMinutes, &c.IsPublished, &c.IsFree, &c.CreatedAt)
	return c, err
}

func (s *Store) UpdateCourse(ctx context.Context, id uuid.UUID, c models.Course) (models.Course, error) {
	err := s.pool.QueryRow(ctx, `
		UPDATE courses SET slug=$2, title=$3, description=$4, thumbnail_url=$5,
		duration_minutes=$6, is_published=$7, is_free=$8
		WHERE id=$1
		RETURNING id, slug, title, description, thumbnail_url, duration_minutes, is_published, is_free, created_at
	`, id, c.Slug, c.Title, c.Description, c.ThumbnailURL, c.DurationMinutes, c.IsPublished, c.IsFree).
		Scan(&c.ID, &c.Slug, &c.Title, &c.Description, &c.ThumbnailURL, &c.DurationMinutes, &c.IsPublished, &c.IsFree, &c.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return c, ErrNotFound
	}
	return c, err
}

func (s *Store) CreateModule(ctx context.Context, m models.Module) (models.Module, error) {
	err := s.pool.QueryRow(ctx, `
		INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3)
		RETURNING id, course_id, title, position
	`, m.CourseID, m.Title, m.Position).Scan(&m.ID, &m.CourseID, &m.Title, &m.Position)
	return m, err
}

func (s *Store) CreateLesson(ctx context.Context, l models.Lesson) (models.Lesson, error) {
	err := s.pool.QueryRow(ctx, `
		INSERT INTO lessons (module_id, title, content_md, video_url, position, duration_minutes)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, module_id, title, content_md, video_url, position, duration_minutes
	`, l.ModuleID, l.Title, l.ContentMD, l.VideoURL, l.Position, l.DurationMinutes).
		Scan(&l.ID, &l.ModuleID, &l.Title, &l.ContentMD, &l.VideoURL, &l.Position, &l.DurationMinutes)
	return l, err
}

func (s *Store) CourseIDForLesson(ctx context.Context, lessonID uuid.UUID) (uuid.UUID, error) {
	var id uuid.UUID
	err := s.pool.QueryRow(ctx, `
		SELECT m.course_id FROM lessons l
		JOIN modules m ON m.id = l.module_id
		WHERE l.id = $1
	`, lessonID).Scan(&id)
	if errors.Is(err, pgx.ErrNoRows) {
		return id, ErrNotFound
	}
	return id, err
}
