'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import ReactMarkdown from 'react-markdown'
import { FileText, Eye } from 'lucide-react'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function MarkdownEditor({ content, onChange, placeholder }: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit')

  return (
    <div className="border rounded-lg">
      <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
        <TabsList className="w-full justify-start rounded-none border-b rounded-t-lg">
          <TabsTrigger value="edit" className="gap-2">
            <FileText className="h-4 w-4" />
            Éditer
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="split" className="gap-2">
            <FileText className="h-4 w-4" />
            <Eye className="h-4 w-4" />
            Split
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="m-0">
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Écrivez en Markdown...'}
            className="min-h-[400px] border-0 rounded-none font-mono text-sm"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="m-0">
          <div className="p-4 min-h-[400px] prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{content || '*Aucun contenu*'}</ReactMarkdown>
          </div>
        </TabsContent>
        
        <TabsContent value="split" className="m-0 p-0">
          <div className="grid grid-cols-2 h-[400px]">
            <div className="border-r">
              <Textarea
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || 'Écrivez en Markdown...'}
                className="h-full border-0 rounded-none font-mono text-sm resize-none"
              />
            </div>
            <div className="p-4 overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{content || '*Aucun contenu*'}</ReactMarkdown>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


