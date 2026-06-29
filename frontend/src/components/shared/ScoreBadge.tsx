interface Props { score: number; size?: 'sm'|'md'|'lg' }
export default function ScoreBadge({ score, size='md' }: Props) {
  const pct = Math.round(score * 100)
  const col = score >= 0.7 ? 'var(--green)' : score >= 0.45 ? 'var(--amber)' : 'var(--red)'
  const fs = size === 'sm' ? 12 : size === 'lg' ? 20 : 15
  return <span className="mono" style={{ fontSize:fs, fontWeight:600, color:col }}>{pct}%</span>
}
