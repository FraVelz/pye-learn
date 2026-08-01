import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('student@pye.local')
  const [password, setPassword] = useState('student123')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email, password)
      navigate('/cursos')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <p className="eyebrow">Cuenta</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-white/55">
        Demo: student@pye.local / student123
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="surface mt-6 space-y-4 p-6">
        <label className="block text-sm">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-[var(--pye-border)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>
        <label className="block text-sm">
          Contraseña
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-[var(--pye-border)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p className="mt-4 text-sm text-white/60">
        ¿No tienes cuenta? <Link to="/register" className="text-[var(--pye-blue)]">Regístrate</Link>
      </p>
    </section>
  )
}
