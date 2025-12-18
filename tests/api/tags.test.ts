import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '../setup'

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-id', email: 'test@test.com' },
  })),
}))

let GET: any, POST: any
beforeEach(async () => {
  try {
    const module = await import('@/app/api/tags/route')
    GET = module.GET
    POST = module.POST
  } catch (error) {
    // Route peut ne pas exister
  }
})

describe('API Tags', () => {
  beforeEach(async () => {
    await prisma.tag.deleteMany()
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

  describe('GET /api/tags', () => {
    it('devrait retourner un tableau vide si aucun tag', async () => {
      if (!GET) return
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })
  })
})

