'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Link2, Search, FileText, Calendar, FolderKanban, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InternalLinksProps {
  content: string
  onContentChange: (content: string) => void
}

export function InternalLinks({ content, onContentChange }: InternalLinksProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  const { data: results = [] } = useQuery({
    queryKey: ['internal-links', search],
    queryFn: async () => {
      if (!search || search.length < 2) return []
      const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: search.length >= 2,
  })

  const insertLink = (item: any) => {
    const linkText = `[[${item.title}]]`
    const newContent = content + (content ? ' ' : '') + linkText
    onContentChange(newContent)
    setIsDialogOpen(false)
    setSearch('')
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4" />
      case 'note':
        return <FileText className="h-4 w-4" />
      case 'project':
        return <FolderKanban className="h-4 w-4" />
      case 'journal':
        return <BookOpen className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="h-4 w-4 mr-2" />
          Lien interne
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lier à un élément</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {search.length < 2 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Tapez au moins 2 caractères pour rechercher
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {results.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => insertLink(item)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors flex items-center gap-3"
                >
                  {getIcon(item.type)}
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.type}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


