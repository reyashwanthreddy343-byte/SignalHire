interface Props { score: number; label?: string; delay?: number }

export default function ScoreBar({ score, label, delay = 0 }: Props) {
  const pct = Math.round(score * 100)
  const cls = score >= 0.7 ? 'bar-high' : score >= 0.45 ? 'bar-mid' : 'bar-low'
  const col = score >= 0.7 ? 'var(--green)' : score >= 0.45 ? 'var(--amber)' : 'var(--red)'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      {label && <span style={{ fontSize:11, color:'var(--muted)', width:58, flexShrink:0 }}>{label}</span>}
      <div className="score-bar-track">
        <div className={`score-bar-fill ${cls}`} style={{ width:`${pct}%`, transitionDelay:`${delay}s` }} />
      </div>
      <span className="mono" style={{ fontSize:11, color:col, width:30, textAlign:'right' }}>{pct}%</span>
    </div>
  )
}
