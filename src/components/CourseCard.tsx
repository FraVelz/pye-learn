import { Link } from 'react-router-dom'
import type { Course } from '../lib/api'

function formatDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}m`
  return m ? `${h}h ${m}m` : `${h}h`
}

export function CourseCard({ course, badge }: { course: Course; badge?: string }) {
  return (
    <Link to={`/cursos/${course.slug}`} className="course-card group block p-5">
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-extrabold text-[var(--pye-blue)]"
            style={{ background: 'var(--pye-hover)' }}
          >
            {course.title.slice(0, 1)}
          </div>
          {badge && (
            <span className="rounded-md bg-[var(--pye-accent)]/15 px-2 py-1 text-xs font-bold text-[var(--pye-accent)]">
              {badge}
            </span>
          )}
          {!badge && course.is_free && (
            <span className="rounded-md bg-[var(--pye-accent-live)]/15 px-2 py-1 text-xs font-bold text-[var(--pye-accent-live)]">
              Gratis
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold leading-snug group-hover:text-[var(--pye-blue)]">{course.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-[var(--pye-text-2)]">{course.description}</p>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide muted">
          {formatDuration(course.duration_minutes)}
        </p>
      </div>
    </Link>
  )
}
