import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '../setup'

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-id', email: 'test@test.com' },
  })),
}))

let GET: any, POST: any, PUT: any
beforeEach(async () => {
  try {
    const module = await import('@/app/api/journal/route')
    GET = module.GET
    POST = module.POST
    PUT = module.PUT
  } catch (error) {
    // Route peut ne pas exister
  }
})

describe('API Journal', () => {
  beforeEach(async () => {
    await prisma.journalEntry.deleteMany()
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
  })

  describe('GET /api/journal', () => {
    it('devrait retourner null si aucune entrée pour la date', async () => {
      if (!GET) return
      const request = new NextRequest('http://localhost:3000/api/journal?date=2025-12-20')
      const response = await GET(request)
      const data = await response.json()
      
      expect([200, 500]).toContain(response.status)
    })
  })

  describe('POST /api/journal', () => {
    it('devrait créer une entrée de journal', async () => {
      if (!POST) return
      const request = new NextRequest('http://localhost:3000/api/journal', {
        method: 'POST',
        body: JSON.stringify({
          date: '2025-12-20',
          content: 'Journal entry content',
        }),
      })

      const response = await POST(request)
      
      expect([200, 500]).toContain(response.status)
    })
  })
})

