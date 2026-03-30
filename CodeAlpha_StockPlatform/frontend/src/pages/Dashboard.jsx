import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMarket } from '../context/MarketContext'
import { portfolioService } from '../services/marketService'
import { useState, useEffect } from 'react'
import { fmtINR, fmtPct, fmtK, isUp, badgeClass, colorClass } from '../utils/helpers'
import StatCard from '../components/StatCard'
import PriceChart from '../components/PriceChart'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { stocks, topGainers, topLosers, mostActive } = useMarket()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [pfHistory, setPfHistory] = useState([])

  useEffect(() => {
    portfolioService.summary().then(({ data }) => {
      setSummary(data)
      setPfHistory(prev => {
        const next = [...prev, { price: data.totalAssets, label: new Date().toLocaleTimeString('en-IN') }]
        return next.slice(-40)
      })
    }).catch(() => {})
  }, [stocks]) 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Welcome */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Good morning, {user?.username} 👋</h1>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
          NSE market simulation — prices update every 5 seconds
        </p>
      </div>

      {/* Portfolio stats */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <StatCard label="Total Assets"    value={fmtINR(summary.totalAssets)}    />
          <StatCard label="Cash Balance"    value={fmtINR(summary.cashBalance)}    />
          <StatCard label="Portfolio Value" value={fmtINR(summary.portfolioValue)} />
          <StatCard
            label="Unrealized P&L"
            value={fmtINR(summary.totalPnL)}
            valueColor={isUp(summary.totalPnL) ? 'var(--green)' : 'var(--red)'}
            sub={fmtPct(summary.totalPnLPercent)}
          />
        </div>
      )}

      {/* Portfolio chart */}
      {pfHistory.length > 2 && (
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Total Asset Value — Live
          </div>
          <PriceChart data={pfHistory} height={180} />
        </div>
      )}

      {/* Gainers / Losers / Active */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <GlList title="Top Gainers" icon={<TrendingUp size={14} color="var(--green)" />} items={topGainers} navigate={navigate} />
        <GlList title="Top Losers"  icon={<TrendingDown size={14} color="var(--red)" />}   items={topLosers}  navigate={navigate} />
        <GlList title="Most Active" icon={<Activity size={14} color="var(--blue)" />}       items={mostActive} navigate={navigate} vol />
      </div>

      {/* Quick trade strip */}
      <div className="card">
        <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          Quick Trade
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {stocks.slice(0, 8).map(s => (
            <button key={s.symbol}
              onClick={() => navigate(`/trade/${s.symbol}`)}
              style={{
                background: 'var(--bg3)', border: '1px solid #ffffff18',
                borderRadius: 7, padding: '7px 14px', cursor: 'pointer',
                color: 'var(--text)', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#ffffff35'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#ffffff18'}
            >
              {s.symbol}
              <span style={{ color: isUp(s.changePercent) ? 'var(--green)' : 'var(--red)', fontFamily: 'monospace', fontSize: 11 }}>
                {fmtPct(s.changePercent)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function GlList({ title, icon, items, navigate, vol }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        {icon}
        <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {title}
        </span>
      </div>
      {items.map(s => (
        <div key={s.symbol}
          onClick={() => navigate(`/market/${s.symbol}`)}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 0', borderBottom: '1px solid #ffffff0a', cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{s.symbol}</div>
            <div style={{ color: 'var(--text3)', fontSize: 10, marginTop: 1 }}>
              {vol ? `Vol: ${fmtK(s.volume)}` : fmtINR(s.currentPrice)}
            </div>
          </div>
          <span className={`badge ${badgeClass(s.changePercent)}`}>
            {fmtPct(s.changePercent)}
          </span>
        </div>
      ))}
    </div>
  )
}
