import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const noteId = formData.get('noteId') as string

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Créer le dossier uploads si nécessaire
    const uploadsDir = join(process.cwd(), 'uploads', session.user.id)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const filepath = join(uploadsDir, filename)

    await writeFile(filepath, buffer)

    const attachment = {
      id: `att-${timestamp}`,
      name: file.name,
      url: `/api/attachments/${session.user.id}/${filename}`,
      size: file.size,
      type: file.type,
    }

    return NextResponse.json(attachment)
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


