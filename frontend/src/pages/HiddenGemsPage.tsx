import { useQuery } from '@tanstack/react-query'
import { getHiddenGems } from '@/utils/api'
import type { HiddenGemCandidate } from '@/types'

function GemCard({ gem, index }: { gem: HiddenGemCandidate; index: number }) {
  const pct = Math.round(gem.gem_score * 100)
  return (
    <div className="surface anim-up" style={{ padding: 18, animationDelay: `${index * 0.04}s` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
            {gem.name || 'Anonymous'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {gem.current_title || 'Title not listed'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 4 }}>
            <i className="ti ti-clock" style={{ marginRight: 4 }} />
            {gem.years_of_experience.toFixed(1)} yrs experience
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, rgba(79,142,247,0.15), rgba(99,102,241,0.15))',
          border: '1px solid rgba(79,142,247,0.25)',
          borderRadius: 10,
          padding: '8px 12px',
          textAlign: 'center',
          minWidth: 72,
        }}>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue)' }}>{pct}%</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gem Score</div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 12 }}>
        {gem.reason}
      </p>

      {gem.suggested_roles.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {gem.suggested_roles.map(role => (
            <span
              key={role}
              style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                color: 'var(--blue)',
              }}
            >
              {role}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HiddenGemsPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['hidden-gems'],
    queryFn: () => getHiddenGems(2, 20),
    refetchOnWindowFocus: false,
  })

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <i className="ti ti-diamond" style={{ fontSize: 22, color: 'var(--blue)' }} />
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>Hidden Gems</h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 640, lineHeight: 1.6 }}>
            High-talent candidates with low platform visibility — the people keyword search would never surface.
            Beyond Keywords. Real Signals.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => refetch()} disabled={isFetching} style={{ flexShrink: 0 }}>
          <i className={`ti ${isFetching ? 'ti-loader spin' : 'ti-refresh'}`} style={{ marginRight: 6 }} />
          Rescan Pool
        </button>
      </div>

      {isLoading && (
        <div className="surface" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
          <i className="ti ti-loader spin" style={{ fontSize: 24, marginBottom: 8, display: 'block' }} />
          Scanning candidate pool for hidden gems…
        </div>
      )}

      {error && (
        <div className="surface" style={{ padding: 24, borderLeft: '3px solid var(--red)' }}>
          <p style={{ color: 'var(--red)', fontSize: 14 }}>Failed to load hidden gems. Ensure the backend is running with indexed candidates.</p>
        </div>
      )}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            <div className="surface" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Scanned</div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{data.total_scanned.toLocaleString()}</div>
            </div>
            <div className="surface" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Gems Found</div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--blue)' }}>{data.gems_found}</div>
            </div>
            <div className="surface" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Showing</div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{data.candidates.length}</div>
            </div>
          </div>

          {data.candidates.length === 0 ? (
            <div className="surface" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
              <p style={{ fontSize: 14, marginBottom: 8 }}>No hidden gems matched the current thresholds.</p>
              <p style={{ fontSize: 12 }}>Rule: talent ≥ 55% and visibility &lt; 35% (high skill depth, low platform exposure).</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {data.candidates.map((gem, i) => (
                <GemCard key={gem.candidate_id} gem={gem} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
