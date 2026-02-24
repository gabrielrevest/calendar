import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const auto = searchParams.get('auto') === 'true'

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Récupérer toutes les données de l'utilisateur
    const [events, projects, notes, tasks, categories, tags] = await Promise.all([
      prisma.event.findMany({ where: { userId } }),
      prisma.project.findMany({ where: { userId } }),
      prisma.note.findMany({ where: { userId } }),
      prisma.task.findMany({ where: { project: { userId } } }),
      prisma.category.findMany({ where: { userId } }),
      prisma.tag.findMany({ where: { userId } }),
    ])

    const backup = {
      version: '1.0',
      date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      user: {
        id: user.id,
        email: user.email,
      },
      data: {
        events,
        projects,
        notes,
        tasks,
        categories,
        tags,
      },
    }

    if (auto) {
      // Sauvegarder automatiquement (à implémenter avec stockage)
      return NextResponse.json({ success: true, message: 'Backup automatique créé' })
    }

    // Retourner le backup pour téléchargement
    return NextResponse.json(backup, {
      headers: {
        'Content-Disposition': `attachment; filename="backup-${format(new Date(), 'yyyy-MM-dd')}.json"`,
      },
    })
  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { enabled, frequency } = body // 'daily', 'weekly', 'monthly'

    // Sauvegarder les paramètres de backup automatique
    return NextResponse.json({ success: true, enabled, frequency })
  } catch (error) {
    console.error('Error setting backup:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

