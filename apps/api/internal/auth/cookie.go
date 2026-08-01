package auth

import (
	"net/http"
	"strings"
	"time"
)

const CookieName = "pye_session"

type CookieOpts struct {
	Secure   bool
	SameSite http.SameSite
	MaxAge   time.Duration
}

func SetSessionCookie(w http.ResponseWriter, token string, opts CookieOpts) {
	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   opts.Secure,
		SameSite: opts.SameSite,
		MaxAge:   int(opts.MaxAge.Seconds()),
	})
}

func ClearSessionCookie(w http.ResponseWriter, opts CookieOpts) {
	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   opts.Secure,
		SameSite: opts.SameSite,
		MaxAge:   -1,
	})
}

func TokenFromRequest(r *http.Request) string {
	if h := r.Header.Get("Authorization"); strings.HasPrefix(h, "Bearer ") {
		return strings.TrimPrefix(h, "Bearer ")
	}
	if c, err := r.Cookie(CookieName); err == nil && c.Value != "" {
		return c.Value
	}
	return ""
}
