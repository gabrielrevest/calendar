'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { History, Restore } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'

interface VersionHistoryProps {
  noteId: string
}

export function VersionHistory({ noteId }: VersionHistoryProps) {
  const { toast } = useToast()

  const { data: versions = [] } = useQuery({
    queryKey: ['note-versions', noteId],
    queryFn: async () => {
      const res = await fetch(`/api/notes/${noteId}/versions`)
      if (!res.ok) return []
      return res.json()
    },
  })

  const restoreVersion = async (versionId: string) => {
    try {
      const res = await fetch(`/api/notes/${noteId}/versions/${versionId}/restore`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Restore failed')
      toast({ title: 'Version restaurée' })
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5" />
        <h3 className="font-semibold">Historique des versions</h3>
      </div>

      {versions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aucune version sauvegardée
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {versions.map((version: any) => (
            <Card key={version.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    Version du {format(new Date(version.createdAt), 'dd MMMM yyyy à HH:mm')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {version.wordCount} mots
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restoreVersion(version.id)}
                >
                  <Restore className="h-4 w-4 mr-2" />
                  Restaurer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

