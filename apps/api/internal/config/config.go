package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
	CORSOrigins []string
}

func Load() Config {
	_ = godotenv.Load()
	_ = godotenv.Load("../../.env")

	origins := strings.Split(env("CORS_ORIGINS", "http://localhost:5173"), ",")
	for i := range origins {
		origins[i] = strings.TrimSpace(origins[i])
	}

	return Config{
		Port:        env("PORT", "8080"),
		DatabaseURL: env("DATABASE_URL", "postgres://pye:pye@localhost:5432/pye_learn?sslmode=disable"),
		JWTSecret:   env("JWT_SECRET", "dev-secret-change-me"),
		CORSOrigins: origins,
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func EnvInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return n
}
