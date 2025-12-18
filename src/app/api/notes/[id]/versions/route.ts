import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching versions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

