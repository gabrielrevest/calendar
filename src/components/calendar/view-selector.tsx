'use client'

import { Button } from '@/components/ui/button'
import { Calendar, CalendarDays, List, GanttChart } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda' | 'timeline'

interface ViewSelectorProps {
  view: CalendarViewType
  onViewChange: (view: CalendarViewType) => void
}

export function ViewSelector({ view, onViewChange }: ViewSelectorProps) {
  const views: { type: CalendarViewType; label: string; icon: any }[] = [
    { type: 'month', label: 'Mois', icon: Calendar },
    { type: 'week', label: 'Semaine', icon: CalendarDays },
    { type: 'day', label: 'Jour', icon: CalendarDays },
    { type: 'agenda', label: 'Agenda', icon: List },
    { type: 'timeline', label: 'Timeline', icon: GanttChart },
  ]

  return (
    <div className="flex gap-2">
      {views.map((v) => {
        const Icon = v.icon
        return (
          <Button
            key={v.type}
            variant={view === v.type ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewChange(v.type)}
            className={cn(
              'flex items-center gap-2',
              view === v.type && 'bg-primary text-primary-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {v.label}
          </Button>
        )
      })}
    </div>
  )
}


