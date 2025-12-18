import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')

    // Pour l'instant, on retourne un tableau vide
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching filters:', error)
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
    const { name, type, filters } = body

    const savedFilter = {
      id: `filter-${Date.now()}`,
      name,
      type,
      filters,
      isFavorite: false,
    }

    return NextResponse.json(savedFilter)
  } catch (error) {
    console.error('Error saving filter:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

