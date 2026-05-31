'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  area: string
  accuracy: number
  total: number
}

export default function AccuracyByArea({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--ink-500)', fontSize: '13px', padding: '32px 0' }}>Sem dados ainda.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(29,31,33,0.07)" />
        <XAxis
          type="number" domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          type="category" dataKey="area" width={110}
          tick={{ fontSize: 12, fill: 'var(--ink-700)' }}
          axisLine={false} tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(29,31,33,0.04)' }}
          contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', boxShadow: 'none' }}
          formatter={(value, _n, props) =>
            [`${value}% (${(props.payload as DataPoint | undefined)?.total ?? 0} tentativas)`, 'Acerto']
          }
        />
        <Bar dataKey="accuracy" fill="#3B82F6" radius={[0, 4, 4, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}
