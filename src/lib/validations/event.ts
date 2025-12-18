import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  recurrence: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  reminders: z.array(z.number()).optional(),
})

export type EventFormData = z.infer<typeof eventSchema>




