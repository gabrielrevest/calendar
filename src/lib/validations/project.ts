import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).default('PLANNING'),
  progress: z.number().min(0).max(100).default(0),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
})

export type ProjectFormData = z.infer<typeof projectSchema>




