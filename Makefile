export PATH := $(HOME)/.local/go/bin:$(HOME)/go/bin:$(PATH)

.PHONY: db db-down migrate seed api web tidy doctor lint help

help:
	@echo "Targets: db, db-down, migrate, seed, api, web, tidy, lint, doctor"

lint:
	cd apps/web && npm run lint
	cd apps/api && go vet ./...

doctor:
	cd apps/web && npm run doctor

db:
	docker compose up -d db

db-down:
	docker compose down

migrate:
	cd apps/api && go run ./cmd/migrate

seed:
	cd apps/api && go run ./cmd/seed

api:
	cd apps/api && go run ./cmd/server

web:
	cd apps/web && npm run dev

tidy:
	cd apps/api && go mod tidy
