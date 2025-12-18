'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Paperclip, X, Download, File } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent } from '@/components/ui/card'

interface Attachment {
  id: string
  name: string
  url: string
  size?: number
  type?: string
}

interface AttachmentsProps {
  noteId?: string
  attachments: Attachment[]
  onAttachmentsChange: (attachments: Attachment[]) => void
}

export function Attachments({ noteId, attachments, onAttachmentsChange }: AttachmentsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (noteId) {
        formData.append('noteId', noteId)
      }

      const res = await fetch('/api/attachments', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')
      
      const data = await res.json()
      onAttachmentsChange([...attachments, data])
      toast({ title: 'Fichier ajouté' })
    } catch (error) {
      toast({ title: 'Erreur lors de l\'upload', variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const removeAttachment = async (id: string) => {
    try {
      await fetch(`/api/attachments/${id}`, { method: 'DELETE' })
      onAttachmentsChange(attachments.filter((a) => a.id !== id))
      toast({ title: 'Fichier supprimé' })
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isUploading}
        >
          <Paperclip className="h-4 w-4 mr-2" />
          {isUploading ? 'Upload...' : 'Ajouter un fichier'}
        </Button>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <Card key={attachment.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{attachment.name}</div>
                    {attachment.size && (
                      <div className="text-xs text-muted-foreground">
                        {formatSize(attachment.size)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


