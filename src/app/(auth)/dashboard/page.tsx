'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, FolderKanban, StickyNote, CalendarClock } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch('/api/events')
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects')
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
  })

  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await fetch('/api/notes')
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
  })

  const today = new Date()
  const todayEvents = Array.isArray(events) ? events.filter((event: any) => {
    const eventDate = new Date(event.startDate)
    return eventDate.toDateString() === today.toDateString()
  }) : []

  const upcomingEvents = Array.isArray(events) ? events.filter((event: any) => {
    const eventDate = new Date(event.startDate)
    return eventDate > today
  }).slice(0, 5) : []

  const activeProjects = Array.isArray(projects) ? projects.filter((p: any) => p.status === 'IN_PROGRESS') : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          {format(today, "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Événements aujourd&apos;hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEvents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
            <StickyNote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Événements à venir</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Événements du jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEvents.length > 0 ? (
              <div className="space-y-3">
                {todayEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-accent rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Aucun événement aujourd&apos;hui
              </p>
            )}
            <Link
              href="/calendar"
              className="block mt-4 text-sm text-primary hover:underline text-center"
            >
              Voir le calendrier complet →
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Prochains événements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-accent rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.startDate), 'PPP à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Aucun événement à venir
              </p>
            )}
            <Link
              href="/appointments"
              className="block mt-4 text-sm text-primary hover:underline text-center"
            >
              Voir tous les rendez-vous →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}




