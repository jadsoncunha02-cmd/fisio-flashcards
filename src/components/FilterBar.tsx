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
    if (filters.area) getSubtopicsForArea(filters.area).then(setSubtopics)
    else setSubtopics([])
  }, [filters.area])

  const set = (key: keyof QuestionFilters, value: unknown) => {
    const next = { ...filters, [key]: value || undefined }
    if (key === 'area') next.subtopic = undefined
    onChange(next)
  }

  return (
    <div className="ff-filter-bar">
      <div className="ff-filter-grid">
        <div className="ff-form-group">
          <label className="ff-label">Busca</label>
          <input
            type="text"
            className="ff-input"
            placeholder="Buscar no enunciado..."
            value={filters.search || ''}
            onChange={(e) => set('search', e.target.value)}
          />
        </div>

        <div className="ff-form-group">
          <label className="ff-label">Área</label>
          <select className="ff-select" value={filters.area || ''} onChange={(e) => set('area', e.target.value)}>
            <option value="">Todas</option>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="ff-form-group">
          <label className="ff-label">Subtópico</label>
          <select
            className="ff-select"
            value={filters.subtopic || ''}
            onChange={(e) => set('subtopic', e.target.value)}
            disabled={!filters.area}
          >
            <option value="">Todos</option>
            {subtopics.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="ff-form-group">
          <label className="ff-label">Instituição</label>
          <select className="ff-select" value={filters.institution || ''} onChange={(e) => set('institution', e.target.value)}>
            <option value="">Todas</option>
            {institutions.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div className="ff-form-group">
          <label className="ff-label">Dificuldade mín.</label>
          <select
            className="ff-select"
            value={filters.difficulty || ''}
            onChange={(e) => set('difficulty', e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Qualquer</option>
            {[1,2,3,4,5].map((d) => <option key={d} value={d}>{d}★+</option>)}
          </select>
        </div>

        <div className="ff-form-group">
          <label className="ff-label">Status</label>
          <select
            className="ff-select"
            value={filters.status || ''}
            onChange={(e) => set('status', e.target.value as QuestionStatus | '')}
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
