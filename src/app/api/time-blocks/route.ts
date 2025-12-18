import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')

    // Pour l'instant, on retourne un tableau vide
    // Plus tard, on pourra stocker les blocs en base
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching time blocks:', error)
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
    const { title, startTime, endTime, date, color } = body

    // Pour l'instant, on retourne juste un objet
    // Plus tard, on pourra stocker en base
    const block = {
      id: `block-${Date.now()}`,
      title,
      startTime,
      endTime,
      date,
      color,
    }

    return NextResponse.json(block)
  } catch (error) {
    console.error('Error creating time block:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

