'use client'

import { useEffect, useState } from 'react'
import { QuestionFilters, QuestionStatus } from '@/lib/types'
import { getDistinctValues, getSubtopicsForArea } from '@/lib/queries'
import CustomSelect from './CustomSelect'

interface Props {
  filters: QuestionFilters
  onChange: (filters: QuestionFilters) => void
}

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

  const areaOptions = [{ value: '', label: 'Todas' }, ...areas.map((a) => ({ value: a, label: a }))]
  const subtopicOptions = [{ value: '', label: 'Todos' }, ...subtopics.map((s) => ({ value: s, label: s }))]
  const institutionOptions = [{ value: '', label: 'Todas' }, ...institutions.map((i) => ({ value: i, label: i }))]
  const diffOptions = [
    { value: '', label: 'Qualquer' },
    ...([1,2,3,4,5].map((d) => ({ value: String(d), label: `${d}★+` }))),
  ]
  const statusOptions: { value: QuestionStatus | ''; label: string }[] = [
    { value: '', label: 'Todas' },
    { value: 'correct', label: '✓ Acertei' },
    { value: 'incorrect', label: '✗ Errei' },
    { value: 'unanswered', label: '— Não respondidas' },
  ]

  return (
    <div className="ff-filter-bar">
      <div className="ff-filter-grid">
        <div className="ff-form-group">
          <label className="ff-label">Busca</label>
          <input type="text" className="ff-input" placeholder="Buscar no enunciado..."
            value={filters.search || ''} onChange={(e) => set('search', e.target.value)} />
        </div>

        <div className="ff-form-group">
          <label className="ff-label">Área</label>
          <CustomSelect
            value={filters.area || ''}
            options={areaOptions}
            onChange={(v) => set('area', v)}
          />
        </div>

        <div className="ff-form-group">
          <label className="ff-label">Subtópico</label>
          <CustomSelect
            value={filters.subtopic || ''}
            options={subtopicOptions}
            onChange={(v) => set('subtopic', v)}
            disabled={!filters.area}
          />
        </div>

        <div className="ff-form-group">
          <label className="ff-label">Instituição</label>
          <CustomSelect
            value={filters.institution || ''}
            options={institutionOptions}
            onChange={(v) => set('institution', v)}
          />
        </div>

        <div className="ff-form-group">
          <label className="ff-label">Dificuldade mín.</label>
          <CustomSelect
            value={filters.difficulty ? String(filters.difficulty) : ''}
            options={diffOptions}
            onChange={(v) => set('difficulty', v ? Number(v) : undefined)}
          />
        </div>

        <div className="ff-form-group">
          <label className="ff-label">Status</label>
          <CustomSelect
            value={filters.status || ''}
            options={statusOptions as { value: string; label: string }[]}
            onChange={(v) => set('status', v as QuestionStatus | '')}
          />
        </div>
      </div>
    </div>
  )
}
