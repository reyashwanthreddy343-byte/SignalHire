import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getHealth } from '@/utils/api'
import { useAppStore } from '@/store/appStore'

const NAV = [
  { to: '/recruiter', icon: 'ti-users', label: 'Recruiter', section: 'core' },
  { to: '/rank', icon: 'ti-list-numbers', label: 'Rankings', section: 'core' },
  { to: '/hidden-gems', icon: 'ti-diamond', label: 'Hidden Gems', section: 'core' },
  { to: '/compare', icon: 'ti-arrows-diff', label: 'Compare', section: 'core' },
  { to: '/evaluate', icon: 'ti-chart-dots', label: 'Evaluate', section: 'analytics' },
  { to: '/analytics', icon: 'ti-chart-treemap', label: 'Analytics', section: 'analytics' },
  { to: '/globe', icon: 'ti-world', label: 'Talent Globe', section: 'analytics' },
  { to: '/honeypots', icon: 'ti-shield-check', label: 'Honeypots', section: 'tools' },
  { to: '/config', icon: 'ti-settings', label: 'Config', section: 'tools' },
  { to: '/candidate', icon: 'ti-user-circle', label: 'Candidate Portal', section: 'tools' },
]

export default function Layout() {
  const { data: health } = useQuery({ queryKey: ['health'], queryFn: getHealth, refetchInterval: 8000, retry: false })
  const { candidatesIndexed, theme, toggleTheme } = useAppStore()
  const indexed = candidatesIndexed || health?.candidates_indexed || 0
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  // Auto-close sidebar on small screens
  useEffect(() => {
    if (window.innerWidth < 900) setSidebarOpen(false)
  }, [location.pathname])

  const sections = [
    { key: 'core', label: 'RECRUITMENT' },
    { key: 'analytics', label: 'ANALYTICS' },
    { key: 'tools', label: 'TOOLS' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Collapsible Sidebar */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        {/* Logo Area */}
        <div className="sidebar-logo-area">
          <NavLink to="/recruiter" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg,#7C3AED,#6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <i className="ti ti-signal-5g" style={{ color: '#fff', fontSize: 16 }} />
            </div>
            {sidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <span style={{ fontWeight: 700, fontSize: 16, display: 'block', lineHeight: 1.2 }}>SignalHire</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>v1.0 Pro</span>
              </div>
            )}
          </NavLink>
        </div>

        {/* Nav Sections */}
        <nav className="sidebar-nav">
          {sections.map(sec => (
            <div key={sec.key} className="sidebar-nav-section">
              {sidebarOpen && <div className="sidebar-section-label">{sec.label}</div>}
              {NAV.filter(n => n.section === sec.key).map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  title={!sidebarOpen ? label : undefined}
                >
                  <i className={`ti ${icon}`} style={{ fontSize: 18, flexShrink: 0 }} />
                  {sidebarOpen && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer Controls */}
        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="sidebar-status">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: health?.status === 'ok' ? 'var(--success)' : 'var(--warning)', display: 'inline-block' }} />
              <span className="mono" style={{ fontSize: 11 }}>{indexed.toLocaleString()} indexed</span>
              <span style={{ color: health?.status === 'ok' ? 'var(--success)' : 'var(--warning)', fontSize: 11 }}>
                {health?.status === 'ok' ? 'Live' : 'Offline'}
              </span>
            </div>
          )}
          <div className="sidebar-footer-btns">
            <button
              onClick={useAppStore.getState().toggleBlindMode}
              className="sidebar-footer-btn"
              title="Toggle Blind Hiring"
              style={{ color: useAppStore().blindMode ? 'var(--accent)' : undefined }}
            >
              <i className={`ti ti-${useAppStore().blindMode ? 'eye-off' : 'eye'}`} />
            </button>
            <button onClick={toggleTheme} className="sidebar-footer-btn" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              <i className={`ti ti-${theme === 'light' ? 'moon' : 'sun'}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="app-main-wrapper">
        {/* Topbar (just hamburger + breadcrumb) */}
        <header className="app-topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle sidebar">
            <i className={`ti ti-${sidebarOpen ? 'layout-sidebar-left-collapse' : 'menu-2'}`} style={{ fontSize: 20 }} />
          </button>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            {NAV.find(n => location.pathname.startsWith(n.to))?.label || 'Dashboard'}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <span className="mono">{indexed.toLocaleString()} candidates</span>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: health?.status === 'ok' ? 'var(--success)' : 'var(--warning)'
            }} />
          </div>
        </header>
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
