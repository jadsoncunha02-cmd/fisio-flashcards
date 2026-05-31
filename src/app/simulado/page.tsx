'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { QuestionFilters, QuestionWithStatus } from '@/lib/types'
import { getQuestions, createAttempt, getDistinctValues } from '@/lib/queries'
import { shuffleArray } from '@/lib/utils'

type Phase = 'config' | 'running' | 'summary'

export default function SimuladoPage() {
  const [phase, setPhase] = useState<Phase>('config')
  const [areas, setAreas] = useState<string[]>([])
  const [filters, setFilters] = useState<QuestionFilters>({})
  const [maxQuestions, setMaxQuestions] = useState('10')
  const [questions, setQuestions] = useState<QuestionWithStatus[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [openAnswer, setOpenAnswer] = useState('')
  const [selfEval, setSelfEval] = useState<boolean | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([])

  useEffect(() => { getDistinctValues('area').then(setAreas) }, [])

  const resetAnswer = () => { setSelectedAnswer(''); setOpenAnswer(''); setSelfEval(null); setConfirmed(false) }

  const handleStart = async () => {
    const all = await getQuestions(filters)
    const shuffled = shuffleArray(all)
    const limit = maxQuestions ? parseInt(maxQuestions) : shuffled.length
    setQuestions(shuffled.slice(0, limit))
    setCurrentIndex(0); setResults([]); setPhase('running'); resetAnswer()
  }

  const currentQuestion = questions[currentIndex]
  const correctCount = results.filter((r) => r.correct).length

  const handleConfirm = async () => {
    if (!currentQuestion) return
    if (currentQuestion.type === 'multiple_choice') {
      const isCorrect = selectedAnswer === currentQuestion.correct_answer
      await createAttempt({ question_id: currentQuestion.id, is_correct: isCorrect, answer_given: selectedAnswer })
      setResults((prev) => [...prev, { id: currentQuestion.id, correct: isCorrect }])
    }
    setConfirmed(true)
  }

  const handleNext = async () => {
    if (!currentQuestion) return
    if (currentQuestion.type === 'open') {
      const isCorrect = selfEval === true
      await createAttempt({ question_id: currentQuestion.id, is_correct: isCorrect, answer_given: openAnswer || null })
      setResults((prev) => [...prev, { id: currentQuestion.id, correct: isCorrect }])
    }
    if (currentIndex + 1 >= questions.length) setPhase('summary')
    else { setCurrentIndex(currentIndex + 1); resetAnswer() }
  }

  // ── Config ──
  if (phase === 'config') return (
    <div style={{ maxWidth: '480px' }}>
      <h1 className="ff-page-title" style={{ marginBottom: '24px' }}>Simulado</h1>
      <div className="ff-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="ff-form-group">
          <label className="ff-label">Área</label>
          <select className="ff-select" value={filters.area || ''}
            onChange={(e) => setFilters({ ...filters, area: e.target.value || undefined, subtopic: undefined })}>
            <option value="">Todas</option>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="ff-form-group">
          <label className="ff-label">Dificuldade mínima</label>
          <select className="ff-select" value={filters.difficulty || ''}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value ? Number(e.target.value) : undefined })}>
            <option value="">Qualquer</option>
            {[1,2,3,4,5].map((d) => <option key={d} value={d}>{d}★+</option>)}
          </select>
        </div>
        <div className="ff-form-group">
          <label className="ff-label">Status</label>
          <select className="ff-select" value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: (e.target.value as QuestionFilters['status']) || undefined })}>
            <option value="">Todas as questões</option>
            <option value="incorrect">Só as que errei</option>
            <option value="unanswered">Só as não respondidas</option>
            <option value="correct">Só as que acertei</option>
          </select>
        </div>
        <div className="ff-form-group">
          <label className="ff-label">Número de questões</label>
          <input type="number" min={1} max={200} className="ff-input"
            value={maxQuestions} onChange={(e) => setMaxQuestions(e.target.value)}
            placeholder="Todas" />
        </div>
        <button onClick={handleStart} className="ff-btn ff-btn-primary ff-btn-block ff-btn-lg">
          Iniciar simulado
        </button>
      </div>
    </div>
  )

  // ── Summary ──
  if (phase === 'summary') {
    const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0
    const pctColor = accuracy >= 70 ? 'var(--success-text)' : accuracy >= 50 ? 'var(--brand-text)' : 'var(--error-text)'
    const wrongIds = results.filter((r) => !r.correct).map((r) => r.id)
    const wrongQuestions = questions.filter((q) => wrongIds.includes(q.id))
    return (
      <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1 className="ff-page-title">Resultado</h1>
        <div className="ff-card" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ fontFamily: 'var(--font-brand)', fontSize: '52px', fontWeight: 700, color: pctColor, lineHeight: 1, margin: '0 0 8px 0' }}>
            {accuracy}%
          </p>
          <p style={{ color: 'var(--ink-500)', fontSize: '14px', margin: 0 }}>
            {correctCount} acertos de {results.length} questões
          </p>
        </div>
        {wrongQuestions.length > 0 && (
          <div className="ff-card">
            <p className="ff-section-title">Questões erradas</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {wrongQuestions.map((q) => (
                <Link key={q.id} href={`/questoes/${q.id}`}
                  style={{ fontSize: '12px', color: 'var(--ink-700)', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', textDecoration: 'none', display: 'block' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--error-soft)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}>
                  {q.question_text.slice(0, 90)}...
                </Link>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { setPhase('config'); resetAnswer() }} className="ff-btn ff-btn-primary" style={{ flex: 1 }}>
            Novo simulado
          </button>
          <Link href="/" className="ff-btn ff-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            Ver dashboard
          </Link>
        </div>
      </div>
    )
  }

  // ── Running ──
  if (!currentQuestion) return null
  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
          <span>Questão {currentIndex + 1} de {questions.length}</span>
          <span>{correctCount} acertos</span>
        </div>
        <div className="ff-progress-wrap">
          <div className="ff-progress-bar" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="ff-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <span className="ff-pill ff-pill-blue">{currentQuestion.area}</span>
          {currentQuestion.subtopic && <span className="ff-pill ff-pill-indigo">{currentQuestion.subtopic}</span>}
        </div>

        <p style={{ fontSize: '14px', color: 'var(--ink-900)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>
          {currentQuestion.question_text}
        </p>

        {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedAnswer === opt.letter
              const isCorrect = opt.letter === currentQuestion.correct_answer
              let cls = 'ff-option'
              if (confirmed) {
                cls += ' disabled'
                if (isCorrect) cls += ' correct'
                else if (isSelected) cls += ' incorrect'
              } else {
                if (isSelected) cls += ' selected'
              }
              return (
                <div key={opt.letter} className={cls} onClick={() => !confirmed && setSelectedAnswer(opt.letter)}>
                  <span className="ff-option-letter">{opt.letter}.</span>
                  <span>{opt.text}</span>
                </div>
              )
            })}
          </div>
        )}

        {currentQuestion.type === 'open' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea rows={3} disabled={confirmed} value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
              className="ff-textarea" placeholder="Sua resposta..." />
            {confirmed && (
              <div className="ff-answer-box">
                <p className="ff-answer-box-label">Gabarito</p>
                <p className="ff-answer-box-text">{currentQuestion.correct_answer}</p>
              </div>
            )}
          </div>
        )}

        {currentQuestion.type === 'open' && confirmed && (
          <div className="ff-eval-row">
            <button onClick={() => setSelfEval(true)}
              className={`ff-eval-btn ff-eval-correct${selfEval === true ? ' selected' : ''}`}>
              ✓ Acertei
            </button>
            <button onClick={() => setSelfEval(false)}
              className={`ff-eval-btn ff-eval-incorrect${selfEval === false ? ' selected' : ''}`}>
              ✗ Errei
            </button>
          </div>
        )}
      </div>

      {!confirmed ? (
        <button onClick={handleConfirm}
          disabled={currentQuestion.type === 'multiple_choice' && !selectedAnswer}
          className="ff-btn ff-btn-primary ff-btn-block ff-btn-lg">
          Confirmar resposta
        </button>
      ) : (
        <button onClick={handleNext}
          disabled={currentQuestion.type === 'open' && selfEval === null}
          className="ff-btn ff-btn-primary ff-btn-block ff-btn-lg">
          {currentIndex + 1 < questions.length ? 'Próxima →' : 'Ver resultado'}
        </button>
      )}
    </div>
  )
}
