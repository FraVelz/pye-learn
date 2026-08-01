import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Course } from '../lib/api'

function formatDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}m`
  return m ? `${h}h ${m}m` : `${h}h`
}

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .listCourses()
      .then(setCourses)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Cursos para subir de nivel</h1>
      <p className="mt-2 text-[var(--pye-text-2)]">Empieza por donde quieras. Contenido práctico y sin relleno.</p>

      {loading && <p className="mt-10 text-white/60">Cargando cursos…</p>}
      {error && <p className="mt-10 text-red-400">{error}</p>}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <Link
            key={c.id}
            to={`/cursos/${c.slug}`}
            className="surface group block p-5 transition hover:border-[var(--pye-border)]"
          >
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
              {c.is_free && (
                <span className="rounded-md bg-[var(--pye-accent-live)]/15 px-2 py-1 text-[var(--pye-accent-live)]">
                  Gratis
                </span>
              )}
              <span className="text-white/50">{formatDuration(c.duration_minutes)}</span>
            </div>
            <h2 className="text-xl font-bold group-hover:text-[var(--pye-blue)]">{c.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-[var(--pye-text-2)]">{c.description}</p>
            <p className="mt-4 text-sm font-semibold text-[var(--pye-blue)]">Ir al curso →</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
