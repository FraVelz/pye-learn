package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Name         string    `json:"name"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
}

type Course struct {
	ID              uuid.UUID `json:"id"`
	Slug            string    `json:"slug"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	ThumbnailURL    string    `json:"thumbnail_url"`
	DurationMinutes int       `json:"duration_minutes"`
	IsPublished     bool      `json:"is_published"`
	IsFree          bool      `json:"is_free"`
	CreatedAt       time.Time `json:"created_at"`
	Modules         []Module  `json:"modules,omitempty"`
	Enrolled        *bool     `json:"enrolled,omitempty"`
}

type Module struct {
	ID       uuid.UUID `json:"id"`
	CourseID uuid.UUID `json:"course_id"`
	Title    string    `json:"title"`
	Position int       `json:"position"`
	Lessons  []Lesson  `json:"lessons,omitempty"`
}

type Lesson struct {
	ID              uuid.UUID `json:"id"`
	ModuleID        uuid.UUID `json:"module_id"`
	Title           string    `json:"title"`
	ContentMD       string    `json:"content_md"`
	VideoURL        string    `json:"video_url"`
	Position        int       `json:"position"`
	DurationMinutes int       `json:"duration_minutes"`
	Completed       *bool     `json:"completed,omitempty"`
}

type Enrollment struct {
	UserID     uuid.UUID `json:"user_id"`
	CourseID   uuid.UUID `json:"course_id"`
	EnrolledAt time.Time `json:"enrolled_at"`
	Course     *Course   `json:"course,omitempty"`
}
