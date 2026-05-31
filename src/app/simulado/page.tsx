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
  const [maxQuestions, setMaxQuestions] = useState<string>('10')

  const [questions, setQuestions] = useState<QuestionWithStatus[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [openAnswer, setOpenAnswer] = useState('')
  const [selfEval, setSelfEval] = useState<boolean | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([])

  useEffect(() => {
    getDistinctValues('area').then(setAreas)
  }, [])

  const handleStart = async () => {
    const all = await getQuestions(filters)
    const shuffled = shuffleArray(all)
    const limit = maxQuestions ? parseInt(maxQuestions) : shuffled.length
    setQuestions(shuffled.slice(0, limit))
    setCurrentIndex(0)
    setResults([])
    setPhase('running')
    resetAnswer()
  }

  const resetAnswer = () => {
    setSelectedAnswer('')
    setOpenAnswer('')
    setSelfEval(null)
    setConfirmed(false)
  }

  const currentQuestion = questions[currentIndex]

  const handleConfirm = async () => {
    if (!currentQuestion) return
    if (currentQuestion.type === 'multiple_choice') {
      const isCorrect = selectedAnswer === currentQuestion.correct_answer
      await createAttempt({
        question_id: currentQuestion.id,
        is_correct: isCorrect,
        answer_given: selectedAnswer,
      })
      setResults((prev) => [...prev, { id: currentQuestion.id, correct: isCorrect }])
    }
    setConfirmed(true)
  }

  const handleNext = async () => {
    if (!currentQuestion) return
    if (currentQuestion.type === 'open') {
      const isCorrect = selfEval === true
      await createAttempt({
        question_id: currentQuestion.id,
        is_correct: isCorrect,
        answer_given: openAnswer || null,
      })
      setResults((prev) => [...prev, { id: currentQuestion.id, correct: isCorrect }])
    }
    if (currentIndex + 1 >= questions.length) {
      setPhase('summary')
    } else {
      setCurrentIndex(currentIndex + 1)
      resetAnswer()
    }
  }

  const correctCount = results.filter((r) => r.correct).length

  const selectClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  if (phase === 'config') {
    return (
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Simulado</h1>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <label className={labelClass}>Área</label>
            <select
              value={filters.area || ''}
              onChange={(e) =>
                setFilters({ ...filters, area: e.target.value || undefined, subtopic: undefined })
              }
              className={selectClass}
            >
              <option value="">Todas</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Dificuldade mínima</label>
            <select
              value={filters.difficulty || ''}
              onChange={(e) =>
                setFilters({ ...filters, difficulty: e.target.value ? Number(e.target.value) : undefined })
              }
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
              onChange={(e) =>
                setFilters({ ...filters, status: (e.target.value as QuestionFilters['status']) || undefined })
              }
              className={selectClass}
            >
              <option value="">Todas</option>
              <option value="incorrect">Só as que errei</option>
              <option value="unanswered">Só as não respondidas</option>
              <option value="correct">Só as que acertei</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Nº de questões</label>
            <input
              type="number"
              min={1}
              max={200}
              value={maxQuestions}
              onChange={(e) => setMaxQuestions(e.target.value)}
              className={selectClass}
              placeholder="Deixe em branco para todas"
            />
          </div>
          <button
            onClick={handleStart}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Iniciar simulado
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'summary') {
    const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0
    const wrongIds = results.filter((r) => !r.correct).map((r) => r.id)
    const wrongQuestions = questions.filter((q) => wrongIds.includes(q.id))

    return (
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Resultado</h1>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-center space-y-3">
          <p className="text-4xl font-bold text-blue-700">{accuracy}%</p>
          <p className="text-gray-600">
            {correctCount} acertos de {results.length} questões
          </p>
        </div>

        {wrongQuestions.length > 0 && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 space-y-2">
            <h2 className="text-sm font-semibold text-red-800">Questões erradas:</h2>
            {wrongQuestions.map((q) => (
              <Link
                key={q.id}
                href={`/questoes/${q.id}`}
                className="block rounded border border-red-200 bg-white p-2 text-xs text-gray-700 hover:border-red-400"
              >
                {q.question_text.slice(0, 80)}...
              </Link>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => { setPhase('config'); resetAnswer() }}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Novo simulado
          </button>
          <Link
            href="/"
            className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-center text-gray-700 hover:bg-gray-200"
          >
            Ver dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Questão {currentIndex + 1} de {questions.length}</span>
          <span>{correctCount} acertos até agora</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 font-medium">
            {currentQuestion.area}
          </span>
          {currentQuestion.subtopic && (
            <span className="rounded-full bg-indigo-100 text-indigo-800 px-2.5 py-0.5">
              {currentQuestion.subtopic}
            </span>
          )}
        </div>

        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {currentQuestion.question_text}
        </p>

        {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
          <div className="space-y-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedAnswer === opt.letter
              const isCorrect = opt.letter === currentQuestion.correct_answer
              let cls =
                'flex gap-3 rounded-md border p-3 text-sm transition-colors'
              if (!confirmed) {
                cls += isSelected
                  ? ' border-blue-400 bg-blue-50 cursor-pointer'
                  : ' border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
              } else {
                if (isCorrect) cls += ' border-green-400 bg-green-50'
                else if (isSelected) cls += ' border-red-400 bg-red-50'
                else cls += ' border-gray-200'
              }
              return (
                <div
                  key={opt.letter}
                  className={cls}
                  onClick={() => !confirmed && setSelectedAnswer(opt.letter)}
                >
                  <span className="font-bold text-gray-600">{opt.letter}.</span>
                  <span>{opt.text}</span>
                </div>
              )
            })}
          </div>
        )}

        {currentQuestion.type === 'open' && (
          <div className="space-y-3">
            <textarea
              rows={3}
              disabled={confirmed}
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none disabled:bg-gray-50"
              placeholder="Sua resposta..."
            />
            {confirmed && (
              <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                <p className="text-sm font-semibold text-blue-800 mb-1">Gabarito:</p>
                <p className="text-sm text-blue-700">{currentQuestion.correct_answer}</p>
              </div>
            )}
          </div>
        )}

        {currentQuestion.type === 'open' && confirmed && (
          <div className="flex gap-3">
            <button
              onClick={() => setSelfEval(true)}
              className={`flex-1 rounded-md py-2 text-sm font-medium ${
                selfEval === true ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              ✓ Acertei
            </button>
            <button
              onClick={() => setSelfEval(false)}
              className={`flex-1 rounded-md py-2 text-sm font-medium ${
                selfEval === false ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              ✗ Errei
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!confirmed ? (
          <button
            onClick={handleConfirm}
            disabled={currentQuestion.type === 'multiple_choice' && !selectedAnswer}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Confirmar resposta
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={currentQuestion.type === 'open' && selfEval === null}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {currentIndex + 1 < questions.length ? 'Próxima questão →' : 'Ver resultado'}
          </button>
        )}
      </div>
    </div>
  )
}
