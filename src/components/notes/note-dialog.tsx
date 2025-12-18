'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Trash2 } from 'lucide-react'

const noteFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
  categoryId: z.string().optional().nullable(),
  linkedDate: z.date().optional().nullable(),
})

type NoteFormData = z.infer<typeof noteFormSchema>

interface NoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: any
  categories?: any[]
  onSave: (data: any) => void
  onDelete?: () => void
  isLoading?: boolean
}

export function NoteDialog({
  open,
  onOpenChange,
  note,
  categories = [],
  onSave,
  onDelete,
  isLoading,
}: NoteDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryId: null,
      linkedDate: null,
    },
  })

  useEffect(() => {
    if (note) {
      reset({
        title: note.title,
        content: note.content,
        categoryId: note.categoryId || null,
        linkedDate: note.linkedDate ? new Date(note.linkedDate) : null,
      })
    } else {
      reset({
        title: '',
        content: '',
        categoryId: null,
        linkedDate: null,
      })
    }
  }, [note, reset])

  const onSubmit = (data: NoteFormData) => {
    onSave({
      ...data,
      categoryId: data.categoryId || null,
      linkedDate: data.linkedDate?.toISOString() || null,
    })
  }

  const linkedDate = watch('linkedDate')
  const categoryId = watch('categoryId')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {note ? 'Modifier la note' : 'Nouvelle note'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Titre de la note"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Catégorie */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={categoryId || 'none'}
                onValueChange={(value) => setValue('categoryId', value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucune catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune catégorie</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color || '#6B7280' }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">Contenu *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Écrivez votre note ici..."
              rows={12}
              className="resize-y min-h-[200px] font-mono"
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date liée (optionnel)</Label>
            <DatePicker
              value={linkedDate || undefined}
              onChange={(date) => setValue('linkedDate', date || null)}
              placeholder="Associer à une date"
              clearable
            />
            <p className="text-xs text-muted-foreground">
              Associez cette note à une date pour la retrouver facilement
            </p>
          </div>

          <DialogFooter className="gap-2 pt-4">
            {note && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : note ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
