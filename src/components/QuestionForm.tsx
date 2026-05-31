'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Question, QuestionOption, QuestionType } from '@/lib/types'
import { createQuestion, updateQuestion, getDistinctValues } from '@/lib/queries'
import ImageUpload from './ImageUpload'

type FormData = {
  type: QuestionType
  question_text: string
  correct_answer: string
  options: QuestionOption[]
  area: string
  subtopic: string
  institution: string
  year: string
  difficulty: number
  tags: string
  notes: string
  image_urls: string[]
}

const INITIAL: FormData = {
  type: 'multiple_choice',
  question_text: '',
  correct_answer: '',
  options: [
    { letter: 'A', text: '' }, { letter: 'B', text: '' }, { letter: 'C', text: '' },
    { letter: 'D', text: '' }, { letter: 'E', text: '' },
  ],
  area: '', subtopic: '', institution: '', year: '',
  difficulty: 3, tags: '', notes: '', image_urls: [],
}

export default function QuestionForm({ initial }: { initial?: Question }) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(() => {
    if (!initial) return INITIAL
    return {
      type: initial.type, question_text: initial.question_text,
      correct_answer: initial.correct_answer,
      options: initial.options || INITIAL.options,
      area: initial.area, subtopic: initial.subtopic || '',
      institution: initial.institution || '', year: initial.year?.toString() || '',
      difficulty: initial.difficulty, tags: (initial.tags || []).join(', '),
      notes: initial.notes || '',
      image_urls: initial.image_urls || [],
    }
  })
  const [areas, setAreas] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { getDistinctValues('area').then(setAreas) }, [])

  const set = (key: keyof FormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const setOption = (index: number, text: string) => {
    const options = [...form.options]
    options[index] = { ...options[index], text }
    set('options', options)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        type: form.type,
        question_text: form.question_text.trim(),
        correct_answer: form.correct_answer.trim(),
        options: form.type === 'multiple_choice' ? form.options : null,
        area: form.area.trim(),
        subtopic: form.subtopic.trim() || null,
        institution: form.institution.trim() || null,
        year: form.year ? parseInt(form.year) : null,
        difficulty: form.difficulty,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        notes: form.notes.trim() || null,
        image_urls: form.image_urls,
      }
      if (initial) {
        await updateQuestion(initial.id, payload)
        router.push(`/questoes/${initial.id}`)
      } else {
        const created = await createQuestion(payload)
        router.push(`/questoes/${created.id}`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar questão')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && <div className="ff-error-msg">{error}</div>}

      {/* Tipo */}
      <div className="ff-form-group">
        <label className="ff-label">Tipo</label>
        <div className="ff-type-toggle">
          {(['multiple_choice', 'open'] as QuestionType[]).map((t) => (
            <button
              key={t} type="button"
              onClick={() => set('type', t)}
              className={`ff-type-btn${form.type === t ? ' active' : ''}`}
            >
              {t === 'multiple_choice' ? 'Múltipla Escolha' : 'Dissertativa'}
            </button>
          ))}
        </div>
      </div>

      {/* Enunciado */}
      <div className="ff-form-group">
        <label className="ff-label">Enunciado *</label>
        <textarea
          required rows={4} className="ff-textarea"
          value={form.question_text}
          onChange={(e) => set('question_text', e.target.value)}
          placeholder="Digite o enunciado da questão..."
        />
      </div>

      {/* Imagens */}
      <div className="ff-form-group">
        <label className="ff-label">Imagens da questão</label>
        <ImageUpload
          urls={form.image_urls}
          onChange={(urls) => set('image_urls', urls)}
        />
      </div>

      {/* Alternativas */}
      {form.type === 'multiple_choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p className="ff-label">Alternativas</p>
          {form.options.map((opt, i) => (
            <div key={opt.letter} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--ink-500)', width: '16px', flexShrink: 0 }}>
                {opt.letter}
              </span>
              <input type="text" className="ff-input" value={opt.text}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`Alternativa ${opt.letter}`} />
            </div>
          ))}
          <div className="ff-form-group" style={{ marginTop: '4px' }}>
            <label className="ff-label">Gabarito *</label>
            <select required className="ff-select" value={form.correct_answer}
              onChange={(e) => set('correct_answer', e.target.value)}>
              <option value="">Selecione a resposta correta</option>
              {form.options.map((opt) => <option key={opt.letter} value={opt.letter}>{opt.letter}</option>)}
            </select>
          </div>
        </div>
      )}

      {form.type === 'open' && (
        <div className="ff-form-group">
          <label className="ff-label">Resposta esperada *</label>
          <textarea required rows={3} className="ff-textarea"
            value={form.correct_answer}
            onChange={(e) => set('correct_answer', e.target.value)}
            placeholder="Descreva a resposta esperada..." />
        </div>
      )}

      {/* Classificação */}
      <div className="ff-form-row ff-form-row-2">
        <div className="ff-form-group">
          <label className="ff-label">Área *</label>
          <input required list="areas-list" className="ff-input"
            value={form.area} onChange={(e) => set('area', e.target.value)}
            placeholder="ex: Ortopedia" />
          <datalist id="areas-list">
            {areas.map((a) => <option key={a} value={a} />)}
          </datalist>
        </div>
        <div className="ff-form-group">
          <label className="ff-label">Subtópico</label>
          <input className="ff-input" value={form.subtopic}
            onChange={(e) => set('subtopic', e.target.value)}
            placeholder="ex: Joelho" />
        </div>
        <div className="ff-form-group">
          <label className="ff-label">Instituição</label>
          <input className="ff-input" value={form.institution}
            onChange={(e) => set('institution', e.target.value)}
            placeholder="ex: UFMG" />
        </div>
        <div className="ff-form-group">
          <label className="ff-label">Ano</label>
          <input type="number" min={2000} max={2030} className="ff-input"
            value={form.year} onChange={(e) => set('year', e.target.value)}
            placeholder="ex: 2024" />
        </div>
        <div className="ff-form-group">
          <label className="ff-label">Dificuldade</label>
          <div className="ff-stars">
            {[1,2,3,4,5].map((d) => (
              <button key={d} type="button"
                className={`ff-star${d <= form.difficulty ? ' active' : ''}`}
                onClick={() => set('difficulty', d)}>★</button>
            ))}
          </div>
        </div>
        <div className="ff-form-group">
          <label className="ff-label">Tags (vírgula)</label>
          <input className="ff-input" value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="ex: ligamento, ortopédico" />
        </div>
      </div>

      {/* Anotação */}
      <div className="ff-form-group">
        <label className="ff-label">Anotação geral</label>
        <textarea rows={3} className="ff-textarea" value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Observações, macetes, links úteis..." />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" disabled={saving} className="ff-btn ff-btn-primary">
          {saving ? 'Salvando...' : initial ? 'Salvar alterações' : 'Cadastrar questão'}
        </button>
        <button type="button" onClick={() => router.back()} className="ff-btn ff-btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  )
}
