'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { parse } from 'date-fns'
import { fr } from 'date-fns/locale'

interface NaturalLanguageInputProps {
  onParse: (data: { title: string; date?: Date; time?: string }) => void
}

export function NaturalLanguageInput({ onParse }: NaturalLanguageInputProps) {
  const [input, setInput] = useState('')

  const parseInput = (text: string) => {
    // Exemples: "Réunion demain à 14h", "Dentiste lundi prochain", "Anniversaire le 15 mars"
    const lowerText = text.toLowerCase()

    // Extraire la date
    let date: Date | undefined
    const today = new Date()
    
    if (lowerText.includes('demain')) {
      date = new Date(today)
      date.setDate(date.getDate() + 1)
    } else if (lowerText.includes('après-demain')) {
      date = new Date(today)
      date.setDate(date.getDate() + 2)
    } else if (lowerText.includes('lundi')) {
      const daysUntilMonday = (1 - today.getDay() + 7) % 7 || 7
      date = new Date(today)
      date.setDate(date.getDate() + daysUntilMonday)
    } else if (lowerText.includes('mardi')) {
      const daysUntilTuesday = (2 - today.getDay() + 7) % 7 || 7
      date = new Date(today)
      date.setDate(date.getDate() + daysUntilTuesday)
    } else if (lowerText.includes('mercredi')) {
      const daysUntilWednesday = (3 - today.getDay() + 7) % 7 || 7
      date = new Date(today)
      date.setDate(date.getDate() + daysUntilWednesday)
    } else if (lowerText.includes('jeudi')) {
      const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7
      date = new Date(today)
      date.setDate(date.getDate() + daysUntilThursday)
    } else if (lowerText.includes('vendredi')) {
      const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7
      date = new Date(today)
      date.setDate(date.getDate() + daysUntilFriday)
    } else if (lowerText.includes('samedi')) {
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7
      date = new Date(today)
      date.setDate(date.getDate() + daysUntilSaturday)
    } else if (lowerText.includes('dimanche')) {
      const daysUntilSunday = (0 - today.getDay() + 7) % 7 || 7
      date = new Date(today)
      date.setDate(date.getDate() + daysUntilSunday)
    }

    // Extraire l'heure
    let time: string | undefined
    const timeMatch = text.match(/(\d{1,2})[h:](\d{2})?/i)
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0')
      const minutes = timeMatch[2] || '00'
      time = `${hours}:${minutes}`
    }

    // Extraire le titre (tout sauf les mots-clés de date/heure)
    const dateKeywords = ['demain', 'après-demain', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
    const timeKeywords = /\d{1,2}[h:]\d{0,2}/gi
    let title = text
      .replace(new RegExp(dateKeywords.join('|'), 'gi'), '')
      .replace(timeKeywords, '')
      .trim()

    if (!title) {
      title = 'Nouvel événement'
    }

    onParse({ title, date, time })
    setInput('')
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Ex: Réunion demain à 14h, Dentiste lundi prochain..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim()) {
            parseInput(input)
          }
        }}
      />
      <Button
        onClick={() => {
          if (input.trim()) {
            parseInput(input)
          }
        }}
        disabled={!input.trim()}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Analyser
      </Button>
    </div>
  )
}

