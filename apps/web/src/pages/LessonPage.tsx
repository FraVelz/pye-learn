import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { api, type Course, type Lesson } from '../lib/api'
import { useAuth } from '../lib/use-auth'

export function LessonPage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const courseSlug = params.get('course') || ''
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login')
      return
    }
    api
      .getLesson(id)
      .then(setLesson)
      .catch((e: Error) => setError(e.message))
    if (courseSlug) {
      api
        .getCourse(courseSlug)
        .then(setCourse)
        .catch(() => undefined)
    }
  }, [id, user, loading, courseSlug, navigate])

  const flatLessons = useMemo(
    () => course?.modules?.flatMap((m) => (m.lessons || []).map((l) => ({ ...l, moduleTitle: m.title }))) || [],
    [course],
  )

  async function complete() {
    if (!user) return
    setBusy(true)
    try {
      await api.completeLesson(id)
      const refreshed = await api.getLesson(id)
      setLesson(refreshed)
      if (courseSlug) {
        setCourse(await api.getCourse(courseSlug))
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (!user) return null
  if (error && !lesson) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-red-400">{error}</p>
  }
  if (!lesson) {
    return <p className="mx-auto max-w-6xl px-4 py-12 muted">Cargando lección…</p>
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="surface h-fit p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide muted">Temario</p>
        <ul className="space-y-2 text-sm">
          {flatLessons.map((l) => (
            <li key={l.id}>
              <Link
                to={`/lecciones/${l.id}?course=${courseSlug}`}
                className={
                  l.id === id
                    ? 'font-semibold text-[var(--pye-blue)]'
                    : 'text-[var(--pye-text-2)] hover:text-[var(--pye-text)]'
                }
              >
                {l.completed ? '✓ ' : ''}
                {l.title}
              </Link>
            </li>
          ))}
          {!flatLessons.length && <li className="muted">Sin temario cargado</li>}
        </ul>
        {courseSlug && (
          <Link to={`/cursos/${courseSlug}`} className="inline-link mt-4 inline-block text-sm text-[var(--pye-blue)]">
            ← Volver al curso
          </Link>
        )}
      </aside>

      <article className="surface p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold tracking-tight">{lesson.title}</h1>
        {lesson.video_url && (
          <p className="mt-3 text-sm">
            <a href={lesson.video_url} target="_blank" rel="noreferrer" className="text-[var(--pye-blue)]">
              Ver video
            </a>
          </p>
        )}
        <div className="prose-lesson mt-6">
          <ReactMarkdown>{lesson.content_md}</ReactMarkdown>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy || !!lesson.completed}
            onClick={() => void complete()}
          >
            {lesson.completed ? 'Completada' : busy ? 'Guardando…' : 'Marcar completada'}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </article>
    </section>
  )
}
