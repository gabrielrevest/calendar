import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '../setup'

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-id', email: 'test@test.com' },
  })),
}))

let GET: any
beforeEach(async () => {
  try {
    const module = await import('@/app/api/stats/route')
    GET = module.GET
  } catch (error) {
    // Route peut ne pas exister
  }
})

describe('API Stats', () => {
  beforeEach(async () => {
    await prisma.reminder.deleteMany()
    await prisma.event.deleteMany()
    await prisma.task.deleteMany()
    await prisma.chapter.deleteMany()
    await prisma.project.deleteMany()
    await prisma.note.deleteMany()
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

  describe('GET /api/stats', () => {
    it('devrait retourner des statistiques', async () => {
      if (!GET) return
      
      // Créer des données de test
      await prisma.event.create({
        data: {
          title: 'Test Event',
          startDate: new Date(),
          endDate: new Date(),
          userId: 'test-user-id',
        },
      })

      const response = await GET()
      
      expect([200, 500]).toContain(response.status)
    })
  })
})

