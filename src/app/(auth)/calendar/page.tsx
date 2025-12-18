'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarView } from '@/components/calendar/calendar-view'
import { ViewSelector, CalendarViewType } from '@/components/calendar/view-selector'
import { OptimizedWeekView } from '@/components/calendar/optimized-week-view'
import { DayView } from '@/components/calendar/day-view'
import { AgendaView } from '@/components/calendar/agenda-view'
import { EventDialog } from '@/components/calendar/event-dialog'
import { useToast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'

export default function CalendarPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentView, setCurrentView] = useState<CalendarViewType>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch('/api/events')
      if (!res.ok) throw new Error('Failed to fetch events')
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create event')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast({ title: 'Événement créé' })
      setIsDialogOpen(false)
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de créer l\'événement', variant: 'destructive' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update event')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast({ title: 'Événement modifié' })
      setIsDialogOpen(false)
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de modifier l\'événement', variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete event')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast({ title: 'Événement supprimé' })
      setIsDialogOpen(false)
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'événement', variant: 'destructive' })
    },
  })

  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
    setSelectedDate(null)
    setIsDialogOpen(true)
  }

  const handleDateClick = (date: Date) => {
    setSelectedEvent(null)
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  const handleSave = (data: any) => {
    if (selectedEvent) {
      updateMutation.mutate({ id: selectedEvent.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = () => {
    if (selectedEvent) {
      deleteMutation.mutate(selectedEvent.id)
    }
  }

  const renderView = () => {
    switch (currentView) {
      case 'week':
        return (
          <Card className="p-4 h-[calc(100vh-300px)] overflow-hidden">
            <OptimizedWeekView
              currentDate={currentDate}
              events={events}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
          </Card>
        )
      case 'day':
        return (
          <Card className="p-4 h-[calc(100vh-300px)]">
            <DayView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
            />
          </Card>
        )
      case 'agenda':
        return (
          <Card className="p-4 h-[calc(100vh-300px)] overflow-y-auto">
            <AgendaView
              events={events}
              onEventClick={handleEventClick}
            />
          </Card>
        )
      case 'timeline':
        return (
          <Card className="p-4 h-[calc(100vh-300px)]">
            <div className="text-center text-muted-foreground py-12">
              Vue Timeline en développement
            </div>
          </Card>
        )
      default:
        return (
          <CalendarView
            events={events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            isLoading={isLoading}
          />
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendrier</h1>
          <p className="text-muted-foreground">
            Gérez vos événements et rendez-vous
          </p>
        </div>
        <ViewSelector view={currentView} onViewChange={setCurrentView} />
      </div>

      {renderView()}

      <EventDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        event={selectedEvent}
        defaultDate={selectedDate}
        onSave={handleSave}
        onDelete={handleDelete}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}



