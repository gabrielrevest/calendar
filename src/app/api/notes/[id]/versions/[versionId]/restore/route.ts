import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error restoring version:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

