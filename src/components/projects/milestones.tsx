'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Flag, CheckCircle2, Circle } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface Milestone {
  id: string
  title: string
  date: Date
  completed: boolean
  projectId: string
}

export function Milestones({ projectId }: { projectId: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMilestone, setNewMilestone] = useState({ title: '', date: '' })
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/milestones`)
      if (!res.ok) return []
      return res.json()
    },
  })

  const createMilestoneMutation = useMutation({
    mutationFn: async (data: { title: string; date: string }) => {
      const res = await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] })
      setNewMilestone({ title: '', date: '' })
      setIsDialogOpen(false)
      toast({ title: 'Jalon créé' })
    },
  })

  const toggleMilestoneMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await fetch(`/api/milestones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] })
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Flag className="h-5 w-5" />
          Jalons
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau jalon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Titre</Label>
                <Input
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  placeholder="Ex: Version 1.0, Lancement..."
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                />
              </div>
              <Button
                onClick={() => {
                  if (newMilestone.title && newMilestone.date) {
                    createMilestoneMutation.mutate(newMilestone)
                  }
                }}
                disabled={!newMilestone.title || !newMilestone.date || createMilestoneMutation.isPending}
                className="w-full"
              >
                Créer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {milestones.map((milestone: Milestone) => (
          <Card key={milestone.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleMilestoneMutation.mutate({ id: milestone.id, completed: !milestone.completed })}
                  className="p-1"
                >
                  {milestone.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <div>
                  <div className={cn('font-medium', milestone.completed && 'line-through text-muted-foreground')}>
                    {milestone.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(milestone.date), 'dd MMMM yyyy')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {milestones.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aucun jalon. Créez-en un pour suivre les étapes importantes.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

