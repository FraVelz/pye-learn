import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Course } from '../lib/api'
import { CourseCard } from '../components/CourseCard'
import { FaqSection } from '../components/FaqSection'
import logo from '../assets/logo.svg'

export function HomePage() {
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    api.listCourses().then(setCourses).catch(() => setCourses([]))
  }, [])

  const preview = courses.slice(0, 3)

  return (
    <>
      <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:pt-20">
        <div className="mx-auto max-w-4xl text-center fade-up">
          <p className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--pye-blue)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--pye-blue)] shadow-[0_0_10px_#008bf9]" />
            Academia de la comunidad PyE
          </p>

          <div className="mb-6 flex justify-center">
            <img src={logo} alt="PyE Learn" className="h-14 w-14 brightness-0 invert sm:h-16 sm:w-16" />
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
            Aprende <span className="chip-ia">dev</span> y{' '}
            <span className="chip-code">{'{programación}'}</span> sin saltar entre mil recursos
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--pye-text-2)] fade-up fade-up-delay">
            Cursos de calidad, prácticos, directos y sin relleno.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/cursos" className="btn btn-primary">
              Ver cursos →
            </Link>
            <Link to="/register" className="btn btn-ghost">
              Crear cuenta gratis
            </Link>
          </div>

          <p className="mt-4 text-sm text-white/45">
            Empieza cuando quieras. ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-white hover:text-[var(--pye-blue)]">
              Iniciar sesión
            </Link>
          </p>
        </div>

        <div className="mt-12 fade-up fade-up-delay">
          <div className="stats-pill">
            <div>
              <strong className="text-2xl text-[var(--pye-blue)]">+{Math.max(courses.length, 3)}</strong>
              <span className="text-xs text-white/50">cursos disponibles</span>
            </div>
            <div>
              <strong className="text-2xl text-[var(--pye-blue)]">+200h</strong>
              <span className="text-xs text-white/50">contenido práctico</span>
            </div>
            <div>
              <strong className="text-2xl text-[var(--pye-blue)]">PyE</strong>
              <span className="text-xs text-white/50">comunidad aprendiendo</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-6">
        <p className="eyebrow">Empieza por donde quieras</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Cursos para subir de nivel</h2>
          <Link to="/cursos" className="text-sm font-semibold text-[var(--pye-blue)] hover:underline">
            Ver todos →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((c, i) => (
            <CourseCard key={c.id} course={c} badge={i === 0 ? 'Nuevo' : undefined} />
          ))}
          {!preview.length && (
            <p className="text-white/50 sm:col-span-3">Cargando catálogo…</p>
          )}
        </div>
      </section>

      <FaqSection />
    </>
  )
}
