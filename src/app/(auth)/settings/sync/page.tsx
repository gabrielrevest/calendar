'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Copy, RefreshCw, Smartphone, ExternalLink } from 'lucide-react'

export default function SyncSettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [calendarUrl, setCalendarUrl] = useState<string>('')

  // Récupérer ou générer le token
  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ['calendar-token'],
    queryFn: async () => {
      const res = await fetch('/api/calendar/token')
      if (!res.ok) throw new Error('Erreur lors de la récupération du token')
      return res.json()
    },
  })

  // Régénérer le token
  const regenerateToken = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/calendar/token', { method: 'POST' })
      if (!res.ok) throw new Error('Erreur lors de la régénération du token')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['calendar-token'], data)
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      setCalendarUrl(`${baseUrl}/api/calendar/ical?token=${data.token}`)
      toast({
        title: 'Token régénéré',
        description: 'Un nouveau token a été généré. Mettez à jour la configuration de votre iPhone.',
      })
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de régénérer le token.',
        variant: 'destructive',
      })
    },
  })

  // Générer l'URL de synchronisation
  useEffect(() => {
    if (tokenData?.token) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      setCalendarUrl(`${baseUrl}/api/calendar/ical?token=${tokenData.token}`)
    }
  }, [tokenData])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(calendarUrl)
    toast({
      title: 'URL copiée',
      description: "L'URL de synchronisation a été copiée dans le presse-papiers.",
    })
  }

  if (tokenLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">Chargement...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Synchronisation iPhone</h1>
        <p className="text-muted-foreground mt-2">
          Configurez la synchronisation de votre calendrier avec l'application Calendrier de l'iPhone
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            URL de synchronisation
          </CardTitle>
          <CardDescription>
            Utilisez cette URL pour ajouter votre calendrier dans l'application Calendrier de l'iPhone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calendar-url">URL du calendrier</Label>
            <div className="flex gap-2">
              <Input
                id="calendar-url"
                value={calendarUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={copyToClipboard} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => regenerateToken.mutate()}
              variant="outline"
              disabled={regenerateToken.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerateToken.isPending ? 'animate-spin' : ''}`} />
              Régénérer le token
            </Button>
            <Button
              onClick={() => window.open(calendarUrl, '_blank')}
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Tester l'URL
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Sur iPhone :</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Ouvrez l'application <strong>Réglages</strong></li>
              <li>Allez dans <strong>Calendrier</strong> → <strong>Comptes</strong></li>
              <li>Appuyez sur <strong>Ajouter un compte</strong></li>
              <li>Sélectionnez <strong>Autre</strong></li>
              <li>Choisissez <strong>Ajouter un compte CalDAV</strong></li>
              <li>Entrez les informations suivantes :
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>Serveur</strong> : Collez l'URL ci-dessus</li>
                  <li><strong>Nom d'utilisateur</strong> : (peut être laissé vide)</li>
                  <li><strong>Mot de passe</strong> : (peut être laissé vide)</li>
                </ul>
              </li>
              <li>Appuyez sur <strong>Suivant</strong></li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Alternative (plus simple) :</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Ouvrez Safari sur votre iPhone</li>
              <li>Collez l'URL ci-dessus dans la barre d'adresse</li>
              <li>Appuyez sur <strong>Abonner</strong> quand Safari vous le demande</li>
              <li>Le calendrier sera ajouté automatiquement</li>
            </ol>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              <strong>Note de sécurité :</strong> Cette URL contient un token unique qui vous identifie.
              Ne partagez pas cette URL avec d'autres personnes. Si vous pensez que votre token a été compromis,
              régénérez-le en cliquant sur le bouton ci-dessus.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

