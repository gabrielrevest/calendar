'use client'

import { format, isSameDay, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface AgendaViewProps {
  events: any[]
  onEventClick: (event: any) => void
}

export function AgendaView({ events, onEventClick }: AgendaViewProps) {
  // Grouper les événements par jour
  const eventsByDay = events.reduce((acc, event) => {
    const day = format(new Date(event.startDate), 'yyyy-MM-dd')
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(event)
    return acc
  }, {} as Record<string, any[]>)

  // Trier les jours
  const sortedDays = Object.keys(eventsByDay).sort()

  return (
    <div className="space-y-4">
      {sortedDays.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          Aucun événement à venir
        </div>
      ) : (
        sortedDays.map((day) => {
          const dayEvents = eventsByDay[day]
          const dayDate = new Date(day)
          const isToday = isSameDay(dayDate, new Date())

          return (
            <div key={day} className="space-y-2">
              <div className={cn(
                'sticky top-0 bg-background z-10 py-2 border-b',
                isToday && 'text-primary font-semibold'
              )}>
                <h3 className="text-lg">
                  {format(dayDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </h3>
              </div>
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onEventClick(event)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </div>
                          )}
                          {event.location && (
                            <div className="text-xs text-muted-foreground mt-1">
                              📍 {event.location}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground ml-4">
                          {format(new Date(event.startDate), 'HH:mm')}
                          {event.endDate && (
                            <> - {format(new Date(event.endDate), 'HH:mm')}</>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}


