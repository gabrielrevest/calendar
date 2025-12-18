import { z } from 'zod'

export const noteSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
  categoryId: z.string().optional().nullable(),
  linkedDate: z.date().optional().nullable(),
  projectId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
})

export type NoteFormData = z.infer<typeof noteSchema>




