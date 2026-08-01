import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, type User } from './api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const me = await api.me()
        if (!cancelled) setUser(me)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await api.login({ email, password })
    // Confirm cookie session (not just response body) so UI matches real auth.
    const me = await api.me()
    setUser(me)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    await api.register({ name, email, password })
    const me = await api.me()
    setUser(me)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // still clear local session
    }
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
