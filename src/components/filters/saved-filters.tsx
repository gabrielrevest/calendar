'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Filter, Trash2, Star } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SavedFilter {
  id: string
  name: string
  type: 'events' | 'projects' | 'notes'
  filters: any
  isFavorite?: boolean
}

export function SavedFilters({ type, onFilterApply }: { type: 'events' | 'projects' | 'notes'; onFilterApply: (filters: any) => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterName, setFilterName] = useState('')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: savedFilters = [] } = useQuery({
    queryKey: ['saved-filters', type],
    queryFn: async () => {
      const res = await fetch(`/api/filters?type=${type}`)
      if (!res.ok) return []
      return res.json()
    },
  })

  const saveFilterMutation = useMutation({
    mutationFn: async (data: { name: string; filters: any }) => {
      const res = await fetch('/api/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type }),
      })
      if (!res.ok) throw new Error('Failed to save filter')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters'] })
      setFilterName('')
      setIsDialogOpen(false)
      toast({ title: 'Filtre sauvegardé' })
    },
  })

  const deleteFilterMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/filters/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters'] })
      toast({ title: 'Filtre supprimé' })
    },
  })

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {savedFilters.map((filter: SavedFilter) => (
        <Button
          key={filter.id}
          variant="outline"
          size="sm"
          onClick={() => onFilterApply(filter.filters)}
          className="gap-2"
        >
          {filter.isFavorite && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />}
          <Filter className="h-3 w-3" />
          {filter.name}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={(e) => {
              e.stopPropagation()
              deleteFilterMutation.mutate(filter.id)
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
            Sauvegarder le filtre
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarder le filtre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom du filtre</Label>
              <Input
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Ex: Projets urgents"
              />
            </div>
            <Button
              onClick={() => {
                // Récupérer les filtres actuels depuis le contexte
                saveFilterMutation.mutate({
                  name: filterName,
                  filters: {}, // À remplir avec les filtres actuels
                })
              }}
              disabled={!filterName.trim() || saveFilterMutation.isPending}
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

