// Shared date-time formatting for the inventory module — everything renders
// in Cambodia time (Asia/Phnom_Penh) as "2:09 PM, 7-16-2026".
//
// Supabase stores timestamps in UTC but often without a zone marker, so bare
// strings get a "Z" appended before parsing. Date-only values (YYYY-MM-DD)
// carry no time of day, so they render as just "7-16-2026".
const TZ = 'Asia/Phnom_Penh'

// Bare "YYYY-MM-DDTHH:MM:SS" (no Z/offset) is what Supabase returns for
// timestamp columns — always UTC, just missing the marker.
function toDate(ts) {
  const s = String(ts)
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(s)
  const iso = dateOnly || /(Z|[+-]\d{2}:?\d{2})$/i.test(s) ? s : s + 'Z'
  return { d: new Date(iso), dateOnly }
}

export function fmtDateTime(ts) {
  if (!ts) return '—'
  const { d, dateOnly } = toDate(ts)
  if (Number.isNaN(d.getTime())) return String(ts)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).formatToParts(d)
  const get = (t) => parts.find((p) => p.type === t)?.value
  const date = `${get('day')} ${get('month')}, ${get('year')}`
  return dateOnly ? date : `${get('hour')}:${get('minute')} ${get('dayPeriod')}, ${date}`
}

// Cambodia calendar date as a sortable "YYYY-MM-DD" key — for grouping
// entries by day (Today/Yesterday) using Cambodia's clock, not the
// viewer's browser timezone (which could be anywhere).
export function cambodiaDateKey(ts) {
  const { d } = toDate(ts)
  if (Number.isNaN(d.getTime())) return null
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d)
  const get = (t) => parts.find((p) => p.type === t)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

// "Today" / "Yesterday" / "17 July, 2026" — all judged by Cambodia's date,
// so the label matches the Cambodia time shown on each entry.
export function cambodiaDayLabel(ts) {
  const key = cambodiaDateKey(ts)
  if (!key) return String(ts)
  const todayKey = cambodiaDateKey(new Date().toISOString())
  const diffDays = Math.round((new Date(todayKey) - new Date(key)) / 86400000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return fmtDateTime(key)
}
