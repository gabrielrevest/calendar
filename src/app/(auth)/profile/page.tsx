'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useSession, signOut } from 'next-auth/react'
import { User, Mail, Calendar, Save, LogOut, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { IPhoneSyncDialog } from '@/components/sync/iphone-sync-dialog'

export default function ProfilePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  })

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
      toast({ title: 'Profil mis à jour !' })
    },
    onError: () => {
      toast({ title: 'Erreur', variant: 'destructive' })
    },
  })

  const handleSave = () => {
    updateMutation.mutate({ name: formData.name })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mon Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Modifiez vos informations de profil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Votre nom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                L'email ne peut pas être modifié
              </p>
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </CardContent>
        </Card>

        {/* Synchronisation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Synchronisation
            </CardTitle>
            <CardDescription>
              Synchronisez votre calendrier avec votre iPhone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowSyncDialog(true)}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Configurer la synchronisation iPhone
            </Button>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Statistiques
            </CardTitle>
            <CardDescription>
              Vos données en un coup d'œil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Membre depuis</span>
                <span className="font-medium">
                  {session?.user?.email ? 'Aujourd\'hui' : '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>
              Gérer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>

      <IPhoneSyncDialog open={showSyncDialog} onOpenChange={setShowSyncDialog} />
    </div>
  )
}


