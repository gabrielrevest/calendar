import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const formatType = searchParams.get('format') || 'json'
    const includeEvents = searchParams.get('includeEvents') === 'true'
    const includeProjects = searchParams.get('includeProjects') === 'true'
    const includeNotes = searchParams.get('includeNotes') === 'true'

    const data: any = {}

    if (includeEvents) {
      data.events = await prisma.event.findMany({
        where: { userId: session.user.id },
        include: { category: true, tags: true },
      })
    }

    if (includeProjects) {
      data.projects = await prisma.project.findMany({
        where: { userId: session.user.id },
        include: { category: true, tags: true, tasks: true, chapters: true },
      })
    }

    if (includeNotes) {
      data.notes = await prisma.note.findMany({
        where: { userId: session.user.id },
        include: { category: true, tags: true },
      })
    }

    if (formatType === 'ical') {
      // Générer iCal
      let ical = 'BEGIN:VCALENDAR\r\n'
      ical += 'VERSION:2.0\r\n'
      ical += 'PRODID:-//Calendar App//EN\r\n'
      ical += 'CALSCALE:GREGORIAN\r\n'

      if (data.events) {
        data.events.forEach((event: any) => {
          ical += 'BEGIN:VEVENT\r\n'
          ical += `UID:${event.id}\r\n`
          ical += `DTSTART:${format(new Date(event.startDate), 'yyyyMMddTHHmmss')}\r\n`
          ical += `DTEND:${format(new Date(event.endDate), 'yyyyMMddTHHmmss')}\r\n`
          ical += `SUMMARY:${event.title}\r\n`
          if (event.description) {
            ical += `DESCRIPTION:${event.description.replace(/\r?\n/g, '\\n')}\r\n`
          }
          ical += 'END:VEVENT\r\n'
        })
      }

      ical += 'END:VCALENDAR\r\n'

      return new NextResponse(ical, {
        headers: {
          'Content-Type': 'text/calendar',
          'Content-Disposition': `attachment; filename="export.ics"`,
        },
      })
    }

    if (formatType === 'csv') {
      // Générer CSV
      let csv = 'Type,Title,Date,Created\n'
      
      if (data.events) {
        data.events.forEach((event: any) => {
          csv += `Event,"${event.title}",${format(new Date(event.startDate), 'yyyy-MM-dd')},${format(new Date(event.createdAt), 'yyyy-MM-dd')}\n`
        })
      }

      if (data.projects) {
        data.projects.forEach((project: any) => {
          csv += `Project,"${project.name}",${project.startDate ? format(new Date(project.startDate), 'yyyy-MM-dd') : ''},${format(new Date(project.createdAt), 'yyyy-MM-dd')}\n`
        })
      }

      if (data.notes) {
        data.notes.forEach((note: any) => {
          csv += `Note,"${note.title}",${note.linkedDate ? format(new Date(note.linkedDate), 'yyyy-MM-dd') : ''},${format(new Date(note.createdAt), 'yyyy-MM-dd')}\n`
        })
      }

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="export.csv"`,
        },
      })
    }

    // JSON par défaut
    return NextResponse.json(data, {
      headers: {
        'Content-Disposition': `attachment; filename="export.json"`,
      },
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

