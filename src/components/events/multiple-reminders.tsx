'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const presetReminders = [
  { label: '5 minutes avant', minutes: 5 },
  { label: '15 minutes avant', minutes: 15 },
  { label: '30 minutes avant', minutes: 30 },
  { label: '1 heure avant', minutes: 60 },
  { label: '2 heures avant', minutes: 120 },
  { label: '1 jour avant', minutes: 1440 },
  { label: '1 semaine avant', minutes: 10080 },
]

interface MultipleRemindersProps {
  eventId?: string
  initialReminders?: { minutes: number }[]
  onSave: (reminders: { minutes: number }[]) => void
}

export function MultipleReminders({ eventId, initialReminders = [], onSave }: MultipleRemindersProps) {
  const [reminders, setReminders] = useState<{ minutes: number }[]>(initialReminders)
  const { toast } = useToast()

  const addReminder = (minutes: number) => {
    if (reminders.some((r) => r.minutes === minutes)) {
      toast({ title: 'Ce rappel existe déjà', variant: 'destructive' })
      return
    }
    setReminders([...reminders, { minutes }].sort((a, b) => b.minutes - a.minutes))
  }

  const removeReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index))
  }

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    if (minutes < 1440) return `${Math.floor(minutes / 60)} h`
    return `${Math.floor(minutes / 1440)} j`
  }

  const handleSave = async () => {
    if (eventId) {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, reminders }),
      })
      if (res.ok) {
        toast({ title: 'Rappels sauvegardés' })
        onSave(reminders)
      }
    } else {
      onSave(reminders)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Rappels multiples</Label>
      
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presetReminders.map((preset) => (
          <Button
            key={preset.minutes}
            variant="outline"
            size="sm"
            onClick={() => addReminder(preset.minutes)}
            disabled={reminders.some((r) => r.minutes === preset.minutes)}
          >
            <Clock className="h-3 w-3 mr-1" />
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Liste des rappels */}
      {reminders.length > 0 && (
        <div className="space-y-2">
          <Label>Rappels configurés</Label>
          {reminders.map((reminder, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatMinutes(reminder.minutes)} avant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeReminder(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Custom reminder */}
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Minutes avant (ex: 120)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const minutes = parseInt(e.currentTarget.value)
              if (minutes > 0) {
                addReminder(minutes)
                e.currentTarget.value = ''
              }
            }
          }}
        />
        <Button
          variant="outline"
          onClick={() => {
            const input = document.querySelector('input[type="number"]') as HTMLInputElement
            const minutes = parseInt(input?.value || '0')
            if (minutes > 0) {
              addReminder(minutes)
              input.value = ''
            }
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {eventId && (
        <Button onClick={handleSave} className="w-full">
          Sauvegarder les rappels
        </Button>
      )}
    </div>
  )
}


