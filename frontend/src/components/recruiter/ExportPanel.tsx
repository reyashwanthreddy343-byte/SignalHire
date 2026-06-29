import { useState } from 'react'
import { exportResults } from '@/utils/api'
import { useAppStore } from '@/store/appStore'
import type { ExportFormat } from '@/types'
import toast from 'react-hot-toast'

const FMTS: { label:string; value:ExportFormat; desc:string; icon:string }[] = [
  { label:'CSV',   value:'csv',  desc:'Redrob format',     icon:'ti-file-spreadsheet' },
  { label:'Excel', value:'xlsx', desc:'Formatted sheet',   icon:'ti-table' },
  { label:'JSON',  value:'json', desc:'Structured data',   icon:'ti-braces' },
]

export default function ExportPanel() {
  const { buildRankRequest } = useAppStore()
  const [loading, setLoading] = useState<ExportFormat|null>(null)

  const go = async (fmt: ExportFormat) => {
    const req = buildRankRequest()
    if (!req.jd_text.trim()) { toast.error('Enter a JD first'); return }
    setLoading(fmt)
    try {
      const blob = await exportResults(req, fmt)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `signalhire.${fmt === 'xlsx' ? 'xlsx' : fmt}`; a.click()
      URL.revokeObjectURL(url)
      toast.success(`Downloaded as ${fmt.toUpperCase()}`)
    } catch { toast.error('Export failed') }
    finally { setLoading(null) }
  }

  return (
    <div>
      <span className="label" style={{ display:'block', marginBottom:10 }}>Export Results</span>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
        {FMTS.map(({ label, value, desc, icon }) => (
          <button key={value} onClick={() => go(value)} disabled={!!loading}
            className="btn" style={{ flexDirection:'column', padding:'10px 8px', gap:6, opacity:loading===value?0.5:1, alignItems:'center' }}>
            <i className={`ti ${loading===value?'ti-loader spin':icon}`} style={{ fontSize:16, color:'var(--blue)' }} />
            <span style={{ fontSize:12, fontWeight:600 }}>{label}</span>
            <span style={{ fontSize:10, color:'var(--muted)' }}>{desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
