import { mockApi } from './mock-data'

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

/** Front-only mock API (localStorage). No backend / no credentials. */
export const api = {
  register: mockApi.register,
  login: mockApi.login,
  logout: mockApi.logout,
  me: mockApi.me,
  listCourses: mockApi.listCourses,
  getCourse: mockApi.getCourse,
  enroll: mockApi.enroll,
  getLesson: mockApi.getLesson,
  completeLesson: mockApi.completeLesson,
}
