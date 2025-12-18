'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, Square, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'

interface TimerProps {
  projectId: string
  onTimeTracked?: (minutes: number) => void
}

export function Timer({ projectId, onTimeTracked }: TimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date()
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        setElapsed(diff)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, startTime])

  const start = () => {
    setStartTime(new Date())
    setIsRunning(true)
    toast({ title: 'Timer démarré' })
  }

  const pause = () => {
    setIsRunning(false)
    toast({ title: 'Timer en pause' })
  }

  const stop = async () => {
    if (startTime && elapsed > 0) {
      const minutes = Math.floor(elapsed / 60)
      if (onTimeTracked) {
        onTimeTracked(minutes)
      }
      
      // Sauvegarder le temps
      try {
        await fetch(`/api/projects/${projectId}/time`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ minutes }),
        })
        toast({ title: `${minutes} minutes enregistrés` })
      } catch (error) {
        console.error('Error saving time:', error)
      }
    }
    
    setIsRunning(false)
    setElapsed(0)
    setStartTime(null)
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-2xl font-mono font-bold">
                {formatTime(elapsed)}
              </div>
              <div className="text-xs text-muted-foreground">
                {isRunning ? 'En cours...' : 'Arrêté'}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isRunning ? (
              <Button onClick={start} size="sm">
                <Play className="h-4 w-4 mr-2" />
                Démarrer
              </Button>
            ) : (
              <Button onClick={pause} size="sm" variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {elapsed > 0 && (
              <Button onClick={stop} size="sm" variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Arrêter
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


