import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  dueDate: z.date().optional().nullable(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  order: z.number().default(0),
  projectId: z.string(),
  tagIds: z.array(z.string()).optional(),
})

export type TaskFormData = z.infer<typeof taskSchema>




