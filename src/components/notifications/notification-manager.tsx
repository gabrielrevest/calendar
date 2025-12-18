'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, BellOff, Settings } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === 'granted') {
        toast({ title: 'Notifications activées' })
      }
    }
  }

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test de notification', {
        body: 'Les notifications fonctionnent correctement !',
        icon: '/icon.png',
      })
      toast({ title: 'Notification de test envoyée' })
    }
  }

  const { data: settings } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const res = await fetch('/api/notifications/settings')
      if (!res.ok) return { enabled: true, email: false, push: true }
      return res.json()
    },
  })

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] })
      toast({ title: 'Paramètres sauvegardés' })
    },
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications navigateur</Label>
              <p className="text-sm text-muted-foreground">
                Statut: {permission === 'granted' ? 'Activé' : permission === 'denied' ? 'Refusé' : 'Non demandé'}
              </p>
            </div>
            {permission !== 'granted' ? (
              <Button onClick={requestPermission} variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Activer
              </Button>
            ) : (
              <Button onClick={sendTestNotification} variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Tester
              </Button>
            )}
          </div>

          {settings && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des notifications push
                  </p>
                </div>
                <Switch
                  checked={settings.push}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({ ...settings, push: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des notifications par email
                  </p>
                </div>
                <Switch
                  checked={settings.email}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({ ...settings, email: checked })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

