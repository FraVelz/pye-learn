package config

import (
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port         string
	DatabaseURL  string
	JWTSecret    string
	CORSOrigins  []string
	CookieSecure bool
	CookieSameSite http.SameSite
}

func Load() Config {
	_ = godotenv.Load()
	_ = godotenv.Load("../../.env")

	origins := strings.Split(env("CORS_ORIGINS", "http://localhost:5173"), ",")
	for i := range origins {
		origins[i] = strings.TrimSpace(origins[i])
	}

	sameSite := http.SameSiteLaxMode
	switch strings.ToLower(env("COOKIE_SAMESITE", "lax")) {
	case "none":
		sameSite = http.SameSiteNoneMode
	case "strict":
		sameSite = http.SameSiteStrictMode
	}

	secure := envBool("COOKIE_SECURE", false)
	if sameSite == http.SameSiteNoneMode {
		secure = true
	}

	return Config{
		Port:           env("PORT", "8080"),
		DatabaseURL:    env("DATABASE_URL", "postgres://pye:pye@localhost:5432/pye_learn?sslmode=disable"),
		JWTSecret:      env("JWT_SECRET", "dev-secret-change-me"),
		CORSOrigins:    origins,
		CookieSecure:   secure,
		CookieSameSite: sameSite,
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func envBool(key string, fallback bool) bool {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return fallback
	}
	return b
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
