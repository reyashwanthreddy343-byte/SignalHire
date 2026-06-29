import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { rankCandidates } from '@/utils/api'
import { useAppStore } from '@/store/appStore'
import UploadZone from '@/components/recruiter/UploadZone'
import RoleFilter from '@/components/recruiter/RoleFilter'
import WeightSliders from '@/components/recruiter/WeightSliders'
import CandidateCard from '@/components/recruiter/CandidateCard'
import RankChart from '@/components/recruiter/RankChart'
import ExportPanel from '@/components/recruiter/ExportPanel'
import CandidateChatSidebar from '@/components/recruiter/CandidateChatSidebar'
import CandidateGalaxy from '@/components/recruiter/CandidateGalaxy'
import toast from 'react-hot-toast'

export default function RecruiterDashboard() {
  const {
    jdText, setJdText, jdLocked, roleLocked, unlockJdAndRole,
    topN, setTopN, minExp, setMinExp,
    rankResponse, setRankResponse, isRanking, setIsRanking,
    buildRankRequest, showWeights, setShowWeights,
    candidatesIndexed, isIngesting, ingestStream
  } = useAppStore()
  const [view, setView] = useState<'list' | 'chart' | 'galaxy'>('list')
  const [panelFolded, setPanelFolded] = useState(false)

  const mutation = useMutation({
    mutationFn: rankCandidates,
    onMutate: () => setIsRanking(true),
    onSuccess: d => {
      setRankResponse(d)
      toast.success(`Ranked ${d.returned} in ${d.processing_time_ms.toFixed(0)}ms`)
      setPanelFolded(true) // Auto-fold the input panel when results come in
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { detail?: string } } }
      toast.error(err?.response?.data?.detail || 'Ranking failed')
    },
    onSettled: () => setIsRanking(false),
  })

  const run = () => {
    if (!jdText.trim()) { toast.error('Add a job description first'); return }
    if (candidatesIndexed === 0) { toast.error('Upload candidate files first'); return }
    mutation.mutate(buildRankRequest())
  }

  const candidates = rankResponse?.ranked_candidates ?? []
  const canRun = !isRanking && !isIngesting && jdText.trim() && candidatesIndexed > 0

  return (
    <div className="recruiter-layout">
      {/* Collapsible Input Panel */}
      <aside className={`recruiter-sidebar ${panelFolded ? 'folded' : ''}`}>
        {/* Step 1 — Upload */}
        <section className="sidebar-section">
          <div className="step-label"><span className="step-num">1</span> Upload</div>
          <UploadZone />
        </section>

        {/* Step 2 — JD & Role */}
        <section className="sidebar-section">
          <div className="step-label">
            <span className="step-num">2</span> Job & Role
            {(jdLocked || roleLocked) && (
              <button type="button" className="link-btn" onClick={unlockJdAndRole}>Unlock</button>
            )}
          </div>

          {jdLocked ? (
            <div className="locked-box">
              <div className="locked-header"><i className="ti ti-lock" /> JD from upload</div>
              <p className="locked-preview">{jdText.slice(0, 280)}{jdText.length > 280 ? '…' : ''}</p>
            </div>
          ) : (
            <textarea
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste job description here if not uploaded…"
              className="jd-input"
              rows={5}
            />
          )}

          <div style={{ marginTop: 12 }}>
            <RoleFilter disabled={roleLocked} />
            {roleLocked && (
              <p style={{ fontSize: 11, color: 'var(--success)', marginTop: 6 }}>
                <i className="ti ti-lock" style={{ marginRight: 4 }} />Role detected from JD
              </p>
            )}
          </div>
        </section>

        {/* Step 3 — Optional weights */}
        <section className="sidebar-section">
          <button type="button" className="collapse-btn" onClick={() => setShowWeights(!showWeights)}>
            <span className="step-num">3</span>
            Signal weights <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            <i className={`ti ti-chevron-${showWeights ? 'up' : 'down'}`} style={{ marginLeft: 'auto' }} />
          </button>
          {showWeights && <div style={{ marginTop: 12 }}><WeightSliders /></div>}
        </section>

        <section className="sidebar-section">
          <div className="settings-grid">
            <label>Top N<input type="number" value={topN} onChange={e => setTopN(Number(e.target.value))} min={1} /></label>
            <label>Min exp<input type="number" value={minExp} onChange={e => setMinExp(Number(e.target.value))} min={0} step={0.5} /></label>
          </div>
        </section>

        <section className="sidebar-section sidebar-run">
          <button type="button" className="btn btn-primary run-btn" onClick={run} disabled={!canRun}>
            {isRanking ? <><i className="ti ti-loader spin" /> Ranking…</> : <><i className="ti ti-player-play" /> Run SignalHire</>}
          </button>
          <p className="run-hint">
            {candidatesIndexed === 0 ? 'Upload candidates to enable' : `${candidatesIndexed.toLocaleString()} in pool`}
          </p>
          {candidates.length > 0 && <ExportPanel />}
        </section>
      </aside>

      <main className="recruiter-main">
        {/* Toggle panel button when folded */}
        {panelFolded && (
          <button
            className="btn btn-ghost"
            onClick={() => setPanelFolded(false)}
            style={{
              position: 'absolute', top: 12, left: 12, zIndex: 10,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', padding: '6px 14px', fontSize: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <i className="ti ti-adjustments" style={{ fontSize: 15 }} />
            Show Controls
          </button>
        )}

        {isIngesting ? (
          <div className="empty-state" style={{ padding: '40px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
            <h2 style={{ textAlign: 'left', marginBottom: 20 }}><i className="ti ti-terminal" /> Hacker Ingestion Stream</h2>
            <div style={{
              background: '#0a0a0a',
              color: '#00ff00',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13,
              padding: 20,
              borderRadius: 8,
              minHeight: 300,
              maxHeight: 500,
              overflowY: 'auto',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'left'
            }}>
              <div style={{ color: '#00ff00', opacity: 0.7, marginBottom: 10 }}>Initialize SignalHire FastMatrixEmbedder... OK</div>
              {ingestStream.map((log, i) => (
                <div key={i} style={{ lineHeight: 1.5, animation: 'fadeIn 0.2s ease-out' }}>
                  <span style={{ opacity: 0.5 }}>$</span> {log}
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, opacity: 0.8 }}>
                <span style={{ opacity: 0.5 }}>$</span> <i className="ti ti-loader spin" />
              </div>
            </div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-chart-bar" style={{ fontSize: 40, color: 'var(--text-muted)', opacity: 0.4 }} />
            <h2>No results yet</h2>
            <p>Upload your files (include <code>job_description.docx</code> + <code>candidates.jsonl</code>), then run.</p>
            <div className="empty-steps">
              <div className="empty-step"><strong>1</strong> Drop all files in upload</div>
              <div className="empty-step"><strong>2</strong> JD & role auto-lock from upload</div>
              <div className="empty-step"><strong>3</strong> Run — or unlock to edit manually</div>
            </div>
          </div>
        ) : (
          <>
            <div className="results-header">
              <div>
                <h2>Top {candidates.length} Candidates</h2>
                <p>{rankResponse?.processing_time_ms.toFixed(0)}ms · hybrid 6-signal scoring</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {panelFolded && (
                  <button className="btn btn-ghost" onClick={() => setPanelFolded(false)} style={{ fontSize: 12 }}>
                    <i className="ti ti-adjustments" /> Edit
                  </button>
                )}
                <div className="view-tabs">
                  {(['list', 'chart', 'galaxy'] as const).map(m => (
                    <button key={m} type="button" className={view === m ? 'tab active' : 'tab'} onClick={() => setView(m as any)}>
                      <i className={`ti ti-${m === 'list' ? 'list' : m === 'chart' ? 'chart-bar' : 'planet'}`} /> {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {view === 'chart' && (
              <div className="chart-wrap surface card-shadow"><RankChart candidates={candidates} /></div>
            )}
            {view === 'galaxy' && (
              <div className="chart-wrap surface card-shadow" style={{ padding: 0 }}><CandidateGalaxy /></div>
            )}
            {view === 'list' && (
              <div className="results-list">
                {candidates.map((c, i) => <CandidateCard key={c.candidate_id} candidate={c} index={i} />)}
              </div>
            )}
          </>
        )}
      </main>
      <CandidateChatSidebar />
    </div>
  )
}
