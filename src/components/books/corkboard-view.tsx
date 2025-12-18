'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, GripVertical, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface CorkboardViewProps {
  projectId: string
  chapters: any[]
  onChapterClick: (chapter: any) => void
}

export function CorkboardView({ projectId, chapters, onChapterClick }: CorkboardViewProps) {
  const [draggedChapter, setDraggedChapter] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, order }: { id: string; order: number }) => {
      const res = await fetch(`/api/projects/${projectId}/chapters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters', projectId] })
    },
  })

  const handleDragStart = (chapterId: string) => {
    setDraggedChapter(chapterId)
  }

  const handleDrop = (targetOrder: number) => {
    if (draggedChapter) {
      updateOrderMutation.mutate({ id: draggedChapter, order: targetOrder })
      setDraggedChapter(null)
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {chapters.map((chapter, index) => (
          <Card
            key={chapter.id}
            draggable
            onDragStart={() => handleDragStart(chapter.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            className="cursor-move hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
            style={{
              transform: 'rotate(-1deg)',
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">{chapter.title || `Chapitre ${index + 1}`}</h3>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onChapterClick(chapter)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={async () => {
                      const res = await fetch(`/api/projects/${projectId}/chapters/${chapter.id}`, {
                        method: 'DELETE',
                      })
                      if (res.ok) {
                        queryClient.invalidateQueries({ queryKey: ['chapters', projectId] })
                        toast({ title: 'Chapitre supprimé' })
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {chapter.content && (
                <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                  {chapter.content.substring(0, 100)}...
                </p>
              )}
              {chapter.wordCount > 0 && (
                <div className="text-xs text-muted-foreground">
                  {chapter.wordCount} mots
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

