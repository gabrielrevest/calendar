'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Palette } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

const defaultCalendars = [
  { name: 'Personnel', color: '#3B82F6', isDefault: true },
  { name: 'Professionnel', color: '#22C55E', isDefault: true },
  { name: 'Famille', color: '#EC4899', isDefault: true },
]

export function CalendarSelector({ selectedCalendars, onCalendarsChange }: { selectedCalendars: string[], onCalendarsChange: (ids: string[]) => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCalendarName, setNewCalendarName] = useState('')
  const [newCalendarColor, setNewCalendarColor] = useState('#3B82F6')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: calendars = [] } = useQuery({
    queryKey: ['calendars'],
    queryFn: async () => {
      // Pour l'instant, retourner les calendriers par défaut
      // Plus tard, on pourra les stocker en base
      return defaultCalendars.map((cal, i) => ({ id: `cal-${i}`, ...cal }))
    },
  })

  const createCalendarMutation = useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      // TODO: API pour créer un calendrier
      return { id: `cal-${Date.now()}`, ...data, isDefault: false }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] })
      toast({ title: 'Calendrier créé' })
      setNewCalendarName('')
      setIsDialogOpen(false)
    },
  })

  const colors = [
    '#3B82F6', '#22C55E', '#8B5CF6', '#EC4899', '#F97316',
    '#EAB308', '#EF4444', '#6366F1', '#06B6D4', '#10B981',
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {calendars.map((calendar: any) => {
        const isSelected = selectedCalendars.includes(calendar.id)
        return (
          <Button
            key={calendar.id}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (isSelected) {
                onCalendarsChange(selectedCalendars.filter(id => id !== calendar.id))
              } else {
                onCalendarsChange([...selectedCalendars, calendar.id])
              }
            }}
            className="flex items-center gap-2"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: calendar.color }}
            />
            {calendar.name}
          </Button>
        )
      })}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau calendrier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom</Label>
              <Input
                value={newCalendarName}
                onChange={(e) => setNewCalendarName(e.target.value)}
                placeholder="Ex: Sport, Loisirs..."
              />
            </div>
            <div>
              <Label>Couleur</Label>
              <div className="flex gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCalendarColor(color)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      newCalendarColor === color ? 'border-foreground scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button
              onClick={() => createCalendarMutation.mutate({ name: newCalendarName, color: newCalendarColor })}
              disabled={!newCalendarName || createCalendarMutation.isPending}
            >
              Créer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


