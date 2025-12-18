import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Date requise' }, { status: 400 })
    }

    let entry = null
    try {
      entry = await prisma.journalEntry.findFirst({
        where: {
          userId: session.user.id,
          date: new Date(date),
        },
      })
    } catch (error) {
      // Table n'existe pas encore
      console.log('JournalEntry table not found')
    }

    return NextResponse.json(entry || null)
  } catch (error) {
    console.error('Error fetching journal entry:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { date, content } = body

    if (!date || !content) {
      return NextResponse.json({ error: 'Date et contenu requis' }, { status: 400 })
    }

    // Valider la date
    const entryDate = new Date(date)
    if (isNaN(entryDate.getTime())) {
      return NextResponse.json({ error: 'Date invalide' }, { status: 400 })
    }

    // Vérifier si une entrée existe déjà pour cette date
    const existing = await prisma.journalEntry.findFirst({
      where: {
        userId: session.user.id,
        date: entryDate,
      },
    })

    let entry;
    if (existing) {
      entry = await prisma.journalEntry.update({
        where: { id: existing.id },
        data: { content },
      })
    } else {
      entry = await prisma.journalEntry.create({
        data: {
          userId: session.user.id,
          date: new Date(date),
          content,
        },
      })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error saving journal entry:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


