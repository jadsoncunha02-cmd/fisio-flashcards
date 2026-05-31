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
    getQuestions(filters).then(setQuestions).finally(() => setLoading(false))
  }, [filters])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="ff-page-header">
        <h1 className="ff-page-title">Questões</h1>
        <Link href="/questoes/nova" className="ff-btn ff-btn-primary">+ Nova questão</Link>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="ff-loading">Carregando...</div>
      ) : questions.length === 0 ? (
        <div className="ff-empty">
          <p className="ff-empty-title">Nenhuma questão encontrada</p>
          <p className="ff-empty-text">
            <Link href="/questoes/nova" style={{ color: 'var(--brand-text)', fontWeight: 600 }}>
              Cadastre a primeira questão
            </Link>
          </p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '12px', color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', margin: 0 }}>
            {questions.length} questão(ões)
          </p>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {questions.map((q) => <QuestionCard key={q.id} question={q} />)}
          </div>
        </>
      )}
    </div>
  )
}
