'use client'

import { useUser } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { Moon, Sun, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, isLoaded } = useUser()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
        
        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Changer de thème</span>
          </Button>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            {isLoaded && (
              <span className="hidden sm:block text-sm font-medium">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Utilisateur'}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}




