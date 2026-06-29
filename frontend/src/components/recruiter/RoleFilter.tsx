import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { autocompleteRoles } from '@/utils/api'
import { useAppStore } from '@/store/appStore'

function RoleBar({ idx, value, disabled }: { idx: number; value: string; disabled?: boolean }) {
  const { updateRoleFilter, removeRoleFilter } = useAppStore()
  const [focused, setFocused] = useState(false)
  const [local, setLocal] = useState(value)

  const { data: suggestions = [] } = useQuery({
    queryKey: ['ac-roles', local],
    queryFn: () => autocompleteRoles(local),
    enabled: local.length >= 1 && focused,
    staleTime: 15000,
  })

  const showDrop = focused && local.length > 0 && suggestions.length > 0

  return (
    <div style={{ position:'relative' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg2)', border:`1px solid ${focused ? 'var(--blue)' : 'var(--border)'}`, borderRadius:8, padding:'0 10px', transition:'border-color 0.15s' }}>
        <span className="mono" style={{ fontSize:10, color:'var(--muted)', flexShrink:0 }}>#{idx+1}</span>
        <input
          value={local}
          disabled={disabled}
          onChange={e => { setLocal(e.target.value); updateRoleFilter(idx, e.target.value) }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="e.g. ML Engineer, Civil Engineer…"
          style={{ flex:1, background:'transparent', border:'none', color:'var(--text)', fontSize:13, padding:'8px 0', outline:'none', fontFamily:'inherit' }}
        />
        <button onClick={() => removeRoleFilter(idx)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', padding:2, display:'flex' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
          <i className="ti ti-x" style={{ fontSize:13 }} />
        </button>
      </div>

      {showDrop && (
        <div className="anim-in" style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:100, background:'var(--bg1)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
          {suggestions.map(s => (
            <button key={s} onMouseDown={() => { setLocal(s); updateRoleFilter(idx, s); setFocused(false) }}
              style={{ width:'100%', padding:'8px 12px', background:'none', border:'none', color:'var(--text)', fontSize:13, textAlign:'left', cursor:'pointer', fontFamily:'inherit', display:'block', borderBottom:'1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-dim)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <i className="ti ti-search" style={{ color:'var(--muted)', fontSize:11, marginRight:8 }} />{s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RoleFilter({ disabled = false }: { disabled?: boolean }) {
  const { roleFilters, addRoleFilter } = useAppStore()
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span className="label">Role Filters</span>
        {!disabled && (
        <button className="btn btn-ghost" onClick={addRoleFilter} style={{ fontSize:12, padding:'3px 8px', gap:4, color:'var(--blue)' }}>
          <i className="ti ti-plus" style={{ fontSize:12 }} />Add filter
        </button>
        )}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {roleFilters.map((v, i) => <RoleBar key={i} idx={i} value={v} disabled={disabled} />)}
      </div>
    </div>
  )
}
