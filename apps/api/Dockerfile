FROM golang:1.25-bookworm AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /bin/server ./cmd/server \
 && CGO_ENABLED=0 go build -o /bin/migrate ./cmd/migrate \
 && CGO_ENABLED=0 go build -o /bin/seed ./cmd/seed

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /bin/server /bin/migrate /bin/seed /app/
COPY migrations /app/migrations
COPY scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENV PORT=8080
ENV MIGRATIONS_DIR=/app/migrations
EXPOSE 8080
CMD ["/app/entrypoint.sh"]
