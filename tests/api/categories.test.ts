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
  const module = await import('@/app/api/categories/route')
  GET = module.GET
  POST = module.POST
})

describe('API Categories', () => {
  beforeEach(async () => {
    await prisma.category.deleteMany()
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

  describe('GET /api/categories', () => {
    it('devrait retourner un tableau vide si aucune catégorie', async () => {
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(0)
    })

    it('devrait retourner les catégories de l\'utilisateur', async () => {
      await prisma.category.create({
        data: {
          name: 'Work',
          type: 'EVENT',
          userId: 'test-user-id',
        },
      })

      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
      expect(data[0].name).toBe('Work')
    })
  })

  describe('POST /api/categories', () => {
    it('devrait créer une catégorie', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Personal',
          type: 'EVENT',
          color: '#FF0000',
        }),
      })

      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.name).toBe('Personal')
      expect(data.type).toBe('EVENT')
    })
  })
})

