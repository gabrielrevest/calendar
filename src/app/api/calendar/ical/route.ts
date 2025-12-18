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

    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Calendrier App//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Mon Calendrier
X-WR-TIMEZONE:Europe/Paris
BEGIN:VTIMEZONE
TZID:Europe/Paris
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
`

    for (const event of events) {
      const uid = `${event.id}@calendrier-app`
      const created = formatDateForIcal(new Date(event.createdAt))
      const modified = formatDateForIcal(new Date(event.updatedAt))

      ical += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${modified}
`

      // Gérer les événements sur toute la journée
      if (event.allDay) {
        ical += `DTSTART;VALUE=DATE:${formatDateAllDay(new Date(event.startDate))}
DTEND;VALUE=DATE:${formatDateAllDay(new Date(event.endDate))}
`
      } else {
        ical += `DTSTART;TZID=Europe/Paris:${formatDateForIcal(new Date(event.startDate))}
DTEND;TZID=Europe/Paris:${formatDateForIcal(new Date(event.endDate))}
`
      }

      ical += `SUMMARY:${escapeText(event.title)}
`

      if (event.description) {
        ical += `DESCRIPTION:${escapeText(event.description)}
`
      }

      if (event.location) {
        ical += `LOCATION:${escapeText(event.location)}
`
      }

      ical += `CREATED:${created}
LAST-MODIFIED:${modified}
END:VEVENT
`
    }

    ical += 'END:VCALENDAR'

    return new NextResponse(ical, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="calendrier.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    })
  } catch (error) {
    console.error('Error generating iCal:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
