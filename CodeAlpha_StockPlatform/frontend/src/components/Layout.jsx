import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMarket } from '../context/MarketContext'
import { fmtINR, fmtPct, isUp } from '../utils/helpers'
import {
  LayoutDashboard, BarChart2, TrendingUp,
  Briefcase, Eye, Clock, LogOut, Zap
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/market',    icon: BarChart2,       label: 'Market'     },
  { to: '/trade',     icon: TrendingUp,      label: 'Trade'      },
  { to: '/portfolio', icon: Briefcase,       label: 'Portfolio'  },
  { to: '/watchlist', icon: Eye,             label: 'Watchlist'  },
  { to: '/history',   icon: Clock,           label: 'History'    },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { stocks, lastUpdate } = useMarket()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--bg2)', borderRight: '1px solid #ffffff12',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #ffffff12' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #00c896, #4d9fff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={16} color="#000" fill="#000" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>BullRun</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>NSE Simulator</div>
            </div>
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #ffffff12' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Logged in as</div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{user?.username}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--green)', marginTop: 4 }}>
            {fmtINR(user?.balance)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Available cash</div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8, marginBottom: 2,
              fontSize: 13, fontWeight: 500, textDecoration: 'none',
              transition: 'all .15s',
              background: isActive ? '#4d9fff18' : 'transparent',
              color: isActive ? 'var(--blue)' : 'var(--text2)',
              borderLeft: isActive ? '2px solid var(--blue)' : '2px solid transparent',
            })}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Live status */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #ffffff12' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div className="live-dot" style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--green)',
            }} />
            <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>LIVE SIM</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>
            {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString('en-IN')}` : 'Connecting...'}
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={{
          margin: '0 8px 12px', padding: '9px 10px', borderRadius: 8,
          background: 'transparent', border: '1px solid #ff4d6a30',
          color: 'var(--red)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, transition: 'all .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#ff4d6a14'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={15} /> Logout
        </button>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Ticker bar */}
        <TickerBar stocks={stocks} />
        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function TickerBar({ stocks }) {
  return (
    <div style={{
      background: 'var(--bg3)', borderBottom: '1px solid #ffffff12',
      padding: '0 16px', height: 36,
      display: 'flex', alignItems: 'center', gap: 24, overflowX: 'auto',
      flexShrink: 0,
    }}>
      {stocks.map(s => (
        <span key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', fontSize: 11 }}>
          <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{s.symbol}</span>
          <span style={{ fontFamily: 'monospace' }}>{fmtINR(s.currentPrice)}</span>
          <span style={{ color: isUp(s.changePercent) ? 'var(--green)' : 'var(--red)', fontFamily: 'monospace' }}>
            {fmtPct(s.changePercent)}
          </span>
        </span>
      ))}
    </div>
  )
}
