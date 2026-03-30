import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMarket } from '../context/MarketContext'
import { portfolioService } from '../services/marketService'
import { fmtINR, fmtPct, fmtK, isUp, badgeClass, colorClass, getSentiment } from '../utils/helpers'
import StockCard from '../components/StockCard'
import PriceChart from '../components/PriceChart'
import toast from 'react-hot-toast'

export default function Market() {
  const { sym } = useParams()
  const { stocks, getStock } = useMarket()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [history, setHistory]   = useState([])
  const [search, setSearch]     = useState('')

  useEffect(() => {
    const target = sym ? getStock(sym) : stocks[0]
    if (target) setSelected(target)
  }, [sym, stocks])

  useEffect(() => {
    if (!selected) return
    setHistory(prev => {
      const next = [...prev, { price: selected.currentPrice, label: new Date().toLocaleTimeString('en-IN') }]
      return next.slice(-50)
    })
  }, [selected?.currentPrice])

  const handleSelect = (stock) => {
    setSelected(stock)
    setHistory([])
    navigate(`/market/${stock.symbol}`, { replace: true })
  }

  const addToWatchlist = async (symbol) => {
    try {
      await portfolioService.addWatch(symbol)
      toast.success(`${symbol} added to watchlist`)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Already in watchlist')
    }
  }

  const filtered = stocks.filter(s =>
    s.symbol.includes(search.toUpperCase()) ||
    s.companyName.toLowerCase().includes(search.toLowerCase())
  )

  const sentiment = selected ? getSentiment(selected.changePercent) : null

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      {/* ── Stock list ── */}
      <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search stocks..."
          style={{
            background: 'var(--bg3)', border: '1px solid #ffffff18',
            borderRadius: 8, padding: '9px 12px', color: 'var(--text)',
            fontSize: 13, outline: 'none', width: '100%',
          }}
        />
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => (
            <StockCard
              key={s.symbol} stock={s}
              selected={selected?.symbol === s.symbol}
              onClick={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* ── Detail panel ── */}
      {selected && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          {/* Header */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>{selected.symbol}</h2>
                <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 2 }}>
                  {selected.companyName} · NSE · {selected.sector}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                  background: sentiment.bg, color: sentiment.color, border: `1px solid ${sentiment.border}`,
                }}>
                  {sentiment.label}
                </span>
                <button onClick={() => addToWatchlist(selected.symbol)} style={{
                  background: '#4d9fff14', border: '1px solid #4d9fff40',
                  borderRadius: 6, padding: '4px 10px', color: 'var(--blue)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>
                  + Watchlist
                </button>
                <button onClick={() => navigate(`/trade/${selected.symbol}`)} style={{
                  background: 'var(--green)', border: 'none', borderRadius: 6,
                  padding: '6px 14px', color: '#000', fontSize: 12,
                  fontWeight: 700, cursor: 'pointer',
                }}>
                  Trade →
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 600 }}>
                {fmtINR(selected.currentPrice)}
              </span>
              <span className={`badge ${badgeClass(selected.changePercent)}`} style={{ fontSize: 13 }}>
                {fmtPct(selected.changePercent)}
              </span>
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 12 }}>
              Change: {fmtINR(selected.changeAmount ?? 0)} from previous close
            </div>
          </div>

          {/* Chart */}
          <div className="card">
            <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Price Chart — Live Session
            </div>
            <PriceChart data={history} height={220} />
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Day High',       value: fmtINR(selected.dayHigh),  color: 'var(--green)' },
              { label: 'Day Low',        value: fmtINR(selected.dayLow),   color: 'var(--red)' },
              { label: 'Prev Close',     value: fmtINR(selected.previousClose) },
              { label: 'Volume',         value: fmtK(selected.volume) },
              { label: '52W High',       value: fmtINR(selected.week52High) },
              { label: '52W Low',        value: fmtINR(selected.week52Low) },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: 'var(--bg3)', border: '1px solid #ffffff10',
                borderRadius: 8, padding: '10px 14px',
              }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 500, color: color || 'var(--text)' }}>
                  {value ?? '—'}
                </div>
              </div>
            ))}
          </div>

          {/* Range bar */}
          {selected.dayHigh && selected.dayLow && (
            <div className="card">
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, fontWeight: 600 }}>
                Day Range
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'monospace', width: 80 }}>
                  {fmtINR(selected.dayLow)}
                </span>
                <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 3, position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 3,
                    background: 'linear-gradient(90deg, var(--red), var(--green))',
                    width: `${Math.min(100, Math.max(0, ((selected.currentPrice - selected.dayLow) / (selected.dayHigh - selected.dayLow)) * 100))}%`,
                  }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'monospace', width: 80, textAlign: 'right' }}>
                  {fmtINR(selected.dayHigh)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
