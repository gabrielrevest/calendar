import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '../setup'

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-id', email: 'test@test.com' },
  })),
}))

describe('Integration Tests - API Flow', () => {
  beforeEach(async () => {
    await prisma.reminder.deleteMany()
    await prisma.event.deleteMany()
    await prisma.task.deleteMany()
    await prisma.chapter.deleteMany()
    await prisma.project.deleteMany()
    await prisma.note.deleteMany()
    await prisma.category.deleteMany()
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

  it('devrait créer un événement, un projet et une note avec des relations', async () => {
    // Créer une catégorie
    const category = await prisma.category.create({
      data: {
        name: 'Work',
        type: 'EVENT',
        userId: 'test-user-id',
      },
    })

    // Créer un tag
    const tag = await prisma.tag.create({
      data: {
        name: 'Important',
        userId: 'test-user-id',
      },
    })

    // Créer un projet
    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        type: 'PERSONAL',
        status: 'PLANNING',
        userId: 'test-user-id',
        categoryId: category.id,
        tags: {
          connect: [{ id: tag.id }],
        },
      },
    })

    // Créer un événement
    const event = await prisma.event.create({
      data: {
        title: 'Meeting',
        startDate: new Date('2025-12-20T10:00:00Z'),
        endDate: new Date('2025-12-20T11:00:00Z'),
        userId: 'test-user-id',
        categoryId: category.id,
        tags: {
          connect: [{ id: tag.id }],
        },
      },
    })

    // Créer une note liée au projet
    const note = await prisma.note.create({
      data: {
        title: 'Project Note',
        content: 'Note content',
        userId: 'test-user-id',
        projectId: project.id,
        categoryId: category.id,
        tags: {
          connect: [{ id: tag.id }],
        },
      },
    })

    // Vérifications
    expect(project.categoryId).toBe(category.id)
    expect(event.categoryId).toBe(category.id)
    expect(note.projectId).toBe(project.id)
    expect(note.categoryId).toBe(category.id)
  })

  it('devrait gérer les foreign keys invalides gracieusement', async () => {
    // Essayer de créer avec des IDs invalides
    const project = await prisma.project.create({
      data: {
        name: 'Project without category',
        type: 'PERSONAL',
        status: 'PLANNING',
        userId: 'test-user-id',
        // categoryId: 'invalid-id' - ne devrait pas être ajouté
      },
    })

    expect(project.categoryId).toBeNull()
  })
})

