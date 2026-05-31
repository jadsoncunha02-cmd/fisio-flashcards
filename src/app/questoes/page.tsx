'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { QuestionFilters, QuestionWithStatus } from '@/lib/types'
import { getQuestions } from '@/lib/queries'
import QuestionCard from '@/components/QuestionCard'
import FilterBar from '@/components/FilterBar'

export default function QuestoesPage() {
  const [questions, setQuestions] = useState<QuestionWithStatus[]>([])
  const [filters, setFilters] = useState<QuestionFilters>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getQuestions(filters)
      .then(setQuestions)
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Questões</h1>
        <Link
          href="/questoes/nova"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nova questão
        </Link>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="py-12 text-center text-gray-400">Carregando...</div>
      ) : questions.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          Nenhuma questão encontrada.{' '}
          <Link href="/questoes/nova" className="text-blue-600 underline">
            Cadastre a primeira.
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{questions.length} questão(ões) encontrada(s)</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
