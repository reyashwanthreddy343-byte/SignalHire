import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/appStore'
import { rankCandidates } from '@/utils/api'
import UploadZone from '@/components/recruiter/UploadZone'
import RoleFilter from '@/components/recruiter/RoleFilter'
import WeightSliders from '@/components/recruiter/WeightSliders'
import ScoreRing from '@/components/shared/ScoreRing'
import ScoreBar from '@/components/shared/ScoreBar'
import SkillPill from '@/components/shared/SkillPill'
import toast from 'react-hot-toast'
import IntentBadge from '@/components/shared/IntentBadge'
import InterviewSimulator from '@/components/recruiter/InterviewSimulator'
import CultureFitRadar from '@/components/recruiter/CultureFitRadar'
import CandidateGalaxy from '@/components/recruiter/CandidateGalaxy'
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, ResponsiveContainer 
} from 'recharts'
import { 
  Search, Sliders, ChevronRight, X, Play, Clock, 
  Briefcase, MapPin, AlertCircle, ShieldAlert, Award, FileSpreadsheet
} from 'lucide-react'
import ExportPanel from '@/components/recruiter/ExportPanel'

export default function RankingsPage() {
  const { 
    jdText, setJdText, weights, topN, setTopN, minExp, setMinExp, 
    roleFilters, rankResponse, setRankResponse, isRanking, setIsRanking,
    selectedCandidate, setSelectedCandidate, buildRankRequest
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'qualified' | 'flagged'>('all')
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [showInterview, setShowInterview] = useState(false)
  const [resultView, setResultView] = useState<'list' | 'galaxy'>('list')

  const mutation = useMutation({
    mutationFn: rankCandidates,
    onMutate: () => setIsRanking(true),
    onSuccess: d => { 
      setRankResponse(d)
      if (d.ranked_candidates.length > 0) {
        setSelectedCandidate(d.ranked_candidates[0])
      }
      toast.success(`Ranked ${d.returned} candidates successfully`)
      setIsSetupOpen(false)
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || 'Ranking pipeline failed'),
    onSettled: () => setIsRanking(false),
  })

  const runPipeline = () => {
    if (!jdText.trim()) { 
      toast.error('Paste a job description first')
      return 
    }
    mutation.mutate(buildRankRequest())
  }

  const candidates = rankResponse?.ranked_candidates ?? []

  // Filter & Search Candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = searchQuery.trim() === '' || 
      c.candidate_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.ai_role_label && c.ai_role_label.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (filterType === 'qualified') {
      return c.final_score > 0 && c.final_score >= 0.3
    }
    if (filterType === 'flagged') {
      return c.final_score === 0 || c.final_score < 0.3
    }
    return true
  })

  const radarData = selectedCandidate ? [
    { axis: 'Semantic', value: Math.round(selectedCandidate.semantic_score * 100) },
    { axis: 'Career', value: Math.round(selectedCandidate.career_score * 100) },
    { axis: 'Skill', value: Math.round((selectedCandidate.skill_score ?? 0) * 100) },
    { axis: 'Behavior', value: Math.round(selectedCandidate.activity_score * 100) },
    { axis: 'Intent', value: Math.round((selectedCandidate.intent_score ?? 0) * 100) },
    { axis: 'Education', value: Math.round((selectedCandidate.education_score ?? 0) * 100) },
  ] : []

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)', overflow: 'hidden', position: 'relative' }}>
      {isRanking && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'rgba(250,250,249,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <i className="ti ti-loader spin" style={{ fontSize: 32, color: 'var(--accent)' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Ranking candidates…</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Scoring against 100k+ profiles — usually 5–10 seconds</p>
        </div>
      )}
      
      {/* ── LEFT PANEL: Ranked List ── */}
      <div style={{ width: 380, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        
        {/* Panel Header */}
        <div style={{ padding: '20px 18px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="serif-heading" style={{ fontSize: 20 }}>Ranked Candidates</span>
              <span className="mono" style={{ fontSize: 10, background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 6px', borderRadius: 4 }}>
                {candidates.length}
              </span>
            </div>
            <button 
              onClick={() => setIsSetupOpen(true)}
              className="btn btn-ghost" 
              style={{ padding: 6, borderRadius: 'var(--radius-sm)' }}
              title="Edit matching settings"
            >
              <Sliders size={15} />
            </button>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search ID, title, or skills..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 30, background: 'var(--bg-page)', fontSize: 12 }} 
            />
          </div>

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'qualified', 'flagged'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setFilterType(f)}
                className={`filter-chip ${filterType === f ? 'active' : ''}`}
                style={{ 
                  textTransform: 'capitalize',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                {f === 'flagged' && <ShieldAlert size={12} />}
                {f === 'all' ? `All (${candidates.length})` : f === 'qualified' ? `Qualified (${candidates.filter(c => c.final_score >= 0.3).length})` : `Flagged (${candidates.filter(c => c.final_score < 0.3).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div style={{ flex: 1, overflowY: 'auto' }} className="stagger">
          {filteredCandidates.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              <AlertCircle size={24} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: 13, fontWeight: 500 }}>No candidates found</p>
              <p style={{ fontSize: 11 }}>Setup Job Description or adjust query filters</p>
            </div>
          ) : (
            filteredCandidates.map((c, idx) => {
              const isSelected = selectedCandidate?.candidate_id === c.candidate_id
              const rankColor = c.rank <= 5 ? 'var(--accent)' : c.rank <= 20 ? 'var(--success)' : c.rank <= 50 ? 'var(--warning)' : 'var(--danger)'

              return (
                <div 
                  key={c.candidate_id}
                  onClick={() => setSelectedCandidate(c)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-selected)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  className="card-shadow-hover"
                >
                  {/* Rank circle left */}
                  <span className="mono" style={{ fontSize: 28, fontWeight: 300, color: rankColor, width: 44, display: 'inline-block' }}>
                    {String(c.rank).padStart(2, '0')}
                  </span>

                  <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.name || c.ai_role_label || 'Candidate'}
                      </span>
                      {c.final_score === 0 && (
                        <span className="badge badge-amber" style={{ fontSize: 9, padding: '1px 4px' }}>DQ</span>
                      )}
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.candidate_id}</span>
                  </div>

                  {/* Micro score track */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{(c.final_score * 100).toFixed(0)}%</span>
                    <div style={{ width: 60, height: 2, background: 'var(--border-subtle)', borderRadius: 1 }}>
                      <div style={{ width: `${c.final_score * 100}%`, height: '100%', background: rankColor, borderRadius: 1 }} />
                    </div>
                  </div>
                  <ChevronRight size={15} style={{ color: 'var(--text-dim)', marginLeft: 8 }} />
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── CENTER PANEL: Candidate details dossier ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-page)', overflowY: 'auto' }}>
        {selectedCandidate ? (
          <div style={{ padding: '32px' }} className="anim-in">
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 24, marginBottom: 24 }}>
              <div>
                <h1 className="serif-heading" style={{ fontSize: 36, lineHeight: 1.1, marginBottom: 8 }}>
                  {selectedCandidate.name || 'Anonymized Profile'}
                </h1>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedCandidate.candidate_id}</span>
                  <span style={{ color: 'var(--border-strong)' }}>|</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Rank #{selectedCandidate.rank} of {candidates.length}</span>
                  {selectedCandidate.final_score === 0 && (
                    <span className="badge badge-amber">Disqualified Profile</span>
                  )}
                </div>
              </div>
              
              {/* Profile Badge Status */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {selectedCandidate.intent_label && (
                  <IntentBadge label={selectedCandidate.intent_label} score={selectedCandidate.intent_score} />
                )}
                <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)' }} />
                  Open to work
                </span>
              </div>
            </div>

            {/* Quick stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              <div className="surface card-shadow" style={{ padding: 16 }}>
                <span className="caps-label" style={{ display: 'block', marginBottom: 4 }}>Primary Role Match</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedCandidate.ai_role_label || 'Specialist'}</span>
              </div>
              <div className="surface card-shadow" style={{ padding: 16 }}>
                <span className="caps-label" style={{ display: 'block', marginBottom: 4 }}>Years of Experience</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedCandidate.experience_match}</span>
              </div>
              <div className="surface card-shadow" style={{ padding: 16 }}>
                <span className="caps-label" style={{ display: 'block', marginBottom: 4 }}>Activity Level</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedCandidate.activity_percentile.toFixed(0)}th percentile</span>
              </div>
            </div>

            {/* Skills Matched / Missing */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Skill Analysis Matrix</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedCandidate.top_matching_skills.map(s => (
                  <SkillPill key={s} skill={s} variant="match" />
                ))}
                {selectedCandidate.missing_skills.map(s => (
                  <SkillPill key={s} skill={s} variant="missing" />
                ))}
              </div>
            </div>

            {/* AI Assessment quote box */}
            <div style={{ 
              borderLeft: '3px solid var(--accent)', 
              padding: '16px 20px', 
              background: 'var(--bg-surface)', 
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              marginBottom: 32
            }} className="card-shadow">
              <span className="caps-label" style={{ display: 'block', marginBottom: 8 }}>AI Evaluation Summary</span>
              <p className="serif-heading" style={{ fontSize: 15, fontStyle: 'italic', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                "{selectedCandidate.explanation || 'Score computed across semantic embeddings and behavioral signals'}"
              </p>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, display: 'block' }}>
                Based on unified 384-dimensional vector comparison
              </span>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              <button 
                onClick={() => toast.success(`Invitation sent to ${selectedCandidate.name || 'Candidate'}`)}
                className="btn btn-primary"
              >
                Schedule Interview
              </button>
              <button 
                onClick={() => setShowInterview(true)}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <i className="ti ti-robot" style={{ fontSize: 14 }} /> AI Interview
              </button>
              <button 
                onClick={() => toast.success('Profile saved to pipeline shortlist')}
                className="btn"
              >
                Shortlist Profile
              </button>
            </div>

            {/* Culture Fit Radar */}
            <CultureFitRadar candidateId={selectedCandidate.candidate_id} candidateName={selectedCandidate.name || 'Candidate'} />
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <Award size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Dossier Closed</h2>
            <p style={{ fontSize: 12 }}>Select a candidate from the left list to inspect their profile.</p>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: Score inspector breakdown ── */}
      <div style={{ width: 340, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', overflowY: 'auto' }}>
        {selectedCandidate ? (
          <div style={{ padding: '24px' }}>
            <span className="caps-label" style={{ display: 'block', marginBottom: 20 }}>Score Breakdown</span>
            
            {/* Big Circular Progress */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <ScoreRing score={selectedCandidate.final_score} size={130} strokeWidth={8} />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Composite Score</span>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Weighted multi-signal total</p>
              </div>
            </div>

            {/* 5 signal rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              <ScoreBar score={selectedCandidate.semantic_score} label="Semantic" />
              <ScoreBar score={selectedCandidate.career_score} label="Career" />
              <ScoreBar score={selectedCandidate.activity_score} label="Behavioral" />
              <ScoreBar 
                score={selectedCandidate.top_matching_skills.length / Math.max(selectedCandidate.top_matching_skills.length + selectedCandidate.missing_skills.length, 1)} 
                label="Skills Fit" 
              />
              <ScoreBar 
                score={selectedCandidate.experience_match === 'match' ? 1.0 : selectedCandidate.experience_match === 'over' ? 0.7 : 0.4} 
                label="Availability" 
              />
            </div>

            {/* Radar component */}
            <div style={{ marginBottom: 20 }}>
              <span className="caps-label" style={{ display: 'block', marginBottom: 12 }}>Multi-Signal Radar</span>
              <div style={{ width: '100%', height: 190, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="var(--border-subtle)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                      name="Signals" 
                      dataKey="value" 
                      stroke="var(--accent)" 
                      fill="var(--accent)" 
                      fillOpacity={0.12} 
                      strokeWidth={1.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Galaxy View Toggle */}
            {candidates.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  <button onClick={() => setResultView('list')} style={{ padding: '5px 14px', borderRadius: 6, fontSize: 11, border: '1px solid var(--border-subtle)', background: resultView === 'list' ? 'var(--accent)' : 'transparent', color: resultView === 'list' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>Radar</button>
                  <button onClick={() => setResultView('galaxy')} style={{ padding: '5px 14px', borderRadius: 6, fontSize: 11, border: '1px solid var(--border-subtle)', background: resultView === 'galaxy' ? 'var(--accent)' : 'transparent', color: resultView === 'galaxy' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}><i className="ti ti-planet" style={{ marginRight: 4 }} />Galaxy</button>
                </div>
                {resultView === 'galaxy' && <CandidateGalaxy />}
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            No candidate selected
          </div>
        )}
      </div>

      {/* ── OVERLAY DRAWER: Edit job requirements ── */}
      <AnimatePresence>
        {isSetupOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSetupOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#000',
                zIndex: 100
              }}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ translateX: '100%' }}
              animate={{ translateX: 0 }}
              exit={{ translateX: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 420,
                background: 'var(--bg-surface)',
                borderLeft: '1px solid var(--border-subtle)',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
                zIndex: 101,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="serif-heading" style={{ fontSize: 22 }}>Setup Match Profiles</span>
                <button onClick={() => setIsSetupOpen(false)} className="btn btn-ghost" style={{ padding: 4 }}>
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable forms */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Upload zone */}
                <div>
                  <span className="caps-label" style={{ display: 'block', marginBottom: 10 }}>Ingest Candidate Profiles</span>
                  <UploadZone />
                </div>

                {/* Job description */}
                <div>
                  <span className="caps-label" style={{ display: 'block', marginBottom: 10 }}>Job Description Text</span>
                  <textarea 
                    value={jdText}
                    onChange={e => setJdText(e.target.value)}
                    placeholder="Paste full job description requirements here..."
                    style={{ height: 120, resize: 'none', fontSize: 13 }}
                  />
                </div>

                {/* Auto filters */}
                <div>
                  <RoleFilter />
                </div>

                {/* Weight sliders */}
                <div>
                  <WeightSliders />
                </div>

                {/* Grid inputs for size */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <span className="caps-label" style={{ display: 'block', marginBottom: 8 }}>Top results N</span>
                    <input 
                      type="number" 
                      value={topN} 
                      onChange={e => setTopN(Number(e.target.value))} 
                      min={1}
                    />
                  </div>
                  <div>
                    <span className="caps-label" style={{ display: 'block', marginBottom: 8 }}>Min Experience</span>
                    <input 
                      type="number" 
                      value={minExp} 
                      onChange={e => setMinExp(Number(e.target.value))} 
                      min={0} 
                      max={20} 
                      step={1}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Run Action */}
              <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-sunken)' }}>
                <button 
                  onClick={runPipeline}
                  disabled={isRanking || !jdText.trim()}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', height: 44, gap: 8 }}
                >
                  {isRanking ? (
                    <>
                      <i className="ti ti-loader spin" style={{ fontSize: 15 }} />
                      Running Engine...
                    </>
                  ) : (
                    <>
                      <Play size={15} fill="currentColor" />
                      Run SignalHire
                    </>
                  )}
                </button>
                {candidates.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <ExportPanel />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
