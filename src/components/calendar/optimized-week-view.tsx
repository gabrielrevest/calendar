'use client'

import { useMemo } from 'react'
import { format, startOfWeek, addDays, isSameDay, eachHourOfInterval, startOfDay, endOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface OptimizedWeekViewProps {
  currentDate: Date
  events: any[]
  onDateClick: (date: Date) => void
  onEventClick: (event: any) => void
}

export function OptimizedWeekView({ currentDate, events, onDateClick, onEventClick }: OptimizedWeekViewProps) {
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate])
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const hours = useMemo(() => eachHourOfInterval({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  }).slice(8, 20), []) // 8h à 20h seulement pour performance

  // Mémoriser les événements par jour et heure
  const eventsByDayHour = useMemo(() => {
    const map = new Map<string, any[]>()
    events.forEach((event) => {
      const eventDate = new Date(event.startDate)
      const dayKey = format(eventDate, 'yyyy-MM-dd')
      const hour = eventDate.getHours()
      const key = `${dayKey}-${hour}`
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(event)
    })
    return map
  }, [events])

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    const key = `${format(day, 'yyyy-MM-dd')}-${hour}`
    return eventsByDayHour.get(key) || []
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card">
      {/* Header avec jours */}
      <div className="grid grid-cols-8 border-b bg-muted/50 sticky top-0 z-10 shadow-sm">
        <div className="p-3 border-r font-semibold text-sm bg-muted">Heure</div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'p-3 border-r text-center cursor-pointer hover:bg-accent transition-colors',
              isSameDay(day, new Date()) && 'bg-primary/20 border-primary border-t-2'
            )}
            onClick={() => onDateClick(day)}
          >
            <div className="text-xs text-muted-foreground uppercase font-medium">
              {format(day, 'EEE', { locale: fr })}
            </div>
            <div className={cn(
              'text-xl font-bold mt-1',
              isSameDay(day, new Date()) && 'text-primary'
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Grille avec heures - Optimisée */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8 relative">
          {/* Colonne heures sticky */}
          <div className="border-r bg-muted/30 sticky left-0 z-10 shadow-sm">
            {hours.map((hour, index) => (
              <div
                key={hour.toISOString()}
                className={cn(
                  'h-20 border-b border-border p-2 text-xs text-muted-foreground font-medium flex items-center',
                  index % 2 === 0 && 'bg-muted/20'
                )}
              >
                {format(hour, 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Colonnes jours avec grille visible */}
          {weekDays.map((day, dayIndex) => (
            <div key={day.toISOString()} className="border-r relative">
              {hours.map((hour, hourIndex) => {
                const hourEvents = getEventsForDayAndHour(day, hour.getHours())
                return (
                  <div
                    key={hour.toISOString()}
                    className={cn(
                      'h-20 border-b border-border p-1 relative group',
                      hourIndex % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                      'hover:bg-accent/30 transition-colors cursor-pointer'
                    )}
                    onClick={() => onDateClick(new Date(day.setHours(hour.getHours(), 0, 0, 0)))}
                  >
                    {/* Grille visible - lignes horizontales et verticales */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-border/80" />
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-border/80" />
                      {dayIndex < weekDays.length - 1 && (
                        <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-border/80" />
                      )}
                    </div>
                    
                    {/* Événements optimisés */}
                    {hourEvents.map((event, eventIndex) => {
                      const startMinutes = new Date(event.startDate).getMinutes()
                      const duration = (new Date(event.endDate || event.startDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60)
                      const height = Math.max(20, Math.min(80, (duration / 60) * 80))
                      const top = (startMinutes / 60) * 80
                      
                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEventClick(event)
                          }}
                          className="absolute left-1 right-1 bg-primary text-primary-foreground text-xs p-1.5 rounded shadow-sm cursor-pointer hover:opacity-90 transition-opacity z-20 border border-primary/20"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            minHeight: '20px',
                          }}
                        >
                          <div className="font-semibold truncate">{event.title}</div>
                          {!event.allDay && duration < 120 && (
                            <div className="text-[10px] opacity-90 truncate">
                              {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate || event.startDate), 'HH:mm')}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

