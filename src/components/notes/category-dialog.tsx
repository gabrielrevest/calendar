'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const colorOptions = [
  { name: 'Rouge', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Jaune', value: '#EAB308' },
  { name: 'Vert', value: '#22C55E' },
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Gris', value: '#6B7280' },
]

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { name: string; color: string }) => void
  isLoading?: boolean
}

export function CategoryDialog({
  open,
  onOpenChange,
  onSave,
  isLoading,
}: CategoryDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3B82F6')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), color })
    setName('')
    setColor('#3B82F6')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Nouvelle catégorie</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la catégorie *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Travail, Personnel, Idées..."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    color === option.value && 'ring-2 ring-offset-2 ring-primary'
                  )}
                  style={{ backgroundColor: option.value }}
                  title={option.name}
                />
              ))}
            </div>
          </div>

          {/* Aperçu */}
          <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-medium">{name || 'Nouvelle catégorie'}</span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}




