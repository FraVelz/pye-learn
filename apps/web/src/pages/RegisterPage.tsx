import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/use-auth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await register(name, email, password)
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
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Crear cuenta</h1>
      <form onSubmit={(e) => void onSubmit(e)} className="surface mt-6 space-y-4 p-6">
        <label className="block text-sm">
          Nombre
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block text-sm">
          Email
          <input
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>
        <label className="block text-sm">
          Contraseña
          <input
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            minLength={6}
            required
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? 'Creando…' : 'Registrarme'}
        </button>
      </form>
      <p className="mt-4 text-sm muted">
        ¿Ya tienes cuenta? <Link to="/login" className="inline-link text-[var(--pye-blue)]">Inicia sesión</Link>
      </p>
    </section>
  )
}
