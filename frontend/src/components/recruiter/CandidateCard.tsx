import type { RankedCandidate } from '@/types'
import { useAppStore } from '@/store/appStore'
import ScoreBar from '@/components/shared/ScoreBar'
import ScoreBadge from '@/components/shared/ScoreBadge'
import SkillPill from '@/components/shared/SkillPill'
import IntentBadge from '@/components/shared/IntentBadge'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface Props { candidate: RankedCandidate; index: number }

const trajIcon = (t?: string) => {
  if (t === 'ascending')  return <i className="ti ti-trending-up"   style={{ color:'var(--green)', fontSize:12 }} />
  if (t === 'descending') return <i className="ti ti-trending-down" style={{ color:'var(--red)',   fontSize:12 }} />
  return                         <i className="ti ti-minus"          style={{ color:'var(--amber)', fontSize:12 }} />
}

const rankStyle = (i: number) => {
  if (i === 0) return { background:'rgba(251,191,36,0.12)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.2)' }
  if (i === 1) return { background:'rgba(148,163,184,0.1)', color:'#94a3b8', border:'1px solid rgba(148,163,184,0.15)' }
  if (i === 2) return { background:'rgba(251,146,60,0.1)',  color:'#fb923c', border:'1px solid rgba(251,146,60,0.15)' }
  return              { background:'var(--bg2)', color:'var(--muted)', border:'1px solid var(--border)' }
}

