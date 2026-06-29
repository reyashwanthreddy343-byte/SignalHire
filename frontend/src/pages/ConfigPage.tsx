import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAppStore } from '@/store/appStore'
import { rankCandidates } from '@/utils/api'
import { motion } from 'framer-motion'
import { Sliders, RefreshCw, AlertTriangle, ArrowUp, ArrowDown, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import type { RankedCandidate } from '@/types'

const SIGNAL_KEYS = ['semantic', 'career', 'skill', 'activity', 'intent', 'education'] as const

export default function ConfigPage() {
  const { jdText, weights, setWeights, rankResponse, setRankResponse, isRanking, setIsRanking, buildRankRequest } = useAppStore()

  const [localWeights, setLocalWeights] = useState(() =>
    Object.fromEntries(SIGNAL_KEYS.map(k => [k, Math.round(weights[k] * 100)])) as Record<(typeof SIGNAL_KEYS)[number], number>
  )

  const [oldRanks, setOldRanks] = useState<Record<string, number>>({})
  const [rankDiffs, setRankDiffs] = useState<Array<{
    candidate_id: string
    name?: string
    oldRank: number
    newRank: number
    scoreDiff: number
    newScore: number
  }>>([])

  const totalWeights = SIGNAL_KEYS.reduce((sum, k) => sum + localWeights[k], 0)

  const mutation = useMutation({
    mutationFn: rankCandidates,
    onMutate: () => setIsRanking(true),
    onSuccess: d => {
      // Calculate rank diffs
      const diffs = d.ranked_candidates.slice(0, 10).map(cand => {
        const oldRank = oldRanks[cand.candidate_id] || cand.rank // Default to new rank if not found
        const diff = oldRank - cand.rank
        const oldScoreVal = rankResponse?.ranked_candidates.find(x => x.candidate_id === cand.candidate_id)?.final_score || cand.final_score
        const scoreDiff = cand.final_score - oldScoreVal

        return {
          candidate_id: cand.candidate_id,
          name: cand.name,
          oldRank,
          newRank: cand.rank,
          scoreDiff,
          newScore: cand.final_score
        }
      })

      setRankDiffs(diffs)
      setRankResponse(d)
      toast.success('Weights updated and candidates re-ranked')
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || 'Re-ranking failed'),
    onSettled: () => setIsRanking(false)
  })

  const applyAndReRank = () => {
    if (!jdText.trim()) {
      toast.error('Paste a job description first')
      return
    }

    // Capture current ranks to compute comparison diffs
    const ranks: Record<string, number> = {}
    if (rankResponse) {
      rankResponse.ranked_candidates.forEach(c => {
        ranks[c.candidate_id] = c.rank
      })
    }
    setOldRanks(ranks)

    const sum = totalWeights || 100
    const normalized = {
      semantic: localWeights.semantic / sum,
      career: localWeights.career / sum,
      skill: localWeights.skill / sum,
      activity: localWeights.activity / sum,
      intent: localWeights.intent / sum,
      education: localWeights.education / sum,
    }

    setWeights(normalized)
    mutation.mutate({
      ...buildRankRequest(),
      weight_semantic: normalized.semantic,
      weight_career: normalized.career,
      weight_skill: normalized.skill,
      weight_activity: normalized.activity,
      weight_intent: normalized.intent,
      weight_education: normalized.education,
    })
  }

  const selectPreset = (preset: 'default' | 'semantic' | 'behavioral' | 'balanced') => {
    if (preset === 'default') {
      setLocalWeights({ semantic: 40, career: 20, skill: 20, activity: 10, intent: 5, education: 5 })
    } else if (preset === 'semantic') {
      setLocalWeights({ semantic: 60, career: 15, skill: 15, activity: 5, intent: 3, education: 2 })
    } else if (preset === 'behavioral') {
      setLocalWeights({ semantic: 25, career: 15, skill: 15, activity: 30, intent: 10, education: 5 })
    } else {
      setLocalWeights({ semantic: 35, career: 20, skill: 20, activity: 10, intent: 8, education: 7 })
    }
  }

  return (
    <div style={{ padding: '32px 0' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="serif-heading" style={{ fontSize: 32, marginBottom: 6 }}>Scoring Weights Tuning</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Dynamically configure the ranking engine coefficients and view shifting matches instantly.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '32px' }}>
        
        {/* Left: Config panel */}
        <div className="surface" style={{ padding: 24, alignSelf: 'start' }}>
          <h2 className="serif-heading" style={{ fontSize: 20, marginBottom: 16 }}>Configuration Sliders</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
            {/* Semantic Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Semantic Similarity</span>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{localWeights.semantic}%</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={100} 
                value={localWeights.semantic}
                onChange={e => setLocalWeights(p => ({ ...p, semantic: Number(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Career Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Career Trajectory</span>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{localWeights.career}%</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={100} 
                value={localWeights.career}
                onChange={e => setLocalWeights(p => ({ ...p, career: Number(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Skill Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Skill Depth</span>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{localWeights.skill}%</span>
              </div>
              <input type="range" min={0} max={100} value={localWeights.skill}
                onChange={e => setLocalWeights(p => ({ ...p, skill: Number(e.target.value) }))} style={{ width: '100%' }} />
            </div>

            {/* Behavioral Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Behavioral Signals</span>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{localWeights.activity}%</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={100} 
                value={localWeights.activity}
                onChange={e => setLocalWeights(p => ({ ...p, activity: Number(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Intent Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Intent Score</span>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{localWeights.intent}%</span>
              </div>
              <input type="range" min={0} max={100} value={localWeights.intent}
                onChange={e => setLocalWeights(p => ({ ...p, intent: Number(e.target.value) }))} style={{ width: '100%' }} />
            </div>

            {/* Education Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Education Signal</span>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{localWeights.education}%</span>
              </div>
              <input type="range" min={0} max={100} value={localWeights.education}
                onChange={e => setLocalWeights(p => ({ ...p, education: Number(e.target.value) }))} style={{ width: '100%' }} />
            </div>
          </div>

          {/* Preset buttons */}
          <div style={{ marginBottom: 24 }}>
            <span className="caps-label" style={{ display: 'block', marginBottom: 8 }}>Presets</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button onClick={() => selectPreset('default')} className="btn" style={{ padding: '6px 12px', fontSize: 11 }}>Default</button>
              <button onClick={() => selectPreset('semantic')} className="btn" style={{ padding: '6px 12px', fontSize: 11 }}>Semantic-Heavy</button>
              <button onClick={() => selectPreset('behavioral')} className="btn" style={{ padding: '6px 12px', fontSize: 11 }}>Behavioral-First</button>
              <button onClick={() => selectPreset('balanced')} className="btn" style={{ padding: '6px 12px', fontSize: 11 }}>Balanced</button>
            </div>
          </div>

          {/* Error warning if weights do not sum to 100 */}
          {totalWeights !== 100 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.15)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 12, marginBottom: 20 }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              <span>Weights sum to {totalWeights}%. We will auto-normalize them to 100% on re-ranking.</span>
            </div>
          )}

          {/* Action apply */}
          <button 
            onClick={applyAndReRank}
            disabled={isRanking || !jdText.trim()}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: 42, gap: 8 }}
          >
            {isRanking ? (
              <>
                <RefreshCw size={14} className="spin" /> Re-ranking...
              </>
            ) : (
              <>
                Apply & Re-rank
              </>
            )}
          </button>
        </div>

        {/* Right: Live Impact Preview */}
        <div className="surface" style={{ padding: 24 }}>
          <h2 className="serif-heading" style={{ fontSize: 20, marginBottom: 16 }}>Impact Preview (Top 10 Changes)</h2>
          
          {rankDiffs.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Sparkles size={24} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: 12 }}>Configure weights and click Apply to see rank updates here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rankDiffs.map((diff, i) => {
                const shift = diff.oldRank - diff.newRank
                return (
                  <div 
                    key={diff.candidate_id}
                    className="surface-2"
                    style={{ 
                      padding: 12, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      borderLeft: shift > 0 ? '3px solid var(--success)' : shift < 0 ? '3px solid var(--danger)' : '3px solid var(--border)'
                    }}
                  >
                    <div>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>#{diff.newRank}</span>
                      <h4 style={{ fontSize: 13, fontWeight: 600, display: 'inline-block', marginLeft: 8 }}>{diff.name || diff.candidate_id}</h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {/* Rank diff badge */}
                      <span className="mono" style={{ 
                        fontSize: 11, 
                        fontWeight: 600, 
                        color: shift > 0 ? 'var(--success)' : shift < 0 ? 'var(--danger)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        {shift > 0 ? (
                          <><ArrowUp size={12} />+{shift}</>
                        ) : shift < 0 ? (
                          <><ArrowDown size={12} />{shift}</>
                        ) : (
                          '='
                        )}
                      </span>

                      {/* Score diff */}
                      <span className="mono" style={{ 
                        fontSize: 11, 
                        fontWeight: 600, 
                        color: diff.scoreDiff > 0 ? 'var(--success)' : diff.scoreDiff < 0 ? 'var(--danger)' : 'var(--text-muted)' 
                      }}>
                        {diff.scoreDiff > 0 ? `+${(diff.scoreDiff * 100).toFixed(1)}%` : diff.scoreDiff < 0 ? `${(diff.scoreDiff * 100).toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
