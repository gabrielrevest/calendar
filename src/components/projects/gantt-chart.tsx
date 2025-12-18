'use client'

import { useQuery } from '@tanstack/react-query'
import { format, differenceInDays, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface GanttChartProps {
  projectId: string
}

export function GanttChart({ projectId }: GanttChartProps) {
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/tasks`)
      if (!res.ok) return []
      return res.json()
    },
  })

  const tasksWithDates = tasks.filter((t: any) => t.dueDate)
  if (tasksWithDates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Aucune tâche avec date pour afficher le Gantt
        </CardContent>
      </Card>
    )
  }

  const minDate = new Date(Math.min(...tasksWithDates.map((t: any) => new Date(t.dueDate).getTime())))
  const maxDate = new Date(Math.max(...tasksWithDates.map((t: any) => new Date(t.dueDate).getTime())))
  
  const weekStart = startOfWeek(minDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(maxDate, { weekStartsOn: 1 })
  const totalDays = differenceInDays(weekEnd, weekStart) + 1

  const getTaskPosition = (task: any) => {
    const start = new Date(task.createdAt)
    const end = new Date(task.dueDate)
    const startOffset = differenceInDays(start, weekStart)
    const duration = differenceInDays(end, start) + 1
    const width = (duration / totalDays) * 100
    const left = (startOffset / totalDays) * 100
    return { left: `${left}%`, width: `${width}%` }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative min-h-[400px]">
          {/* En-tête avec dates */}
          <div className="flex mb-4 border-b pb-2">
            {Array.from({ length: Math.min(totalDays, 30) }, (_, i) => {
              const date = addDays(weekStart, i)
              return (
                <div key={i} className="flex-1 text-xs text-center">
                  {format(date, 'dd/MM')}
                </div>
              )
            })}
          </div>

          {/* Barres de tâches */}
          <div className="space-y-2">
            {tasksWithDates.map((task: any) => {
              const position = getTaskPosition(task)
              return (
                <div key={task.id} className="relative h-8">
                  <div
                    className={cn(
                      'absolute h-6 rounded px-2 text-xs flex items-center',
                      task.completed ? 'bg-green-500' : 'bg-blue-500',
                      'text-white'
                    )}
                    style={position}
                  >
                    {task.title}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

