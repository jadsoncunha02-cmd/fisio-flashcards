'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDashboardStats, getQuestionById } from '@/lib/queries'
import { DashboardStats, Question } from '@/lib/types'
import AccuracyByArea from '@/components/Charts/AccuracyByArea'
import WeeklyEvolution from '@/components/Charts/WeeklyEvolution'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [missedQuestions, setMissedQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(async (s) => {
      setStats(s)
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="ff-page-header">
        <h1 className="ff-page-title">Dashboard</h1>
        <Link href="/questoes/nova" className="ff-btn ff-btn-primary">+ Nova questão</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="ff-stat-card">
          <span className="ff-stat-label">Questões</span>
          <span className="ff-stat-value">{stats.totalQuestions}</span>
        </div>
        <div className="ff-stat-card">
          <span className="ff-stat-label">Tentativas</span>
          <span className="ff-stat-value">{stats.totalAttempts}</span>
        </div>
        <div className="ff-stat-card">
          <span className="ff-stat-label">Acerto global</span>
          <span className="ff-stat-value brand">{stats.globalAccuracy}%</span>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="ff-chart-card">
          <p className="ff-chart-title">Acerto por área</p>
          <AccuracyByArea data={stats.accuracyByArea} />
        </div>
        <div className="ff-chart-card">
          <p className="ff-chart-title">Evolução semanal</p>
          <WeeklyEvolution data={stats.weeklyEvolution} />
        </div>
      </div>

      {/* Most missed */}
      {mostMissedWithQ.length > 0 && (
        <div className="ff-card">
          <p className="ff-section-title">Questões mais erradas</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mostMissedWithQ.map(({ question_id, error_rate, total, question }) => (
              <Link key={question_id} href={`/questoes/${question_id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)', textDecoration: 'none', transition: 'background var(--t-base)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--error-soft)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}>
                <span style={{ fontSize: '13px', color: 'var(--ink-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                  {question?.question_text?.slice(0, 90)}...
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--error-text)', flexShrink: 0, marginLeft: '16px' }}>
                  {error_rate}% erro · {total} tent.
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {stats.totalQuestions === 0 && (
        <div className="ff-empty">
          <p className="ff-empty-title">Nenhuma questão ainda</p>
          <p className="ff-empty-text">
            <Link href="/questoes/nova" style={{ color: 'var(--brand-text)', fontWeight: 600 }}>
              Cadastre sua primeira questão
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
