'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalResult } from '@/lib/types'
import { getExternalResults, deleteExternalResult } from '@/lib/queries'
import { formatDate } from '@/lib/utils'
import DifficultyStars from '@/components/DifficultyStars'
import ResultsEvolution from '@/components/Charts/ResultsEvolution'

export default function ResultadosPage() {
  const [results, setResults] = useState<ExternalResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExternalResults().then((r) => { setResults(r); setLoading(false) })
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este resultado?')) return
    await deleteExternalResult(id)
    setResults((prev) => prev.filter((r) => r.id !== id))
  }

  const chartData = [...results]
    .sort((a, b) => a.exam_date.localeCompare(b.exam_date))
    .map((r) => ({
      date: new Date(r.exam_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      accuracy: Math.round((r.correct_answers / r.total_questions) * 100),
      label: r.banca || r.institution || 'Prova',
    }))

  const avg = results.length > 0
    ? Math.round(results.reduce((s, r) => s + (r.correct_answers / r.total_questions) * 100, 0) / results.length)
    : 0

  const best = results.length > 0
    ? Math.max(...results.map((r) => Math.round((r.correct_answers / r.total_questions) * 100)))
    : 0

  if (loading) return <div className="ff-loading">Carregando...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="ff-page-header">
        <h1 className="ff-page-title">Resultados Externos</h1>
        <Link href="/resultados/novo" className="ff-btn ff-btn-primary">+ Novo resultado</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="ff-stat-card">
          <span className="ff-stat-label">Provas registradas</span>
          <span className="ff-stat-value">{results.length}</span>
        </div>
        <div className="ff-stat-card">
          <span className="ff-stat-label">Média geral</span>
          <span className="ff-stat-value brand">{avg}%</span>
        </div>
        <div className="ff-stat-card">
          <span className="ff-stat-label">Melhor resultado</span>
          <span className="ff-stat-value" style={{ color: 'var(--success-text)' }}>{best}%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="ff-chart-card">
        <p className="ff-chart-title">Evolução do desempenho</p>
        <ResultsEvolution data={chartData} />
      </div>

      {/* Table */}
      {results.length === 0 ? (
        <div className="ff-empty">
          <p className="ff-empty-title">Nenhum resultado cadastrado</p>
          <p className="ff-empty-text">
            <Link href="/resultados/novo" style={{ color: 'var(--brand-text)', fontWeight: 600 }}>
              Cadastre seu primeiro resultado externo
            </Link>
          </p>
        </div>
      ) : (
        <div className="ff-table-wrap">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Banca / Instituição</th>
                <th>Questões</th>
                <th>Acertos</th>
                <th>%</th>
                <th>Dificuldade</th>
                <th>Tempo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const pct = Math.round((r.correct_answers / r.total_questions) * 100)
                const pctColor = pct >= 70 ? 'var(--success-text)' : pct >= 50 ? 'var(--brand-text)' : 'var(--error-text)'
                return (
                  <tr key={r.id}>
                    <td className="primary">
                      {new Date(r.exam_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="primary">
                      {[r.banca, r.institution].filter(Boolean).join(' — ') || '—'}
                    </td>
                    <td>{r.total_questions}</td>
                    <td>{r.correct_answers}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: pctColor, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        {pct}%
                      </span>
                    </td>
                    <td>
                      {r.difficulty ? <DifficultyStars value={r.difficulty} /> : '—'}
                    </td>
                    <td>{r.duration_minutes ? `${r.duration_minutes}min` : '—'}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="ff-btn ff-btn-ghost ff-btn-sm"
                        style={{ color: 'var(--error)', padding: '0 8px' }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
