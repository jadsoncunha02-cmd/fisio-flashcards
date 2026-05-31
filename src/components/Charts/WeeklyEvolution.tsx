'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  week: string
  accuracy: number
}

function formatWeek(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function WeeklyEvolution({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--ink-500)', fontSize: '13px', padding: '32px 0' }}>Sem dados ainda.</p>
  }

  const formatted = data.map((d) => ({ ...d, week: formatWeek(d.week) }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={formatted} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(29,31,33,0.07)" />
        <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', boxShadow: 'none' }}
          formatter={(v) => [`${v}%`, 'Acerto']}
        />
        <Line
          type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={1.5}
          dot={{ r: 3, fill: '#3B82F6', strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
