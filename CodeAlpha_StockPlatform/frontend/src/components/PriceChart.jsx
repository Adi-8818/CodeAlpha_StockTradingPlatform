import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { fmtINR, isUp } from '../utils/helpers'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid #ffffff20',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
    }}>
      <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>
        {fmtINR(payload[0].value)}
      </div>
      <div style={{ color: 'var(--text3)', fontSize: 10, marginTop: 2 }}>
        {payload[0].payload.label}
      </div>
    </div>
  )
}

export default function PriceChart({ data = [], height = 200, color }) {
  const resolvedColor = color || (data.length > 1 && data[data.length - 1]?.price >= data[0]?.price
    ? '#00c896' : '#ff4d6a')

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={resolvedColor} stopOpacity={0.15} />
            <stop offset="95%" stopColor={resolvedColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#5a6080' }}
          axisLine={false} tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#5a6080' }}
          axisLine={false} tickLine={false}
          tickFormatter={v => '₹' + v.toFixed(0)}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="price"
          stroke={resolvedColor}
          strokeWidth={2}
          fill="url(#priceGrad)"
          dot={false}
          activeDot={{ r: 4, fill: resolvedColor, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
