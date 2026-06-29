import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { RankedCandidate } from '@/types'
import { useAppStore } from '@/store/appStore'

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background:'var(--bg1)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', fontSize:12, lineHeight:1.8, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
      <p style={{ fontWeight:600, color:'var(--text)', marginBottom:4 }}>{d.name}</p>
      <p style={{ color:'#4f8ef7' }}>Semantic: {(d.semantic*100).toFixed(0)}%</p>
      <p style={{ color:'#34d399' }}>Career: {(d.career*100).toFixed(0)}%</p>
      <p style={{ color:'#a78bfa' }}>Skill: {(d.skill*100).toFixed(0)}%</p>
      <p style={{ color:'#fbbf24' }}>Behavior: {(d.activity*100).toFixed(0)}%</p>
      <p style={{ color:'#fb7185' }}>Intent: {(d.intent*100).toFixed(0)}%</p>
      <p style={{ color:'#38bdf8' }}>Education: {(d.education*100).toFixed(0)}%</p>
      <div style={{ marginTop:4, paddingTop:4, borderTop:'1px solid var(--border)' }}>
        <p style={{ color:'var(--text)', fontWeight:600, fontFamily:'JetBrains Mono' }}>Total: {(d.final*100).toFixed(0)}%</p>
      </div>
    </div>
  )
}

export default function RankChart({ candidates }: { candidates: RankedCandidate[] }) {
  const { setSelectedCandidate } = useAppStore()
  const data = candidates.slice(0,15).map(c => ({
    name: c.name ? c.name.split(' ')[0] : `C${c.rank}`,
    semantic: c.semantic_score,
    career: c.career_score,
    skill: c.skill_score ?? 0,
    activity: c.activity_score,
    intent: c.intent_score ?? 0,
    education: c.education_score ?? 0,
    final: c.final_score,
    candidate: c,
  }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barGap={2} onClick={d => d?.activePayload?.[0] && setSelectedCandidate(d.activePayload[0].payload.candidate)}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill:'var(--muted)', fontSize:11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill:'var(--muted)', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v*100).toFixed(0)}%`} domain={[0,1]} width={36} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(79,142,247,0.05)' }} />
          <Bar dataKey="semantic" stackId="a" fill="#4f8ef7" />
          <Bar dataKey="career" stackId="a" fill="#34d399" />
          <Bar dataKey="skill" stackId="a" fill="#a78bfa" />
          <Bar dataKey="activity" stackId="a" fill="#fbbf24" />
          <Bar dataKey="intent" stackId="a" fill="#fb7185" />
          <Bar dataKey="education" stackId="a" fill="#38bdf8" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display:'flex', justifyContent:'center', gap:14, marginTop:8, flexWrap:'wrap' }}>
        {[['Semantic','#4f8ef7'],['Career','#34d399'],['Skill','#a78bfa'],['Behavior','#fbbf24'],['Intent','#fb7185'],['Education','#38bdf8']].map(([l,c])=>(
          <div key={l} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--muted)' }}>
            <span style={{ width:8, height:8, borderRadius:2, background:c, display:'inline-block' }} />{l}
          </div>
        ))}
      </div>
    </div>
  )
}
