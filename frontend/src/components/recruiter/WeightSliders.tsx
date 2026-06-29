import { useAppStore } from '@/store/appStore'

interface SliderProps { label: string; value: number; color: string; icon: string; onChange: (v: number) => void }

function SliderRow({ label, value, color, icon, onChange }: SliderProps) {
  const pct = Math.round(value * 100)
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:24, height:24, borderRadius:6, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <i className={`ti ${icon}`} style={{ color, fontSize:12 }} />
      </div>
      <span style={{ fontSize:12, color:'var(--muted)', width:64, flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, position:'relative' }}>
        <input
          type="range" min={0} max={100} step={1} value={pct}
          onChange={e => onChange(Number(e.target.value) / 100)}
          style={{ width:'100%', accentColor:color }}
        />
      </div>
      <span className="mono" style={{ fontSize:12, color, width:32, textAlign:'right', fontWeight:600 }}>{pct}%</span>
    </div>
  )
}

const SIGNALS = [
  { key: 'semantic' as const, label: 'Semantic', color: '#4f8ef7', icon: 'ti-vector-triangle' },
  { key: 'career' as const, label: 'Career', color: '#34d399', icon: 'ti-trending-up' },
  { key: 'skill' as const, label: 'Skill', color: '#a78bfa', icon: 'ti-code' },
  { key: 'activity' as const, label: 'Behavior', color: '#fbbf24', icon: 'ti-activity' },
  { key: 'intent' as const, label: 'Intent', color: '#fb7185', icon: 'ti-target' },
  { key: 'education' as const, label: 'Education', color: '#38bdf8', icon: 'ti-school' },
]

export default function WeightSliders() {
  const { weights, setWeights } = useAppStore()
  const total = Math.round(
    (weights.semantic + weights.career + weights.skill + weights.activity + weights.intent + weights.education) * 100
  )

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span className="label">Signal Weights</span>
        <span className="mono" style={{ fontSize:11, color: total === 100 ? 'var(--green)' : 'var(--amber)', fontWeight:600 }}>{total}%</span>
      </div>
      <div className="surface-2" style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
        {SIGNALS.map(({ key, label, color, icon }) => (
          <SliderRow
            key={key}
            label={label}
            value={weights[key]}
            color={color}
            icon={icon}
            onChange={v => setWeights({ [key]: v })}
          />
        ))}
      </div>
      <p style={{ fontSize:11, color:'var(--muted2)', marginTop:6 }}>Weights auto-normalize to 100% (PRD 6-signal model)</p>
    </div>
  )
}
