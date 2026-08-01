package main

import (
	"context"
	"log"
	"os"
	"path/filepath"

	"github.com/FraVelz/pye-learn/apps/api/internal/config"
	"github.com/FraVelz/pye-learn/apps/api/internal/db"
	"github.com/FraVelz/pye-learn/apps/api/internal/migrate"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()
	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	dir := os.Getenv("MIGRATIONS_DIR")
	if dir == "" {
		dir = filepath.Join("migrations")
		if _, err := os.Stat(dir); err != nil {
			dir = filepath.Join("apps", "api", "migrations")
		}
	}
	if err := migrate.Up(ctx, pool, dir); err != nil {
		log.Fatal(err)
	}
	log.Println("migrations ok")
}
