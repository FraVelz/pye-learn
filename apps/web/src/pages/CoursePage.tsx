import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, type Course } from '../lib/api'
import { useAuth } from '../lib/use-auth'

export function CoursePage() {
  const { slug = '' } = useParams()
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api
      .getCourse(slug, token)
      .then(setCourse)
      .catch((e: Error) => setError(e.message))
  }, [slug, token])

  async function enroll() {
    if (!user || !token) {
      navigate('/login')
      return
    }
    if (!course) return
    setBusy(true)
    try {
      await api.enroll(course.id, token)
      const refreshed = await api.getCourse(slug, token)
      setCourse(refreshed)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const firstLesson = course?.modules?.flatMap((m) => m.lessons || [])[0]

  if (error && !course) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-red-400">{error}</p>
  }
  if (!course) {
    return <p className="mx-auto max-w-6xl px-4 py-12 muted">Cargando…</p>
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm muted">
        <Link to="/cursos" className="hover:text-[var(--pye-text)]">
          Cursos
        </Link>{' '}
        / {course.title}
      </p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight">{course.title}</h1>
          <p className="mt-4 text-lg text-[var(--pye-text-2)]">{course.description}</p>
          <p className="mt-3 text-sm muted">{course.duration_minutes} min · {course.is_free ? 'Gratis' : 'Pago'}</p>
        </div>
        <div className="surface flex w-full max-w-sm flex-col gap-3 p-5">
          {course.enrolled ? (
            <>
              <p className="text-sm text-[var(--pye-accent-live)]">Ya estás inscrito</p>
              {firstLesson && (
                <Link to={`/lecciones/${firstLesson.id}?course=${course.slug}`} className="btn btn-primary">
                  Continuar
                </Link>
              )}
            </>
          ) : (
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void enroll()}>
              {busy ? 'Inscribiendo…' : 'Inscribirse'}
            </button>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold">Temario</h2>
        <div className="mt-4 space-y-4">
          {(course.modules || []).map((m) => (
            <details key={m.id} open className="surface p-4">
              <summary className="temario-summary font-semibold">{m.title}</summary>
              <ul className="mt-3 space-y-2">
                {(m.lessons || []).map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 text-sm text-[var(--pye-text-2)]">
                    <span>
                      {l.completed ? '✓ ' : ''}
                      {l.title}
                    </span>
                    <span className="muted">{l.duration_minutes}m</span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
