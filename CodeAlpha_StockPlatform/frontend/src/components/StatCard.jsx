export default function StatCard({ label, value, sub, valueColor, style }) {
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid #ffffff12',
      borderRadius: 8, padding: '12px 16px',
      ...style,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
      <div style={{
        fontFamily: 'monospace', fontSize: 16, fontWeight: 500,
        color: valueColor || 'var(--text)',
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}
