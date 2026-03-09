import { NextRequest, NextResponse } from 'next/server'
import type { CalendarMeeting } from '@/types/history'

function parseICSDate(value: string): Date | null {
  // Remove any TZID prefix: "TZID=America/Buenos_Aires:20260308T100000" → "20260308T100000"
  const raw = value.includes(':') ? value.split(':').pop()! : value

  // Format: 20260308T100000Z or 20260308T100000 or 20260308
  const fullMatch = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/)
  if (fullMatch) {
    const [, yr, mo, dy, hr, mn, sc] = fullMatch
    return new Date(`${yr}-${mo}-${dy}T${hr}:${mn}:${sc}Z`)
  }

  const dateOnly = raw.match(/^(\d{4})(\d{2})(\d{2})$/)
  if (dateOnly) {
    const [, yr, mo, dy] = dateOnly
    return new Date(`${yr}-${mo}-${dy}T00:00:00Z`)
  }

  return null
}

function parseICS(text: string, includeAll = false): CalendarMeeting[] {
  const now = new Date()
  const results: CalendarMeeting[] = []

  // Unfold lines (ICS lines can be folded with CRLF + space/tab)
  const unfolded = text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '')
  const lines = unfolded.split(/\r?\n/)

  let inEvent = false
  let currentEvent: Record<string, string[]> = {}

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === 'BEGIN:VEVENT') {
      inEvent = true
      currentEvent = {}
      continue
    }

    if (trimmed === 'END:VEVENT') {
      inEvent = false

      const uid = currentEvent['UID']?.[0] ?? crypto.randomUUID()
      const title = currentEvent['SUMMARY']?.[0] ?? '(Sin título)'
      const dtstart = currentEvent['DTSTART']?.[0]
      const dtend = currentEvent['DTEND']?.[0]
      const location = currentEvent['LOCATION']?.[0]
      const attendeeLines = currentEvent['ATTENDEE'] ?? []

      if (!dtstart) continue

      const startDate = parseICSDate(dtstart)
      if (!startDate) continue

      // Only past events (skip filter when includeAll)
      if (!includeAll && startDate >= now) continue

      const endDate = dtend ? parseICSDate(dtend) : undefined

      const attendees: string[] = []
      for (const att of attendeeLines) {
        const match = att.match(/mailto:([^\s;]+)/i)
        if (match) attendees.push(match[1])
      }

      results.push({
        uid,
        title,
        date: startDate.toISOString(),
        endDate: endDate?.toISOString(),
        attendees,
        location,
      })

      currentEvent = {}
      continue
    }

    if (!inEvent) continue

    // Parse property name and value
    // Property name can have params: ATTENDEE;RSVP=TRUE;...;PARTSTAT=ACCEPTED:mailto:...
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) continue

    const propFull = trimmed.substring(0, colonIdx)
    const propValue = trimmed.substring(colonIdx + 1)

    // Property name is the part before the first ; or the whole thing
    const propName = propFull.split(';')[0].toUpperCase()

    if (!currentEvent[propName]) {
      currentEvent[propName] = []
    }

    // For ATTENDEE we store the full value (so we can extract mailto: later)
    // For others we store just the value
    if (propName === 'ATTENDEE') {
      // Store full line including params for email extraction
      currentEvent[propName].push(trimmed)
    } else {
      currentEvent[propName].push(propValue)
    }
  }

  if (includeAll) {
    results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return results
  }
  results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return results.slice(0, 30)
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const searchParams = new URL(req.url).searchParams
  const url = searchParams.get('url')
  const all = searchParams.get('all') === 'true'

  if (!url) {
    return NextResponse.json({ ok: false, error: 'URL no configurada' })
  }

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'dashboard-pm/1.0' },
    })

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: `Error al obtener el calendario (HTTP ${response.status})` })
    }

    const text = await response.text()
    const meetings = parseICS(text, all)

    return NextResponse.json({ ok: true, meetings })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ ok: false, error: `No se pudo obtener el calendario: ${message}` })
  }
}
