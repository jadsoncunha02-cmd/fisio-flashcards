'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createExternalResult } from '@/lib/queries'

type FormData = {
  banca: string
  institution: string
  total_questions: string
  correct_answers: string
  difficulty: number
  duration_minutes: string
  exam_date: string
  notes: string
}

const INITIAL: FormData = {
  banca: '', institution: '',
  total_questions: '', correct_answers: '',
  difficulty: 0,
  duration_minutes: '',
  exam_date: new Date().toISOString().split('T')[0],
  notes: '',
}

export default function NovoResultadoPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof FormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const total = parseInt(form.total_questions) || 0
  const correct = parseInt(form.correct_answers) || 0
  const pct = total > 0 ? Math.round((correct / total) * 100) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const totalN = parseInt(form.total_questions)
    const correctN = parseInt(form.correct_answers)
    if (isNaN(totalN) || totalN <= 0) { setError('Número de questões inválido.'); return }
    if (isNaN(correctN) || correctN < 0 || correctN > totalN) { setError('Acertos inválidos.'); return }
    setSaving(true)
    try {
      await createExternalResult({
        banca: form.banca.trim() || null,
        institution: form.institution.trim() || null,
        total_questions: totalN,
        correct_answers: correctN,
        difficulty: form.difficulty || null,
        duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
        exam_date: form.exam_date,
        notes: form.notes.trim() || null,
      })
      router.push('/resultados')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      setSaving(false)
    }
  }

  const pctColor = pct === null ? 'var(--ink-500)' : pct >= 70 ? 'var(--success-text)' : pct >= 50 ? 'var(--brand-text)' : 'var(--error-text)'

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <Link href="/resultados" className="ff-btn ff-btn-ghost ff-btn-sm">← Voltar</Link>
        <h1 className="ff-page-title" style={{ margin: 0 }}>Novo Resultado</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && <div className="ff-error-msg">{error}</div>}

        {/* Banca + Instituição */}
        <div className="ff-form-row ff-form-row-2">
          <div className="ff-form-group">
            <label className="ff-label">Banca</label>
            <input className="ff-input" value={form.banca}
              onChange={(e) => set('banca', e.target.value)}
              placeholder="ex: VUNESP, FUVEST" />
          </div>
          <div className="ff-form-group">
            <label className="ff-label">Instituição</label>
            <input className="ff-input" value={form.institution}
              onChange={(e) => set('institution', e.target.value)}
              placeholder="ex: UNICAMP, USP" />
          </div>
        </div>

        {/* Questões + Acertos com preview de % */}
        <div className="ff-form-row ff-form-row-2">
          <div className="ff-form-group">
            <label className="ff-label">Total de questões *</label>
            <input required type="number" min={1} className="ff-input"
              value={form.total_questions}
              onChange={(e) => set('total_questions', e.target.value)}
              placeholder="ex: 60" />
          </div>
          <div className="ff-form-group">
            <label className="ff-label">
              Acertos *
              {pct !== null && (
                <span style={{ marginLeft: '8px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: pctColor, textTransform: 'none', letterSpacing: 0 }}>
                  → {pct}%
                </span>
              )}
            </label>
            <input required type="number" min={0} max={total || 9999} className="ff-input"
              value={form.correct_answers}
              onChange={(e) => set('correct_answers', e.target.value)}
              placeholder="ex: 42" />
          </div>
        </div>

        {/* Data + Tempo */}
        <div className="ff-form-row ff-form-row-2">
          <div className="ff-form-group">
            <label className="ff-label">Data da prova *</label>
            <input required type="date" className="ff-input"
              value={form.exam_date}
              onChange={(e) => set('exam_date', e.target.value)} />
          </div>
          <div className="ff-form-group">
            <label className="ff-label">Duração (minutos)</label>
            <input type="number" min={1} className="ff-input"
              value={form.duration_minutes}
              onChange={(e) => set('duration_minutes', e.target.value)}
              placeholder="ex: 240" />
          </div>
        </div>

        {/* Dificuldade */}
        <div className="ff-form-group">
          <label className="ff-label">Nível de dificuldade</label>
          <div className="ff-stars" style={{ marginTop: '4px' }}>
            {[1,2,3,4,5].map((d) => (
              <button key={d} type="button"
                className={`ff-star${d <= form.difficulty ? ' active' : ''}`}
                onClick={() => set('difficulty', form.difficulty === d ? 0 : d)}
                style={{ fontSize: '26px' }}>★</button>
            ))}
            {form.difficulty > 0 && (
              <button type="button" onClick={() => set('difficulty', 0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--ink-500)', marginLeft: '8px', fontFamily: 'var(--font-mono)' }}>
                limpar
              </button>
            )}
          </div>
        </div>

        {/* Observações */}
        <div className="ff-form-group">
          <label className="ff-label">Observações</label>
          <textarea rows={3} className="ff-textarea" value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Contexto da prova, pontos de atenção, temas mais cobrados..." />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" disabled={saving} className="ff-btn ff-btn-primary">
            {saving ? 'Salvando...' : 'Salvar resultado'}
          </button>
          <Link href="/resultados" className="ff-btn ff-btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
