'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Clock, Trash2 } from 'lucide-react'
import { format, addMinutes, setHours, setMinutes } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface TimeBlock {
  id: string
  startTime: string // HH:mm
  endTime: string // HH:mm
  title: string
  color?: string
  date: Date
}

interface TimeBlockingProps {
  date: Date
  onBlockSelect?: (block: TimeBlock) => void
}

export function TimeBlocking({ date, onBlockSelect }: TimeBlockingProps) {
  const [newBlock, setNewBlock] = useState({ startTime: '09:00', endTime: '10:00', title: '' })
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: blocks = [] } = useQuery({
    queryKey: ['time-blocks', format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const res = await fetch(`/api/time-blocks?date=${format(date, 'yyyy-MM-dd')}`)
      if (!res.ok) return []
      return res.json()
    },
  })

  const createBlockMutation = useMutation({
    mutationFn: async (data: Omit<TimeBlock, 'id'>) => {
      const res = await fetch('/api/time-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create block')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-blocks'] })
      toast({ title: 'Bloc créé' })
      setNewBlock({ startTime: '09:00', endTime: '10:00', title: '' })
    },
  })

  const deleteBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/time-blocks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete block')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-blocks'] })
      toast({ title: 'Bloc supprimé' })
    },
  })

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const colors = ['#3B82F6', '#22C55E', '#8B5CF6', '#EC4899', '#F97316', '#EAB308']

  const getBlockPosition = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    const top = (startMinutes / 60) * 60 // 60px par heure
    const height = ((endMinutes - startMinutes) / 60) * 60
    return { top: `${top}px`, height: `${height}px` }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label>Titre</Label>
          <Input
            value={newBlock.title}
            onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
            placeholder="Ex: Travail, Sport, Repas..."
          />
        </div>
        <div>
          <Label>Début</Label>
          <Input
            type="time"
            value={newBlock.startTime}
            onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
          />
        </div>
        <div>
          <Label>Fin</Label>
          <Input
            type="time"
            value={newBlock.endTime}
            onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
          />
        </div>
        <Button
          onClick={() => {
            if (newBlock.title) {
              createBlockMutation.mutate({
                ...newBlock,
                date,
                color: colors[Math.floor(Math.random() * colors.length)],
              })
            }
          }}
          disabled={!newBlock.title || createBlockMutation.isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative min-h-[600px]">
            {/* Lignes horaires */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-dashed border-muted"
                style={{ top: `${hour * 60}px` }}
              >
                <div className="absolute left-0 w-16 text-xs text-muted-foreground -mt-2.5">
                  {format(setHours(new Date(), hour), 'HH:mm')}
                </div>
              </div>
            ))}

            {/* Blocs de temps */}
            {blocks.map((block: TimeBlock) => {
              const position = getBlockPosition(block.startTime, block.endTime)
              return (
                <div
                  key={block.id}
                  className="absolute left-20 right-4 rounded-lg p-2 text-white text-sm cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                  style={{
                    top: position.top,
                    height: position.height,
                    backgroundColor: block.color || '#3B82F6',
                  }}
                  onClick={() => onBlockSelect?.(block)}
                >
                  <div className="font-semibold">{block.title}</div>
                  <div className="text-xs opacity-90">
                    {block.startTime} - {block.endTime}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 text-white hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteBlockMutation.mutate(block.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

