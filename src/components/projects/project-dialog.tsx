'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Trash2, BookOpen, User, Briefcase, Lightbulb, MapPin, FolderKanban } from 'lucide-react'
import { cn } from '@/lib/utils'

const projectFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  type: z.string().default('PERSONAL'),
  status: z.string().default('PLANNING'),
  priority: z.string().default('NORMAL'),
  progress: z.number().min(0).max(100).default(0),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  targetWords: z.number().optional().nullable(),
})

type ProjectFormData = z.infer<typeof projectFormSchema>

const typeOptions = [
  { value: 'BOOK', label: 'Livre / Écriture', icon: BookOpen, description: 'Roman, nouvelle, essai...' },
  { value: 'PERSONAL', label: 'Personnel', icon: User, description: 'Projet personnel' },
  { value: 'PROFESSIONAL', label: 'Professionnel', icon: Briefcase, description: 'Travail, carrière' },
  { value: 'IDEA', label: 'Idée', icon: Lightbulb, description: 'Brainstorming, concept' },
  { value: 'OUTING', label: 'Sortie / Voyage', icon: MapPin, description: 'Voyage, événement' },
  { value: 'OTHER', label: 'Autre', icon: FolderKanban, description: 'Projet divers' },
]

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: any
  onSave: (data: any) => void
  onDelete?: () => void
  isLoading?: boolean
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSave,
  onDelete,
  isLoading,
}: ProjectDialogProps) {
  const [step, setStep] = useState<'type' | 'details'>('type')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'PERSONAL',
      status: 'PLANNING',
      priority: 'NORMAL',
      progress: 0,
      startDate: new Date(),
      endDate: null,
      targetWords: null,
    },
  })

  useEffect(() => {
    if (project) {
      setStep('details')
      reset({
        name: project.name,
        description: project.description || '',
        type: project.type || 'PERSONAL',
        status: project.status,
        priority: project.priority || 'NORMAL',
        progress: project.progress,
        startDate: project.startDate ? new Date(project.startDate) : new Date(),
        endDate: project.endDate ? new Date(project.endDate) : null,
        targetWords: project.targetWords || null,
      })
    } else {
      setStep('type')
      reset({
        name: '',
        description: '',
        type: 'PERSONAL',
        status: 'PLANNING',
        priority: 'NORMAL',
        progress: 0,
        startDate: new Date(),
        endDate: null,
        targetWords: null,
      })
    }
  }, [project, reset, open])

  const onSubmit = (data: ProjectFormData) => {
    onSave({
      ...data,
      startDate: data.startDate?.toISOString() || null,
      endDate: data.endDate?.toISOString() || null,
    })
  }

  const type = watch('type')
  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const progress = watch('progress')
  const status = watch('status')
  const priority = watch('priority')
  const targetWords = watch('targetWords')

  const selectedType = typeOptions.find(t => t.value === type)

  // Étape 1 : Choix du type
  if (step === 'type' && !project) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Quel type de projet ?</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            {typeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = type === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setValue('type', option.value)
                    setStep('details')
                  }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-left',
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                  )}
                >
                  <div className={cn(
                    'p-3 rounded-full',
                    option.value === 'BOOK' && 'bg-purple-100 text-purple-600',
                    option.value === 'PERSONAL' && 'bg-blue-100 text-blue-600',
                    option.value === 'PROFESSIONAL' && 'bg-green-100 text-green-600',
                    option.value === 'IDEA' && 'bg-yellow-100 text-yellow-600',
                    option.value === 'OUTING' && 'bg-pink-100 text-pink-600',
                    option.value === 'OTHER' && 'bg-gray-100 text-gray-600',
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Étape 2 : Détails du projet
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {selectedType && (
              <div className={cn(
                'p-2 rounded-lg',
                type === 'BOOK' && 'bg-purple-100 text-purple-600',
                type === 'PERSONAL' && 'bg-blue-100 text-blue-600',
                type === 'PROFESSIONAL' && 'bg-green-100 text-green-600',
                type === 'IDEA' && 'bg-yellow-100 text-yellow-600',
                type === 'OUTING' && 'bg-pink-100 text-pink-600',
                type === 'OTHER' && 'bg-gray-100 text-gray-600',
              )}>
                <selectedType.icon className="h-5 w-5" />
              </div>
            )}
            <DialogTitle>
              {project ? 'Modifier le projet' : `Nouveau ${selectedType?.label || 'projet'}`}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Changer de type (si nouveau projet) */}
          {!project && (
            <button
              type="button"
              onClick={() => setStep('type')}
              className="text-sm text-primary hover:underline"
            >
              ← Changer de type
            </button>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              {type === 'BOOK' ? 'Titre du livre *' : 'Nom du projet *'}
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={type === 'BOOK' ? 'Mon roman' : 'Mon projet'}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {type === 'BOOK' ? 'Synopsis / Résumé' : 'Description'}
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={type === 'BOOK' 
                ? 'Décrivez l\'histoire de votre livre...' 
                : 'Décrivez votre projet en détail...'}
              rows={type === 'BOOK' ? 6 : 4}
            />
          </div>

          {/* Champs spécifiques aux livres */}
          {type === 'BOOK' && (
            <div className="space-y-2">
              <Label>Objectif de mots (optionnel)</Label>
              <Input
                type="number"
                value={targetWords || ''}
                onChange={(e) => setValue('targetWords', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Ex: 50000 pour un roman"
              />
              <p className="text-xs text-muted-foreground">
                Un roman fait généralement entre 50 000 et 100 000 mots
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planification</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="ON_HOLD">En pause</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select
                value={priority}
                onValueChange={(value) => setValue('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Basse</SelectItem>
                  <SelectItem value="NORMAL">Normale</SelectItem>
                  <SelectItem value="HIGH">Haute</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Progression ({progress}%)</Label>
            <Input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setValue('progress', parseInt(e.target.value))}
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <DatePicker
                value={startDate || undefined}
                onChange={(date) => setValue('startDate', date || null)}
                placeholder="Sélectionner"
                clearable
              />
            </div>

            <div className="space-y-2">
              <Label>
                {type === 'OUTING' ? 'Date de l\'événement' : 'Date de fin (optionnel)'}
              </Label>
              <DatePicker
                value={endDate || undefined}
                onChange={(date) => setValue('endDate', date || null)}
                placeholder="Non définie"
                clearable
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            {project && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : project ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
