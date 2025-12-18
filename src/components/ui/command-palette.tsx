'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Calendar, FolderKanban, StickyNote, BookOpen, BarChart3, User, Settings, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

const commands = [
  {
    id: 'new-event',
    label: 'Nouvel événement',
    icon: Calendar,
    action: '/appointments?new=true',
  },
  {
    id: 'new-project',
    label: 'Nouveau projet',
    icon: FolderKanban,
    action: '/projects?new=true',
  },
  {
    id: 'new-note',
    label: 'Nouvelle note',
    icon: StickyNote,
    action: '/notes?new=true',
  },
  {
    id: 'calendar',
    label: 'Ouvrir Calendrier',
    icon: Calendar,
    action: '/calendar',
  },
  {
    id: 'projects',
    label: 'Ouvrir Projets',
    icon: FolderKanban,
    action: '/projects',
  },
  {
    id: 'notes',
    label: 'Ouvrir Notes',
    icon: StickyNote,
    action: '/notes',
  },
  {
    id: 'journal',
    label: 'Ouvrir Journal',
    icon: BookOpen,
    action: '/journal',
  },
  {
    id: 'stats',
    label: 'Ouvrir Statistiques',
    icon: BarChart3,
    action: '/stats',
  },
  {
    id: 'profile',
    label: 'Ouvrir Profil',
    icon: User,
    action: '/profile',
  },
]

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const { data: searchResults = [] } = useQuery({
    queryKey: ['command-search', search],
    queryFn: async () => {
      if (!search || search.length < 2) return []
      const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: search.length >= 2,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !e.shiftKey) {
        e.preventDefault()
        onOpenChange(true)
      }
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onOpenChange])

  const allCommands = [
    ...commands,
    ...searchResults.map((result: any) => ({
      id: result.id,
      label: result.title,
      icon: Calendar,
      action: result.url,
      isSearchResult: true,
    })),
  ]

  const handleSelect = (command: any) => {
    if (command.action) {
      router.push(command.action)
      onOpenChange(false)
      setSearch('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <Command className="rounded-lg border-0">
          <CommandInput placeholder="Tapez une commande ou recherchez... (Ctrl+P)" />
          <CommandList>
            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
            <CommandGroup heading="Commandes">
              {commands
                .filter((cmd) =>
                  cmd.label.toLowerCase().includes(search.toLowerCase())
                )
                .map((command) => {
                  const Icon = command.icon
                  return (
                    <CommandItem
                      key={command.id}
                      onSelect={() => handleSelect(command)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {command.label}
                    </CommandItem>
                  )
                })}
            </CommandGroup>
            {searchResults.length > 0 && (
              <CommandGroup heading="Résultats de recherche">
                {searchResults.map((result: any) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    {result.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}


