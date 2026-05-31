'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Question, QuestionOption, QuestionType } from '@/lib/types'
import { createQuestion, updateQuestion, getDistinctValues } from '@/lib/queries'

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
}

const INITIAL: FormData = {
  type: 'multiple_choice',
  question_text: '',
  correct_answer: '',
  options: [
    { letter: 'A', text: '' },
    { letter: 'B', text: '' },
    { letter: 'C', text: '' },
    { letter: 'D', text: '' },
    { letter: 'E', text: '' },
  ],
  area: '',
  subtopic: '',
  institution: '',
  year: '',
  difficulty: 3,
  tags: '',
  notes: '',
}

interface Props {
  initial?: Question
}

export default function QuestionForm({ initial }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(() => {
    if (!initial) return INITIAL
    return {
      type: initial.type,
      question_text: initial.question_text,
      correct_answer: initial.correct_answer,
      options: initial.options || INITIAL.options,
      area: initial.area,
      subtopic: initial.subtopic || '',
      institution: initial.institution || '',
      year: initial.year?.toString() || '',
      difficulty: initial.difficulty,
      tags: (initial.tags || []).join(', '),
      notes: initial.notes || '',
    }
  })
  const [areas, setAreas] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getDistinctValues('area').then(setAreas)
  }, [])

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

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Tipo</label>
        <div className="flex gap-2">
          {(['multiple_choice', 'open'] as QuestionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('type', t)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                form.type === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t === 'multiple_choice' ? 'Múltipla Escolha' : 'Dissertativa'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Enunciado *</label>
        <textarea
          required
          rows={4}
          value={form.question_text}
          onChange={(e) => set('question_text', e.target.value)}
          className={inputClass}
          placeholder="Digite o enunciado da questão..."
        />
      </div>

      {form.type === 'multiple_choice' && (
        <div className="space-y-2">
          <label className={labelClass}>Alternativas</label>
          {form.options.map((opt, i) => (
            <div key={opt.letter} className="flex gap-2 items-center">
              <span className="w-6 font-bold text-gray-600">{opt.letter}</span>
              <input
                type="text"
                value={opt.text}
                onChange={(e) => setOption(i, e.target.value)}
                className={inputClass}
                placeholder={`Alternativa ${opt.letter}`}
              />
            </div>
          ))}
          <div>
            <label className={labelClass}>Gabarito *</label>
            <select
              required
              value={form.correct_answer}
              onChange={(e) => set('correct_answer', e.target.value)}
              className={inputClass}
            >
              <option value="">Selecione a resposta correta</option>
              {form.options.map((opt) => (
                <option key={opt.letter} value={opt.letter}>{opt.letter}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {form.type === 'open' && (
        <div>
          <label className={labelClass}>Resposta esperada *</label>
          <textarea
            required
            rows={3}
            value={form.correct_answer}
            onChange={(e) => set('correct_answer', e.target.value)}
            className={inputClass}
            placeholder="Descreva a resposta esperada..."
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Área *</label>
          <input
            required
            list="areas-list"
            value={form.area}
            onChange={(e) => set('area', e.target.value)}
            className={inputClass}
            placeholder="ex: Ortopedia"
          />
          <datalist id="areas-list">
            {areas.map((a) => <option key={a} value={a} />)}
          </datalist>
        </div>

        <div>
          <label className={labelClass}>Subtópico</label>
          <input
            value={form.subtopic}
            onChange={(e) => set('subtopic', e.target.value)}
            className={inputClass}
            placeholder="ex: Joelho"
          />
        </div>

        <div>
          <label className={labelClass}>Instituição</label>
          <input
            value={form.institution}
            onChange={(e) => set('institution', e.target.value)}
            className={inputClass}
            placeholder="ex: UFMG"
          />
        </div>

        <div>
          <label className={labelClass}>Ano</label>
          <input
            type="number"
            min={2000}
            max={2030}
            value={form.year}
            onChange={(e) => set('year', e.target.value)}
            className={inputClass}
            placeholder="ex: 2024"
          />
        </div>

        <div>
          <label className={labelClass}>Dificuldade</label>
          <div className="flex gap-2 mt-1">
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => set('difficulty', d)}
                className={`text-xl transition-colors ${
                  d <= form.difficulty ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Tags (separadas por vírgula)</label>
          <input
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
            className={inputClass}
            placeholder="ex: ligamento, teste ortopédico"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Anotação geral</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          className={inputClass}
          placeholder="Observações, macetes, links úteis..."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Salvando...' : initial ? 'Salvar alterações' : 'Cadastrar questão'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg bg-gray-100 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
