'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { EmptyState } from '@/components/ui/empty-state'
import { BookOpen, Plus, Trash2, Edit, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function JournalPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const { data: entries, isLoading } = useQuery({
    queryKey: ['journal', selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/journal?date=${selectedDate}`)
      if (!res.ok) return null
      return res.json()
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (data: { date: string; content: string }) => {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] })
      toast({ title: 'Entrée sauvegardée !' })
      setIsEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] })
      toast({ title: 'Entrée supprimée' })
      setContent('')
      setIsEditing(false)
    },
  })

  useEffect(() => {
    if (entries) {
      setContent(entries.content || '')
      setIsEditing(!!entries.content)
    } else {
      setContent('')
      setIsEditing(false)
    }
  }, [entries, selectedDate])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Journal</h1>
          <p className="text-muted-foreground">
            Écrivez vos pensées et réflexions quotidiennes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(new Date(selectedDate), 'EEEE d MMMM yyyy', { locale: fr })}
            </CardTitle>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrivez votre entrée de journal..."
                className="min-h-[400px] font-serif text-lg leading-relaxed"
              />
              <div className="flex gap-2">
                <Button onClick={() => saveMutation.mutate({ date: selectedDate, content })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
                {entries && (
                  <Button
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(entries.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {entries?.content ? (
                <div className="space-y-4">
                  <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap font-serif text-lg leading-relaxed">
                    {entries.content}
                  </div>
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="Aucune entrée pour ce jour"
                  description="Commencez à écrire votre journal en cliquant sur le bouton ci-dessous"
                  action={{
                    label: 'Nouvelle entrée',
                    onClick: () => setIsEditing(true),
                  }}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

