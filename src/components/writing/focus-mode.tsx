'use client'

import { useState, useEffect } from 'react'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FocusModeProps {
  children: React.ReactNode
  title?: string
  onExit?: () => void
}

export function FocusMode({ children, title, onExit }: FocusModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && e.shiftKey) {
        e.preventDefault()
        setIsFullscreen(!isFullscreen)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  if (!isFullscreen) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10"
          onClick={() => setIsFullscreen(true)}
          title="Mode focus (Ctrl+Shift+F)"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        {children}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-background">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title || 'Mode Focus'}</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              title="Quitter le mode focus (Escape)"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            {onExit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-sm text-muted-foreground text-center">
          <kbd className="px-2 py-1 bg-muted rounded">Escape</kbd> pour quitter • <kbd className="px-2 py-1 bg-muted rounded">Ctrl+Shift+F</kbd> pour basculer
        </div>
      </div>
    </div>
  )
}


