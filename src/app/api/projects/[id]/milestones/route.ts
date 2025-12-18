import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Pour l'instant, on retourne un tableau vide
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching milestones:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { title, date } = body

    const milestone = {
      id: `milestone-${Date.now()}`,
      title,
      date,
      completed: false,
      projectId: params.id,
    }

    return NextResponse.json(milestone)
  } catch (error) {
    console.error('Error creating milestone:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

