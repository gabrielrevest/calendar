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
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Trash2 } from 'lucide-react'

const eventFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
})

type EventFormData = z.infer<typeof eventFormSchema>

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: any
  defaultDate?: Date | null
  onSave: (data: any) => void
  onDelete?: () => void
  isLoading?: boolean
}

export function EventDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
  onSave,
  onDelete,
  isLoading,
}: EventDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      allDay: false,
      location: '',
    },
  })

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description || '',
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        allDay: event.allDay,
        location: event.location || '',
      })
    } else if (defaultDate) {
      const start = new Date(defaultDate)
      const end = new Date(defaultDate)
      end.setHours(end.getHours() + 1)
      reset({
        title: '',
        description: '',
        startDate: start,
        endDate: end,
        allDay: false,
        location: '',
      })
    } else {
      const now = new Date()
      now.setMinutes(0, 0, 0)
      const end = new Date(now)
      end.setHours(end.getHours() + 1)
      reset({
        title: '',
        description: '',
        startDate: now,
        endDate: end,
        allDay: false,
        location: '',
      })
    }
  }, [event, defaultDate, reset])

  const onSubmit = (data: EventFormData) => {
    onSave({
      ...data,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
    })
  }

  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const allDay = watch('allDay')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Modifier l\'événement' : 'Nouvel événement'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Titre de l'événement"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Description de l'événement"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allDay"
              checked={allDay}
              onCheckedChange={(checked) => setValue('allDay', !!checked)}
            />
            <Label htmlFor="allDay">Journée entière</Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début *</Label>
              <DatePicker
                value={startDate}
                onChange={(date) => date && setValue('startDate', date)}
                showTime={!allDay}
                placeholder="Sélectionner"
              />
            </div>

            <div className="space-y-2">
              <Label>Date de fin *</Label>
              <DatePicker
                value={endDate}
                onChange={(date) => date && setValue('endDate', date)}
                showTime={!allDay}
                placeholder="Sélectionner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Lieu de l'événement"
            />
          </div>

          <DialogFooter className="gap-2">
            {event && onDelete && (
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
              {isLoading ? 'Enregistrement...' : event ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}




