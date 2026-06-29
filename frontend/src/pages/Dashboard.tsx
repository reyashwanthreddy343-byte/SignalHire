import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { getHealth } from '@/utils/api'
import { useAppStore } from '@/store/appStore'
import { ArrowUpRight, Activity, Cpu, Users, Shield, Calendar, ArrowRight } from 'lucide-react'
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useNavigate } from 'react-router-dom'

function CountUp({ value, duration = 1200, decimals = 0 }: { value: number; duration?: number; decimals?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) return

    const totalMiliseconds = duration
    const incrementTime = Math.max(Math.floor(totalMiliseconds / 60), 10)
    
    const timer = setInterval(() => {
      start += (end - start) * 0.15
      if (Math.abs(end - start) < 0.1 || start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, incrementTime)

    return () => clearInterval(timer)
  }, [value, duration])

  return <span className="mono">{count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { rankResponse } = useAppStore()
  const { data: health } = useQuery({ 
    queryKey: ['health'], 
    queryFn: getHealth, 
    refetchInterval: 15000, 
    retry: false 
  })
  const candidates = rankResponse?.ranked_candidates ?? []

  // Derive score distribution from actual ranking data when available
  const chartData = useMemo(() => {
    if (candidates.length > 0) {
      const buckets: Record<string, number> = {
        '0.0-0.1': 0, '0.1-0.2': 0, '0.2-0.3': 0, '0.3-0.4': 0,
        '0.4-0.5': 0, '0.5-0.6': 0, '0.6-0.7': 0, '0.7-0.8': 0,
        '0.8-0.9': 0, '0.9-1.0': 0,
      }
      candidates.forEach(c => {
        const s = Math.min(c.final_score, 0.999)
        const key = `${(Math.floor(s * 10) / 10).toFixed(1)}-${(Math.floor(s * 10) / 10 + 0.1).toFixed(1)}`
        if (buckets[key] !== undefined) buckets[key]++
      })
      return Object.entries(buckets).map(([range, count]) => ({ range, count, expected: 0 }))
    }
    // Before any ranking: show empty placeholder
    return [
      { range: '0.0-0.1', count: 0, expected: 0 },
      { range: '0.1-0.2', count: 0, expected: 0 },
      { range: '0.2-0.3', count: 0, expected: 0 },
      { range: '0.3-0.4', count: 0, expected: 0 },
      { range: '0.4-0.5', count: 0, expected: 0 },
      { range: '0.5-0.6', count: 0, expected: 0 },
      { range: '0.6-0.7', count: 0, expected: 0 },
      { range: '0.7-0.8', count: 0, expected: 0 },
      { range: '0.8-0.9', count: 0, expected: 0 },
      { range: '0.9-1.0', count: 0, expected: 0 }
    ]
  }, [candidates])

  const maxCount = useMemo(() => Math.max(...chartData.map(d => d.count), 1), [chartData])

  // Compute live stats from real data
  const totalIndexed = health?.candidates_indexed ?? 0
  const qualifiedCount = candidates.length > 0
    ? candidates.filter(c => c.final_score >= 0.3).length
    : 0
  const avgScore = candidates.length > 0
    ? candidates.reduce((s, c) => s + c.final_score, 0) / candidates.length
    : 0
  const topScore = candidates.length > 0
    ? Math.max(...candidates.map(c => c.final_score))
    : 0
  const topCandRole = candidates.length > 0
    ? (candidates.find(c => c.final_score === topScore)?.ai_role_label || 'N/A')
    : 'N/A'

  const now = new Date()
  const ts = (offsetMin: number) => {
    const t = new Date(now.getTime() - offsetMin * 60 * 1000)
    return t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const activityFeed = useMemo(() => {
    const items = []
    if (health?.models_loaded) {
      items.push({ time: ts(0), type: 'success', text: `FAISS index ready with ${totalIndexed.toLocaleString()} vectors` })
    } else {
      items.push({ time: ts(0), type: 'warning', text: 'Pipeline initializing — loading models...' })
    }
    if (candidates.length > 0) {
      items.push({ time: ts(1), type: 'success', text: `Last ranking returned ${candidates.length} candidates in ${rankResponse?.processing_time_ms?.toFixed(0)}ms` })
    }
    items.push({ time: ts(3), type: 'info', text: 'Role ontology with semantic expansion loaded' })
    items.push({ time: ts(5), type: 'info', text: 'Hybrid scorer initialized (semantic + career + behavioral)' })
    return items
  }, [health, candidates, rankResponse])

  const stats = [
    { label: 'Indexed Candidates', value: totalIndexed, trend: totalIndexed > 0 ? 'Pool loaded' : 'Awaiting data', trendType: totalIndexed > 0 ? 'success' : 'info', icon: Users, color: '#7C3AED' },
    { label: 'Qualified Profiles', value: qualifiedCount, trend: candidates.length > 0 ? `${((qualifiedCount / candidates.length) * 100).toFixed(0)}% pass rate` : 'Run ranking first', trendType: qualifiedCount > 0 ? 'success' : 'info', icon: Shield, color: '#059669' },
    { label: 'Avg Composite Score', value: avgScore * 100, trend: candidates.length > 0 ? 'From last ranking' : 'No data', trendType: 'info', icon: Activity, color: '#3B82F6', decimals: 0, suffix: '%' },
    { label: 'Top Candidate Score', value: topScore * 100, trend: topCandRole, trendType: topScore > 0 ? 'success' : 'info', icon: Cpu, color: '#F59E0B', decimals: 0, suffix: '%' }
  ]

  return (
    <div style={{ padding: '32px 0', position: 'relative' }} className="dot-grid">
      {/* Blurred atmospheric violet circle */}
      <div style={{ 
        position: 'absolute', 
        top: '-10%', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '600px', 
        height: '400px', 
        background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', 
        pointerEvents: 'none', 
        zIndex: 0 
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 48 }} className="anim-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-light)', border: '1px solid var(--border-default)', padding: '4px 12px', borderRadius: '9999px', fontSize: 11, fontWeight: 500, color: 'var(--accent)', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} className="pulse-dot" />
            SignalHire Active Pipeline
          </div>

          <h1 style={{ fontSize: '48px', fontWeight: 'bold', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
            Signal<span style={{ color: 'var(--accent)' }}>Hire</span> Overview
          </h1>
          
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '580px', lineHeight: 1.6, marginBottom: 24 }}>
            India Runs Track 1 + Track 2: Advanced Candidate Discovery & Matching Dashboard. 
            Analyze <CountUp value={totalIndexed} /> profiles instantly.
          </p>

          {/* Stats Bar Center */}
          <div style={{ display: 'flex', gap: 24, fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '10px 24px', borderRadius: 'var(--radius-md)' }} className="card-shadow">
            <span><strong>{totalIndexed.toLocaleString()}</strong> candidates indexed</span>
            <span style={{ color: 'var(--border-strong)' }}>|</span>
            <span><strong>40+</strong> signals per profile</span>
            <span style={{ color: 'var(--border-strong)' }}>|</span>
            <span><strong>{rankResponse ? `${rankResponse.processing_time_ms.toFixed(0)}ms` : '< 5min'}</strong> execution</span>
          </div>
        </section>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: 40 }} className="stagger">
          {stats.map((item, idx) => {
            const Icon = item.icon
            return (
              <div 
                key={idx} 
                className="btn text-left card-shadow card-shadow-hover"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'stretch', 
                  padding: '20px', 
                  cursor: 'default',
                  position: 'relative',
                  borderBottom: `2px solid ${item.color}`,
                  height: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span className="caps-label" style={{ fontSize: 10 }}>{item.label}</span>
                  <Icon size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 4 }}>
                  <CountUp value={item.value} decimals={item.decimals ?? 0} />{(item as { suffix?: string }).suffix || ''}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: item.trendType === 'success' ? 'var(--success)' : 'var(--accent)' }}>●</span>
                  {item.trend}
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts & Actions Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: 40 }}>
          {/* Re-designed Score Distribution Chart */}
          <div className="btn text-left card-shadow" style={{ padding: '24px', height: 'auto', display: 'flex', flexDirection: 'column', cursor: 'default' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 16 }}>Score Distribution Across Candidate Pool</h3>
            <div style={{ flex: 1, minHeight: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--bg-surface)', 
                      borderColor: 'var(--border-subtle)', 
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: 12
                    }} 
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => {
                      const ratio = entry.count / maxCount
                      const fill = `rgba(124, 58, 237, ${0.4 + 0.6 * ratio})`
                      return <Cell key={`cell-${index}`} fill={fill} />
                    })}
                  </Bar>
                  <Line type="monotone" dataKey="expected" stroke="var(--text-muted)" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: 12 }}>
              <span>Low Score (&lt; 0.3)</span>
              <span>Dashed line: expected normal distribution</span>
              <span>High Match (&gt; 0.7)</span>
            </div>
          </div>

          {/* Quick Actions & Recent activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="btn text-left card-shadow" style={{ padding: '24px', height: 'auto', cursor: 'default' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 16 }}>Discovery Launchpad</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 20 }}>
                Analyze match criteria or view profiles loaded in the FAISS index.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => navigate('/rank')} className="btn btn-primary" style={{ justifyContent: 'space-between' }}>
                  Open Rankings <ArrowRight size={14} />
                </button>
                <button onClick={() => navigate('/config')} className="btn" style={{ justifyContent: 'space-between' }}>
                  Adjust Scoring Weights <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* System Events Timelines */}
            <div className="btn text-left card-shadow" style={{ padding: '24px', height: 'auto', display: 'flex', flexDirection: 'column', flex: 1, cursor: 'default' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 16 }}>System Activity Feed</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                {activityFeed.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 3 }}>
                      {item.time}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {item.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
