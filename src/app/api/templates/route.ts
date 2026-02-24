import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'

const DEFAULT_TEMPLATES = {
  project: [
    {
      name: 'Projet Personnel',
      type: 'PERSONAL',
      description: 'Template pour un projet personnel',
      status: 'PLANNING',
      priority: 'NORMAL',
    },
    {
      name: 'Livre',
      type: 'BOOK',
      description: 'Template pour écrire un livre',
      status: 'PLANNING',
      priority: 'NORMAL',
      targetWords: 50000,
      targetPages: 200,
    },
    {
      name: 'Projet Professionnel',
      type: 'PROFESSIONAL',
      description: 'Template pour un projet professionnel',
      status: 'PLANNING',
      priority: 'HIGH',
    },
  ],
  note: [
    {
      name: 'Note de Réunion',
      title: 'Réunion - {{date}}',
      content: 'Participants:\n\nOrdre du jour:\n1.\n2.\n3.\n\nActions:\n- ',
    },
    {
      name: 'Idée',
      title: 'Idée - {{date}}',
      content: 'Idée:\n\nContexte:\n\nAction:\n',
    },
    {
      name: 'Note Rapide',
      title: 'Note - {{date}}',
      content: '',
    },
  ],
  event: [
    {
      name: 'Rendez-vous Médical',
      title: 'Rendez-vous médical',
      allDay: false,
      location: '',
    },
    {
      name: 'Réunion',
      title: 'Réunion',
      allDay: false,
      location: '',
    },
    {
      name: 'Anniversaire',
      title: 'Anniversaire',
      allDay: true,
      location: '',
    },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    if (type === 'all') {
      return NextResponse.json(DEFAULT_TEMPLATES)
    }

    return NextResponse.json(DEFAULT_TEMPLATES[type as keyof typeof DEFAULT_TEMPLATES] || [])
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


