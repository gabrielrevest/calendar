'use client'

import { format, eachHourOfInterval, startOfDay, endOfDay, isSameHour } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DayViewProps {
  currentDate: Date
  events: any[]
  onEventClick: (event: any) => void
}

export function DayView({ currentDate, events, onEventClick }: DayViewProps) {
  const hours = eachHourOfInterval({
    start: startOfDay(currentDate),
    end: endOfDay(currentDate),
  })

  const getEventsForHour = (hour: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate)
      return isSameHour(eventDate, hour)
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold">
          {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-12">
          {/* Colonne heures */}
          <div className="col-span-2 border-r">
            {hours.map((hour) => (
              <div
                key={hour.toISOString()}
                className="h-20 border-b p-2 text-sm text-muted-foreground"
              >
                {format(hour, 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Colonne événements */}
          <div className="col-span-10">
            {hours.map((hour) => {
              const hourEvents = getEventsForHour(hour)
              return (
                <div
                  key={hour.toISOString()}
                  className="h-20 border-b p-2 relative"
                >
                  {hourEvents.map((event) => {
                    const start = new Date(event.startDate)
                    const end = new Date(event.endDate || event.startDate)
                    const duration = (end.getTime() - start.getTime()) / (1000 * 60)
                    const topOffset = (start.getMinutes() / 60) * 80

                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="absolute left-2 right-2 bg-primary text-primary-foreground text-sm p-2 rounded cursor-pointer hover:opacity-80"
                        style={{
                          top: `${topOffset}px`,
                          height: `${Math.max(40, (duration / 60) * 80)}px`,
                        }}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs opacity-90">
                          {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}


