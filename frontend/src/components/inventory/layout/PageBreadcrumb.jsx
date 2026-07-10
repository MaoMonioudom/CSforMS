import { useNavigate } from 'react-router-dom'

const PAGES = [
  { path: '/home',          label: 'Home'          },
  { path: '/catalog',       label: 'Browse'        },
  { path: '/notifications', label: 'Notifications' },
]

// Simple spaced page links shown under the hero of every logged-in page.
// The page you're on is bold with an underline; no separators.
export default function PageBreadcrumb({ current, light = true }) {
  const navigate = useNavigate()
  const mutedColor  = light ? 'rgba(255,255,255,0.55)' : '#94a3b8'
  const hoverColor  = light ? 'rgba(255,255,255,0.9)'  : '#334155'
  const activeColor = light ? '#fff' : '#0f172a'

  return (
    <nav aria-label="Pages" className="mb-4 flex items-center gap-5 sm:gap-7">
      {PAGES.map((p) => {
        const active = p.path === current
        return active ? (
          <span key={p.path} style={{
            fontSize: 13, fontWeight: 700, color: activeColor, whiteSpace: 'nowrap',
            paddingBottom: 3, borderBottom: `2px solid ${activeColor}`,
          }}>
            {p.label}
          </span>
        ) : (
          <button key={p.path} onClick={() => navigate(`/inventory${p.path}`)}
            style={{
              background: 'none', border: 'none', padding: '0 0 3px', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, color: mutedColor, whiteSpace: 'nowrap',
              borderBottom: '2px solid transparent', transition: 'color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = hoverColor}
            onMouseLeave={e => e.currentTarget.style.color = mutedColor}>
            {p.label}
          </button>
        )
      })}
    </nav>
  )
}
