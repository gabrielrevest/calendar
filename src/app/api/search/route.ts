import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''

    if (query.length < 2) {
      return NextResponse.json([])
    }

    const results: any[] = []

    // Recherche dans les événements
    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { startDate: 'desc' },
    })

    events.forEach((event) => {
      results.push({
        id: event.id,
        type: 'event',
        title: event.title,
        description: event.description || event.location,
        date: event.startDate,
        url: `/appointments`,
      })
    })

    // Recherche dans les notes
    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { updatedAt: 'desc' },
    })

    notes.forEach((note) => {
      results.push({
        id: note.id,
        type: 'note',
        title: note.title,
        description: note.content?.substring(0, 100),
        date: note.updatedAt,
        url: `/notes`,
      })
    })

    // Recherche dans les projets
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { updatedAt: 'desc' },
    })

    projects.forEach((project) => {
      results.push({
        id: project.id,
        type: 'project',
        title: project.name,
        description: project.description,
        date: project.updatedAt,
        url: project.type === 'BOOK' ? `/projects/${project.id}/write` : `/projects`,
      })
    })

    // Recherche dans le journal
    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        userId: session.user.id,
        content: { contains: query, mode: 'insensitive' },
      },
      take: 10,
      orderBy: { date: 'desc' },
    })

    journalEntries.forEach((entry) => {
      results.push({
        id: entry.id,
        type: 'journal',
        title: `Journal - ${format(new Date(entry.date), 'd MMMM yyyy', { locale: fr })}`,
        description: entry.content.substring(0, 100),
        date: entry.date,
        url: `/journal?date=${format(new Date(entry.date), 'yyyy-MM-dd')}`,
      })
    })

    // Trier par pertinence (date récente d'abord)
    results.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime()
      const dateB = new Date(b.date || 0).getTime()
      return dateB - dateA
    })

    return NextResponse.json(results.slice(0, 20))
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

