import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-clerk'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

function formatDateForIcal(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss")
}

function formatDateAllDay(date: Date): string {
  return format(date, "yyyyMMdd")
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function withIcalHeaders(body: string, status = 200): NextResponse {
  return new NextResponse(body, {
    status,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="calendrier.ics"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export async function OPTIONS() {
  return withIcalHeaders('', 204)
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier le token dans l'URL (pour l'abonnement iPhone)
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    let userId: string | null = null

    if (token) {
      // Authentification par token (pour iPhone)
      const user = await prisma.user.findUnique({
        where: { calendarToken: token },
        select: { id: true },
      })
      
      if (!user) {
        return new NextResponse('Token invalide', { status: 401 })
      }
      userId = user.id
    } else {
      // Authentification par session (pour téléchargement direct)
      userId = await getCurrentUserId()
      if (!userId) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }
    }

    const events = await prisma.event.findMany({
      where: { userId },
      orderBy: { startDate: 'asc' },
    })

    let ical = `BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//Calendrier App//FR\r
CALSCALE:GREGORIAN\r
METHOD:PUBLISH\r
X-WR-CALNAME:Mon Calendrier\r
X-WR-TIMEZONE:Europe/Paris\r
BEGIN:VTIMEZONE\r
TZID:Europe/Paris\r
BEGIN:DAYLIGHT\r
TZOFFSETFROM:+0100\r
TZOFFSETTO:+0200\r
TZNAME:CEST\r
DTSTART:19700329T020000\r
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU\r
END:DAYLIGHT\r
BEGIN:STANDARD\r
TZOFFSETFROM:+0200\r
TZOFFSETTO:+0100\r
TZNAME:CET\r
DTSTART:19701025T030000\r
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\r
END:STANDARD\r
END:VTIMEZONE\r
`

    for (const event of events) {
      const uid = `${event.id}@calendrier-app`
      const created = formatDateForIcal(new Date(event.createdAt))
      const modified = formatDateForIcal(new Date(event.updatedAt))

      ical += `BEGIN:VEVENT\r
UID:${uid}\r
DTSTAMP:${modified}\r
`

      // Gérer les événements sur toute la journée
      if (event.allDay) {
        ical += `DTSTART;VALUE=DATE:${formatDateAllDay(new Date(event.startDate))}\r
DTEND;VALUE=DATE:${formatDateAllDay(new Date(event.endDate))}\r
`
      } else {
        ical += `DTSTART;TZID=Europe/Paris:${formatDateForIcal(new Date(event.startDate))}\r
DTEND;TZID=Europe/Paris:${formatDateForIcal(new Date(event.endDate))}\r
`
      }

      ical += `SUMMARY:${escapeText(event.title)}\r
`

      if (event.description) {
        ical += `DESCRIPTION:${escapeText(event.description)}\r
`
      }

      if (event.location) {
        ical += `LOCATION:${escapeText(event.location)}\r
`
      }

      ical += `CREATED:${created}\r
LAST-MODIFIED:${modified}\r
END:VEVENT\r
`
    }

    ical += 'END:VCALENDAR\r\n'
    return withIcalHeaders(ical)
  } catch (error) {
    console.error('Error generating iCal:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
