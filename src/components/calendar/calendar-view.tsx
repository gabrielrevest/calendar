'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ViewType = 'month' | 'week' | 'day'

interface CalendarViewProps {
  events: any[]
  onEventClick: (event: any) => void
  onDateClick: (date: Date) => void
  isLoading?: boolean
}

export function CalendarView({ events, onEventClick, onDateClick, isLoading }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>('month')

  const navigate = (direction: 'prev' | 'next') => {
    if (view === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
    } else if (view === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1))
    } else {
      setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1))
    }
  }

  const goToToday = () => setCurrentDate(new Date())

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate)
      return isSameDay(eventDate, date)
    })
  }

  // Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return (
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
        {/* Header */}
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div
            key={day}
            className="bg-muted/80 p-3 text-center text-sm font-semibold border-b"
          >
            {day}
          </div>
        ))}
        
        {/* Days avec grille visible */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day)
          const isToday = isSameDay(day, new Date())
          const isCurrentMonth = isSameMonth(day, currentDate)

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={cn(
                'bg-card min-h-[120px] p-2 cursor-pointer hover:bg-accent/50 transition-colors border-r border-b relative',
                !isCurrentMonth && 'opacity-40 bg-muted/30',
                isToday && 'bg-primary/5 border-primary/50'
              )}
            >
              {/* Grille visible */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-px bg-border" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
                {(index + 1) % 7 !== 0 && (
                  <div className="absolute top-0 bottom-0 right-0 w-px bg-border" />
                )}
              </div>
              
              <div
                className={cn(
                  'text-sm font-semibold mb-1 relative z-10',
                  isToday && 'bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center'
                )}
              >
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                    className="text-xs p-1 bg-primary/10 text-primary rounded truncate hover:bg-primary/20"
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })
    const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8h - 19h

    return (
      <div className="overflow-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-8 gap-px bg-border">
            <div className="bg-muted p-2" />
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  'bg-muted p-2 text-center',
                  isSameDay(day, new Date()) && 'bg-primary/10'
                )}
              >
                <div className="text-sm font-medium">
                  {format(day, 'EEE', { locale: fr })}
                </div>
                <div className={cn(
                  'text-lg',
                  isSameDay(day, new Date()) && 'bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto'
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-px bg-border">
              <div className="bg-card p-2 text-sm text-muted-foreground text-right pr-4">
                {hour}:00
              </div>
              {days.map((day) => {
                const slotStart = new Date(day)
                slotStart.setHours(hour, 0, 0, 0)
                const slotEvents = events.filter((event) => {
                  const eventStart = new Date(event.startDate)
                  return isSameDay(eventStart, day) && eventStart.getHours() === hour
                })

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => {
                      const clickDate = new Date(day)
                      clickDate.setHours(hour)
                      onDateClick(clickDate)
                    }}
                    className="bg-card min-h-[60px] p-1 cursor-pointer hover:bg-accent/50"
                  >
                    {slotEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(event)
                        }}
                        className="text-xs p-1 bg-primary text-primary-foreground rounded mb-1 truncate"
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
      </div>
    )
  }

  // Day View
  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8)

    return (
      <div className="space-y-px">
        {hours.map((hour) => {
          const slotStart = new Date(currentDate)
          slotStart.setHours(hour, 0, 0, 0)
          const slotEvents = events.filter((event) => {
            const eventStart = new Date(event.startDate)
            return isSameDay(eventStart, currentDate) && eventStart.getHours() === hour
          })

          return (
            <div key={hour} className="flex gap-4 bg-card p-2 rounded">
              <div className="w-16 text-sm text-muted-foreground text-right">
                {hour}:00
              </div>
              <div
                onClick={() => {
                  const clickDate = new Date(currentDate)
                  clickDate.setHours(hour)
                  onDateClick(clickDate)
                }}
                className="flex-1 min-h-[60px] border rounded-lg p-2 cursor-pointer hover:bg-accent/50"
              >
                {slotEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                    className="p-2 bg-primary text-primary-foreground rounded mb-2"
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm opacity-80">
                      {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className="p-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Aujourd&apos;hui
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-4 text-lg font-semibold">
            {view === 'day'
              ? format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })
              : format(currentDate, 'MMMM yyyy', { locale: fr })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            {(['month', 'week', 'day'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium transition-colors',
                  view === v
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                )}
              >
                {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
              </button>
            ))}
          </div>
          <Button onClick={() => onDateClick(new Date())}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau
          </Button>
        </div>
      </div>

      {/* Calendar */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
        </>
      )}
    </Card>
  )
}




