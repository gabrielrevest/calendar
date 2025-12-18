'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, ChevronRight, ChevronDown, GripVertical, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface Task {
  id: string
  title: string
  completed: boolean
  subtasks?: Task[]
  parentTaskId?: string
}

interface HierarchicalTasksProps {
  projectId: string
}

export function HierarchicalTasks({ projectId }: HierarchicalTasksProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [parentId, setParentId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/tasks`)
      if (!res.ok) return []
      return res.json()
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; parentTaskId?: string }) => {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create task')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      setNewTaskTitle('')
      setParentId(null)
      toast({ title: 'Tâche créée' })
    },
  })

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })
      if (!res.ok) throw new Error('Failed to update task')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete task')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      toast({ title: 'Tâche supprimée' })
    },
  })

  const buildTree = (tasks: Task[]): Task[] => {
    const taskMap = new Map<string, Task>()
    const rootTasks: Task[] = []

    tasks.forEach((task) => {
      taskMap.set(task.id, { ...task, subtasks: [] })
    })

    tasks.forEach((task) => {
      const taskNode = taskMap.get(task.id)!
      if (task.parentTaskId) {
        const parent = taskMap.get(task.parentTaskId)
        if (parent) {
          if (!parent.subtasks) parent.subtasks = []
          parent.subtasks.push(taskNode)
        }
      } else {
        rootTasks.push(taskNode)
      }
    })

    return rootTasks
  }

  const taskTree = buildTree(tasks)

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const renderTask = (task: Task, level: number = 0) => {
    const hasSubtasks = task.subtasks && task.subtasks.length > 0
    const isExpanded = expandedTasks.has(task.id)

    return (
      <div key={task.id} className="space-y-1">
        <div
          className={cn(
            'flex items-center gap-2 p-2 rounded hover:bg-accent',
            level > 0 && 'ml-4'
          )}
        >
          {hasSubtasks ? (
            <button
              onClick={() => toggleExpanded(task.id)}
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
          <Checkbox
            checked={task.completed}
            onCheckedChange={(checked) =>
              toggleTaskMutation.mutate({ id: task.id, completed: checked as boolean })
            }
          />
          <span
            className={cn(
              'flex-1',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setParentId(task.id)
              setNewTaskTitle('')
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTaskMutation.mutate(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {hasSubtasks && isExpanded && (
          <div className="ml-4">
            {task.subtasks!.map((subtask) => renderTask(subtask, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nouvelle tâche..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newTaskTitle.trim()) {
              createTaskMutation.mutate({
                title: newTaskTitle.trim(),
                parentTaskId: parentId || undefined,
              })
            }
          }}
        />
        <Button
          onClick={() => {
            if (newTaskTitle.trim()) {
              createTaskMutation.mutate({
                title: newTaskTitle.trim(),
                parentTaskId: parentId || undefined,
              })
            }
          }}
          disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
        >
          <Plus className="h-4 w-4" />
        </Button>
        {parentId && (
          <Button
            variant="outline"
            onClick={() => setParentId(null)}
          >
            Annuler sous-tâche
          </Button>
        )}
      </div>

      <div className="space-y-1">
        {taskTree.map((task) => renderTask(task))}
      </div>
    </div>
  )
}


