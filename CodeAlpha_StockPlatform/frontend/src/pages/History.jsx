import { useState, useEffect } from 'react'
import { tradeService } from '../services/marketService'
import { fmtINR, fmtDateTime, isUp } from '../utils/helpers'

export default function History() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all') 

  useEffect(() => {
    tradeService.history().then(({ data }) => {
      setTransactions(data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = transactions.filter(t =>
    filter === 'all' ? true : t.type.toLowerCase() === filter
  )

  const totalBought = transactions.filter(t => t.type === 'BUY').reduce((s, t) => s + t.totalAmount, 0)
  const totalSold   = transactions.filter(t => t.type === 'SELL').reduce((s, t) => s + t.totalAmount, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>Transaction History</h1>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Total Trades', value: transactions.length, mono: false },
          { label: 'Buy Orders',   value: transactions.filter(t => t.type === 'BUY').length, mono: false },
          { label: 'Total Bought', value: fmtINR(totalBought), color: 'var(--red)' },
          { label: 'Total Sold',   value: fmtINR(totalSold),   color: 'var(--green)' },
        ].map(({ label, value, color, mono }) => (
          <div key={label} style={{
            background: 'var(--bg3)', border: '1px solid #ffffff12',
            borderRadius: 8, padding: '12px 16px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 500, color: color || 'var(--text)' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {['all', 'buy', 'sell'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontFamily: 'Sora, sans-serif', fontSize: 12, fontWeight: 600,
            textTransform: 'capitalize',
            background: filter === f ? 'var(--blue)' : 'var(--bg3)',
            color: filter === f ? '#fff' : 'var(--text2)',
          }}>
            {f === 'all' ? 'All' : f === 'buy' ? 'Buy Orders' : 'Sell Orders'}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
          <div>No transactions yet</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid #ffffff12' }}>
                {['Type', 'Symbol', 'Qty', 'Price', 'Total Amount', 'Balance Impact', 'Timestamp'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text3)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => {
                const isBuy = tx.type === 'BUY'
                return (
                  <tr key={tx.transactionId}
                    style={{ borderBottom: '1px solid #ffffff08', transition: 'background .12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ffffff04'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: 7,
                        background: isBuy ? '#00c89618' : '#ff4d6a18',
                        color: isBuy ? 'var(--green)' : 'var(--red)',
                        fontWeight: 700, fontSize: 10,
                      }}>
                        {isBuy ? 'B' : 'S'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{tx.stockSymbol}</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace' }}>{tx.quantity}</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace' }}>{fmtINR(tx.price)}</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 600 }}>{fmtINR(tx.totalAmount)}</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: isBuy ? 'var(--red)' : 'var(--green)' }}>
                      {isBuy ? '−' : '+'}{fmtINR(tx.totalAmount)}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text3)' }}>{fmtDateTime(tx.timestamp)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
