import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { api } from '@/utils/api'

export default function CandidateChatSidebar() {
  const { selectedCandidate, setSelectedCandidate } = useAppStore()
  const [messages, setMessages] = useState<{role: 'user' | 'agent', text: string}[]>([
    { role: 'agent', text: "Hi! I'm the AI Talent Assistant. Ask me anything about this candidate's background, skills, work experience, education, or fit." }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  if (!selectedCandidate) return null

  const c = selectedCandidate

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const q = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setInput('')
    setIsTyping(true)

    try {
      const response = await api.post(`/candidates/${c.candidate_id}/chat`, { message: q })
      const ans = response.data.response
      setMessages(prev => [...prev, { role: 'agent', text: ans }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'agent', text: "I apologize, but I encountered an issue retrieving that analysis. Please check your network connection and try again." }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: 320,
      background: 'var(--bg)',
      borderLeft: '1px solid var(--border)',
      boxShadow: '-4px 0 15px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      animation: 'slideInRight 0.2s ease-out'
    }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 14, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-robot" style={{ color: 'var(--blue)' }} /> Agentic Chat
        </h3>
        <button onClick={() => setSelectedCandidate(null)} className="btn btn-ghost" style={{ padding: 4 }}>
          <i className="ti ti-x" />
        </button>
      </div>

      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4, marginLeft: 2 }}>{m.role === 'user' ? 'You' : 'SignalHire AI'}</div>
            <div style={{ 
              background: m.role === 'user' ? 'var(--blue)' : 'var(--bg-sunken)', 
              color: m.role === 'user' ? '#fff' : 'var(--text)', 
              padding: '8px 12px', 
              borderRadius: 8, 
              fontSize: 13, 
              lineHeight: 1.4,
              border: m.role === 'agent' ? '1px solid var(--border)' : 'none'
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', background: 'var(--bg-sunken)', padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border)', color: 'var(--muted)' }}>
            <i className="ti ti-dots" style={{ animation: 'blink 1s infinite' }} />
          </div>
        )}
      </div>

      <form onSubmit={send} style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about candidate…" 
          style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-sunken)', color: 'var(--text)', fontSize: 13 }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }} disabled={!input.trim() || isTyping}>
          <i className="ti ti-send" />
        </button>
      </form>
    </div>
  )
}
