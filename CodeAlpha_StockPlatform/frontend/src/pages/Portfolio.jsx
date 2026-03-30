import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMarket } from '../context/MarketContext'
import { portfolioService } from '../services/marketService'
import { fmtINR, fmtPct, isUp, badgeClass } from '../utils/helpers'
import StatCard from '../components/StatCard'
import PriceChart from '../components/PriceChart'

export default function Portfolio() {
  const { stocks } = useMarket()
  const navigate   = useNavigate()
  const [portfolio, setPortfolio] = useState([])
  const [summary, setSummary]     = useState(null)
  const [pfHistory, setPfHistory] = useState([])

  const load = async () => {
    try {
      const [{ data: pf }, { data: sum }] = await Promise.all([
        portfolioService.get(), portfolioService.summary(),
      ])
      setPortfolio(pf)
      setSummary(sum)
      setPfHistory(prev => {
        const next = [...prev, { price: sum.totalAssets, label: new Date().toLocaleTimeString('en-IN') }]
        return next.slice(-50)
      })
    } catch (e) { console.error(e) }
  }

  useEffect(() => { load() }, [stocks]) 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>Portfolio</h1>

      {/* Summary stats */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <StatCard label="Total Assets"    value={fmtINR(summary.totalAssets)} />
          <StatCard label="Cash Balance"    value={fmtINR(summary.cashBalance)} />
          <StatCard label="Invested Value"  value={fmtINR(summary.portfolioValue)} />
          <StatCard
            label="Total P&L"
            value={fmtINR(summary.totalPnL)}
            valueColor={isUp(summary.totalPnL) ? 'var(--green)' : 'var(--red)'}
            sub={`${fmtPct(summary.totalPnLPercent)} overall`}
          />
        </div>
      )}

      {/* Growth chart */}
      {pfHistory.length > 2 && (
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>
            Portfolio Growth
          </div>
          <PriceChart data={pfHistory} height={180} />
        </div>
      )}

      {/* Holdings table */}
      <div className="card">
        <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14 }}>
          Holdings ({portfolio.length})
        </div>
        {portfolio.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <div>No holdings yet. <span style={{ color: 'var(--blue)', cursor: 'pointer' }} onClick={() => navigate('/trade')}>Start trading →</span></div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ffffff12' }}>
                  {['Symbol', 'Qty', 'Avg Price', 'Current', 'Invested', 'Value', 'P&L', 'P&L %', ''].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--text3)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {portfolio.map(h => (
                  <tr key={h.stockSymbol}
                    style={{ borderBottom: '1px solid #ffffff08', transition: 'background .15s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ffffff05'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 10px' }}>
                      <div style={{ fontWeight: 600 }}>{h.stockSymbol}</div>
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{h.quantity}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{fmtINR(h.avgPrice)}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: isUp(h.profitLoss) ? 'var(--green)' : 'var(--red)' }}>
                      {fmtINR(h.currentPrice)}
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{fmtINR(h.totalInvested)}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{fmtINR(h.currentValue)}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: isUp(h.profitLoss) ? 'var(--green)' : 'var(--red)' }}>
                      {(h.profitLoss >= 0 ? '+' : '')}{fmtINR(h.profitLoss)}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${badgeClass(h.profitLossPercent)}`}>
                        {fmtPct(h.profitLossPercent)}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => navigate(`/trade/${h.stockSymbol}`)} style={{
                        background: 'var(--bg3)', border: '1px solid #ffffff18',
                        borderRadius: 6, padding: '4px 10px', color: 'var(--text2)',
                        fontSize: 11, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
                      }}>
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
