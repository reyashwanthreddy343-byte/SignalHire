import { useState } from 'react'
import { api } from '@/utils/api'
import toast from 'react-hot-toast'

interface Props {
  candidateId: string
  candidateName: string
  onClose: () => void
}

const PRESET_QUESTIONS = [
  "Tell me about yourself and your experience.",
  "What are your greatest strengths?",
  "Describe a challenging project you completed.",
  "Why are you interested in this role?",
  "How do you handle tight deadlines?",
  "What's your approach to learning new technologies?",
]

export default function InterviewSimulator({ candidateId, candidateName, onClose }: Props) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{ role: 'interviewer' | 'candidate'; text: string }[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [followups, setFollowups] = useState<string[]>([])

  const askQuestion = async (q: string) => {
    if (!q.trim()) return
    const trimmed = q.trim()
    setMessages(prev => [...prev, { role: 'interviewer', text: trimmed }])
    setQuestion('')
    setIsThinking(true)

    try {
      const { data } = await api.post('/analytics/simulate_interview', {
        candidate_id: candidateId,
        question: trimmed,
      })
      setMessages(prev => [...prev, { role: 'candidate', text: data.ai_response }])
      setFollowups(data.suggested_followups || [])
    } catch {
      toast.error('Interview simulation failed')
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{
        width: '90%', maxWidth: 700, maxHeight: '85vh',
        background: 'var(--bg1)', border: '1px solid var(--border)',
        borderRadius: 16, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(99,102,241,0.1))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="ti ti-robot" style={{ color: '#fff', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Interview Simulator</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Interviewing as {candidateName}</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', transition: 'all 0.15s',
          }}>
            <i className="ti ti-x" />
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <i className="ti ti-messages" style={{ fontSize: 48, color: 'var(--border)', display: 'block', marginBottom: 12 }} />
              <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
                Ask a question or pick a preset below
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {PRESET_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => askQuestion(q)} style={{
                    padding: '8px 14px', borderRadius: 20,
                    background: 'var(--bg2)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontSize: 12, cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
                  >{q}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12,
              flexDirection: m.role === 'interviewer' ? 'row-reverse' : 'row',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: m.role === 'interviewer' ? 'var(--blue)' : 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className={`ti ${m.role === 'interviewer' ? 'ti-user' : 'ti-robot'}`} style={{ color: '#fff', fontSize: 14 }} />
              </div>
              <div style={{
                maxWidth: '75%', padding: '12px 16px', borderRadius: 12,
                background: m.role === 'interviewer' ? 'rgba(59,130,246,0.15)' : 'var(--bg2)',
                border: `1px solid ${m.role === 'interviewer' ? 'rgba(59,130,246,0.2)' : 'var(--border)'}`,
                fontSize: 13, lineHeight: 1.6, color: 'var(--text)',
              }}>
                {m.text}
              </div>
            </div>
          ))}

          {isThinking && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'var(--accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="ti ti-robot" style={{ color: '#fff', fontSize: 14 }} />
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: 12,
                background: 'var(--bg2)', border: '1px solid var(--border)',
                fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <i className="ti ti-loader spin" /> {candidateName} is thinking...
              </div>
            </div>
          )}

          {/* Follow-up suggestions */}
          {followups.length > 0 && !isThinking && messages.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', width: '100%', marginBottom: 4 }}>Suggested follow-ups:</span>
              {followups.map((q, i) => (
                <button key={i} onClick={() => askQuestion(q)} style={{
                  padding: '6px 12px', borderRadius: 16,
                  background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
                  color: 'var(--accent)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                }}>{q}</button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 10,
        }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askQuestion(question)}
            placeholder="Ask the candidate a question..."
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, outline: 'none',
            }}
          />
          <button onClick={() => askQuestion(question)} disabled={isThinking} style={{
            padding: '10px 20px', borderRadius: 10,
            background: 'var(--accent)', border: 'none',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <i className="ti ti-send" /> Ask
          </button>
        </div>
      </div>
    </div>
  )
}
