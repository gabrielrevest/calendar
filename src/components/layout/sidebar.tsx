'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import {
  Calendar,
  LayoutDashboard,
  FolderKanban,
  StickyNote,
  CalendarClock,
  LogOut,
  Menu,
  X,
  Smartphone,
  User,
  BookOpen,
  Search,
  BarChart3,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { IPhoneSyncDialog } from '@/components/sync/iphone-sync-dialog'
import { GlobalSearch } from '@/components/search/global-search'
import { CommandPalette } from '@/components/ui/command-palette'

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendrier', href: '/calendar', icon: Calendar },
  { name: 'Rendez-vous', href: '/appointments', icon: CalendarClock },
  { name: 'Projets', href: '/projects', icon: FolderKanban },
  { name: 'Notes', href: '/notes', icon: StickyNote },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Statistiques', href: '/stats', icon: BarChart3 },
  { name: 'Synchronisation', href: '/settings/sync', icon: Smartphone },
  { name: 'Profil', href: '/profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [iPhoneSyncOpen, setIPhoneSyncOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-5 border-b">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Calendrier</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="p-4 border-t space-y-2">
            {/* Recherche globale */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Search className="h-5 w-5" />
              Recherche (Ctrl+K)
            </button>
            
            {/* Sync iPhone */}
            <button
              onClick={() => setIPhoneSyncOpen(true)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Smartphone className="h-5 w-5" />
              Synchroniser iPhone
            </button>

            {/* Logout */}
            <button
              onClick={() => signOut({ redirectUrl: '/auth/signin' })}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* iPhone Sync Dialog */}
      <IPhoneSyncDialog open={iPhoneSyncOpen} onOpenChange={setIPhoneSyncOpen} />
      
      {/* Global Search */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      
      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </>
  )
}
