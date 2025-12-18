'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Check, Plus, Trash2 } from 'lucide-react'
import { format, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface Habit {
  id: string
  name: string
  color: string
  completions: string[] // Dates au format YYYY-MM-DD
}

export function HabitsTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000) })

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const res = await fetch('/api/habits')
      if (!res.ok) return []
      return res.json()
    },
  })

  const createHabitMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed to create habit')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      setNewHabitName('')
      setIsDialogOpen(false)
      toast({ title: 'Habitude créée' })
    },
  })

  const toggleCompletionMutation = useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      const res = await fetch(`/api/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })
      if (!res.ok) throw new Error('Failed to toggle')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })

  const deleteHabitMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      toast({ title: 'Habitude supprimée' })
    },
  })

  const isCompleted = (habit: Habit, date: Date) => {
    return habit.completions.includes(format(date, 'yyyy-MM-dd'))
  }

  const colors = ['#3B82F6', '#22C55E', '#8B5CF6', '#EC4899', '#F97316', '#EAB308']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Suivi des habitudes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle habitude
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle habitude</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Ex: Méditation, Sport, Lecture..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newHabitName.trim()) {
                    createHabitMutation.mutate(newHabitName.trim())
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (newHabitName.trim()) {
                    createHabitMutation.mutate(newHabitName.trim())
                  }
                }}
                disabled={!newHabitName.trim() || createHabitMutation.isPending}
                className="w-full"
              >
                Créer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aucune habitude. Créez-en une pour commencer !
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {habits.map((habit: Habit, index: number) => (
            <Card key={habit.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: habit.color || colors[index % colors.length] }}
                    />
                    {habit.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteHabitMutation.mutate(habit.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {weekDays.map((day) => {
                    const completed = isCompleted(habit, day)
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          toggleCompletionMutation.mutate({
                            habitId: habit.id,
                            date: format(day, 'yyyy-MM-dd'),
                          })
                        }}
                        className={cn(
                          'flex-1 aspect-square rounded-lg border-2 transition-all',
                          completed
                            ? 'bg-green-500 border-green-600 text-white'
                            : 'border-muted hover:border-primary'
                        )}
                        title={format(day, 'EEEE d MMMM')}
                      >
                        <div className="flex items-center justify-center h-full">
                          {completed && <Check className="h-6 w-6" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

