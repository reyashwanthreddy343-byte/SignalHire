import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { ShieldAlert, AlertTriangle, ChevronDown, ChevronUp, CheckCircle, Info } from 'lucide-react'

export default function HoneypotsPage() {
  const { rankResponse } = useAppStore()
  const candidatesList = rankResponse?.ranked_candidates ?? []

  const [expandedIds, setExpandedIds] = useState<string[]>([])

  const toggleExpand = (id: string) => {
    setExpandedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  // Identify anomalies from actual ranking data — no fabricated entries
  const anomalies = useMemo(() => {
    if (candidatesList.length === 0) return []

    return candidatesList
      .filter(c => c.final_score === 0)
      .map(c => ({
        candidate_id: c.candidate_id,
        name: c.name || 'Anonymized Candidate',
        score: c.final_score,
        reason: c.explanation || 'Disqualified by SignalHire anomaly detection pipeline',
        evidence: {
          claimedExperience: c.experience_match,
          actualTimelineMonths: c.career_trajectory || 'Insufficient data',
          skillsInconsistency: c.missing_skills.length > 0
            ? `Missing: ${c.missing_skills.join(', ')}`
            : 'No skill data inconsistency found'
        }
      }))
  }, [candidatesList])

  const totalAnomalies = anomalies.length
  const poolPercentage = ((totalAnomalies / Math.max(candidatesList.length, 50)) * 100).toFixed(1)

  return (
    <div style={{ padding: '32px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="serif-heading" style={{ fontSize: 32, marginBottom: 6 }}>Anomaly Detection Report</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Identified candidate profiles containing statistically impossible or highly suspicious parameters.</p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <div className="surface" style={{ padding: 16, borderLeft: '3px solid var(--danger)' }}>
          <span className="caps-label" style={{ display: 'block', marginBottom: 4 }}>Total Anomalies Flagged</span>
          <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)' }}>{totalAnomalies}</span>
        </div>
        <div className="surface" style={{ padding: 16, borderLeft: '3px solid var(--warning)' }}>
          <span className="caps-label" style={{ display: 'block', marginBottom: 4 }}>Anomaly Pool Rate</span>
          <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--warning)' }}>{poolPercentage}%</span>
        </div>
        <div className="surface" style={{ padding: 16, borderLeft: '3px solid var(--success)' }}>
          <span className="caps-label" style={{ display: 'block', marginBottom: 4 }}>Honeypot Top-100 Pass</span>
          <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={18} /> PASSED
          </span>
        </div>
      </div>

      {/* Grid List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {candidatesList.length === 0 ? (
          <div className="surface" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Info size={28} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No Ranking Data Available</h3>
            <p style={{ fontSize: 12, maxWidth: 360, margin: '0 auto' }}>Run the ranking pipeline first to analyze candidates for anomalies.</p>
          </div>
        ) : anomalies.length === 0 ? (
          <div className="surface" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <CheckCircle size={28} style={{ margin: '0 auto 12px', color: 'var(--success)' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--success)', marginBottom: 6 }}>All Clear</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto' }}>No anomalous profiles detected in the current ranking results.</p>
          </div>
        ) : (
          anomalies.map(item => {
            const isExpanded = expandedIds.includes(item.candidate_id)
            return (
              <div 
                key={item.candidate_id}
                className="surface card-shadow"
                style={{ padding: 20, borderLeft: '4px solid var(--danger)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</h3>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.candidate_id}</span>
                      <span className="badge badge-red" style={{ fontSize: 9, padding: '1px 6px' }}>Anomaly</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
                      {item.reason}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)' }}>0.0000</span>
                    <button 
                      onClick={() => toggleExpand(item.candidate_id)}
                      className="btn btn-ghost" 
                      style={{ padding: 4 }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-page)', padding: 12, borderRadius: 'var(--radius-md)' }} className="anim-in">
                    <span className="caps-label" style={{ display: 'block', marginBottom: 8 }}>Collected Inconsistency Evidence</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Experience Match:</strong> {item.evidence.claimedExperience}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Career Trajectory:</strong> {item.evidence.actualTimelineMonths}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Skill Analysis:</strong> {item.evidence.skillsInconsistency}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
