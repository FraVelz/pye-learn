package main

import (
	"context"
	"log"

	"github.com/FraVelz/pye-learn/apps/api/internal/auth"
	"github.com/FraVelz/pye-learn/apps/api/internal/config"
	"github.com/FraVelz/pye-learn/apps/api/internal/db"
	"github.com/FraVelz/pye-learn/apps/api/internal/models"
	"github.com/FraVelz/pye-learn/apps/api/internal/store"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()
	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()
	s := store.New(pool)

	adminHash, err := auth.HashPassword("admin123")
	if err != nil {
		log.Fatal(err)
	}
	if _, err := s.GetUserByEmail(ctx, "admin@pye.local"); err != nil {
		if _, err := s.CreateUser(ctx, "admin@pye.local", adminHash, "Admin PyE", "admin"); err != nil {
			log.Fatal(err)
		}
		log.Println("created admin@pye.local / admin123")
	}

	studentHash, _ := auth.HashPassword("student123")
	if _, err := s.GetUserByEmail(ctx, "student@pye.local"); err != nil {
		if _, err := s.CreateUser(ctx, "student@pye.local", studentHash, "Estudiante Demo", "student"); err != nil {
			log.Fatal(err)
		}
		log.Println("created student@pye.local / student123")
	}

	if _, err := s.GetCourseBySlug(ctx, "go-desde-cero"); err == nil {
		log.Println("seed already present")
		return
	}

	goCourse, err := s.CreateCourse(ctx, models.Course{
		Slug:            "go-desde-cero",
		Title:           "Go desde cero",
		Description:     "Aprende los fundamentos de Go con ejercicios prácticos orientados a APIs.",
		ThumbnailURL:    "",
		DurationMinutes: 120,
		IsPublished:     true,
		IsFree:          true,
	})
	if err != nil {
		log.Fatal(err)
	}
	m1, err := s.CreateModule(ctx, models.Module{CourseID: goCourse.ID, Title: "Fundamentos", Position: 1})
	if err != nil {
		log.Fatal(err)
	}
	_, _ = s.CreateLesson(ctx, models.Lesson{
		ModuleID: m1.ID, Title: "Hola mundo y tooling", Position: 1, DurationMinutes: 15,
		ContentMD: "# Hola mundo\n\nInstala Go, crea un módulo y ejecuta tu primer programa.\n\n```bash\ngo mod init example\ngo run .\n```\n",
	})
	_, _ = s.CreateLesson(ctx, models.Lesson{
		ModuleID: m1.ID, Title: "Structs y métodos", Position: 2, DurationMinutes: 20,
		ContentMD: "# Structs\n\nModela datos con structs y adjunta comportamiento con métodos.\n",
	})
	m2, _ := s.CreateModule(ctx, models.Module{CourseID: goCourse.ID, Title: "HTTP", Position: 2})
	_, _ = s.CreateLesson(ctx, models.Lesson{
		ModuleID: m2.ID, Title: "Handlers y routing", Position: 1, DurationMinutes: 25,
		ContentMD: "# HTTP\n\nUsa `net/http` o chi para exponer endpoints REST.\n",
	})

	reactCourse, err := s.CreateCourse(ctx, models.Course{
		Slug:            "react-practico",
		Title:           "React práctico",
		Description:     "Construye interfaces modernas con React, routing y consumo de APIs.",
		DurationMinutes: 90,
		IsPublished:     true,
		IsFree:          true,
	})
	if err != nil {
		log.Fatal(err)
	}
	rm, _ := s.CreateModule(ctx, models.Module{CourseID: reactCourse.ID, Title: "Componentes", Position: 1})
	_, _ = s.CreateLesson(ctx, models.Lesson{
		ModuleID: rm.ID, Title: "JSX y estado", Position: 1, DurationMinutes: 18,
		ContentMD: "# JSX y estado\n\nComponentes funcionales, props y `useState`.\n",
	})
	_, _ = s.CreateLesson(ctx, models.Lesson{
		ModuleID: rm.ID, Title: "Fetch a tu API", Position: 2, DurationMinutes: 22,
		ContentMD: "# Fetch\n\nConsume endpoints REST con `fetch` y maneja loading/error.\n",
	})

	sqlCourse, err := s.CreateCourse(ctx, models.Course{
		Slug:            "postgres-para-devs",
		Title:           "Postgres para devs",
		Description:     "Modelado, migraciones y consultas esenciales para backends reales.",
		DurationMinutes: 75,
		IsPublished:     true,
		IsFree:          true,
	})
	if err != nil {
		log.Fatal(err)
	}
	sm, _ := s.CreateModule(ctx, models.Module{CourseID: sqlCourse.ID, Title: "Esquema", Position: 1})
	_, _ = s.CreateLesson(ctx, models.Lesson{
		ModuleID: sm.ID, Title: "Tablas y relaciones", Position: 1, DurationMinutes: 20,
		ContentMD: "# Tablas\n\nPrimary keys, foreign keys e índices.\n",
	})

	log.Println("seed ok")
}
