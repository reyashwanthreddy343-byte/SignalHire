import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import ScoreRing from '@/components/shared/ScoreRing'
import ScoreBar from '@/components/shared/ScoreBar'
import SkillPill from '@/components/shared/SkillPill'
import { Trash2, AlertCircle, Sparkles, UserPlus } from 'lucide-react'
import type { RankedCandidate } from '@/types'

export default function ComparePage() {
  const { rankResponse } = useAppStore()
  const candidatesList = rankResponse?.ranked_candidates ?? []

  const [compareIds, setCompareIds] = useState<string[]>([])

  const selectedCandidates = useMemo(() => {
    return compareIds
      .map(id => candidatesList.find(c => c.candidate_id === id))
      .filter((c): c is RankedCandidate => !!c)
  }, [compareIds, candidatesList])

  const addCandidate = (id: string) => {
    if (compareIds.includes(id)) return
    if (compareIds.length >= 3) {
      setCompareIds(p => [...p.slice(1), id])
    } else {
      setCompareIds(p => [...p, id])
    }
  }

  const removeCandidate = (id: string) => {
    setCompareIds(p => p.filter(x => x !== id))
  }

  // Find the highest score per dimension in the selected candidates to highlight winners
  const winners = useMemo(() => {
    if (selectedCandidates.length < 2) return {}
    
    const maxVals = {
      final: Math.max(...selectedCandidates.map(c => c.final_score)),
      semantic: Math.max(...selectedCandidates.map(c => c.semantic_score)),
      career: Math.max(...selectedCandidates.map(c => c.career_score)),
      skill: Math.max(...selectedCandidates.map(c => c.skill_score ?? 0)),
      behavioral: Math.max(...selectedCandidates.map(c => c.activity_score)),
      intent: Math.max(...selectedCandidates.map(c => c.intent_score ?? 0)),
      education: Math.max(...selectedCandidates.map(c => c.education_score ?? 0)),
    }

    return {
      final: selectedCandidates.map(c => c.final_score === maxVals.final),
      semantic: selectedCandidates.map(c => c.semantic_score === maxVals.semantic),
      career: selectedCandidates.map(c => c.career_score === maxVals.career),
      skill: selectedCandidates.map(c => (c.skill_score ?? 0) === maxVals.skill),
      behavioral: selectedCandidates.map(c => c.activity_score === maxVals.behavioral),
      intent: selectedCandidates.map(c => (c.intent_score ?? 0) === maxVals.intent),
      education: selectedCandidates.map(c => (c.education_score ?? 0) === maxVals.education),
    }
  }, [selectedCandidates])

  // Simple auto comparison text generator
  const comparisonVerdict = useMemo(() => {
    if (selectedCandidates.length < 2) return null
    const c1 = selectedCandidates[0]
    const c2 = selectedCandidates[1]
    
    let lead = c1.final_score > c2.final_score ? c1 : c2
    let trailing = c1.final_score > c2.final_score ? c2 : c1
    let gap = Math.abs(c1.final_score - c2.final_score) * 100

    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--accent-light)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', marginTop: 32 }}>
        <Sparkles size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          <strong>SignalHire Verdict:</strong> {lead.name || lead.ai_role_label || 'Top Candidate'} leads by a margin of <strong>{gap.toFixed(0)}%</strong> overall, showing stronger {lead.semantic_score > trailing.semantic_score ? 'semantic alignment' : 'career progression'}. However, {trailing.name || trailing.ai_role_label} maintains a competitive {trailing.activity_score > lead.activity_score ? 'behavioral score' : 'skills profile'}.
        </p>
      </div>
    )
  }, [selectedCandidates])

  return (
    <div style={{ padding: '32px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 className="serif-heading" style={{ fontSize: 32, marginBottom: 6 }}>Side-by-Side Comparison</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Compare up to 3 candidate profiles side-by-side to inspect matching parameters.</p>
        </div>

        {/* Dropdown pick selector */}
        {candidatesList.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={15} style={{ color: 'var(--text-muted)' }} />
            <select 
              onChange={e => {
                if (e.target.value) {
                  addCandidate(e.target.value)
                  e.target.value = ''
                }
              }}
              style={{ width: 220, fontSize: 12 }}
              defaultValue=""
            >
              <option value="" disabled>Add Candidate...</option>
              {candidatesList.map(c => (
                <option key={c.candidate_id} value={c.candidate_id} disabled={compareIds.includes(c.candidate_id)}>
                  Rank #{c.rank} - {c.name || c.candidate_id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {compareIds.length === 0 ? (
        <div className="surface" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <AlertCircle size={28} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3 className="serif-heading" style={{ fontSize: 20, color: 'var(--text-secondary)', marginBottom: 6 }}>No profiles selected</h3>
          <p style={{ fontSize: 12, maxWidth: 360, margin: '0 auto' }}>
            Choose candidates from the dropdown selector on the top right to start comparing.
          </p>
        </div>
      ) : (
        <div>
          {/* Main comparison grid */}
          <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(${selectedCandidates.length}, 1fr)`, gap: 16 }}>
            {/* Header row */}
            <div style={{ alignSelf: 'end', paddingBottom: 16 }}>
              <span className="caps-label">Parameters</span>
            </div>
            {selectedCandidates.map((c, idx) => (
              <div 
                key={c.candidate_id} 
                className="surface card-shadow"
                style={{ 
                  padding: 16, 
                  position: 'relative',
                  border: winners.final && winners.final[idx] ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <button 
                  onClick={() => removeCandidate(c.candidate_id)}
                  style={{ position: 'absolute', top: 12, right: 12, color: 'var(--text-muted)' }}
                  className="btn btn-ghost p-1"
                >
                  <Trash2 size={13} />
                </button>
                <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>Rank #{c.rank}</span>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 4, marginBottom: 2 }}>{c.name || 'Candidate'}</h3>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.candidate_id}</span>
              </div>
            ))}

            {/* Composite Score Row */}
            <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>Fit Score</span>
            </div>
            {selectedCandidates.map((c, idx) => (
              <div 
                key={idx} 
                className="surface" 
                style={{ 
                  padding: 16, 
                  display: 'flex', 
                  justifyContent: 'center',
                  background: winners.final && winners.final[idx] ? 'var(--bg-selected)' : 'var(--bg-surface)' 
                }}
              >
                <ScoreRing score={c.final_score} size={80} />
              </div>
            ))}

            {/* Semantic Score Row */}
            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Semantic Fit</span>
            </div>
            {selectedCandidates.map((c, idx) => (
              <div 
                key={idx} 
                className="surface" 
                style={{ 
                  padding: 16,
                  background: winners.semantic && winners.semantic[idx] ? 'var(--bg-selected)' : 'var(--bg-surface)' 
                }}
              >
                <ScoreBar score={c.semantic_score} />
              </div>
            ))}

            {/* Career Score Row */}
            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Career Trajectory</span>
            </div>
            {selectedCandidates.map((c, idx) => (
              <div 
                key={idx} 
                className="surface" 
                style={{ 
                  padding: 16,
                  background: winners.career && winners.career[idx] ? 'var(--bg-selected)' : 'var(--bg-surface)' 
                }}
              >
                <ScoreBar score={c.career_score} />
              </div>
            ))}

            {/* Skill Depth Row */}
            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Skill Depth</span>
            </div>
            {selectedCandidates.map((c, idx) => (
              <div key={idx} className="surface" style={{ padding: 16, background: winners.skill && winners.skill[idx] ? 'var(--bg-selected)' : 'var(--bg-surface)' }}>
                <ScoreBar score={c.skill_score ?? 0} />
              </div>
            ))}

            {/* Behavioral Score Row */}
            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Behavioral Signals</span>
            </div>
            {selectedCandidates.map((c, idx) => (
              <div 
                key={idx} 
                className="surface" 
                style={{ 
                  padding: 16,
                  background: winners.behavioral && winners.behavioral[idx] ? 'var(--bg-selected)' : 'var(--bg-surface)' 
                }}
              >
                <ScoreBar score={c.activity_score} />
              </div>
            ))}

            {/* Intent Score Row */}
            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Intent Score</span>
            </div>
            {selectedCandidates.map((c, idx) => (
              <div key={idx} className="surface" style={{ padding: 16, background: winners.intent && winners.intent[idx] ? 'var(--bg-selected)' : 'var(--bg-surface)' }}>
                <ScoreBar score={c.intent_score ?? 0} />
              </div>
            ))}

            {/* Education Score Row */}
            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Education Signal</span>
            </div>
            {selectedCandidates.map((c, idx) => (
              <div key={idx} className="surface" style={{ padding: 16, background: winners.education && winners.education[idx] ? 'var(--bg-selected)' : 'var(--bg-surface)' }}>
                <ScoreBar score={c.education_score ?? 0} />
              </div>
            ))}

            {/* Experience Match Row */}
            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Experience Fit</span>
            </div>
            {selectedCandidates.map((c, idx) => (
              <div 
                key={idx} 
                className="surface" 
                style={{ 
                  padding: 16,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              >
                {c.experience_match}
              </div>
            ))}

            {/* Skills Row */}
            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Key Skills Match</span>
            </div>
            {selectedCandidates.map((c, idx) => (
              <div key={idx} className="surface" style={{ padding: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {c.top_matching_skills.slice(0, 3).map(s => (
                    <SkillPill key={s} skill={s} variant="match" />
                  ))}
                  {c.missing_skills.slice(0, 2).map(s => (
                    <SkillPill key={s} skill={s} variant="missing" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* AI Comparison Verdict */}
          {comparisonVerdict}
        </div>
      )}
    </div>
  )
}
