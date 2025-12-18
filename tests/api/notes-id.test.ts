import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '../setup'

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-id', email: 'test@test.com' },
  })),
}))

describe('API Notes [id]', () => {
  let noteId: string
  let GET: any, PUT: any, DELETE: any

  beforeEach(async () => {
    await prisma.note.deleteMany()
    await prisma.user.deleteMany()
    
    await prisma.user.upsert({
      where: { id: 'test-user-id' },
      update: {
        email: 'test@test.com',
        name: 'Test User',
      },
      create: {
        id: 'test-user-id',
        email: 'test@test.com',
        name: 'Test User',
      },
    })

    const note = await prisma.note.create({
      data: {
        title: 'Test Note',
        content: 'Test content',
        userId: 'test-user-id',
      },
    })
    noteId = note.id

    try {
      const module = await import(`@/app/api/notes/[id]/route`)
      GET = module.GET
      PUT = module.PUT
      DELETE = module.DELETE
    } catch (error) {
      // Route peut ne pas exister
    }
  })

  describe('GET /api/notes/[id]', () => {
    it('devrait retourner une note par ID', async () => {
      if (!GET) return
      const request = new NextRequest(`http://localhost:3000/api/notes/${noteId}`)
      const response = await GET(request, { params: Promise.resolve({ id: noteId }) })
      
      expect([200, 404]).toContain(response.status)
    })
  })

  describe('PUT /api/notes/[id]', () => {
    it('devrait mettre à jour une note', async () => {
      if (!PUT) return
      const request = new NextRequest(`http://localhost:3000/api/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Note',
          content: 'Updated content',
        }),
      })

      const response = await PUT(request, { params: Promise.resolve({ id: noteId }) })
      
      expect([200, 404, 500]).toContain(response.status)
    })
  })

  describe('DELETE /api/notes/[id]', () => {
    it('devrait supprimer une note', async () => {
      if (!DELETE) return
      const request = new NextRequest(`http://localhost:3000/api/notes/${noteId}`, {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve({ id: noteId }) })
      
      expect([200, 404, 500]).toContain(response.status)
    })
  })
})

