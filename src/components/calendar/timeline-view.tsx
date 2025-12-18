'use client'

import { useQuery } from '@tanstack/react-query'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TimelineViewProps {
  currentDate: Date
  onDateClick?: (date: Date) => void
}

export function TimelineView({ currentDate, onDateClick }: TimelineViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const { data: events = [] } = useQuery({
    queryKey: ['events', format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd')],
    queryFn: async () => {
      const res = await fetch(
        `/api/events?start=${format(weekStart, 'yyyy-MM-dd')}&end=${format(weekEnd, 'yyyy-MM-dd')}`
      )
      if (!res.ok) return []
      return res.json()
    },
  })

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForDay = (date: Date) => {
    return events.filter((event: any) => isSameDay(new Date(event.startDate), date))
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec jours */}
      <div className="grid grid-cols-8 gap-2">
        <div className="font-semibold">Heure</div>
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="text-center">
            <div className="text-xs text-muted-foreground">
              {format(day, 'EEE', { locale: fr })}
            </div>
            <div className="text-lg font-semibold">
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 gap-2 border-t border-dashed border-muted min-h-[60px]"
              >
                <div className="p-2 text-xs text-muted-foreground">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
                {weekDays.map((day) => {
                  const dayEvents = getEventsForDay(day)
                  const hourEvents = dayEvents.filter((event: any) => {
                    const eventHour = new Date(event.startDate).getHours()
                    return eventHour === hour
                  })

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className="p-1 border-r border-muted last:border-r-0 relative"
                      onClick={() => onDateClick?.(day)}
                    >
                      {hourEvents.map((event: any) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded mb-1 bg-primary text-primary-foreground truncate"
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

