import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    return NextResponse.json({ ...body, id: params.id })
  } catch (error) {
    console.error('Error updating milestone:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

