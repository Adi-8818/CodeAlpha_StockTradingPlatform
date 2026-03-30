import { useNavigate } from 'react-router-dom'
import { fmtINR, fmtPct, fmtK, isUp, badgeClass, getSentiment } from '../utils/helpers'

export default function StockCard({ stock, selected, onClick }) {
  const navigate = useNavigate()
  const up = isUp(stock.changePercent)
  const sentiment = getSentiment(stock.changePercent)

  return (
    <div
      onClick={() => onClick ? onClick(stock) : navigate(`/trade/${stock.symbol}`)}
      style={{
        background: selected ? '#4d9fff0e' : 'var(--bg3)',
        border: `1px solid ${selected ? 'var(--blue)' : '#ffffff12'}`,
        borderRadius: 10, padding: 14, cursor: 'pointer',
        transition: 'all .18s',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = '#ffffff28' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = '#ffffff12' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{stock.symbol}</div>
          <div style={{ color: 'var(--text3)', fontSize: 10, marginTop: 2 }}>{stock.companyName}</div>
        </div>
        <span className={`badge ${badgeClass(stock.changePercent)}`}>
          {fmtPct(stock.changePercent)}
        </span>
      </div>

      <div style={{ fontFamily: 'monospace', fontSize: 17, fontWeight: 500, marginBottom: 6 }}>
        {fmtINR(stock.currentPrice)}
      </div>

      {/* Mini sparkline placeholder */}
      <div style={{
        height: 2, borderRadius: 1, marginBottom: 8,
        background: up ? 'var(--green)' : 'var(--red)', opacity: .5,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>
          Vol: {fmtK(stock.volume)} · {stock.sector}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
          background: sentiment.bg, color: sentiment.color, border: `1px solid ${sentiment.border}`,
        }}>
          {sentiment.label}
        </span>
      </div>
    </div>
  )
}
