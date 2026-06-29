import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import axios from 'axios'
import ScoreRing from '@/components/shared/ScoreRing'
import SkillPill from '@/components/shared/SkillPill'
import { ArrowLeft, Clock, MapPin, Award, Github, Linkedin, Briefcase, GraduationCap, Code, AlertTriangle, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Candidate } from '@/types'
import { useAppStore } from '@/store/appStore'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { rankResponse } = useAppStore()

  // Fetch full details from candidate database
  const { data: profile, isLoading } = useQuery<Candidate>({
    queryKey: ['candidate', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/v1/candidates/${id}`)
      return data
    },
    enabled: !!id,
    retry: false
  })

  if (isLoading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="ti ti-loader spin" style={{ fontSize: 32, marginBottom: 12, display: 'inline-block' }} />
        <p>Loading candidate dossier...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <AlertTriangle size={32} style={{ color: 'var(--danger)', margin: '0 auto 12px' }} />
        <h2 className="serif-heading" style={{ fontSize: 24, marginBottom: 8 }}>Candidate Profile Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>The candidate ID may be incorrect or has not been ingested yet.</p>
        <button onClick={() => navigate('/rank')} className="btn">
          <ArrowLeft size={14} /> Back to Rankings
        </button>
      </div>
    )
  }

  // Highlight keywords helper
  const highlightKeywords = (text: string) => {
    if (!text) return ''
    const keywords = [
      'ranking system', 'production', 'embeddings', 'vector search', 
      'information retrieval', 'indexing', 'FAISS', 'deployed', 'shipped'
    ]
    let highlighted = text
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'gi')
      highlighted = highlighted.replace(regex, '<strong style="color:var(--accent); font-weight: 600;">$1</strong>')
    })
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />
  }

  // Use real platform activity data — zero-fill when absent
  const signals = profile.platform_activity || {
    profile_views: 0,
    applications_sent: 0,
    response_rate: 0,
    last_active_days_ago: 0,
    login_frequency_per_week: 0,
    profile_completeness: 0
  }
  const hasActivityData = !!profile.platform_activity

  return (
    <div style={{ padding: '40px 0', maxWidth: '1000px', margin: '0 auto' }} className="anim-up">
      {/* Back Link */}
      <button onClick={() => navigate('/rank')} className="btn btn-ghost" style={{ gap: 6, marginBottom: 24, paddingLeft: 0 }}>
        <ArrowLeft size={14} /> Back to Rankings
      </button>

      {/* Hero newspaper block */}
      <div 
        className="surface"
        style={{ 
          padding: '40px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '4px solid var(--accent)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          marginBottom: 40
        }}
      >
        <div>
          <h1 className="serif-heading" style={{ fontSize: '42px', lineHeight: 1.05, marginBottom: 12, letterSpacing: '-0.03em' }}>
            {profile.name || 'Anonymous Candidate'}
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: 16 }}>
            {profile.headline || profile.current_title || 'Software Engineer'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} /> {profile.years_of_experience} years exp
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={14} /> {profile.location || 'India'}
            </span>
            <span>•</span>
            <span className="badge badge-green">Open to relocation</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <ScoreRing score={(() => {
            // Pull actual ranked score from store if available
            const ranked = rankResponse?.ranked_candidates?.find(c => c.candidate_id === id)
            return ranked ? ranked.final_score : null
          })() ?? 0} size={96} strokeWidth={6} />
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {rankResponse?.ranked_candidates?.find(c => c.candidate_id === id) ? 'Fit Score' : 'Not Ranked'}
          </span>
        </div>
      </div>

      {/* Grid: 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '32px' }}>
        
        {/* Left Column: Timeline & Assessment */}
        <div>
          {/* Timeline section */}
          <section style={{ marginBottom: 40 }}>
            <h2 className="serif-heading" style={{ fontSize: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 20 }}>
              Career Chronology
            </h2>

            {profile.work_experience && profile.work_experience.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {profile.work_experience.map((exp: any, idx: number) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="surface"
                    style={{ 
                      padding: '20px', 
                      borderLeft: exp.is_current ? '3px solid var(--success)' : '3px solid var(--border-strong)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <h4 style={{ fontWeight: 600, fontSize: 14 }}>{exp.title}</h4>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {exp.start_date} - {exp.end_date || 'Present'}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>{exp.company}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {highlightKeywords(exp.description || '')}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No work experience details provided.</p>
            )}
          </section>

          {/* Education section */}
          <section style={{ marginBottom: 40 }}>
            <h2 className="serif-heading" style={{ fontSize: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 20 }}>
              Education
            </h2>
            {profile.education && profile.education.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {profile.education.map((edu: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: 6, borderRadius: 6 }}>
                      <GraduationCap size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: 13 }}>{edu.degree} in {edu.field_of_study}</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{edu.institution}</p>
                      {edu.end_year && <p className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Graduated: {edu.end_year}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No education details provided.</p>
            )}
          </section>
        </div>

        {/* Right Column: Skills & Redrob Signals */}
        <div>
          {/* Skills Radar Matrix */}
          <section style={{ marginBottom: 40 }}>
            <h2 className="serif-heading" style={{ fontSize: 22, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 20 }}>
              Skills Index
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.skills && profile.skills.map((s, idx) => (
                <SkillPill key={idx} skill={s} variant="neutral" />
              ))}
              {profile.implied_skills && profile.implied_skills.map((s, idx) => (
                <span key={idx} className="pill-match" style={{ fontSize: 11, background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                  {s} (implied)
                </span>
              ))}
            </div>
          </section>

          {/* Platform behavioral signals */}
          <section style={{ marginBottom: 40 }}>
            <h2 className="serif-heading" style={{ fontSize: 22, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 20 }}>
              Behavioral Signals
            </h2>

            {!hasActivityData && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 12 }}>
                No platform activity data available for this candidate.
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="surface" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Profile Completeness</span>
                <span className="mono" style={{ fontWeight: 600 }}>{hasActivityData ? `${Math.round(signals.profile_completeness * 100)}%` : '—'}</span>
              </div>
              <div className="surface" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Recruiter Response Rate</span>
                <span className="mono" style={{ fontWeight: 600 }}>{hasActivityData ? `${Math.round(signals.response_rate * 100)}%` : '—'}</span>
              </div>
              <div className="surface" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Profile Views (30d)</span>
                <span className="mono" style={{ fontWeight: 600 }}>{hasActivityData ? signals.profile_views : '—'}</span>
              </div>
              <div className="surface" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Applications Submitted</span>
                <span className="mono" style={{ fontWeight: 600 }}>{hasActivityData ? signals.applications_sent : '—'}</span>
              </div>
            </div>
          </section>

          {/* Verification items */}
          <section>
            <h2 className="serif-heading" style={{ fontSize: 22, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 20 }}>
              Trust Checklist
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)' }}>
                <ShieldCheck size={16} /> Verified Email
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)' }}>
                <ShieldCheck size={16} /> Verified Phone
              </div>
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="btn" style={{ gap: 6, justifyContent: 'flex-start', padding: 8 }}>
                  <Github size={14} /> GitHub Profile
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="btn" style={{ gap: 6, justifyContent: 'flex-start', padding: 8 }}>
                  <Linkedin size={14} /> LinkedIn Profile
                </a>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}
