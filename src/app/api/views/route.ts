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

    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching views:', error)
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
    const { name, type, filters, layout } = body

    const view = {
      id: `view-${Date.now()}`,
      name,
      type,
      filters,
      layout,
      isFavorite: false,
    }

    return NextResponse.json(view)
  } catch (error) {
    console.error('Error saving view:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

