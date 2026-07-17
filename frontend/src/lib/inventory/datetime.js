// Shared date-time formatting for the inventory module — everything renders
// in Cambodia time (Asia/Phnom_Penh) as "2:09 PM, 7-16-2026".
//
// Supabase stores timestamps in UTC but often without a zone marker, so bare
// strings get a "Z" appended before parsing. Date-only values (YYYY-MM-DD)
// carry no time of day, so they render as just "7-16-2026".
const TZ = 'Asia/Phnom_Penh'

export function fmtDateTime(ts) {
  if (!ts) return '—'
  const s = String(ts)
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(s)
  const iso = dateOnly || /(Z|[+-]\d{2}:?\d{2})$/i.test(s) ? s : s + 'Z'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return s
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).formatToParts(d)
  const get = (t) => parts.find((p) => p.type === t)?.value
  const date = `${get('day')} ${get('month')}, ${get('year')}`
  return dateOnly ? date : `${get('hour')}:${get('minute')} ${get('dayPeriod')}, ${date}`
}
