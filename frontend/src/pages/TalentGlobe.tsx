import { useQuery } from '@tanstack/react-query'
import ReactECharts from 'echarts-for-react'
import { api } from '@/utils/api'

async function fetchHeatmap() {
  const { data } = await api.get('/analytics/heatmap')
  return data
}

// Simple Mercator-ish projection for scatter chart
function project(lat: number, lng: number): [number, number] {
  return [lng, lat]
}

export default function TalentGlobe() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['heatmap'], queryFn: fetchHeatmap })

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, color: 'var(--muted)', gap: 10 }}>
      <i className="ti ti-loader spin" style={{ fontSize: 24 }} /> Mapping global talent...
    </div>
  )

  if (isError || !data?.points?.length) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
      <i className="ti ti-world" style={{ fontSize: 48, display: 'block', marginBottom: 12 }} />
      <p>Upload candidates to see the global talent heatmap.</p>
    </div>
  )

  // Use a direct scatter chart with projected lat/lng — no external map registration needed
  const option = {
    backgroundColor: '#0a0a0f',
    tooltip: {
      trigger: 'item' as const,
      formatter: (p: any) => {
        const d = p.data
        return `<strong>${d.candidateName}</strong><br/>${d.candidateTitle}<br/>Candidates: ${d.count}`
      }
    },
    grid: {
      left: 50, right: 30, top: 30, bottom: 40,
    },
    xAxis: {
      type: 'value' as const,
      min: 60,
      max: 100,
      name: 'Longitude',
      nameTextStyle: { color: '#444', fontSize: 10 },
      axisLabel: { color: '#333', fontSize: 9 },
      axisLine: { lineStyle: { color: '#222' } },
      splitLine: { lineStyle: { color: '#111' } },
    },
    yAxis: {
      type: 'value' as const,
      min: 5,
      max: 38,
      name: 'Latitude',
      nameTextStyle: { color: '#444', fontSize: 10 },
      axisLabel: { color: '#333', fontSize: 9 },
      axisLine: { lineStyle: { color: '#222' } },
      splitLine: { lineStyle: { color: '#111' } },
    },
    series: [{
      type: 'effectScatter',
      data: data.points.map((p: any) => ({
        value: project(p.lat, p.lng),
        candidateName: p.name,
        candidateTitle: p.title,
        count: p.value,
      })),
      symbolSize: (val: any, params: any) => Math.max(10, Math.min(35, params.data.count * 4)),
      showEffectOn: 'render' as const,
      rippleEffect: {
        brushType: 'stroke' as const,
        scale: 4,
        period: 4,
      },
      label: {
        show: true,
        position: 'right' as const,
        formatter: (p: any) => p.data.candidateName,
        color: '#777',
        fontSize: 9,
      },
      itemStyle: {
        color: {
          type: 'radial' as const, x: 0.5, y: 0.5, r: 0.5,
          colorStops: [
            { offset: 0, color: '#a855f7' },
            { offset: 0.5, color: '#6366f1' },
            { offset: 1, color: 'rgba(99,102,241,0.2)' },
          ]
        },
        shadowBlur: 20,
        shadowColor: 'rgba(168,85,247,0.6)',
      },
      zlevel: 1,
    },
    // Background "grid dots" to give a map-like feel
    {
      type: 'scatter',
      data: Array.from({ length: 200 }, () => [
        60 + Math.random() * 40,
        5 + Math.random() * 33,
      ]),
      symbolSize: 1,
      itemStyle: { color: 'rgba(99,102,241,0.08)' },
      silent: true,
      zlevel: 0,
    }],
  }

  return (
    <div style={{ padding: '28px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="ti ti-world" style={{ color: 'var(--accent)' }} /> Global Talent Heatmap
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Mapping <strong style={{ color: 'var(--accent)' }}>{data.total}</strong> candidates across regions • Bubble size = talent density
        </p>
      </div>

      <div className="surface anim-in" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
        <ReactECharts 
          option={option} 
          style={{ height: 560, background: '#0a0a0f' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      {/* Stats Bar */}
      <div className="surface" style={{ marginTop: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Bubble size = talent density</span>
        <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
          {[
            { size: 8, label: '1-5' },
            { size: 14, label: '5-20' },
            { size: 22, label: '20+' },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
              <div style={{ width: l.size, height: l.size, borderRadius: '50%', background: 'var(--accent)', opacity: 0.7 }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Top Cities */}
      <div className="surface" style={{ marginTop: 16, padding: '16px 20px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-map-pin" style={{ color: 'var(--accent)' }} /> Top Talent Cities
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {data.points.sort((a: any, b: any) => b.value - a.value).slice(0, 15).map((p: any, i: number) => (
            <div key={i} style={{
              padding: '6px 14px', borderRadius: 20,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: 'var(--text)' }}>{p.name}</span>
              <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{p.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
