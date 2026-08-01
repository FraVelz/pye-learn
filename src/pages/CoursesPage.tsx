import { useEffect, useState } from 'react'
import { api, type Course } from '../lib/api'
import { CourseCard } from '../components/CourseCard'

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
    <section className="mx-auto max-w-6xl px-4 py-14">
      <p className="eyebrow">Catálogo</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Cursos para subir de nivel</h1>
      <p className="mt-3 max-w-2xl text-[var(--pye-text-2)]">
        Empieza por donde quieras. Contenido práctico, directo y sin relleno.
      </p>

      {loading && <p className="mt-10 muted">Cargando cursos…</p>}
      {error && <p className="mt-10 text-red-400">{error}</p>}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c, i) => (
          <CourseCard key={c.id} course={c} badge={i === 0 ? 'Nuevo' : undefined} />
        ))}
      </div>
    </section>
  )
}
