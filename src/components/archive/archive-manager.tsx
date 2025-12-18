'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Archive, Unarchive } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'

export function ArchiveManager() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: archivedItems = [] } = useQuery({
    queryKey: ['archived'],
    queryFn: async () => {
      const res = await fetch('/api/archive')
      if (!res.ok) return []
      return res.json()
    },
  })

  const unarchiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/archive/${id}/unarchive`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to unarchive')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archived'] })
      toast({ title: 'Élément désarchivé' })
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Archive className="h-6 w-6" />
          Archives
        </h2>
      </div>

      {archivedItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aucun élément archivé
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {archivedItems.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Archivé le {format(new Date(item.archivedAt), 'dd MMMM yyyy')}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unarchiveMutation.mutate(item.id)}
                >
                  <Unarchive className="h-4 w-4 mr-2" />
                  Désarchiver
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

