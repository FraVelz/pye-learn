package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/somospye/pye-learn/apps/api/internal/config"
	"github.com/somospye/pye-learn/apps/api/internal/db"
	"github.com/somospye/pye-learn/apps/api/internal/handlers"
	"github.com/somospye/pye-learn/apps/api/internal/httpx"
	"github.com/somospye/pye-learn/apps/api/internal/middleware"
	"github.com/somospye/pye-learn/apps/api/internal/store"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	api := &handlers.API{Store: store.New(pool), JWTSecret: cfg.JWTSecret}

	r := chi.NewRouter()
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: cfg.CORSOrigins,
		AllowOriginFunc: func(r *http.Request, origin string) bool {
			for _, o := range cfg.CORSOrigins {
				if o == "*" || o == origin {
					return true
				}
			}
			return strings.HasSuffix(origin, ".vercel.app")
		},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/auth/register", api.Register)
		r.Post("/auth/login", api.Login)

		r.Group(func(r chi.Router) {
			r.Use(middleware.JWT(cfg.JWTSecret))
			r.Get("/auth/me", api.Me)
			r.Get("/me/enrollments", api.MyEnrollments)
			r.Post("/courses/{id}/enroll", api.Enroll)
			r.Get("/lessons/{id}", api.GetLesson)
			r.Post("/lessons/{id}/complete", api.CompleteLesson)
		})

		r.With(middleware.OptionalJWT(cfg.JWTSecret)).Get("/courses", api.ListCourses)
		r.With(middleware.OptionalJWT(cfg.JWTSecret)).Get("/courses/{slug}", api.GetCourse)

		r.Route("/admin", func(r chi.Router) {
			r.Use(middleware.JWT(cfg.JWTSecret))
			r.Use(middleware.RequireAdmin)
			r.Post("/courses", api.AdminCreateCourse)
			r.Patch("/courses/{id}", api.AdminUpdateCourse)
			r.Post("/modules", api.AdminCreateModule)
			r.Post("/lessons", api.AdminCreateLesson)
		})
	})

	srv := &http.Server{Addr: ":" + cfg.Port, Handler: r}
	go func() {
		log.Printf("api listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdownCtx)
}
