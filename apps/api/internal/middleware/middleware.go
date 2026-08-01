package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/somospye/pye-learn/apps/api/internal/auth"
	"github.com/somospye/pye-learn/apps/api/internal/httpx"
)

type ctxKey string

const ClaimsKey ctxKey = "claims"

func WithClaims(ctx context.Context, c *auth.Claims) context.Context {
	return context.WithValue(ctx, ClaimsKey, c)
}

func ClaimsFrom(ctx context.Context) (*auth.Claims, bool) {
	c, ok := ctx.Value(ClaimsKey).(*auth.Claims)
	return c, ok
}

func JWT(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := r.Header.Get("Authorization")
			if !strings.HasPrefix(h, "Bearer ") {
				httpx.Error(w, http.StatusUnauthorized, "missing bearer token")
				return
			}
			claims, err := auth.ParseToken(secret, strings.TrimPrefix(h, "Bearer "))
			if err != nil {
				httpx.Error(w, http.StatusUnauthorized, "invalid token")
				return
			}
			next.ServeHTTP(w, r.WithContext(WithClaims(r.Context(), claims)))
		})
	}
}

func OptionalJWT(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := r.Header.Get("Authorization")
			if strings.HasPrefix(h, "Bearer ") {
				if claims, err := auth.ParseToken(secret, strings.TrimPrefix(h, "Bearer ")); err == nil {
					r = r.WithContext(WithClaims(r.Context(), claims))
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}

func RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := ClaimsFrom(r.Context())
		if !ok || claims.Role != "admin" {
			httpx.Error(w, http.StatusForbidden, "admin required")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
	})
}
