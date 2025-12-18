import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Pour l'instant, on retourne des paramètres par défaut
    return NextResponse.json({
      enabled: true,
      email: false,
      push: true,
    })
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    // Pour l'instant, on retourne juste les paramètres
    return NextResponse.json(body)
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

