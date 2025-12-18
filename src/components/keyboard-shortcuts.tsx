'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

export function KeyboardShortcuts() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K : Recherche globale
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !e.shiftKey) {
        e.preventDefault()
        // Déclencher la recherche globale
        document.dispatchEvent(new CustomEvent('open-global-search'))
      }

      // Ctrl/Cmd + P : Command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !e.shiftKey) {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('open-command-palette'))
      }

      // Ctrl/Cmd + N : Nouveau (contexte dépendant)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.shiftKey) {
        e.preventDefault()
        const path = window.location.pathname
        if (path.includes('/projects')) {
          router.push('/projects?new=true')
        } else if (path.includes('/notes')) {
          router.push('/notes?new=true')
        } else {
          router.push('/appointments?new=true')
        }
      }

      // Ctrl/Cmd + / : Aide raccourcis
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        toast({
          title: 'Raccourcis clavier',
          description: 'Ctrl+K: Recherche | Ctrl+P: Commandes | Ctrl+N: Nouveau',
        })
      }

      // Échap : Fermer modales
      if (e.key === 'Escape') {
        // Fermer les modales ouvertes
        document.dispatchEvent(new CustomEvent('close-modals'))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, toast])

  return null
}

