import ReactECharts from 'echarts-for-react'
import 'echarts-gl'
import { useQuery } from '@tanstack/react-query'
import { getGalaxyPoints } from '@/utils/api'
import { useAppStore } from '@/store/appStore'

export default function CandidateGalaxy() {
  const { theme } = useAppStore()
  const { data: points, isLoading } = useQuery({
    queryKey: ['galaxy'],
    queryFn: getGalaxyPoints,
    refetchOnWindowFocus: false,
  })

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--blue)' }}><i className="ti ti-loader spin" /> Mapping Galaxy…</div>
  if (!points || points.length === 0) return null

  const isLight = theme === 'light'
  const bgColor = isLight ? '#ffffff' : '#0a0a0a'
  const textColor = isLight ? '#333333' : '#ffffff'
  const gridLineColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'

  // format for echarts-gl: [x, y, z, name, score, id]
  const data = points.map((p: any) => [
    p.x, p.y, p.z, 
    p.name || 'Candidate', 
    p.score, 
    p.id
  ])

  const option = {
    tooltip: {
      backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 10, 10, 0.95)',
      borderColor: isLight ? '#ccc' : '#444',
      textStyle: {
        color: textColor,
      },
      formatter: (params: any) => {
        const d = params.value
        return `<b>${d[3]}</b><br/>Score: ${(d[4]*100).toFixed(0)}%`
      }
    },
    visualMap: {
      show: false,
      min: 0,
      max: 1,
      inRange: {
        color: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']
      }
    },
    xAxis3D: {
      type: 'value',
      axisLine: { lineStyle: { color: textColor } },
      axisLabel: { textStyle: { color: textColor } },
      splitLine: { lineStyle: { color: gridLineColor } }
    },
    yAxis3D: {
      type: 'value',
      axisLine: { lineStyle: { color: textColor } },
      axisLabel: { textStyle: { color: textColor } },
      splitLine: { lineStyle: { color: gridLineColor } }
    },
    zAxis3D: {
      type: 'value',
      axisLine: { lineStyle: { color: textColor } },
      axisLabel: { textStyle: { color: textColor } },
      splitLine: { lineStyle: { color: gridLineColor } }
    },
    grid3D: {
      viewControl: {
        autoRotate: true,
        autoRotateSpeed: 5
      },
      environment: bgColor,
      axisLine: { lineStyle: { color: textColor } },
      axisPointer: { lineStyle: { color: isLight ? '#2563eb' : '#3b82f6' } }
    },
    series: [{
      type: 'scatter3D',
      data: data,
      symbolSize: 8,
      itemStyle: {
        opacity: 0.8
      },
      emphasis: {
        itemStyle: {
          color: isLight ? '#000000' : '#ffffff'
        }
      }
    }]
  }

  return (
    <div style={{
      background: bgColor,
      padding: '20px',
      borderRadius: '12px',
      border: `1px solid ${isLight ? 'var(--border)' : '#333'}`,
      color: textColor
    }}>
      <h3 style={{ color: textColor, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="ti ti-planet" style={{ color: 'var(--blue)' }} /> Candidate Galaxy
      </h3>
      <p style={{ color: isLight ? '#666' : '#888', fontSize: 12, marginBottom: 16 }}>A 3D projection of your talent pool using PCA dimensionality reduction.</p>
      <div style={{ height: 400, width: '100%' }}>
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  )
}
