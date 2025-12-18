'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { ProjectDialog } from '@/components/projects/project-dialog'
import { KanbanView } from '@/components/projects/kanban-view'
import { 
  Plus, FolderKanban, Search, Trash2, Edit, BookOpen, 
  Briefcase, Lightbulb, MapPin, User, MoreHorizontal,
  Eye, FileText, LayoutGrid, List
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  BOOK: { label: 'Livre', icon: BookOpen, color: 'bg-purple-500' },
  PERSONAL: { label: 'Personnel', icon: User, color: 'bg-blue-500' },
  PROFESSIONAL: { label: 'Professionnel', icon: Briefcase, color: 'bg-green-500' },
  IDEA: { label: 'Idée', icon: Lightbulb, color: 'bg-yellow-500' },
  OUTING: { label: 'Sortie', icon: MapPin, color: 'bg-pink-500' },
  OTHER: { label: 'Autre', icon: FolderKanban, color: 'bg-gray-500' },
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PLANNING: { label: 'Planification', color: 'bg-gray-500' },
  IN_PROGRESS: { label: 'En cours', color: 'bg-blue-500' },
  ON_HOLD: { label: 'En pause', color: 'bg-yellow-500' },
  COMPLETED: { label: 'Terminé', color: 'bg-green-500' },
  CANCELLED: { label: 'Annulé', color: 'bg-red-500' },
}

export default function ProjectsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects')
      if (!res.ok) {
        console.error('Failed to fetch projects:', res.status, res.statusText)
        return []
      }
      const data = await res.json()
      // S'assurer que c'est un tableau
      return Array.isArray(data) ? data : []
    },
  })

  // S'assurer que projects est toujours un tableau
  const projects = Array.isArray(projectsData) ? projectsData : []

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create project')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: 'Projet créé' })
      setIsDialogOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update project')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: 'Projet modifié' })
      setIsDialogOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete project')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: 'Projet supprimé' })
      setIsDialogOpen(false)
    },
  })

  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = !filterType || project.type === filterType
    return matchesSearch && matchesType
  })

  const handleSave = (data: any) => {
    if (selectedProject) {
      updateMutation.mutate({ id: selectedProject.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  // Compter les projets par type
  const typeCounts = projects.reduce((acc: Record<string, number>, p: any) => {
    acc[p.type || 'OTHER'] = (acc[p.type || 'OTHER'] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-muted-foreground">
            {projects.length} projet{projects.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="rounded-l-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => { setSelectedProject(null); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau projet
          </Button>
        </div>
      </div>

      {/* Filtres par type */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterType === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType(null)}
        >
          Tous ({projects.length})
        </Button>
        {Object.entries(typeConfig).map(([type, config]) => {
          const count = typeCounts[type] || 0
          if (count === 0) return null
          const Icon = config.icon
          return (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(type)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {config.label} ({count})
            </Button>
          )
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un projet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanView
          projects={filteredProjects}
          onProjectClick={(project) => {
            if (project.id) {
              setSelectedProject(project)
              setIsDialogOpen(true)
            } else {
              setSelectedProject({ status: project.status })
              setIsDialogOpen(true)
            }
          }}
        />
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun projet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Créez votre premier projet pour commencer
            </p>
            <Button onClick={() => { setSelectedProject(null); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un projet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project: any) => {
            const typeInfo = typeConfig[project.type || 'OTHER'] || typeConfig.OTHER
            const status = statusLabels[project.status] || statusLabels.PLANNING
            const TypeIcon = typeInfo.icon

            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('p-1.5 rounded-lg', typeInfo.color)}>
                        <TypeIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">{typeInfo.label}</span>
                        <div className="flex items-center gap-2">
                          <div className={cn('h-2 w-2 rounded-full', status.color)} />
                          <span className="text-xs text-muted-foreground">{status.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {project.type === 'BOOK' && (
                        <Link href={`/projects/${project.id}/write`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setSelectedProject(project); setIsDialogOpen(true); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteMutation.mutate(project.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {project.description}
                    </p>
                  )}
                  
                  {/* Progress bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full transition-all', typeInfo.color)}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats spécifiques au type livre */}
                  {project.type === 'BOOK' && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span>{project.wordCount || 0} mots</span>
                      {project.targetWords && (
                        <span>/ {project.targetWords} objectif</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {project.startDate && (
                      <span>Début: {format(new Date(project.startDate), 'dd/MM/yyyy')}</span>
                    )}
                    {project.tasks?.length > 0 && (
                      <span>{project.tasks.filter((t: any) => t.completed).length}/{project.tasks.length} tâches</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        project={selectedProject}
        onSave={handleSave}
        onDelete={selectedProject ? () => deleteMutation.mutate(selectedProject.id) : undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
