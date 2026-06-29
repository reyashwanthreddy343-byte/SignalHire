import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useQueryClient } from '@tanstack/react-query'
import { ingestFiles, pollIngestionStatus } from '@/utils/api'
import { useAppStore } from '@/store/appStore'
import toast from 'react-hot-toast'

interface UpFile {
  name: string
  size: number
  status: 'pending' | 'uploading' | 'done' | 'skipped' | 'error'
  note?: string
}

const SKIP_HINTS = ['schema', 'readme', 'submission_spec', 'signals_doc']

function guessStatus(name: string): UpFile['status'] {
  const n = name.toLowerCase()
  if (SKIP_HINTS.some(h => n.includes(h))) return 'skipped'
  if (n.includes('job_description') || n.includes('job description')) return 'pending'
  if (n.endsWith('.jsonl') || n.endsWith('.pdf') || n.endsWith('.zip')) return 'pending'
  return 'pending'
}

export default function UploadZone() {
  const [files, setFiles] = useState<UpFile[]>([])
  const queryClient = useQueryClient()
  const {
    setJdText, setJdLocked, setRoleLocked, updateRoleFilter,
    setCandidatesIndexed, setIngestMessage, setIsIngesting,
  } = useAppStore()

  const onDrop = useCallback(async (accepted: File[]) => {
    const newFiles: UpFile[] = accepted.map(f => ({
      name: f.name,
      size: f.size,
      status: guessStatus(f.name) === 'skipped' ? 'skipped' : 'uploading',
      note: guessStatus(f.name) === 'skipped' ? 'Docs skipped (not candidates)' : undefined,
    }))
    setFiles(p => [...p, ...newFiles])
    setIsIngesting(true)
    setIngestMessage('Uploading…')
    useAppStore.getState().clearIngestStream()

    try {
      const { job_id } = await ingestFiles(accepted)
      toast.success(`Processing ${accepted.length} file(s)…`)

      // Setup WebSocket for Hacker Stream
      const wsUrl = `ws://localhost:8000/api/v1/ingest/${job_id}/ws`
      const ws = new WebSocket(wsUrl)
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.type === 'progress') {
            useAppStore.getState().addIngestStreamLog(`[${new Date().toISOString().split('T')[1].slice(0,-1)}] ${msg.data.message}`)
          }
        } catch(err) {}
      }

      let jdToastShown = false
      const poll = async () => {
        const s = await pollIngestionStatus(job_id)
        setIngestMessage(s.message || 'Processing…')
        if (s.candidates_indexed != null) setCandidatesIndexed(s.candidates_indexed)
        if (s.progress_pct != null && s.status === 'processing') {
          setIngestMessage(s.message || `Indexing… ${s.progress_pct}%`)
        }

        if (s.jd_text) {
          setJdText(s.jd_text)
          setJdLocked(true)
          setFiles(p => p.map(f => {
            const n = f.name.toLowerCase()
            if (n.includes('job_description') || n.includes('job description')) {
              return { ...f, status: 'done' as const, note: 'JD loaded' }
            }
            return f
          }))
          if (!jdToastShown) {
            jdToastShown = true
            toast.success('Job description locked from upload')
          }
        }
        if (s.role_detected) {
          updateRoleFilter(0, s.role_detected)
          setRoleLocked(true)
        }

        if (s.status === 'processing') {
          setTimeout(poll, 1200)
          return
        }

        setIsIngesting(false)

        if (s.status === 'done') {
          setFiles(p => p.map(f => {
            const nf = newFiles.find(n => n.name === f.name)
            if (!nf) return f
            if (f.status === 'skipped') return f
            return { ...f, status: 'done' as const }
          }))

          if (s.candidates_indexed > 0) {
            setCandidatesIndexed(s.candidates_indexed)
            toast.success(`Indexed ${s.candidates_indexed.toLocaleString()} candidates`)
          } else if (s.jd_text && !jdToastShown) {
            toast.success('JD ready — add candidate files or paste manually')
          }
          if (s.skipped_files?.length) {
            toast(`${s.skipped_files.length} doc file(s) skipped (schema/readme)`, { icon: 'ℹ️' })
          }
          queryClient.invalidateQueries({ queryKey: ['health'] })
        } else {
          setFiles(p => p.map(f => {
            const nf = newFiles.find(n => n.name === f.name)
            return nf ? { ...f, status: 'error' as const } : f
          }))
          toast.error(s.error || 'Ingestion failed')
        }
      }
      setTimeout(poll, 800)
    } catch (e: unknown) {
      setIsIngesting(false)
      const err = e as { response?: { data?: { detail?: string } } }
      toast.error(err?.response?.data?.detail || 'Upload failed')
      setFiles(p => p.map(f => newFiles.find(n => n.name === f.name) ? { ...f, status: 'error' } : f))
    }
  }, [queryClient, setCandidatesIndexed, setIngestMessage, setIsIngesting, setJdLocked, setJdText, setRoleLocked, updateRoleFilter])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/json': ['.json', '.jsonl'],
      'text/csv': ['.csv'],
      'application/zip': ['.zip'],
      'text/plain': ['.txt'],
    },
    multiple: true,
  })

  const fmt = (b: number) => b < 1024 ? `${b}B` : b < 1048576 ? `${(b / 1024).toFixed(0)}KB` : `${(b / 1048576).toFixed(1)}MB`
  const { ingestMessage, isIngesting, candidatesIndexed } = useAppStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div {...getRootProps()} className="dropzone" style={isDragActive ? { borderColor: 'var(--accent)', background: 'var(--accent-light)' } : {}}>
        <input {...getInputProps()} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '4px 0' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-sunken)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className={`ti ${isIngesting ? 'ti-loader spin' : 'ti-cloud-upload'}`} style={{ fontSize: 18, color: 'var(--accent)' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
              {isDragActive ? 'Drop to upload' : 'Upload everything at once'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Candidates + <strong>job_description.docx</strong> together.<br />
              PDF · DOCX · JSONL · CSV · ZIP
            </p>
          </div>
        </div>
      </div>

      {(isIngesting || candidatesIndexed > 0) && (
        <div className="surface-2" style={{ padding: '10px 12px', fontSize: 12 }}>
          {isIngesting ? (
            <span style={{ color: 'var(--accent)' }}><i className="ti ti-loader spin" style={{ marginRight: 6 }} />{ingestMessage || 'Fast indexing…'}</span>
          ) : (
            <span style={{ color: 'var(--success)' }}><i className="ti ti-circle-check" style={{ marginRight: 6 }} />{candidatesIndexed.toLocaleString()} candidates ready</span>
          )}
        </div>
      )}

      {files.slice(-6).map((f, i) => (
        <div key={`${f.name}-${i}`} className="surface-2" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
          <i className="ti ti-file-text" style={{ color: 'var(--accent)', fontSize: 14 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fmt(f.size)}{f.note ? ` · ${f.note}` : ''}</p>
          </div>
          {f.status === 'uploading' && <i className="ti ti-loader spin" style={{ color: 'var(--accent)' }} />}
          {f.status === 'done' && <i className="ti ti-circle-check" style={{ color: 'var(--success)' }} />}
          {f.status === 'skipped' && <i className="ti ti-minus" style={{ color: 'var(--text-muted)' }} />}
          {f.status === 'error' && <i className="ti ti-circle-x" style={{ color: 'var(--danger)' }} />}
        </div>
      ))}
    </div>
  )
}
