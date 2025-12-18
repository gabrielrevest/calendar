'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Moon, BellOff } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function DoNotDisturb() {
  const [enabled, setEnabled] = useState(false)
  const [startTime, setStartTime] = useState('22:00')
  const [endTime, setEndTime] = useState('08:00')
  const { toast } = useToast()

  const handleSave = () => {
    // Sauvegarder les paramètres
    toast({ title: 'Paramètres sauvegardés' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5" />
          Ne pas déranger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Activer</Label>
            <p className="text-sm text-muted-foreground">
              Désactiver les notifications pendant cette période
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Heure de début</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label>Heure de fin</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BellOff className="h-4 w-4" />
              Les notifications seront désactivées de {startTime} à {endTime}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

