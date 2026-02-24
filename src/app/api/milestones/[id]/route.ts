import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    return NextResponse.json({ ...body, id: params.id })
  } catch (error) {
    console.error('Error updating milestone:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

