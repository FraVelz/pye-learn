import type { Course, Lesson, User } from './api'

export const MOCK_COURSES: Course[] = [
  {
    id: 'course-go',
    slug: 'go-desde-cero',
    title: 'Go desde cero',
    description: 'Aprende los fundamentos de Go con ejercicios prácticos orientados a APIs.',
    thumbnail_url: '',
    duration_minutes: 120,
    is_published: true,
    is_free: true,
    modules: [
      {
        id: 'mod-go-1',
        course_id: 'course-go',
        title: 'Fundamentos',
        position: 1,
        lessons: [
          {
            id: 'lesson-go-1',
            module_id: 'mod-go-1',
            title: 'Hola mundo y tooling',
            position: 1,
            duration_minutes: 15,
            video_url: '',
            content_md:
              '# Hola mundo\n\nInstala Go, crea un módulo y ejecuta tu primer programa.\n\n```bash\ngo mod init example\ngo run .\n```\n',
          },
          {
            id: 'lesson-go-2',
            module_id: 'mod-go-1',
            title: 'Structs y métodos',
            position: 2,
            duration_minutes: 20,
            video_url: '',
            content_md: '# Structs\n\nModela datos con structs y adjunta comportamiento con métodos.\n',
          },
        ],
      },
      {
        id: 'mod-go-2',
        course_id: 'course-go',
        title: 'HTTP',
        position: 2,
        lessons: [
          {
            id: 'lesson-go-3',
            module_id: 'mod-go-2',
            title: 'Handlers y routing',
            position: 1,
            duration_minutes: 25,
            video_url: '',
            content_md: '# HTTP\n\nUsa `net/http` o chi para exponer endpoints REST.\n',
          },
        ],
      },
    ],
  },
  {
    id: 'course-react',
    slug: 'react-practico',
    title: 'React práctico',
    description: 'Construye interfaces modernas con React, routing y consumo de APIs.',
    thumbnail_url: '',
    duration_minutes: 90,
    is_published: true,
    is_free: true,
    modules: [
      {
        id: 'mod-react-1',
        course_id: 'course-react',
        title: 'Componentes',
        position: 1,
        lessons: [
          {
            id: 'lesson-react-1',
            module_id: 'mod-react-1',
            title: 'JSX y estado',
            position: 1,
            duration_minutes: 18,
            video_url: '',
            content_md: '# JSX y estado\n\nComponentes funcionales, props y `useState`.\n',
          },
          {
            id: 'lesson-react-2',
            module_id: 'mod-react-1',
            title: 'Fetch a tu API',
            position: 2,
            duration_minutes: 22,
            video_url: '',
            content_md: '# Fetch\n\nConsume endpoints REST con `fetch` y maneja loading/error.\n',
          },
        ],
      },
    ],
  },
  {
    id: 'course-sql',
    slug: 'postgres-para-devs',
    title: 'Postgres para devs',
    description: 'Modelado, migraciones y consultas esenciales para backends reales.',
    thumbnail_url: '',
    duration_minutes: 75,
    is_published: true,
    is_free: true,
    modules: [
      {
        id: 'mod-sql-1',
        course_id: 'course-sql',
        title: 'Esquema',
        position: 1,
        lessons: [
          {
            id: 'lesson-sql-1',
            module_id: 'mod-sql-1',
            title: 'Tablas y relaciones',
            position: 1,
            duration_minutes: 20,
            video_url: '',
            content_md: '# Tablas\n\nPrimary keys, foreign keys e índices.\n',
          },
        ],
      },
    ],
  },
]

const SESSION_KEY = 'pye_learn_mock_session'
const ENROLLMENTS_KEY = 'pye_learn_mock_enrollments'
const PROGRESS_KEY = 'pye_learn_mock_progress'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function getSession(): User | null {
  return readJson<User | null>(SESSION_KEY, null)
}

function setSession(user: User | null) {
  if (!user) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  writeJson(SESSION_KEY, user)
}

function getEnrollments(): string[] {
  return readJson<string[]>(ENROLLMENTS_KEY, [])
}

function getProgress(): string[] {
  return readJson<string[]>(PROGRESS_KEY, [])
}

function cloneCourse(course: Course, enrolled: boolean, completed: Set<string>): Course {
  return {
    ...course,
    enrolled,
    modules: (course.modules || []).map((m) => ({
      ...m,
      lessons: (m.lessons || []).map((l) => ({
        ...l,
        completed: completed.has(l.id),
      })),
    })),
  }
}

function findLesson(id: string): Lesson | undefined {
  for (const course of MOCK_COURSES) {
    for (const mod of course.modules || []) {
      const lesson = (mod.lessons || []).find((l) => l.id === id)
      if (lesson) return lesson
    }
  }
  return undefined
}

export const mockApi = {
  async register(body: { email: string; password: string; name: string }) {
    if (!body.email.trim() || !body.name.trim() || body.password.length < 6) {
      throw new Error('Completa nombre, email y una contraseña de al menos 6 caracteres')
    }
    const user: User = {
      id: `user-${crypto.randomUUID()}`,
      email: body.email.trim().toLowerCase(),
      name: body.name.trim(),
      role: 'student',
    }
    setSession(user)
    return delay({ user })
  },

  async login(body: { email: string; password: string }) {
    if (!body.email.trim() || !body.password) {
      throw new Error('Email y contraseña requeridos')
    }
    // Mock: any credentials work; no backend / no real auth.
    const existing = getSession()
    const user: User = {
      id: existing?.email === body.email.trim().toLowerCase() ? existing.id : `user-${crypto.randomUUID()}`,
      email: body.email.trim().toLowerCase(),
      name: existing?.email === body.email.trim().toLowerCase() ? existing.name : body.email.split('@')[0] || 'Estudiante',
      role: 'student',
    }
    setSession(user)
    return delay({ user })
  },

  async logout() {
    setSession(null)
    return delay({ status: 'ok' })
  },

  async me() {
    const user = getSession()
    if (!user) throw new Error('No autenticado')
    return delay(user)
  },

  async listCourses() {
    const enrolled = new Set(getEnrollments())
    const completed = new Set(getProgress())
    return delay(MOCK_COURSES.map((c) => cloneCourse(c, enrolled.has(c.id), completed)))
  },

  async getCourse(slug: string) {
    const course = MOCK_COURSES.find((c) => c.slug === slug)
    if (!course) throw new Error('Curso no encontrado')
    const enrolled = new Set(getEnrollments())
    const completed = new Set(getProgress())
    return delay(cloneCourse(course, enrolled.has(course.id), completed))
  },

  async enroll(courseId: string) {
    if (!getSession()) throw new Error('No autenticado')
    const course = MOCK_COURSES.find((c) => c.id === courseId)
    if (!course) throw new Error('Curso no encontrado')
    const enrolled = new Set(getEnrollments())
    enrolled.add(courseId)
    writeJson(ENROLLMENTS_KEY, [...enrolled])
    return delay({ status: 'ok' })
  },

  async getLesson(id: string) {
    if (!getSession()) throw new Error('No autenticado')
    const lesson = findLesson(id)
    if (!lesson) throw new Error('Lección no encontrada')
    const completed = new Set(getProgress())
    return delay({ ...lesson, completed: completed.has(id) })
  },

  async completeLesson(id: string) {
    if (!getSession()) throw new Error('No autenticado')
    if (!findLesson(id)) throw new Error('Lección no encontrada')
    const completed = new Set(getProgress())
    completed.add(id)
    writeJson(PROGRESS_KEY, [...completed])
    return delay({ status: 'ok' })
  },
}
