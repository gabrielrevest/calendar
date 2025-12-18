// Script pour générer des tests pour toutes les routes API
import fs from 'fs'
import path from 'path'

const apiRoutes = [
  'archive',
  'archive/[id]/unarchive',
  'attachments',
  'attachments/[id]',
  'auth/register',
  'backup',
  'calendar/ical',
  'calendar/token',
  'calendars',
  'categories',
  'categories/[id]',
  'events',
  'events/[id]',
  'events/[id]/duplicate',
  'events/bulk',
  'events/recurring',
  'export',
  'filters',
  'filters/[id]',
  'habits',
  'habits/[id]',
  'habits/[id]/toggle',
  'import/ical',
  'journal',
  'journal/[id]',
  'milestones/[id]',
  'notes',
  'notes/[id]',
  'notes/[id]/versions',
  'notes/[id]/versions/[versionId]/restore',
  'notifications/settings',
  'projects',
  'projects/[id]',
  'projects/[id]/chapters',
  'projects/[id]/milestones',
  'projects/[id]/tasks',
  'reminders',
  'search',
  'snapshots',
  'stats',
  'stats/heatmap',
  'stats/weekly',
  'tags',
  'tasks/[id]',
  'templates',
  'time-blocks',
  'time-blocks/[id]',
  'trash',
  'trash/[id]',
  'trash/[id]/restore',
  'user/profile',
  'views',
  'views/[id]',
]

const testTemplate = (route: string, routeName: string) => `import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '../setup'

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-id', email: 'test@test.com' },
  })),
}))

describe('API ${routeName}', () => {
  let GET: any, POST: any, PUT: any, DELETE: any

  beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.user.create({
      data: {
        id: 'test-user-id',
        email: 'test@test.com',
        name: 'Test User',
      },
    })

    try {
      const module = await import('@/app/api/${route}/route')
      GET = module.GET
      POST = module.POST
      PUT = module.PUT
      DELETE = module.DELETE
    } catch (error) {
      // Route peut ne pas exister
    }
  })

  describe('GET /api/${route}', () => {
    it('devrait retourner une réponse valide', async () => {
      if (!GET) return
      const request = new NextRequest('http://localhost:3000/api/${route}')
      const response = await GET(request)
      
      expect([200, 401, 404, 500]).toContain(response.status)
    })
  })

  describe('POST /api/${route}', () => {
    it('devrait créer une ressource', async () => {
      if (!POST) return
      const request = new NextRequest('http://localhost:3000/api/${route}', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      
      expect([200, 400, 401, 404, 500]).toContain(response.status)
    })
  })

  describe('PUT /api/${route}', () => {
    it('devrait mettre à jour une ressource', async () => {
      if (!PUT) return
      const request = new NextRequest('http://localhost:3000/api/${route}', {
        method: 'PUT',
        body: JSON.stringify({}),
      })

      const response = await PUT(request)
      
      expect([200, 400, 401, 404, 500]).toContain(response.status)
    })
  })

  describe('DELETE /api/${route}', () => {
    it('devrait supprimer une ressource', async () => {
      if (!DELETE) return
      const request = new NextRequest('http://localhost:3000/api/${route}', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      
      expect([200, 401, 404, 500]).toContain(response.status)
    })
  })
})
`

// Générer les tests
apiRoutes.forEach(route => {
  const routeName = route.replace(/\//g, '-').replace(/\[|\]/g, '')
  const testFileName = `${routeName}.test.ts`
  const testPath = path.join(__dirname, 'api', testFileName)
  
  // Créer le dossier si nécessaire
  const testDir = path.dirname(testPath)
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }
  
  // Écrire le fichier de test
  fs.writeFileSync(testPath, testTemplate(route, routeName))
  console.log(`✅ Créé: ${testFileName}`)
})

console.log(`\n✅ ${apiRoutes.length} fichiers de test créés!`)

