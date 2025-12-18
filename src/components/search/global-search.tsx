'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar, StickyNote, FolderKanban, BookOpen, Search, X } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'event' | 'note' | 'project' | 'journal'
  title: string
  description?: string
  date?: Date
  url: string
}

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['global-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return []
      
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: query.length >= 2,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
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

  const handleSelect = (result: SearchResult) => {
    router.push(result.url)
    onOpenChange(false)
    setQuery('')
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4" />
      case 'note':
        return <StickyNote className="h-4 w-4" />
      case 'project':
        return <FolderKanban className="h-4 w-4" />
      case 'journal':
        return <BookOpen className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Recherche globale</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les événements, notes, projets... (Ctrl+K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {query.length < 2 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Tapez au moins 2 caractères pour rechercher
            </div>
          )}

          {isLoading && query.length >= 2 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Recherche en cours...
            </div>
          )}

          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Aucun résultat trouvé
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {results.map((result: SearchResult) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getIcon(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      {result.description && (
                        <div className="text-sm text-muted-foreground truncate mt-1">
                          {result.description}
                        </div>
                      )}
                      {result.date && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(result.date), 'd MMMM yyyy', { locale: fr })}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-2 border-t">
            <kbd className="px-2 py-1 bg-muted rounded">Ctrl+K</kbd> pour ouvrir la recherche
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


