import { useState } from 'react'
import { api } from '@/utils/api'
import toast from 'react-hot-toast'

export default function ATSOptimizer() {
  const [resumeText, setResumeText] = useState('')
  const [jdText, setJdText] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedText, setOptimizedText] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [missingSkills, setMissingSkills] = useState<string[]>([])

  const handleOptimize = async () => {
    if (!resumeText || !jdText) {
      toast.error('Please provide both Resume and Job Description')
      return
    }
    setIsOptimizing(true)
    try {
      const { data } = await api.post('/candidates/optimize_resume', {
        resume_text: resumeText,
        jd_text: jdText
      })
      setOptimizedText(data.optimized_resume)
      setScore(data.ats_score)
      setMissingSkills(data.missing_skills)
      toast.success('Resume optimized successfully!')
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Optimization failed')
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="anim-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
          ATS Resume Optimizer
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Beat the algorithm. Paste your resume and the Job Description, and our AI will rewrite your bullet points to maximize your match score.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="surface-2" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-file-text" style={{ color: 'var(--blue)' }} /> Your Current Resume
          </h3>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Paste your current resume here..."
            style={{ width: '100%', height: 300, background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, resize: 'vertical', outline: 'none' }}
          />
        </div>

        <div className="surface-2" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-briefcase" style={{ color: 'var(--green)' }} /> Target Job Description
          </h3>
          <textarea
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            placeholder="Paste the Job Description here..."
            style={{ width: '100%', height: 300, background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, resize: 'vertical', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          style={{ padding: '12px 32px', background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 600, cursor: isOptimizing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 24px rgba(168,85,247,0.4)', transition: 'all 0.2s' }}
        >
          {isOptimizing ? (
            <><i className="ti ti-loader spin" style={{ fontSize: 18 }} /> Rewriting Resume...</>
          ) : (
            <><i className="ti ti-wand" style={{ fontSize: 18 }} /> Optimize for ATS</>
          )}
        </button>
      </div>

      {optimizedText && (
        <div className="anim-up" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(168,85,247,0.05)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-check" style={{ color: 'var(--success)' }} /> Optimized Resume
            </h3>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Match Score</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{score}%</div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr' }}>
            <div style={{ padding: 20, borderRight: '1px solid var(--border)', background: 'var(--bg1)' }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Keywords Injected</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {missingSkills.map(s => (
                  <span key={s} style={{ padding: '4px 8px', background: 'var(--success-dim)', color: 'var(--success)', borderRadius: 6, fontSize: 11, fontWeight: 500 }}>
                    + {s}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <textarea
                readOnly
                value={optimizedText}
                style={{ width: '100%', height: 400, background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
