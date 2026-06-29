import { useQuery } from '@tanstack/react-query'
import ReactECharts from 'echarts-for-react'
import { api } from '@/utils/api'

interface Props {
  candidateId: string
  candidateName: string
}

export default function CultureFitRadar({ candidateId, candidateName }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['cultureFit', candidateId],
    queryFn: async () => {
      const { data } = await api.post('/analytics/culture_fit', { candidate_id: candidateId })
      return data
    },
  })

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 20, color: 'var(--muted)', fontSize: 12 }}>
      <i className="ti ti-loader spin" /> Analyzing culture fit...
    </div>
  )

  if (!data) return null

  const dims = data.dimensions || {}
  const labels = Object.keys(dims)
  const values = Object.values(dims) as number[]

  const option = {
    backgroundColor: 'transparent',
    tooltip: {},
    radar: {
      indicator: labels.map(l => ({ name: l, max: 1 })),
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#aaa', fontSize: 11, fontFamily: 'Space Grotesk' },
      splitLine: { lineStyle: { color: 'rgba(168,85,247,0.15)' } },
      splitArea: { areaStyle: { color: ['transparent', 'rgba(168,85,247,0.03)'] } },
      axisLine: { lineStyle: { color: 'rgba(168,85,247,0.2)' } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: values.map(v => Math.round(v * 100) / 100),
        name: candidateName,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#a855f7', width: 2 },
        areaStyle: {
          color: {
            type: 'radial', x: 0.5, y: 0.5, r: 0.5,
            colorStops: [
              { offset: 0, color: 'rgba(168,85,247,0.4)' },
              { offset: 1, color: 'rgba(168,85,247,0.05)' },
            ]
          }
        },
        itemStyle: { color: '#a855f7', borderColor: '#fff', borderWidth: 1 },
      }],
    }],
  }

  return (
    <div className="surface" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-heart-rate-monitor" style={{ color: 'var(--accent)' }} /> Culture Fit
        </h4>
        <span style={{
          fontSize: 18, fontWeight: 800, color: 'var(--accent)',
          fontFamily: 'JetBrains Mono',
        }}>
          {Math.round((data.overall_fit || 0) * 100)}%
        </span>
      </div>
      <ReactECharts option={option} style={{ height: 240 }} />
      <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, marginTop: 8 }}>
        {data.insight}
      </p>
    </div>
  )
}
