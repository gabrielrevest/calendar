'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Eye, Trash2, Star } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SavedView {
  id: string
  name: string
  type: 'calendar' | 'projects' | 'notes'
  filters: any
  layout: any
  isFavorite?: boolean
}

export function SavedViews({ type, onViewLoad }: { type: 'calendar' | 'projects' | 'notes'; onViewLoad: (view: SavedView) => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewName, setViewName] = useState('')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: views = [] } = useQuery({
    queryKey: ['saved-views', type],
    queryFn: async () => {
      const res = await fetch(`/api/views?type=${type}`)
      if (!res.ok) return []
      return res.json()
    },
  })

  const saveViewMutation = useMutation({
    mutationFn: async (data: { name: string; filters: any; layout: any }) => {
      const res = await fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type }),
      })
      if (!res.ok) throw new Error('Failed to save view')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-views'] })
      setViewName('')
      setIsDialogOpen(false)
      toast({ title: 'Vue sauvegardée' })
    },
  })

  const deleteViewMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/views/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-views'] })
      toast({ title: 'Vue supprimée' })
    },
  })

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {views.map((view: SavedView) => (
        <Button
          key={view.id}
          variant="outline"
          size="sm"
          onClick={() => onViewLoad(view)}
          className="gap-2"
        >
          {view.isFavorite && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />}
          <Eye className="h-3 w-3" />
          {view.name}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={(e) => {
              e.stopPropagation()
              deleteViewMutation.mutate(view.id)
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </Button>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Sauvegarder la vue
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarder la vue actuelle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom de la vue</Label>
              <Input
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="Ex: Vue personnalisée"
              />
            </div>
            <Button
              onClick={() => {
                // Récupérer les filtres et layout actuels
                saveViewMutation.mutate({
                  name: viewName,
                  filters: {}, // À remplir avec les filtres actuels
                  layout: {}, // À remplir avec le layout actuel
                })
              }}
              disabled={!viewName.trim() || saveViewMutation.isPending}
              className="w-full"
            >
              Sauvegarder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

