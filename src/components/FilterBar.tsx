'use client'

import { useEffect, useState } from 'react'
import { QuestionFilters, QuestionStatus } from '@/lib/types'
import { getDistinctValues, getSubtopicsForArea } from '@/lib/queries'

interface Props {
  filters: QuestionFilters
  onChange: (filters: QuestionFilters) => void
}

const STATUS_OPTIONS: { value: QuestionStatus | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'correct', label: '✓ Acertei' },
  { value: 'incorrect', label: '✗ Errei' },
  { value: 'unanswered', label: '— Não respondidas' },
]

export default function FilterBar({ filters, onChange }: Props) {
  const [areas, setAreas] = useState<string[]>([])
  const [subtopics, setSubtopics] = useState<string[]>([])
  const [institutions, setInstitutions] = useState<string[]>([])

  useEffect(() => {
    Promise.all([getDistinctValues('area'), getDistinctValues('institution')]).then(([a, i]) => {
      setAreas(a)
      setInstitutions(i)
    })
  }, [])

  useEffect(() => {
    if (filters.area) {
      getSubtopicsForArea(filters.area).then(setSubtopics)
    } else {
      setSubtopics([])
    }
  }, [filters.area])

  const set = (key: keyof QuestionFilters, value: unknown) => {
    const next = { ...filters, [key]: value || undefined }
    if (key === 'area') next.subtopic = undefined
    onChange(next)
  }

  const labelClass = 'block text-xs font-medium text-gray-600 mb-1'
  const selectClass =
    'w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none'

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <label className={labelClass}>Busca</label>
          <input
            type="text"
            placeholder="Buscar no enunciado..."
            value={filters.search || ''}
            onChange={(e) => set('search', e.target.value)}
            className={selectClass}
          />
        </div>

        <div>
          <label className={labelClass}>Área</label>
          <select value={filters.area || ''} onChange={(e) => set('area', e.target.value)} className={selectClass}>
            <option value="">Todas</option>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Subtópico</label>
          <select
            value={filters.subtopic || ''}
            onChange={(e) => set('subtopic', e.target.value)}
            disabled={!filters.area}
            className={selectClass}
          >
            <option value="">Todos</option>
            {subtopics.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Instituição</label>
          <select value={filters.institution || ''} onChange={(e) => set('institution', e.target.value)} className={selectClass}>
            <option value="">Todas</option>
            {institutions.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Dificuldade mín.</label>
          <select
            value={filters.difficulty || ''}
            onChange={(e) => set('difficulty', e.target.value ? Number(e.target.value) : undefined)}
            className={selectClass}
          >
            <option value="">Qualquer</option>
            {[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>{d}★+</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => set('status', e.target.value as QuestionStatus | '')}
            className={selectClass}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
