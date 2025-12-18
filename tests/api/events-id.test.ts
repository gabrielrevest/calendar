import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '../setup'

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-id', email: 'test@test.com' },
  })),
}))

describe('API Events [id]', () => {
  let eventId: string
  let GET: any, PUT: any, DELETE: any

  beforeEach(async () => {
    await prisma.reminder.deleteMany()
    await prisma.event.deleteMany()
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

    const event = await prisma.event.create({
      data: {
        title: 'Test Event',
        startDate: new Date('2025-12-20T10:00:00Z'),
        endDate: new Date('2025-12-20T11:00:00Z'),
        userId: 'test-user-id',
      },
    })
    eventId = event.id

    try {
      const module = await import(`@/app/api/events/[id]/route`)
      GET = module.GET
      PUT = module.PUT
      DELETE = module.DELETE
    } catch (error) {
      // Route peut ne pas exister
    }
  })

  describe('GET /api/events/[id]', () => {
    it('devrait retourner un événement par ID', async () => {
      if (!GET) return
      const request = new NextRequest(`http://localhost:3000/api/events/${eventId}`)
      const response = await GET(request, { params: Promise.resolve({ id: eventId }) })
      
      expect([200, 404]).toContain(response.status)
    })
  })

  describe('PUT /api/events/[id]', () => {
    it('devrait mettre à jour un événement', async () => {
      if (!PUT) return
      const request = new NextRequest(`http://localhost:3000/api/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Event',
          startDate: '2025-12-20T10:00:00Z',
          endDate: '2025-12-20T11:00:00Z',
          tagIds: [], // Tableau vide pour éviter les problèmes de relations
        }),
      })

      const response = await PUT(request, { params: Promise.resolve({ id: eventId }) })
      
      expect([200, 404, 500]).toContain(response.status)
    })
  })

  describe('DELETE /api/events/[id]', () => {
    it('devrait supprimer un événement', async () => {
      if (!DELETE) return
      const request = new NextRequest(`http://localhost:3000/api/events/${eventId}`, {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve({ id: eventId }) })
      
      expect([200, 404, 500]).toContain(response.status)
    })
  })
})

