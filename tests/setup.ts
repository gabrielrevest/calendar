import { beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

// Créer le dossier tests s'il n'existe pas
const testDbPath = path.join(process.cwd(), 'tests', 'test.db')
const testDbDir = path.dirname(testDbPath)
if (!fs.existsSync(testDbDir)) {
  fs.mkdirSync(testDbDir, { recursive: true })
}

// URL de la base de données de test
const testDbUrl = `file:${testDbPath}`

// Mock Prisma pour les tests
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: testDbUrl,
    },
  },
})

beforeAll(async () => {
  // Initialiser la base de données de test
  process.env.DATABASE_URL = testDbUrl
  try {
    // Pousser le schéma vers la base de test
    execSync('npx prisma db push --skip-generate', {
      env: { ...process.env, DATABASE_URL: testDbUrl },
      stdio: 'ignore',
    })
  } catch (error) {
    // Ignorer les erreurs si la DB existe déjà
  }
  await prisma.$connect()
})

afterAll(async () => {
  // Nettoyer après les tests
  await prisma.$disconnect()
  // Optionnel: supprimer la base de test
  // if (fs.existsSync(testDbPath)) {
  //   fs.unlinkSync(testDbPath)
  // }
})

beforeEach(async () => {
  // Nettoyer les données entre les tests (dans l'ordre pour respecter les foreign keys)
  await prisma.reminder.deleteMany()
  await prisma.event.deleteMany()
  await prisma.task.deleteMany()
  await prisma.chapter.deleteMany()
  await prisma.project.deleteMany()
  await prisma.note.deleteMany()
  await prisma.journalEntry.deleteMany()
  await prisma.category.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.calendar.deleteMany()
  await prisma.user.deleteMany()
})

// Mock Next.js
global.fetch = global.fetch || (() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({}),
} as Response))

