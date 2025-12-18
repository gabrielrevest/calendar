'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

const columns = [
  { id: 'PLANNING', label: 'Planification', color: 'bg-gray-500' },
  { id: 'IN_PROGRESS', label: 'En cours', color: 'bg-blue-500' },
  { id: 'ON_HOLD', label: 'En pause', color: 'bg-yellow-500' },
  { id: 'COMPLETED', label: 'Terminé', color: 'bg-green-500' },
]

interface KanbanViewProps {
  projects: any[]
  onProjectClick: (project: any) => void
}

export function KanbanView({ projects, onProjectClick }: KanbanViewProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [draggedProject, setDraggedProject] = useState<string | null>(null)

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: 'Statut mis à jour' })
    },
  })

  const handleDragStart = (projectId: string) => {
    setDraggedProject(projectId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: string) => {
    if (draggedProject) {
      updateStatusMutation.mutate({ id: draggedProject, status })
      setDraggedProject(null)
    }
  }

  const getProjectsByStatus = (status: string) => {
    return projects.filter((p) => p.status === status)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-300px)]">
      {columns.map((column) => {
        const columnProjects = getProjectsByStatus(column.id)
        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 flex flex-col"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className={cn('p-3 rounded-t-lg text-white font-semibold flex items-center justify-between', column.color)}>
              <span>{column.label}</span>
              <span className="bg-white/20 px-2 py-1 rounded text-sm">
                {columnProjects.length}
              </span>
            </div>
            <div className="flex-1 bg-muted/50 rounded-b-lg p-3 space-y-3 overflow-y-auto">
              {columnProjects.map((project) => (
                <Card
                  key={project.id}
                  draggable
                  onDragStart={() => handleDragStart(project.id)}
                  className="cursor-move hover:shadow-md transition-shadow"
                  onClick={() => onProjectClick(project)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{project.name}</h3>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {project.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {project.description}
                      </p>
                    )}
                    {project.progress !== undefined && (
                      <div className="w-full bg-secondary rounded-full h-1.5 mb-2">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{project.type}</span>
                      {project.priority && (
                        <span className={cn(
                          'px-2 py-0.5 rounded',
                          project.priority === 'URGENT' && 'bg-red-100 text-red-800',
                          project.priority === 'HIGH' && 'bg-orange-100 text-orange-800',
                          project.priority === 'NORMAL' && 'bg-blue-100 text-blue-800',
                          project.priority === 'LOW' && 'bg-gray-100 text-gray-800',
                        )}>
                          {project.priority}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={() => {
                  // Créer nouveau projet avec ce statut
                  onProjectClick({ status: column.id })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un projet
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}


