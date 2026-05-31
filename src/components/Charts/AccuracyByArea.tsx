'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

interface DataPoint {
  area: string
  accuracy: number
  total: number
}

interface Props {
  data: DataPoint[]
}

export default function AccuracyByArea({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">Sem dados ainda.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="area" tick={{ fontSize: 12 }} width={80} />
        <Tooltip
          formatter={(value, _name, props) =>
            [`${value}% (${(props.payload as DataPoint | undefined)?.total ?? 0} tent.)`, 'Acerto']
          }
        />
        <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.area}
              fill={entry.accuracy >= 70 ? '#22c55e' : entry.accuracy >= 50 ? '#f59e0b' : '#ef4444'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
