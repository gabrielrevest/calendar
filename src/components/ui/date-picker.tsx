'use client'

import * as React from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  showTime?: boolean
  clearable?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Sélectionner une date',
  showTime = false,
  clearable = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(value || new Date())
  const [selectedHour, setSelectedHour] = React.useState(value ? value.getHours() : 9)
  const [selectedMinute, setSelectedMinute] = React.useState(value ? value.getMinutes() : 0)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  const startDayOfWeek = monthStart.getDay()
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  const handleSelectDate = (day: Date) => {
    const newDate = new Date(day)
    if (showTime) {
      newDate.setHours(selectedHour, selectedMinute, 0, 0)
    }
    onChange(newDate)
    if (!showTime) {
      setOpen(false)
    }
  }

  const handleTimeChange = (hour: number, minute: number) => {
    setSelectedHour(hour)
    setSelectedMinute(minute)
    if (value) {
      const newDate = new Date(value)
      newDate.setHours(hour, minute, 0, 0)
      onChange(newDate)
    }
  }

  const handleToday = () => {
    const today = new Date()
    if (showTime) {
      today.setHours(selectedHour, selectedMinute, 0, 0)
    }
    onChange(today)
    setCurrentMonth(today)
    if (!showTime) {
      setOpen(false)
    }
  }

  const handleClear = () => {
    onChange(undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {value ? (
            format(value, showTime ? 'PPP HH:mm' : 'PPP', { locale: fr })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map((day) => (
              <div
                key={day}
                className="text-center text-xs text-muted-foreground font-medium py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Jours du mois */}
          <div className="grid grid-cols-7 gap-1">
            {/* Padding pour le premier jour */}
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`padding-${i}`} className="h-8 w-8" />
            ))}
            
            {days.map((day) => {
              const isSelected = value && isSameDay(day, value)
              const isTodayDate = isToday(day)
              
              return (
                <Button
                  key={day.toISOString()}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8 p-0 font-normal',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                    isTodayDate && !isSelected && 'border border-primary',
                    !isSameMonth(day, currentMonth) && 'text-muted-foreground opacity-50'
                  )}
                  onClick={() => handleSelectDate(day)}
                >
                  {format(day, 'd')}
                </Button>
              )
            })}
          </div>

          {/* Sélection de l'heure */}
          {showTime && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-center gap-2">
                <select
                  value={selectedHour}
                  onChange={(e) => handleTimeChange(parseInt(e.target.value), selectedMinute)}
                  className="px-2 py-1 border rounded-md bg-background"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={selectedMinute}
                  onChange={(e) => handleTimeChange(selectedHour, parseInt(e.target.value))}
                  className="px-2 py-1 border rounded-md bg-background"
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>
                      {m.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 pt-4 border-t flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleToday}
            >
              Aujourd&apos;hui
            </Button>
            {clearable && value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {showTime && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                OK
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}




