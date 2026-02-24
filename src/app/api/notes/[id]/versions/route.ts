import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching versions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

