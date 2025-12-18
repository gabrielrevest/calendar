'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { BookSettingsDialog } from '@/components/books/book-settings-dialog'
import { FocusMode } from '@/components/writing/focus-mode'
import { 
  ArrowLeft, Save, BookOpen, FileText, Plus, Trash2, 
  ChevronDown, ChevronUp, GripVertical, Eye, Edit2, Settings,
  Palette, Hash, User
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function WriteProjectPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const [content, setContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)

  // Fetch project
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch project')
      return res.json()
    },
  })

  // Fetch chapters
  const { data: chapters = [] } = useQuery({
    queryKey: ['chapters', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${params.id}/chapters`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: !!project,
  })

  // Update content state when project loads
  useEffect(() => {
    if (project?.content) {
      setContent(project.content)
    }
  }, [project])

  // Calculate word count and page count
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0
    setWordCount(words)
    // Estimation: ~250 mots par page
    setPageCount(Math.ceil(words / 250))
  }, [content])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...project,
          content,
          wordCount,
          pageCount,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', params.id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setLastSaved(new Date())
      toast({ title: 'Sauvegardé !' })
    },
    onError: () => {
      toast({ title: 'Erreur de sauvegarde', variant: 'destructive' })
    },
  })

  // Create chapter mutation
  const createChapterMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/projects/${params.id}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          order: chapters.length,
        }),
      })
      if (!res.ok) throw new Error('Failed to create chapter')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters', params.id] })
      toast({ title: 'Chapitre créé !' })
    },
  })

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (content !== project?.content) {
        saveMutation.mutate()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [content, project?.content])

  // Save shortcut (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveMutation.mutate()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const progress = project?.targetWords 
    ? Math.min(100, Math.round((wordCount / project.targetWords) * 100))
    : 0

  const pageProgress = project?.targetPages
    ? Math.min(100, Math.round((pageCount / project.targetPages) * 100))
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!project || project.type !== 'BOOK') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <BookOpen className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">Ce projet n'est pas un livre</p>
        <Link href="/projects">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux projets
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              {project.coverColor && (
                <div 
                  className="w-10 h-14 rounded border-2 border-border shadow-md"
                  style={{ backgroundColor: project.coverColor }}
                />
              )}
              <div>
                <h1 className="text-xl font-bold">{project.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{wordCount.toLocaleString()} mots</span>
                  <span>~{pageCount} pages</span>
                  {project.targetWords && (
                    <>
                      <span>/</span>
                      <span>{project.targetWords.toLocaleString()} objectif</span>
                      <span>({progress}%)</span>
                    </>
                  )}
                  {project.genre && (
                    <span className="px-2 py-0.5 bg-muted rounded text-xs">
                      {project.genre}
                    </span>
                  )}
                  {lastSaved && (
                    <span className="text-xs">
                      Sauvegardé à {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Éditer
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Aperçu
                </>
              )}
            </Button>
            <Button 
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
        
        {/* Progress bars */}
        <div className="mt-4 space-y-2">
          {project.targetWords && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Mots</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {project.targetPages && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Pages</span>
                <span>{pageProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${pageProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Chapitres */}
        <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Chapitres</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const title = prompt('Titre du chapitre:')
                if (title) createChapterMutation.mutate(title)
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {chapters.map((chapter: any) => (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapterId(chapter.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-colors",
                  selectedChapterId === chapter.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent"
                )}
              >
                <div className="font-medium">{chapter.title}</div>
                <div className="text-xs opacity-70 mt-1">
                  {chapter.wordCount || 0} mots
                </div>
              </button>
            ))}
            {chapters.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun chapitre. Cliquez sur + pour en créer un.
              </p>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto">
            {isPreview ? (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
                  {content || <span className="text-muted-foreground italic">Aucun contenu pour le moment...</span>}
                </div>
              </div>
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Commencez à écrire votre histoire...

Il était une fois..."
                className="min-h-[calc(100vh-250px)] resize-none border-0 focus-visible:ring-0 text-lg leading-relaxed font-serif"
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="border-t bg-muted/50 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-6">
            <span>{wordCount.toLocaleString()} mots</span>
            <span>{content.length.toLocaleString()} caractères</span>
            <span>~{pageCount} pages</span>
            {project.author && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {project.author}
              </span>
            )}
            {project.isbn && (
              <span className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {project.isbn}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Ctrl+S pour sauvegarder</span>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <BookSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        project={project}
      />
    </div>
  )
}
