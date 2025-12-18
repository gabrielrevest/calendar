'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Checkbox } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from '@tanstack/react-query'

interface DuplicateDialogProps {
  item: { id: string; type: 'event' | 'project' | 'note'; title: string }
  onDuplicate?: (duplicatedId: string) => void
}

export function DuplicateDialog({ item, onDuplicate }: DuplicateDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newTitle, setNewTitle] = useState(`${item.title} (Copie)`)
  const [includeRelations, setIncludeRelations] = useState(true)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleDuplicate = async () => {
    try {
      const res = await fetch(`/api/${item.type}s/${item.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, includeRelations }),
      })

      if (!res.ok) throw new Error('Duplication failed')

      const data = await res.json()
      queryClient.invalidateQueries({ queryKey: [item.type + 's'] })
      toast({ title: 'Élément dupliqué' })
      setIsOpen(false)
      onDuplicate?.(data.id)
    } catch (error) {
      toast({ title: 'Erreur lors de la duplication', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Dupliquer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dupliquer {item.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nouveau titre</Label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="include-relations"
              checked={includeRelations}
              onChange={(e) => setIncludeRelations(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="include-relations" className="cursor-pointer">
              Inclure les relations (tâches, notes, etc.)
            </Label>
          </div>
          <Button onClick={handleDuplicate} className="w-full">
            <Copy className="h-4 w-4 mr-2" />
            Dupliquer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

