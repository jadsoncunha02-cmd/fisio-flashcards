'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDashboardStats, getQuestionById, getExternalResults } from '@/lib/queries'
import { DashboardStats, Question, ExternalResult } from '@/lib/types'
import AccuracyByArea from '@/components/Charts/AccuracyByArea'
import WeeklyEvolution from '@/components/Charts/WeeklyEvolution'
import ResultsEvolution from '@/components/Charts/ResultsEvolution'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [missedQuestions, setMissedQuestions] = useState<Question[]>([])
  const [external, setExternal] = useState<ExternalResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getExternalResults().catch(() => [] as ExternalResult[]),
    ]).then(async ([s, ext]) => {
      setStats(s)
      setExternal(ext)
      const qs = await Promise.all(s.mostMissed.map((m) => getQuestionById(m.question_id)))
      setMissedQuestions(qs.filter(Boolean) as Question[])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="ff-loading">Carregando dashboard...</div>
  if (!stats) return null

  const mostMissedWithQ = stats.mostMissed.map((m) => ({
    ...m, question: missedQuestions.find((q) => q.id === m.question_id),
  }))

  const extAvg = external.length > 0
    ? Math.round(external.reduce((s, r) => s + (r.correct_answers / r.total_questions) * 100, 0) / external.length)
    : 0

  const extChartData = [...external]
    .sort((a, b) => a.exam_date.localeCompare(b.exam_date))
    .map((r) => ({
      date: new Date(r.exam_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      accuracy: Math.round((r.correct_answers / r.total_questions) * 100),
      label: r.banca || r.institution || 'Prova',
    }))

  const divider = (
    <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div className="ff-page-header">
        <h1 className="ff-page-title">Dashboard</h1>
        <Link href="/questoes/nova" className="ff-btn ff-btn-primary">+ Nova questão</Link>
      </div>

      {/* ── Simulado interno ── */}
      <section>
        <p className="ff-section-title" style={{ marginBottom: '14px' }}>Simulado interno</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div className="ff-stat-card">
              <span className="ff-stat-label">Questões cadastradas</span>
              <span className="ff-stat-value">{stats.totalQuestions}</span>
            </div>
            <div className="ff-stat-card">
              <span className="ff-stat-label">Tentativas realizadas</span>
              <span className="ff-stat-value">{stats.totalAttempts}</span>
            </div>
            <div className="ff-stat-card">
              <span className="ff-stat-label">Acerto no simulado</span>
              <span className="ff-stat-value brand">{stats.globalAccuracy}%</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="ff-chart-card">
              <p className="ff-chart-title">Acerto por área</p>
              <AccuracyByArea data={stats.accuracyByArea} />
            </div>
            <div className="ff-chart-card">
              <p className="ff-chart-title">Evolução semanal</p>
              <WeeklyEvolution data={stats.weeklyEvolution} />
            </div>
          </div>

          {mostMissedWithQ.length > 0 && (
            <div className="ff-card">
              <p className="ff-section-title">Questões mais erradas</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {mostMissedWithQ.map(({ question_id, error_rate, total, question }) => (
                  <Link key={question_id} href={`/questoes/${question_id}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', textDecoration: 'none', transition: 'background var(--t-base)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--error-soft)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}>
                    <span style={{ fontSize: '13px', color: 'var(--ink-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                      {question?.question_text?.slice(0, 90)}...
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--error-text)', flexShrink: 0, marginLeft: '12px' }}>
                      {error_rate}% erro · {total} tent.
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {divider}

      {/* ── Provas externas ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <p className="ff-section-title" style={{ margin: 0 }}>Provas externas</p>
          <Link href="/resultados" style={{ fontSize: '12px', color: 'var(--brand-text)', fontFamily: 'var(--font-mono)', textDecoration: 'none', fontWeight: 500 }}>
            Ver todas →
          </Link>
        </div>

        {external.length === 0 ? (
          <div className="ff-card" style={{ padding: '28px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--ink-500)', margin: '0 0 10px 0' }}>
              Nenhuma prova externa registrada ainda.
            </p>
            <Link href="/resultados/novo" className="ff-btn ff-btn-secondary ff-btn-sm">
              + Registrar resultado
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="ff-stat-card">
                <span className="ff-stat-label">Provas registradas</span>
                <span className="ff-stat-value">{external.length}</span>
              </div>
              <div className="ff-stat-card">
                <span className="ff-stat-label">Média externa</span>
                <span className="ff-stat-value brand">{extAvg}%</span>
              </div>
              <div className="ff-stat-card">
                <span className="ff-stat-label">Melhor resultado</span>
                <span className="ff-stat-value" style={{ color: 'var(--success-text)' }}>
                  {Math.max(...external.map((r) => Math.round((r.correct_answers / r.total_questions) * 100)))}%
                </span>
              </div>
            </div>

            <div className="ff-chart-card">
              <p className="ff-chart-title">Evolução em provas externas</p>
              <ResultsEvolution data={extChartData} />
            </div>
          </div>
        )}
      </section>

      {stats.totalQuestions === 0 && external.length === 0 && (
        <div className="ff-empty">
          <p className="ff-empty-title">Nenhum dado ainda</p>
          <p className="ff-empty-text">
            <Link href="/questoes/nova" style={{ color: 'var(--brand-text)', fontWeight: 600 }}>
              Cadastre sua primeira questão
            </Link>
            {' '}ou{' '}
            <Link href="/resultados/novo" style={{ color: 'var(--brand-text)', fontWeight: 600 }}>
              registre um resultado externo
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
