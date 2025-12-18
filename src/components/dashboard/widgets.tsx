'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GripVertical, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Widget {
  id: string
  type: 'calendar' | 'tasks' | 'stats' | 'notes' | 'habits'
  title: string
  position: { x: number; y: number }
  size: { w: number; h: number }
}

const availableWidgets = [
  { id: 'calendar', type: 'calendar', title: 'Calendrier', icon: '📅' },
  { id: 'tasks', type: 'tasks', title: 'Tâches', icon: '✓' },
  { id: 'stats', type: 'stats', title: 'Statistiques', icon: '📊' },
  { id: 'notes', type: 'notes', title: 'Notes récentes', icon: '📝' },
  { id: 'habits', type: 'habits', title: 'Habitudes', icon: '🎯' },
]

export function DashboardWidgets() {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [isAdding, setIsAdding] = useState(false)

  const addWidget = (type: string) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: type as any,
      title: availableWidgets.find((w) => w.id === type)?.title || 'Widget',
      position: { x: 0, y: 0 },
      size: { w: 300, h: 200 },
    }
    setWidgets([...widgets, newWidget])
    setIsAdding(false)
  }

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Widgets du tableau de bord</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un widget
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {availableWidgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => addWidget(widget.id)}
                  className="p-4 border rounded-lg hover:border-primary transition-colors text-center"
                >
                  <div className="text-2xl mb-2">{widget.icon}</div>
                  <div className="text-sm font-medium">{widget.title}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((widget) => (
          <Card key={widget.id} className="relative">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">{widget.title}</CardTitle>
              <div className="flex gap-1">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeWidget(widget.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Contenu du widget {widget.type}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {widgets.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aucun widget. Ajoutez-en un pour personnaliser votre tableau de bord.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

