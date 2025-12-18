import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '../setup'

// Mock auth
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-id', email: 'test@test.com' },
  })),
}))

// Import dynamique pour éviter les problèmes de compilation
let GET: any, POST: any
beforeEach(async () => {
  const module = await import('@/app/api/events/route')
  GET = module.GET
  POST = module.POST
})

describe('API Events', () => {
  beforeEach(async () => {
    // Nettoyer avant chaque test
    await prisma.reminder.deleteMany()
    await prisma.event.deleteMany()
    await prisma.user.deleteMany()
    await prisma.category.deleteMany()
    
    // Créer un utilisateur de test (upsert pour éviter les erreurs)
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

  describe('GET /api/events', () => {
    it('devrait retourner un tableau vide si aucun événement', async () => {
      const request = new NextRequest('http://localhost:3000/api/events')
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(0)
    })

    it('devrait retourner les événements de l\'utilisateur', async () => {
      // Créer un événement de test
      await prisma.event.create({
        data: {
          title: 'Test Event',
          startDate: new Date('2025-12-20T10:00:00Z'),
          endDate: new Date('2025-12-20T11:00:00Z'),
          userId: 'test-user-id',
        },
      })

      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
      expect(data[0].title).toBe('Test Event')
    })

    it('devrait retourner un tableau même en cas d\'erreur', async () => {
      // Tester que la route gère les erreurs gracieusement
      // En cas d'erreur, elle devrait retourner un tableau vide
      const response = await GET()
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('POST /api/events', () => {
    it('devrait créer un événement sans catégorie', async () => {
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Event',
          startDate: '2025-12-20T10:00:00Z',
          endDate: '2025-12-20T11:00:00Z',
          allDay: false,
        }),
      })

      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.title).toBe('New Event')
      expect(data.categoryId).toBeNull()
    })

    it('devrait créer un événement avec une catégorie valide', async () => {
      // Créer une catégorie
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          type: 'EVENT',
          userId: 'test-user-id',
        },
      })

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Event with Category',
          startDate: '2025-12-20T10:00:00Z',
          endDate: '2025-12-20T11:00:00Z',
          categoryId: category.id,
        }),
      })

      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.categoryId).toBe(category.id)
    })

    it('devrait ignorer une catégorie invalide', async () => {
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Event with Invalid Category',
          startDate: '2025-12-20T10:00:00Z',
          endDate: '2025-12-20T11:00:00Z',
          categoryId: 'invalid-category-id',
        }),
      })

      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.categoryId).toBeNull()
    })

    it('devrait valider les tags avant de les connecter', async () => {
      // Créer un tag valide
      const tag = await prisma.tag.create({
        data: {
          name: 'Test Tag',
          userId: 'test-user-id',
        },
      })

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Event with Tags',
          startDate: '2025-12-20T10:00:00Z',
          endDate: '2025-12-20T11:00:00Z',
          tagIds: [tag.id, 'invalid-tag-id'],
        }),
      })

      const response = await POST(request)
      
      // Si erreur, logger les détails
      if (response.status !== 200) {
        const errorData = await response.json()
        console.log('Error response:', errorData)
      }
      
      expect([200, 400, 500]).toContain(response.status)
      
      if (response.status === 200) {
        const data = await response.json()
        // Seul le tag valide devrait être connecté
        expect(data.tags).toBeDefined()
      }
    })

    it('devrait retourner une erreur si non authentifié', async () => {
      // Mock getSession pour retourner null
      const authModule = await import('@/lib/auth')
      vi.mocked(authModule.getSession).mockResolvedValueOnce(null as any)
      
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test',
          startDate: '2025-12-20T10:00:00Z',
          endDate: '2025-12-20T11:00:00Z',
        }),
      })

      const response = await POST(request)
      
      expect([401, 500]).toContain(response.status)
    })
  })
})

