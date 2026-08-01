const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export type User = {
  id: string
  email: string
  name: string
  role: string
}

export type Lesson = {
  id: string
  module_id: string
  title: string
  content_md: string
  video_url: string
  position: number
  duration_minutes: number
  completed?: boolean
}

export type Module = {
  id: string
  course_id: string
  title: string
  position: number
  lessons?: Lesson[]
}

export type Course = {
  id: string
  slug: string
  title: string
  description: string
  thumbnail_url: string
  duration_minutes: number
  is_published: boolean
  is_free: boolean
  modules?: Module[]
  enrolled?: boolean
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || res.statusText || `HTTP ${res.status}`)
  }
  if (res.status === 204) {
    return undefined as T
  }
  return (await res.json()) as T
}

export const api = {
  register: (body: { email: string; password: string; name: string }) =>
    request<{ user: User }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ user: User }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  logout: () =>
    request<{ status: string }>('/api/v1/auth/logout', { method: 'POST' }),
  me: () => request<User>('/api/v1/auth/me'),
  listCourses: () => request<Course[]>('/api/v1/courses'),
  getCourse: (slug: string) => request<Course>(`/api/v1/courses/${slug}`),
  enroll: (courseId: string) =>
    request<{ status: string }>(`/api/v1/courses/${courseId}/enroll`, {
      method: 'POST',
    }),
  getLesson: (id: string) => request<Lesson>(`/api/v1/lessons/${id}`),
  completeLesson: (id: string) =>
    request<{ status: string }>(`/api/v1/lessons/${id}/complete`, {
      method: 'POST',
    }),
}
