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

function authHeaders(token?: string | null): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || res.statusText)
  }
  return data as T
}

export const api = {
  register: (body: { email: string; password: string; name: string }) =>
    request<{ token: string; user: User }>('/api/v1/auth/register', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/v1/auth/login', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }),
  me: (token: string) =>
    request<User>('/api/v1/auth/me', { headers: authHeaders(token) }),
  listCourses: () => request<Course[]>('/api/v1/courses'),
  getCourse: (slug: string, token?: string | null) =>
    request<Course>(`/api/v1/courses/${slug}`, { headers: authHeaders(token) }),
  enroll: (courseId: string, token: string) =>
    request<{ status: string }>(`/api/v1/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: authHeaders(token),
    }),
  getLesson: (id: string, token: string) =>
    request<Lesson>(`/api/v1/lessons/${id}`, { headers: authHeaders(token) }),
  completeLesson: (id: string, token: string) =>
    request<{ status: string }>(`/api/v1/lessons/${id}/complete`, {
      method: 'POST',
      headers: authHeaders(token),
    }),
}
