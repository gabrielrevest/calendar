'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { NoteDialog } from '@/components/notes/note-dialog'
import { CategoryDialog } from '@/components/notes/category-dialog'
import { 
  Plus, StickyNote, Search, Trash2, Edit, Calendar, 
  FolderOpen, Tag, Settings, ChevronDown 
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const defaultColors = [
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Vert', value: '#22C55E' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Jaune', value: '#EAB308' },
  { name: 'Gris', value: '#6B7280' },
  { name: 'Rouge', value: '#EF4444' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Émeraude', value: '#10B981' },
  { name: 'Ambre', value: '#F59E0B' },
  { name: 'Fuchsia', value: '#D946EF' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Sarcelle', value: '#14B8A6' },
  { name: 'Bleu ciel', value: '#0EA5E9' },
]

export default function NotesPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<any>(null)
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)

  // Fetch notes
  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await fetch('/api/notes')
      if (!res.ok) throw new Error('Failed to fetch notes')
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
  })

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
  })

  // Filtrer les catégories pour les notes
  const noteCategories = Array.isArray(categories) ? categories.filter((c: any) => c.type === 'NOTE') : []

  // CRUD Notes
  const createNoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create note')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast({ title: 'Note créée' })
      setIsNoteDialogOpen(false)
    },
  })

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update note')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast({ title: 'Note modifiée' })
      setIsNoteDialogOpen(false)
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete note')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast({ title: 'Note supprimée' })
      setIsNoteDialogOpen(false)
    },
  })

  // CRUD Categories
  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'NOTE' }),
      })
      if (!res.ok) throw new Error('Failed to create category')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({ title: 'Catégorie créée' })
      setIsCategoryDialogOpen(false)
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete category')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast({ title: 'Catégorie supprimée' })
      if (selectedCategory) setSelectedCategory(null)
    },
  })

  // Filtrer les notes
  const filteredNotes = notes.filter((note: any) => {
    const matchesSearch = 
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || note.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Compter les notes par catégorie
  const notesCountByCategory = notes.reduce((acc: Record<string, number>, note: any) => {
    const catId = note.categoryId || 'uncategorized'
    acc[catId] = (acc[catId] || 0) + 1
    return acc
  }, {})

  const handleSaveNote = (data: any) => {
    if (selectedNote) {
      updateNoteMutation.mutate({ id: selectedNote.id, data })
    } else {
      createNoteMutation.mutate(data)
    }
  }

  const isLoading = notesLoading || categoriesLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground">
            {notes.length} note{notes.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowCategoryManager(!showCategoryManager)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Catégories
          </Button>
          <Button onClick={() => { setSelectedNote(null); setIsNoteDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle note
          </Button>
        </div>
      </div>

      {/* Gestionnaire de catégories (collapsible) */}
      {showCategoryManager && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Gérer les catégories</CardTitle>
              <Button size="sm" onClick={() => setIsCategoryDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Nouvelle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {noteCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune catégorie. Créez-en une pour organiser vos notes !
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {noteCategories.map((category: any) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-lg group"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color || '#6B7280' }}
                    />
                    <span className="text-sm">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({notesCountByCategory[category.id] || 0})
                    </span>
                    <button
                      onClick={() => deleteCategoryMutation.mutate(category.id)}
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Toutes ({notes.length})
        </Button>
        <Button
          variant={selectedCategory === 'uncategorized' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('uncategorized')}
        >
          Sans catégorie ({notesCountByCategory['uncategorized'] || 0})
        </Button>
        {noteCategories.map((category: any) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="gap-2"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color || '#6B7280' }}
            />
            {category.name} ({notesCountByCategory[category.id] || 0})
          </Button>
        ))}
      </div>

      {/* Liste des notes */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <StickyNote className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {search || selectedCategory ? 'Aucune note trouvée' : 'Aucune note'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {search || selectedCategory 
                ? 'Essayez de modifier vos filtres'
                : 'Créez votre première note'}
            </p>
            {!search && !selectedCategory && (
              <Button onClick={() => { setSelectedNote(null); setIsNoteDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une note
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note: any) => {
            const category = noteCategories.find((c: any) => c.id === note.categoryId)
            return (
              <Card key={note.id} className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {category && (
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color || '#6B7280' }}
                          />
                          <span className="text-xs text-muted-foreground">{category.name}</span>
                        </div>
                      )}
                      <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setSelectedNote(note); setIsNoteDialogOpen(true); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap mb-4">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {format(new Date(note.updatedAt), 'dd MMM yyyy', { locale: fr })}
                    </span>
                    {note.linkedDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(note.linkedDate), 'dd/MM/yyyy')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      <NoteDialog
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        note={selectedNote}
        categories={noteCategories}
        onSave={handleSaveNote}
        onDelete={selectedNote ? () => deleteNoteMutation.mutate(selectedNote.id) : undefined}
        isLoading={createNoteMutation.isPending || updateNoteMutation.isPending}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onSave={(data) => createCategoryMutation.mutate(data)}
        isLoading={createCategoryMutation.isPending}
      />
    </div>
  )
}
