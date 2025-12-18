'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, FileText, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OutlineViewProps {
  chapters: any[]
  onChapterSelect: (chapter: any) => void
  onChapterAdd: (parentId?: string) => void
  onChapterEdit: (chapter: any) => void
  onChapterDelete: (chapterId: string) => void
}

export function OutlineView({ chapters, onChapterSelect, onChapterAdd, onChapterEdit, onChapterDelete }: OutlineViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expanded)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpanded(newExpanded)
  }

  const buildTree = (items: any[], parentId: string | null = null): any[] => {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: buildTree(items, item.id),
      }))
  }

  const tree = buildTree(chapters)

  const renderChapter = (chapter: any, level: number = 0) => {
    const hasChildren = chapter.children && chapter.children.length > 0
    const isExpanded = expanded.has(chapter.id)

    return (
      <div key={chapter.id} className="space-y-1">
        <div
          className={cn(
            'flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer',
            level > 0 && 'ml-4'
          )}
          onClick={() => onChapterSelect(chapter)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(chapter.id)
              }}
              className="p-1 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 font-medium">{chapter.title || 'Sans titre'}</span>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onChapterEdit(chapter)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onChapterDelete(chapter.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {chapter.children.map((child: any) => renderChapter(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Plan du livre</h3>
        <Button size="sm" onClick={() => onChapterAdd()}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un chapitre
        </Button>
      </div>
      <div className="space-y-1">
        {tree.map((chapter) => renderChapter(chapter))}
      </div>
    </div>
  )
}

