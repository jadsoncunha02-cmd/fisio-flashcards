'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

interface DataPoint {
  date: string
  accuracy: number
  label: string
}

interface Props {
  data: DataPoint[]
}

export default function ResultsEvolution({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="ff-empty">
        <p className="ff-empty-title">Nenhum resultado ainda</p>
        <p className="ff-empty-text">Cadastre seu primeiro resultado externo para ver a evolução.</p>
      </div>
    )
  }

  const avg = Math.round(data.reduce((s, d) => s + d.accuracy, 0) / data.length)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(29,31,33,0.08)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }} />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}
        />
        <Tooltip
          contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
          formatter={(v, _n, props) => [`${v}% — ${(props.payload as { label?: string } | undefined)?.label ?? ''}`, 'Acerto']}
        />
        <ReferenceLine y={avg} stroke="var(--brand)" strokeDasharray="4 3" label={{ value: `Média ${avg}%`, position: 'right', fontSize: 10, fill: 'var(--brand-text)', fontFamily: 'var(--font-mono)' }} />
        <Line
          type="monotone"
          dataKey="accuracy"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
