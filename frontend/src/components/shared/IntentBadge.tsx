interface IntentBadgeProps {
  label: string
  score?: number
}

export default function IntentBadge({ label, score }: IntentBadgeProps) {
  let text = 'Passive'
  let icon = 'ti-moon'
  let bg = 'rgba(156, 163, 175, 0.08)'
  let color = 'var(--muted)'
  let border = 'rgba(156, 163, 175, 0.15)'

  if (label === 'actively_looking') {
    text = 'Actively Looking'
    icon = 'ti-flame'
    bg = 'rgba(239, 68, 68, 0.1)'
    color = 'var(--red)'
    border = 'rgba(239, 68, 68, 0.2)'
  } else if (label === 'open_to_offers') {
    text = 'Open to Offers'
    icon = 'ti-eye'
    bg = 'rgba(245, 158, 11, 0.1)'
    color = 'var(--amber)'
    border = 'rgba(245, 158, 11, 0.2)'
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 8px',
      borderRadius: 6,
      background: bg,
      color: color,
      border: `1px solid ${border}`,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      lineHeight: 1
    }}>
      <i className={`ti ${icon}`} style={{ fontSize: 12 }} />
      {text}
      {score !== undefined && (
        <span style={{ opacity: 0.7, marginLeft: 2, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
          {(score * 100).toFixed(0)}%
        </span>
      )}
    </span>
  )
}
