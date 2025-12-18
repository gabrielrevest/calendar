'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, isPast, isFuture, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarClock, MapPin, Trash2, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export default function AppointmentsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch('/api/events')
      if (!res.ok) throw new Error('Failed to fetch events')
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete event')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast({ title: 'Rendez-vous supprimé' })
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' })
    },
  })

  const eventsArray = Array.isArray(events) ? events : []
  const sortedEvents = [...eventsArray].sort((a: any, b: any) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )

  const todayEvents = sortedEvents.filter((e: any) => isToday(new Date(e.startDate)))
  const upcomingEvents = sortedEvents.filter((e: any) => isFuture(new Date(e.startDate)) && !isToday(new Date(e.startDate)))
  const pastEvents = sortedEvents.filter((e: any) => isPast(new Date(e.startDate)) && !isToday(new Date(e.startDate))).reverse()

  const EventCard = ({ event, showDelete = true }: { event: any; showDelete?: boolean }) => (
    <div className="flex items-start justify-between p-4 bg-accent/50 rounded-lg">
      <div className="flex gap-4">
        <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-lg p-2 min-w-[60px]">
          <span className="text-xs uppercase">
            {format(new Date(event.startDate), 'MMM', { locale: fr })}
          </span>
          <span className="text-2xl font-bold">
            {format(new Date(event.startDate), 'd')}
          </span>
        </div>
        <div>
          <h3 className="font-semibold">{event.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
          {event.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </div>
      {showDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteMutation.mutate(event.id)}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rendez-vous</h1>
        <p className="text-muted-foreground">
          Tous vos rendez-vous passés et à venir
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarClock className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun rendez-vous</h3>
            <p className="text-muted-foreground text-center">
              Créez votre premier rendez-vous depuis le calendrier
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Today */}
          {todayEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  Aujourd&apos;hui
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming */}
          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>À venir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Past */}
          {pastEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground">Passés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pastEvents.slice(0, 10).map((event: any) => (
                  <div key={event.id} className="opacity-60">
                    <EventCard event={event} showDelete={false} />
                  </div>
                ))}
                {pastEvents.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground">
                    Et {pastEvents.length - 10} autres rendez-vous passés...
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}




