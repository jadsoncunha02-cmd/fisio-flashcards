'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDashboardStats, getQuestionById } from '@/lib/queries'
import { DashboardStats, Question } from '@/lib/types'
import AccuracyByArea from '@/components/Charts/AccuracyByArea'
import WeeklyEvolution from '@/components/Charts/WeeklyEvolution'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm text-center">
      <p className="text-2xl font-bold text-blue-700">{value}</p>
      <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

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

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Carregando dashboard...</div>
  }

  if (!stats) return null

  const mostMissedWithQ = stats.mostMissed.map((m) => ({
    ...m,
    question: missedQuestions.find((q) => q.id === m.question_id),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/questoes/nova"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nova questão
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Questões" value={stats.totalQuestions} />
        <StatCard label="Tentativas" value={stats.totalAttempts} />
        <StatCard
          label="Acerto global"
          value={`${stats.globalAccuracy}%`}
          sub={stats.totalAttempts === 0 ? 'Nenhuma tentativa' : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Acerto por área</h2>
          <AccuracyByArea data={stats.accuracyByArea} />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Evolução semanal</h2>
          <WeeklyEvolution data={stats.weeklyEvolution} />
        </div>
      </div>

      {mostMissedWithQ.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Questões mais erradas</h2>
          <div className="space-y-2">
            {mostMissedWithQ.map(({ question_id, error_rate, total, question }) => (
              <Link
                key={question_id}
                href={`/questoes/${question_id}`}
                className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2 hover:border-red-200 hover:bg-red-50 transition-colors"
              >
                <span className="text-sm text-gray-700 truncate max-w-xs">
                  {question?.question_text?.slice(0, 80)}...
                </span>
                <span className="ml-4 shrink-0 text-sm font-semibold text-red-600">
                  {error_rate}% erro ({total} tent.)
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {stats.totalQuestions === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-400">
          <p className="text-lg mb-2">Nenhuma questão ainda</p>
          <Link href="/questoes/nova" className="text-blue-600 underline text-sm">
            Cadastre sua primeira questão
          </Link>
        </div>
      )}
    </div>
  )
}
