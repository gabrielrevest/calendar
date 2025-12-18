'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileText, Calendar, Database } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function ExportDialogFull() {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<'ical' | 'csv' | 'json' | 'pdf'>('ical')
  const [includeEvents, setIncludeEvents] = useState(true)
  const [includeProjects, setIncludeProjects] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(true)
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format,
        includeEvents: includeEvents.toString(),
        includeProjects: includeProjects.toString(),
        includeNotes: includeNotes.toString(),
      })

      const res = await fetch(`/api/export?${params}`)
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export-${format}-${Date.now()}.${format === 'pdf' ? 'pdf' : format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({ title: 'Export réussi' })
      setIsOpen(false)
    } catch (error) {
      toast({ title: 'Erreur lors de l\'export', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exporter les données</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Format</label>
            <Select value={format} onValueChange={(v: any) => setFormat(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ical">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    iCal (.ics)
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Inclure</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="events"
                  checked={includeEvents}
                  onCheckedChange={(checked) => setIncludeEvents(checked as boolean)}
                />
                <label htmlFor="events" className="text-sm">Événements</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="projects"
                  checked={includeProjects}
                  onCheckedChange={(checked) => setIncludeProjects(checked as boolean)}
                />
                <label htmlFor="projects" className="text-sm">Projets</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notes"
                  checked={includeNotes}
                  onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
                />
                <label htmlFor="notes" className="text-sm">Notes</label>
              </div>
            </div>
          </div>

          <Button onClick={handleExport} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

