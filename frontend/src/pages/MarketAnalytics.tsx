import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ReactECharts from 'echarts-for-react'
import { api } from '@/utils/api'

async function fetchMarketData() {
  const { data } = await api.get('/analytics/market')
  return data
}

export default function MarketAnalytics() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['market'], queryFn: fetchMarketData })
  const [activeTab, setActiveTab] = useState<'sunburst' | 'salary' | 'companies' | 'experience'>('sunburst')

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, color: 'var(--muted)', gap: 10 }}>
      <i className="ti ti-loader spin" style={{ fontSize: 24 }} /> Analyzing talent market...
    </div>
  )

  if (isError || !data) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
      <i className="ti ti-alert-triangle" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} />
      Upload candidates first to see market intelligence.
    </div>
  )

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
    border: 'none', fontFamily: 'inherit', transition: 'all 0.15s',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--muted)',
  })

  // Sunburst chart
  const sunburstOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} candidates' },
    series: [{
      type: 'sunburst',
      data: data.skill_sunburst,
      radius: ['15%', '90%'],
      sort: undefined,
      emphasis: { focus: 'ancestor' },
      levels: [
        {},
        {
          r0: '15%', r: '50%',
          itemStyle: { borderWidth: 2, borderColor: 'rgba(0,0,0,0.3)' },
          label: { fontSize: 12, fontWeight: 600, color: '#fff' },
        },
        {
          r0: '50%', r: '90%',
          label: { fontSize: 10, color: '#ddd' },
          itemStyle: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)' },
        }
      ],
      label: { fontFamily: 'Space Grotesk' },
      itemStyle: {
        color: undefined,
        borderRadius: 6,
      },
    }],
    color: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'],
  }

  // Salary boxplot
  const salaryOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    xAxis: {
      type: 'category',
      data: data.salary_bands.map((s: any) => s.level),
      axisLabel: { color: '#aaa', fontFamily: 'Space Grotesk', fontSize: 11 },
      axisLine: { lineStyle: { color: '#333' } },
    },
    yAxis: {
      type: 'value',
      name: 'Salary (LPA)',
      nameTextStyle: { color: '#888', fontFamily: 'Space Grotesk' },
      axisLabel: { color: '#aaa', fontFamily: 'Space Grotesk', fontSize: 11 },
      splitLine: { lineStyle: { color: '#222' } },
    },
    series: [{
      type: 'bar',
      data: data.salary_bands.map((s: any) => ({
        value: s.median,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#a855f7' },
              { offset: 1, color: '#6366f1' },
            ]
          },
          borderRadius: [6, 6, 0, 0],
        }
      })),
      barWidth: '50%',
      label: {
        show: true, position: 'top',
        formatter: (p: any) => `₹${p.value}L`,
        color: '#fff', fontSize: 11, fontFamily: 'JetBrains Mono',
      },
    },
    {
      type: 'bar',
      data: data.salary_bands.map((s: any) => ({
        value: s.max - s.median,
        itemStyle: { color: 'rgba(168,85,247,0.2)', borderRadius: [6, 6, 0, 0] }
      })),
      stack: 'salary',
      barWidth: '50%',
    }],
    grid: { left: 60, right: 30, bottom: 40, top: 50 },
  }

  // Company breakdown
  const companyOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { show: false },
    series: [{
      type: 'pie',
      radius: ['40%', '75%'],
      avoidLabelOverlap: true,
      padAngle: 3,
      itemStyle: { borderRadius: 8 },
      label: { show: true, color: '#ddd', fontSize: 11, fontFamily: 'Space Grotesk' },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 20, shadowColor: 'rgba(168,85,247,0.5)' },
      },
      data: data.company_breakdown.slice(0, 10),
    }],
    color: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6'],
  }

  // Experience distribution
  const expOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.experience_distribution.map((e: any) => e.name),
      axisLabel: { color: '#aaa', fontFamily: 'Space Grotesk', fontSize: 12 },
      axisLine: { lineStyle: { color: '#333' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#aaa', fontFamily: 'Space Grotesk', fontSize: 11 },
      splitLine: { lineStyle: { color: '#222' } },
    },
    series: [{
      type: 'bar',
      data: data.experience_distribution.map((e: any, i: number) => ({
        value: e.value,
        itemStyle: {
          color: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 5],
          borderRadius: [8, 8, 0, 0],
        }
      })),
      barWidth: '50%',
      label: {
        show: true, position: 'top',
        color: '#fff', fontSize: 12, fontFamily: 'JetBrains Mono',
      },
    }],
    grid: { left: 50, right: 30, bottom: 40, top: 30 },
  }

  return (
    <div style={{ padding: '28px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="ti ti-chart-treemap" style={{ color: 'var(--accent)' }} /> Market Intelligence
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Real-time analysis of <strong style={{ color: 'var(--accent)' }}>{data.total_candidates?.toLocaleString()}</strong> candidates in the talent pool
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { icon: 'ti-users', label: 'Total Candidates', value: data.total_candidates?.toLocaleString() || '0', color: '#a855f7' },
          { icon: 'ti-code', label: 'Unique Skills', value: data.skill_sunburst?.reduce((a: number, c: any) => a + (c.children?.length || 0), 0) || '0', color: '#3b82f6' },
          { icon: 'ti-building', label: 'Companies', value: data.company_breakdown?.length || '0', color: '#10b981' },
          { icon: 'ti-map-pin', label: 'Locations', value: data.location_stats?.length || '0', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="surface anim-up" style={{ padding: '20px', animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: 20, color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'JetBrains Mono' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 2, padding: 4, background: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)', width: 'fit-content', marginBottom: 24 }}>
        {(['sunburst', 'salary', 'companies', 'experience'] as const).map(t => (
          <button key={t} style={tabStyle(activeTab === t)} onClick={() => setActiveTab(t)}>
            {t === 'sunburst' && <><i className="ti ti-chart-donut-3" style={{ marginRight: 6 }} />Skills</>}
            {t === 'salary' && <><i className="ti ti-currency-rupee" style={{ marginRight: 6 }} />Salary</>}
            {t === 'companies' && <><i className="ti ti-building" style={{ marginRight: 6 }} />Companies</>}
            {t === 'experience' && <><i className="ti ti-chart-bar" style={{ marginRight: 6 }} />Experience</>}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="surface anim-in" style={{ padding: 24, minHeight: 450 }}>
        {activeTab === 'sunburst' && (
          <ReactECharts option={sunburstOption} style={{ height: 450 }} />
        )}
        {activeTab === 'salary' && (
          <>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
              Salary bands are <strong>estimated/synthetic for demo purposes</strong> — inferred from job titles, not verified compensation data.
            </p>
            <ReactECharts option={salaryOption} style={{ height: 450 }} />
          </>
        )}
        {activeTab === 'companies' && (
          <ReactECharts option={companyOption} style={{ height: 450 }} />
        )}
        {activeTab === 'experience' && (
          <ReactECharts option={expOption} style={{ height: 450 }} />
        )}
      </div>

      {/* Location Grid */}
      {data.location_stats?.length > 0 && (
        <div className="surface" style={{ marginTop: 20, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-map-pin" style={{ color: 'var(--accent)' }} /> Talent Locations
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.location_stats.map((loc: any, i: number) => (
              <div key={i} style={{
                padding: '6px 14px', borderRadius: 20,
                background: 'var(--bg2)', border: '1px solid var(--border)',
                fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ color: 'var(--text)' }}>{loc.name}</span>
                <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{loc.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
