'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Restore, Delete, Calendar, FolderKanban, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'

export function TrashManager() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: trashItems = [] } = useQuery({
    queryKey: ['trash'],
    queryFn: async () => {
      const res = await fetch('/api/trash')
      if (!res.ok) return []
      return res.json()
    },
  })

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trash/${id}/restore`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to restore')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] })
      toast({ title: 'Élément restauré' })
    },
  })

  const deletePermanentlyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trash/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] })
      toast({ title: 'Élément supprimé définitivement' })
    },
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4" />
      case 'project':
        return <FolderKanban className="h-4 w-4" />
      case 'note':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trash2 className="h-6 w-6" />
          Corbeille
        </h2>
        {trashItems.length > 0 && (
          <Button
            variant="destructive"
            onClick={async () => {
              await Promise.all(trashItems.map((item: any) => deletePermanentlyMutation.mutate(item.id)))
            }}
          >
            <Delete className="h-4 w-4 mr-2" />
            Vider la corbeille
          </Button>
        )}
      </div>

      {trashItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            La corbeille est vide
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {trashItems.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getIcon(item.type)}
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Supprimé le {format(new Date(item.deletedAt), 'dd MMMM yyyy à HH:mm')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => restoreMutation.mutate(item.id)}
                  >
                    <Restore className="h-4 w-4 mr-2" />
                    Restaurer
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletePermanentlyMutation.mutate(item.id)}
                  >
                    <Delete className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

