'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Link as LinkIcon } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from '@tanstack/react-query'

export function ICalImport() {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleFileImport = async () => {
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/import/ical', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Import failed')

      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast({ title: 'Import réussi' })
      setIsOpen(false)
      setFile(null)
    } catch (error) {
      toast({ title: 'Erreur lors de l\'import', variant: 'destructive' })
    }
  }

  const handleUrlImport = async () => {
    if (!url) return

    try {
      const res = await fetch('/api/import/ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!res.ok) throw new Error('Import failed')

      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast({ title: 'Import réussi' })
      setIsOpen(false)
      setUrl('')
    } catch (error) {
      toast({ title: 'Erreur lors de l\'import', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Importer iCal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importer un calendrier iCal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Fichier .ics</label>
            <Input
              type="file"
              accept=".ics"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button
              onClick={handleFileImport}
              disabled={!file}
              className="w-full mt-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importer le fichier
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">URL du calendrier</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://calendar.google.com/calendar/ical/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button
                onClick={handleUrlImport}
                disabled={!url}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Importer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

