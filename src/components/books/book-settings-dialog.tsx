'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Palette, BookOpen, User, Hash } from 'lucide-react'

const coverColors = [
  { name: 'Bleu', value: '#3B82F6', class: 'bg-blue-500' },
  { name: 'Violet', value: '#8B5CF6', class: 'bg-purple-500' },
  { name: 'Rouge', value: '#EF4444', class: 'bg-red-500' },
  { name: 'Vert', value: '#22C55E', class: 'bg-green-500' },
  { name: 'Orange', value: '#F97316', class: 'bg-orange-500' },
  { name: 'Rose', value: '#EC4899', class: 'bg-pink-500' },
  { name: 'Indigo', value: '#6366F1', class: 'bg-indigo-500' },
  { name: 'Ambre', value: '#F59E0B', class: 'bg-amber-500' },
]

const genres = [
  'Roman', 'Science-fiction', 'Fantasy', 'Thriller', 'Mystère',
  'Romance', 'Historique', 'Biographie', 'Autobiographie', 'Essai',
  'Poésie', 'Nouvelle', 'Jeunesse', 'Autre'
]

interface BookSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: any
}

export function BookSettingsDialog({ open, onOpenChange, project }: BookSettingsDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [coverColor, setCoverColor] = useState(project?.coverColor || '#8B5CF6')
  const [genre, setGenre] = useState(project?.genre || '')
  const [author, setAuthor] = useState(project?.author || '')
  const [isbn, setIsbn] = useState(project?.isbn || '')
  const [targetPages, setTargetPages] = useState(project?.targetPages?.toString() || '')

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...project, ...data }),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: 'Paramètres mis à jour !' })
      onOpenChange(false)
    },
    onError: () => {
      toast({ title: 'Erreur', variant: 'destructive' })
    },
  })

  const handleSave = () => {
    updateMutation.mutate({
      coverColor,
      genre: genre || null,
      author: author || null,
      isbn: isbn || null,
      targetPages: targetPages ? parseInt(targetPages) : null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Paramètres du livre
          </DialogTitle>
          <DialogDescription>
            Personnalisez les métadonnées de votre livre
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Couleur de couverture */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4" />
              Couleur de couverture
            </Label>
            <div className="grid grid-cols-4 gap-3">
              {coverColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setCoverColor(color.value)}
                  className={`
                    h-12 rounded-lg border-2 transition-all
                    ${coverColor === color.value ? 'border-primary scale-110' : 'border-border'}
                    ${color.class}
                  `}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Genre */}
          <div>
            <Label htmlFor="genre">Genre littéraire</Label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="">Sélectionner un genre</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Auteur */}
          <div>
            <Label htmlFor="author" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Auteur
            </Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nom de l'auteur"
              className="mt-1"
            />
          </div>

          {/* ISBN */}
          <div>
            <Label htmlFor="isbn" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              ISBN (optionnel)
            </Label>
            <Input
              id="isbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="978-..."
              className="mt-1"
            />
          </div>

          {/* Objectif de pages */}
          <div>
            <Label htmlFor="targetPages">Objectif de pages</Label>
            <Input
              id="targetPages"
              type="number"
              value={targetPages}
              onChange={(e) => setTargetPages(e.target.value)}
              placeholder="250"
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


