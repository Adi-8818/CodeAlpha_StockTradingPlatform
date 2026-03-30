import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMarket } from '../context/MarketContext'
import { useAuth } from '../context/AuthContext'
import { tradeService, portfolioService } from '../services/marketService'
import { fmtINR, fmtPct, isUp, badgeClass, colorClass } from '../utils/helpers'
import PriceChart from '../components/PriceChart'
import toast from 'react-hot-toast'

export default function Trade() {
  const { sym } = useParams()
  const { stocks, getStock } = useMarket()
  const { updateBalance } = useAuth()
  const navigate = useNavigate()

  const [selected, setSelected]   = useState(null)
  const [tradeType, setTradeType] = useState('buy')
  const [qty, setQty]             = useState(1)
  const [loading, setLoading]     = useState(false)
  const [holding, setHolding]     = useState(null)
  const [history, setHistory]     = useState([])

  useEffect(() => {
    const s = sym ? getStock(sym) : stocks[0]
    if (s) setSelected(s)
  }, [sym, stocks])

  useEffect(() => {
    if (!selected) return
    setHistory(prev => {
      const next = [...prev, { price: selected.currentPrice, label: new Date().toLocaleTimeString('en-IN') }]
      return next.slice(-40)
    })
    
    portfolioService.get().then(({ data }) => {
      const h = data.find(p => p.stockSymbol === selected.symbol)
      setHolding(h || null)
    }).catch(() => {})
  }, [selected?.currentPrice])

  const cost = (qty || 0) * (selected?.currentPrice || 0)

  const execute = async () => {
    if (!qty || qty < 1) { toast.error('Enter a valid quantity'); return }
    setLoading(true)
    try {
      const svc = tradeType === 'buy' ? tradeService.buy : tradeService.sell
      const { data } = await svc({ symbol: selected.symbol, quantity: Number(qty) })
      toast.success(data.message)
      updateBalance(data.remainingBalance)
      setQty(1)
      
      portfolioService.get().then(({ data: pfData }) => {
        const h = pfData.find(p => p.stockSymbol === selected.symbol)
        setHolding(h || null)
      })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Trade failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      {/* ── Stock selector ── */}
      <div style={{ width: 220, flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
          Select Stock
        </div>
        {stocks.map(s => (
          <div key={s.symbol}
            onClick={() => { setSelected(s); setHistory([]); navigate(`/trade/${s.symbol}`, { replace: true }) }}
            style={{
              background: selected?.symbol === s.symbol ? '#4d9fff0e' : 'var(--bg3)',
              border: `1px solid ${selected?.symbol === s.symbol ? 'var(--blue)' : '#ffffff12'}`,
              borderRadius: 8, padding: '9px 12px', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'all .15s',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{s.symbol}</div>
              <div style={{ color: 'var(--text3)', fontSize: 10 }}>{s.sector}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 11 }}>{fmtINR(s.currentPrice)}</div>
              <div style={{ fontSize: 10, color: isUp(s.changePercent) ? 'var(--green)' : 'var(--red)', fontFamily: 'monospace' }}>
                {fmtPct(s.changePercent)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Trade panel ── */}
      {selected && (
        <div style={{ flex: 1, display: 'flex', gap: 14 }}>
          {/* Chart + info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{selected.symbol}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 11 }}>{selected.companyName}</div>
                </div>
                <span className={`badge ${badgeClass(selected.changePercent)}`} style={{ fontSize: 12 }}>
                  {fmtPct(selected.changePercent)}
                </span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 26, fontWeight: 600, color: isUp(selected.changePercent) ? 'var(--green)' : 'var(--red)' }}>
                {fmtINR(selected.currentPrice)}
              </div>
              <div style={{ marginTop: 12 }}>
                <PriceChart data={history} height={160} />
              </div>
            </div>

            {/* Holdings */}
            {holding && (
              <div className="card">
                <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                  Your Holdings
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Quantity',  value: `${holding.quantity} shares` },
                    { label: 'Avg Price', value: fmtINR(holding.avgPrice) },
                    { label: 'Invested',  value: fmtINR(holding.totalInvested) },
                    { label: 'Curr. Value', value: fmtINR(holding.currentValue) },
                    { label: 'P&L',
                      value: fmtINR(holding.profitLoss),
                      color: isUp(holding.profitLoss) ? 'var(--green)' : 'var(--red)'
                    },
                    { label: 'P&L %',
                      value: fmtPct(holding.profitLossPercent),
                      color: isUp(holding.profitLossPercent) ? 'var(--green)' : 'var(--red)'
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'var(--bg3)', borderRadius: 6, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 500, color: color || 'var(--text)' }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order form */}
          <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Buy / Sell tabs */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['buy', 'sell'].map(t => (
                <button key={t} onClick={() => setTradeType(t)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                  fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'all .15s', textTransform: 'uppercase',
                  background: tradeType === t
                    ? (t === 'buy' ? 'var(--green)' : 'var(--red)')
                    : (t === 'buy' ? '#00c89618' : '#ff4d6a18'),
                  color: tradeType === t ? '#000' : (t === 'buy' ? 'var(--green)' : 'var(--red)'),
                  border: `1px solid ${t === 'buy' ? '#00c89640' : '#ff4d6a40'}`,
                }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Order type badge */}
            <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text3)' }}>Order Type</span>
                <span style={{ color: 'var(--blue)', fontWeight: 600 }}>Market Order</span>
              </div>
            </div>

            {/* Qty input */}
            <div>
              <label style={{ fontSize: 11, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
                Quantity
              </label>
              <input
                type="number" min="1" value={qty}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '100%', background: 'var(--bg)', border: '1px solid #ffffff20',
                  borderRadius: 8, padding: '10px 12px', color: 'var(--text)',
                  fontFamily: 'monospace', fontSize: 15, outline: 'none',
                }}
              />
            </div>

            {/* Order summary */}
            <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Market Price', value: fmtINR(selected.currentPrice) },
                { label: 'Quantity',     value: qty },
                { label: 'Total Value',  value: fmtINR(cost),  bold: true },
                tradeType === 'buy'
                  ? { label: 'Holdings after', value: `${(holding?.quantity || 0) + Number(qty)} shares` }
                  : { label: 'Holdings after', value: `${Math.max(0, (holding?.quantity || 0) - Number(qty))} shares` },
              ].map(({ label, value, bold }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text2)' }}>{label}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: bold ? 600 : 400 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Execute button */}
            <button
              onClick={execute}
              disabled={loading}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 8, border: 'none',
                background: tradeType === 'buy' ? 'var(--green)' : 'var(--red)',
                color: tradeType === 'buy' ? '#000' : '#fff',
                fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Sora, sans-serif', opacity: loading ? .6 : 1, transition: 'opacity .15s',
                textTransform: 'uppercase', letterSpacing: '.04em',
              }}
            >
              {loading ? 'Executing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selected.symbol}`}
            </button>

            {tradeType === 'sell' && !holding && (
              <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
                You don't hold any {selected.symbol} shares
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
