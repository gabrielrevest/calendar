'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Smartphone, Copy, Check, RefreshCw, ExternalLink, 
  ChevronRight, AlertCircle, Download
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface IPhoneSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IPhoneSyncDialog({ open, onOpenChange }: IPhoneSyncDialogProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState(1)

  // Récupérer le token
  const { data: tokenData, isLoading, refetch } = useQuery({
    queryKey: ['calendar-token'],
    queryFn: async () => {
      const res = await fetch('/api/calendar/token')
      if (!res.ok) throw new Error('Failed to fetch token')
      return res.json()
    },
    enabled: open,
  })

  // Régénérer le token
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/calendar/token', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to regenerate token')
      return res.json()
    },
    onSuccess: () => {
      refetch()
      toast({ title: 'Nouveau lien généré', description: 'L\'ancien lien ne fonctionne plus.' })
    },
  })

  const [subscribeUrl, setSubscribeUrl] = useState('')
  const [localIP, setLocalIP] = useState<string | null>(null)

  // Obtenir l'IP locale pour Electron
  useEffect(() => {
    if (tokenData?.token && typeof window !== 'undefined') {
      const getIP = async () => {
        try {
          // En Electron, utiliser l'API os
          if ((window as any).require) {
            const os = (window as any).require('os')
            const interfaces = os.networkInterfaces()
            
            for (const name of Object.keys(interfaces)) {
              for (const iface of interfaces[name] || []) {
                if (iface.family === 'IPv4' && !iface.internal) {
                  const ip = iface.address
                  setLocalIP(ip)
                  const port = window.location.port || '3000'
                  setSubscribeUrl(`http://${ip}:${port}/api/calendar/ical?token=${tokenData.token}`)
                  return
                }
              }
            }
          }
          
          // Fallback: utiliser l'origin actuel
          const origin = window.location.origin
          setSubscribeUrl(`${origin}/api/calendar/ical?token=${tokenData.token}`)
        } catch (error) {
          console.error('Error getting local IP:', error)
          const origin = window.location.origin
          setSubscribeUrl(`${origin}/api/calendar/ical?token=${tokenData.token}`)
        }
      }
      getIP()
    }
  }, [tokenData?.token])
  
  // URL pour iPhone (webcal://)
  const iphoneUrl = subscribeUrl.replace('http://', 'webcal://').replace('https://', 'webcal://')

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({ title: 'Lien copié !' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Erreur de copie', variant: 'destructive' })
    }
  }

  const downloadIcs = () => {
    window.open(subscribeUrl, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Synchroniser avec iPhone
          </DialogTitle>
          <DialogDescription>
            Abonnez-vous à votre calendrier sur iPhone pour voir tous vos rendez-vous
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Lien d'abonnement */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Lien d'abonnement</label>
              <div className="flex gap-2">
                <Input
                  value={subscribeUrl}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(subscribeUrl)}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => regenerateMutation.mutate()}
                  disabled={regenerateMutation.isPending}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", regenerateMutation.isPending && "animate-spin")} />
                  Nouveau lien
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadIcs}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger .ics
                </Button>
              </div>
            </div>

            {/* Instructions étape par étape */}
            <div className="space-y-4">
              <h3 className="font-semibold">Comment s'abonner sur iPhone :</h3>
              
              <div className="space-y-3">
                <StepItem 
                  number={1} 
                  active={step === 1}
                  onClick={() => setStep(1)}
                  title="Ouvrir Réglages"
                  description="Sur votre iPhone, ouvrez l'app Réglages"
                />
                
                <StepItem 
                  number={2} 
                  active={step === 2}
                  onClick={() => setStep(2)}
                  title="Aller dans Calendrier"
                  description="Faites défiler et appuyez sur 'Calendrier'"
                />
                
                <StepItem 
                  number={3} 
                  active={step === 3}
                  onClick={() => setStep(3)}
                  title="Comptes"
                  description="Appuyez sur 'Comptes' puis 'Ajouter un compte'"
                />
                
                <StepItem 
                  number={4} 
                  active={step === 4}
                  onClick={() => setStep(4)}
                  title="Autre"
                  description="Sélectionnez 'Autre' en bas de la liste"
                />
                
                <StepItem 
                  number={5} 
                  active={step === 5}
                  onClick={() => setStep(5)}
                  title="Ajouter un calendrier avec abonnement"
                  description="Appuyez sur 'Ajouter un cal. avec abonnement'"
                />
                
                <StepItem 
                  number={6} 
                  active={step === 6}
                  onClick={() => setStep(6)}
                  title="Coller le lien"
                  description="Collez le lien copié ci-dessus dans le champ 'Serveur'"
                />
                
                <StepItem 
                  number={7} 
                  active={step === 7}
                  onClick={() => setStep(7)}
                  title="Terminé !"
                  description="Appuyez sur 'Suivant' puis 'Enregistrer'. Vos événements apparaîtront dans l'app Calendrier !"
                />
              </div>
            </div>

            {/* Avertissement */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Important - Réseau requis</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Pour que la synchronisation fonctionne, votre iPhone et votre ordinateur doivent être 
                    <strong> sur le même réseau Wi-Fi</strong>. L'application utilise l'adresse IP locale : 
                    {localIP && <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded">{localIP}</code>}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-sm">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Mises à jour</p>
                  <p className="text-amber-700 dark:text-amber-300">
                    L'iPhone vérifie les mises à jour automatiquement. Si vous ajoutez un événement, 
                    il peut prendre quelques minutes à apparaître sur iPhone.
                  </p>
                </div>
              </div>
            </div>

            {/* Méthode alternative */}
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Méthode rapide :</strong> Envoyez-vous le lien par email, puis ouvrez-le sur iPhone. 
                Safari proposera automatiquement de s'abonner au calendrier.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.location.href = `mailto:?subject=Mon%20calendrier&body=Lien%20d'abonnement%20:%20${encodeURIComponent(subscribeUrl)}`
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                M'envoyer par email
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function StepItem({ 
  number, 
  active, 
  onClick, 
  title, 
  description 
}: { 
  number: number
  active: boolean
  onClick: () => void
  title: string
  description: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
        active ? "bg-primary/10" : "hover:bg-accent"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      )}>
        {number}
      </div>
      <div>
        <p className={cn("font-medium", active && "text-primary")}>{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}



