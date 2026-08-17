// ── MakerVault Theme ── Modern Tech / Inventory ───────────────────────────
// Values reference the real tokens registered in index.css's inventory
// @theme block, instead of duplicating hex here — this file used to keep
// its own separate copy (including a stale, pre-redesign `accent`), which
// is exactly the kind of drift that made two sources of truth disagree.
export const T = {
  red:          'var(--color-red)',
  redLight:     'var(--color-red-light)',
  redMid:       'var(--color-red-mid)',
  cream:        'var(--color-cream)',
  stone:        'var(--color-stone)',
  charcoal:     'var(--color-charcoal)',
  ink:          'var(--color-ink)',
  muted:        'var(--color-inv-muted)',
  faint:        'var(--color-faint)',
  white:        '#FFFFFF',
  green:        'var(--color-green)',
  greenLight:   'var(--color-green-light)',
  amber:        'var(--color-amber)',
  amberLight:   'var(--color-amber-light)',
  blue:         'var(--color-blue)',
  blueLight:    'var(--color-blue-light)',
  purple:       'var(--color-purple)',
  purpleLight:  'var(--color-purple-light)',
  teal:         'var(--color-teal)',
  tealLight:    'var(--color-teal-light)',
  border:       'var(--border)',
  borderDark:   'var(--color-border-dark)',
  accent:       'var(--color-inv-accent)',
  accentLight:  'var(--color-inv-accent-light)',
}

export const statusConfig = {
  available:   { label: 'Available',   color: T.green,  bg: T.greenLight  },
  out_of_stock:{ label: 'Out of Stock',color: T.red,    bg: T.redLight    },
  low_stock:   { label: 'Low Stock',   color: T.amber,  bg: T.amberLight  },
  borrowed:    { label: 'Borrowed',    color: T.amber,  bg: T.amberLight  },
  maintenance: { label: 'Maintenance', color: T.red,    bg: T.redLight    },
  unavailable: { label: 'Unavailable', color: T.muted,  bg: T.stone       },
  pending:     { label: 'Pending',     color: T.blue,   bg: T.blueLight   },
  completed:   { label: 'Returned',    color: T.muted,  bg: T.stone       },
  purchased:   { label: 'Purchased',   color: T.teal,   bg: T.tealLight   },
  active:      { label: 'Borrowed', color: T.amber,  bg: T.amberLight  },
  overdue:     { label: 'Overdue',     color: T.red,    bg: T.redLight    },
  approved:    { label: 'Approved',    color: T.green,  bg: T.greenLight  },
  denied:      { label: 'Declined',    color: T.red,    bg: T.redLight    },
  pay_completed: { label: 'Completed', color: T.green,  bg: T.greenLight  },
  pay_pending:   { label: 'Pending',   color: T.amber,  bg: T.amberLight  },
  pay_failed:    { label: 'Failed',    color: T.red,    bg: T.redLight    },
}
