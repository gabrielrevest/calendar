export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

export interface Event {
  id: string
  title: string
  description: string | null
  startDate: Date
  endDate: Date
  allDay: boolean
  location: string | null
  recurrence: string | null
  userId: string
  categoryId: string | null
  category?: Category | null
  tags?: Tag[]
  reminders?: Reminder[]
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  color: string | null
  type: string
  userId: string
}

export interface Tag {
  id: string
  name: string
  color: string | null
  userId: string
}

export interface Reminder {
  id: string
  minutes: number
  eventId: string
}

export interface Note {
  id: string
  title: string
  content: string
  userId: string
  categoryId: string | null
  category?: Category | null
  linkedDate: Date | null
  projectId: string | null
  project?: Project | null
  tags?: Tag[]
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  startDate: Date | null
  endDate: Date | null
  userId: string
  categoryId: string | null
  category?: Category | null
  tags?: Tag[]
  tasks?: Task[]
  notes?: Note[]
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  dueDate: Date | null
  priority: string
  order: number
  projectId: string
  project?: Project
  tags?: Tag[]
  createdAt: Date
  updatedAt: Date
}




