'use client'

import { useQuery } from '@tanstack/react-query'
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function ProductivityHeatmap() {
  const yearStart = startOfYear(new Date())
  const yearEnd = endOfYear(new Date())
  const days = eachDayOfInterval({ start: yearStart, end: yearEnd })

  const { data: activityData = [] } = useQuery({
    queryKey: ['productivity-heatmap', format(yearStart, 'yyyy')],
    queryFn: async () => {
      const res = await fetch(`/api/stats/heatmap?year=${format(yearStart, 'yyyy')}`)
      if (!res.ok) return []
      return res.json()
    },
  })

  const getActivityLevel = (date: Date) => {
    const data = activityData.find((d: any) => isSameDay(new Date(d.date), date))
    return data?.level || 0
  }

  const getColor = (level: number) => {
    if (level === 0) return 'bg-muted'
    if (level === 1) return 'bg-green-200 dark:bg-green-900'
    if (level === 2) return 'bg-green-400 dark:bg-green-700'
    if (level === 3) return 'bg-green-600 dark:bg-green-600'
    return 'bg-green-800 dark:bg-green-500'
  }

  // Grouper par semaine
  const weeks: Date[][] = []
  let currentWeek: Date[] = []
  
  days.forEach((day, index) => {
    if (day.getDay() === 1 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(day)
    if (index === days.length - 1) {
      weeks.push(currentWeek)
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carte de productivité</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => {
                  const level = getActivityLevel(day)
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'w-3 h-3 rounded-sm',
                        getColor(level)
                      )}
                      title={format(day, 'dd/MM/yyyy')}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>Moins</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
            <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-600" />
            <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-500" />
          </div>
          <span>Plus</span>
        </div>
      </CardContent>
    </Card>
  )
}