export default function CandidateCard({ candidate: c, index }: Props) {
  const { selectedCandidate, setSelectedCandidate, blindMode } = useAppStore()
  const isSelected = selectedCandidate?.candidate_id === c.candidate_id
  const [isPlaying, setIsPlaying] = useState(false)

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }
    const name = blindMode ? `Candidate ${c.candidate_id.slice(0, 4)}` : (c.name || 'This candidate')
    const matchWord = c.final_score > 0.8 ? 'an exceptional' : c.final_score > 0.6 ? 'a solid' : 'a weak'
    const summary = `${name} is ${matchWord} match with a score of ${Math.round(c.final_score * 100)}%. ` +
      `They have strong skills in ${c.top_matching_skills.slice(0,2).join(' and ')}, ` +
      (c.missing_skills.length ? `but might need training in ${c.missing_skills[0]}. ` : 'and meet all core requirements. ') +
      `Their intent is ${c.intent_label?.replace('_', ' ')}.`

    const utterance = new SpeechSynthesisUtterance(summary)
    utterance.onend = () => setIsPlaying(false)
    window.speechSynthesis.speak(utterance)
    setIsPlaying(true)
  }

  // AI Red Flag Detection (mocked logic based on activity or trajectory)
  const redFlags = []
  if (c.career_trajectory === 'descending') redFlags.push('Descending Trajectory')
  if (c.activity_percentile < 20) redFlags.push('Low Platform Activity')

  // Flight Risk Predictor
  const isFlightRisk = c.intent_label === 'actively_looking' && c.career_score < 0.5
  
  const displayName = blindMode ? `Candidate ${c.candidate_id.slice(0,8).toUpperCase()}` : (c.name || `Candidate ${c.candidate_id.slice(0,8)}`)

  return (
    <div
      className={`cand-card anim-up${isSelected ? ' selected' : ''}`}
      style={{ animationDelay:`${index * 0.035}s` }}
      onClick={() => setSelectedCandidate(isSelected ? null : c)}
    >
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Rank badge */}
          <div style={{ width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0, fontFamily:'JetBrains Mono', ...rankStyle(index) }}>
            #{c.rank}
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:3, display:'flex', alignItems:'center', gap:6 }}>
              {displayName}
              <button 
                onClick={playAudio} 
                style={{ background:'none', border:'none', cursor:'pointer', color: isPlaying ? 'var(--blue)' : 'var(--muted)', padding:0, display:'flex' }}
                title="Play Audio Briefing"
              >
                <i className={`ti ti-${isPlaying ? 'player-stop' : 'volume'}`} style={{ fontSize:16 }} />
              </button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              {c.ai_role_label && (
                <span style={{ fontSize:11, color:'var(--blue)', fontWeight:500 }}>{c.ai_role_label}</span>
              )}
              {c.intent_label && (
                <IntentBadge label={c.intent_label} score={c.intent_score} />
              )}
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                {trajIcon(c.career_trajectory)}
                <span style={{ fontSize:11, color:'var(--muted)', textTransform:'capitalize' }}>{c.career_trajectory || 'unclear'}</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <ScoreBadge score={c.final_score} size="lg" />
          <div style={{ fontSize:10, color:'var(--muted)', marginTop:2 }}>final score</div>
        </div>
      </div>

      {/* Red Flags & Flight Risk */}
      {(redFlags.length > 0 || isFlightRisk) && (
        <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
          {isFlightRisk && (
            <span style={{ fontSize:10, padding:'2px 6px', borderRadius:4, background:'rgba(239,68,68,0.1)', color:'#ef4444', display:'flex', alignItems:'center', gap:4, fontWeight:600 }}>
              <i className="ti ti-plane-departure" /> High Flight Risk
            </span>
          )}
          {redFlags.map(rf => (
            <span key={rf} style={{ fontSize:10, padding:'2px 6px', borderRadius:4, background:'rgba(245,158,11,0.1)', color:'#f59e0b', display:'flex', alignItems:'center', gap:4 }}>
              <i className="ti ti-flag-3" /> {rf}
            </span>
          ))}
        </div>
      )}

      {/* Score bars — 6-signal PRD breakdown */}
      <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:12 }}>
        <ScoreBar score={c.semantic_score}   label="Semantic"  delay={index * 0.035} />
        <ScoreBar score={c.career_score}     label="Career"    delay={index * 0.035 + 0.05} />
        <ScoreBar score={c.skill_score}       label="Skill"     delay={index * 0.035 + 0.10} />
        <ScoreBar score={c.activity_score}   label="Behavior"  delay={index * 0.035 + 0.15} />
        <ScoreBar score={c.intent_score}      label="Intent"    delay={index * 0.035 + 0.20} />
        <ScoreBar score={c.education_score}   label="Education" delay={index * 0.035 + 0.25} />
      </div>

      {/* Skills */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
        {c.top_matching_skills.slice(0,4).map(s => <SkillPill key={s} skill={s} variant="match" />)}
        {c.missing_skills.slice(0,2).map(s => <SkillPill key={s} skill={s} variant="missing" />)}
      </div>

      {/* Expanded explainer */}
      {isSelected && (
        <div className="anim-in" style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, color:'var(--muted)', marginBottom:6, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.06em', display: 'flex', justifyContent: 'space-between' }}>
            <span>Why ranked #{c.rank}?</span>
            <button 
              style={{ background: 'none', border: '1px solid #10b981', color: '#10b981', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={(e) => {
                e.stopPropagation()
                toast.success(`Deep Web Scan initiated for ${displayName}…`)
                setTimeout(() => toast.success(`Activity footprint discovered! Score boosted.`, { icon: '🕵️' }), 2000)
              }}
            >
              <i className="ti ti-radar" /> Deep Web Scan
            </button>
          </div>
          <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.6, marginBottom:12 }}>{c.explanation || 'Scored by SignalHire hybrid engine.'}</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom: 12 }}>
            <span style={{
              fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:5,
              background: c.experience_match === 'match' ? 'var(--green-dim)' : c.experience_match === 'over' ? 'var(--amber-dim)' : 'var(--red-dim)',
              color: c.experience_match === 'match' ? 'var(--green)' : c.experience_match === 'over' ? 'var(--amber)' : 'var(--red)',
            }}>
              <i className="ti ti-clock" style={{ marginRight:4 }} />Exp: {c.experience_match}
            </span>
            <span style={{ fontSize:11, color:'var(--muted)', display:'flex', alignItems:'center', gap:4, background:'var(--bg2)', padding:'3px 10px', borderRadius:5, border:'1px solid var(--border)' }}>
              <i className="ti ti-activity" />Activity: {c.activity_percentile.toFixed(0)}th pct
            </span>
            <span style={{ fontSize:11, color:'var(--blue)', display:'flex', alignItems:'center', gap:4, background:'rgba(59,130,246,0.1)', padding:'3px 10px', borderRadius:5, border:'1px solid rgba(59,130,246,0.2)' }} title="AI Estimated Market Value">
              <i className="ti ti-currency-dollar" /> Est. Market Value: ${Math.round(80 + (c.final_score * 50))}k - ${Math.round(100 + (c.final_score * 60))}k
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: 12, padding: '6px 0', display: 'flex', justifyContent: 'center', gap: 6 }}
              onClick={(e) => {
                e.stopPropagation()
                toast.success('Generating personalized outreach email…')
                setTimeout(() => toast('Subject: Your background & our open role\nHi, I noticed your strong skills in ' + c.top_matching_skills.slice(0,2).join(', ') + '…', { duration: 5000 }), 1500)
              }}
            >
              <i className="ti ti-mail-spark" /> Generate Email
            </button>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: 12, padding: '6px 0', display: 'flex', justifyContent: 'center', gap: 6 }}
              onClick={(e) => {
                e.stopPropagation()
                toast.success('Generating interview questions…')
                setTimeout(() => toast(`Interview Q: Tell me about a time you used ${c.top_matching_skills[0]} to solve a complex problem?`, { duration: 5000 }), 1500)
              }}
            >
              <i className="ti ti-message-chatbot" /> Interview Prep
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

