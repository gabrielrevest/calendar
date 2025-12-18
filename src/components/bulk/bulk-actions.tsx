'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Move, Trash2, Tag, Folder } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from '@tanstack/react-query'

interface BulkActionsProps {
  selectedItems: string[]
  type: 'events' | 'projects' | 'notes'
  onClearSelection: () => void
}

export function BulkActions({ selectedItems, type, onClearSelection }: BulkActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [action, setAction] = useState<'move' | 'delete' | 'tag'>('move')
  const [targetCategory, setTargetCategory] = useState('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleBulkAction = async () => {
    try {
      const res = await fetch(`/api/${type}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedItems,
          action,
          targetCategory,
        }),
      })

      if (!res.ok) throw new Error('Bulk action failed')

      queryClient.invalidateQueries({ queryKey: [type] })
      toast({ title: `${selectedItems.length} éléments modifiés` })
      setIsDialogOpen(false)
      onClearSelection()
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  if (selectedItems.length === 0) return null

  return (
    <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
      <span className="text-sm font-medium">{selectedItems.length} sélectionné(s)</span>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
          <Move className="h-4 w-4 mr-2" />
          Actions en masse
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actions en masse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Action</Label>
              <Select value={action} onValueChange={(v: any) => setAction(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="move">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      Déplacer
                    </div>
                  </SelectItem>
                  <SelectItem value="delete">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </div>
                  </SelectItem>
                  <SelectItem value="tag">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Ajouter un tag
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(action === 'move' || action === 'tag') && (
              <div>
                <Label>Catégorie</Label>
                <Select value={targetCategory} onValueChange={setTargetCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* À remplir avec les catégories */}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleBulkAction} className="w-full">
              Appliquer à {selectedItems.length} élément(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Annuler
      </Button>
    </div>
  )
}

