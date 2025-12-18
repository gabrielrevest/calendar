'use client'

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Calendar className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Calendrier & Projets
          </CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à votre application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignedOut>
            <div className="space-y-3">
              <SignInButton 
                mode="modal"
                forceRedirectUrl="/dashboard"
                fallbackRedirectUrl="/dashboard"
              >
                <Button className="w-full" size="lg">
                  Se connecter
                </Button>
              </SignInButton>
              <SignUpButton 
                mode="modal"
                forceRedirectUrl="/dashboard"
                fallbackRedirectUrl="/dashboard"
              >
                <Button className="w-full" variant="outline" size="lg">
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
