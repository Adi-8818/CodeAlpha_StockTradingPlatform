import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMarket } from '../context/MarketContext'
import { portfolioService } from '../services/marketService'
import { fmtINR, fmtPct, isUp, badgeClass } from '../utils/helpers'
import toast from 'react-hot-toast'
import { X, Plus } from 'lucide-react'

export default function Watchlist() {
  const { stocks, getStock } = useMarket()
  const navigate = useNavigate()
  const [watchlist, setWatchlist] = useState([])
  const [showAdd, setShowAdd]     = useState(false)

  const load = () => portfolioService.watchlist()
    .then(({ data }) => setWatchlist(data))
    .catch(() => {})

  useEffect(() => { load() }, [])

  const remove = async (symbol) => {
    try {
      await portfolioService.removeWatch(symbol)
      setWatchlist(prev => prev.filter(w => w.stockSymbol !== symbol))
      toast.success(`${symbol} removed`)
    } catch { toast.error('Failed to remove') }
  }

  const add = async (symbol) => {
    try {
      await portfolioService.addWatch(symbol)
      load()
      setShowAdd(false)
      toast.success(`${symbol} added to watchlist`)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Already in watchlist')
    }
  }

  const watchedSymbols = watchlist.map(w => w.stockSymbol)
  const enriched = watchlist.map(w => ({ ...w, stock: getStock(w.stockSymbol) })).filter(w => w.stock)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Watchlist</h1>
        <button onClick={() => setShowAdd(v => !v)} style={{
          background: 'var(--blue)', border: 'none', borderRadius: 8,
          padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Plus size={14} /> Add Stock
        </button>
      </div>

      {/* Add stock panel */}
      {showAdd && (
        <div className="card slide-in">
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, fontWeight: 600 }}>
            Add to Watchlist
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {stocks.filter(s => !watchedSymbols.includes(s.symbol)).map(s => (
              <button key={s.symbol} onClick={() => add(s.symbol)} style={{
                background: 'var(--bg3)', border: '1px solid #ffffff18',
                borderRadius: 7, padding: '6px 12px', color: 'var(--text)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {s.symbol}
                <span style={{ color: isUp(s.changePercent) ? 'var(--green)' : 'var(--red)', fontFamily: 'monospace', fontSize: 10 }}>
                  {fmtPct(s.changePercent)}
                </span>
              </button>
            ))}
            {stocks.filter(s => !watchedSymbols.includes(s.symbol)).length === 0 && (
              <span style={{ color: 'var(--text3)', fontSize: 13 }}>All stocks are already in your watchlist</span>
            )}
          </div>
        </div>
      )}

      {/* Watchlist table */}
      {enriched.length === 0 && !showAdd ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👁</div>
          <div>Your watchlist is empty.</div>
          <button onClick={() => setShowAdd(true)} style={{
            marginTop: 12, background: 'var(--blue)', border: 'none', borderRadius: 8,
            padding: '8px 20px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Add your first stock
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {enriched.map(({ stock, watchlistId }) => (
            <div key={watchlistId}
              style={{
                background: 'var(--bg2)', border: '1px solid #ffffff12',
                borderRadius: 10, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                transition: 'all .15s',
              }}
              onClick={() => navigate(`/market/${stock.symbol}`)}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#ffffff25'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#ffffff12'}
            >
              {/* Sparkline strip */}
              <div style={{
                width: 4, height: 40, borderRadius: 2,
                background: isUp(stock.changePercent) ? 'var(--green)' : 'var(--red)',
              }} />

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{stock.symbol}</div>
                <div style={{ color: 'var(--text2)', fontSize: 11, marginTop: 2 }}>{stock.companyName}</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>High</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--green)' }}>{fmtINR(stock.dayHigh)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>Low</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--red)' }}>{fmtINR(stock.dayLow)}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 500 }}>
                  {fmtINR(stock.currentPrice)}
                </div>
                <span className={`badge ${badgeClass(stock.changePercent)}`} style={{ marginTop: 4 }}>
                  {fmtPct(stock.changePercent)}
                </span>
              </div>

              <button onClick={e => { e.stopPropagation(); navigate(`/trade/${stock.symbol}`) }} style={{
                background: 'var(--green)', border: 'none', borderRadius: 7,
                padding: '6px 14px', color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>
                Trade
              </button>

              <button onClick={e => { e.stopPropagation(); remove(stock.symbol) }} style={{
                background: 'none', border: '1px solid #ff4d6a30', borderRadius: 6,
                padding: '6px 8px', color: 'var(--red)', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
