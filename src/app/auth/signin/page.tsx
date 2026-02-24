'use client'

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export default function SignInPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard')
    }
  }, [user, isLoaded, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.14),_transparent_55%),linear-gradient(to_bottom_right,_hsl(var(--background)),_hsl(var(--muted)/0.4))] p-4">
      <Card className="w-full max-w-lg border-2 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full shadow-lg shadow-primary/30">
              <Calendar className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Calendrier & Projets
          </CardTitle>
          <CardDescription className="text-base text-foreground/80">
            Connexion rapide, claire et securisee
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl border bg-background/70 p-3 text-sm">
            <div className="grid gap-2 text-foreground/85">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Acces immediat a vos evenements et projets</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-sky-500" />
                <span>Synchronisation iPhone via lien iCal personnel</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-violet-500" />
                <span>Compte isole, donnees privees par utilisateur</span>
              </div>
            </div>
          </div>
          <SignedOut>
            <div className="space-y-3">
              <SignInButton 
                mode="modal"
                forceRedirectUrl="/dashboard"
                fallbackRedirectUrl="/dashboard"
              >
                <Button className="w-full text-base font-semibold shadow-md" size="lg">
                  Se connecter
                </Button>
              </SignInButton>
              <SignUpButton 
                mode="modal"
                forceRedirectUrl="/dashboard"
                fallbackRedirectUrl="/dashboard"
              >
                <Button className="w-full text-base font-semibold border-2" variant="outline" size="lg">
                  Créer un compte
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Vous êtes connecté
              </p>
              <UserButton afterSignOutUrl="/auth/signin" />
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Aller au tableau de bord
              </Button>
            </div>
          </SignedIn>
        </CardContent>
      </Card>
    </div>
  )
}
