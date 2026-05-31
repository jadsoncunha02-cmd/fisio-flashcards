'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Question } from '@/lib/types'
import { getQuestionById } from '@/lib/queries'
import QuestionForm from '@/components/QuestionForm'

export default function EditQuestaoPage() {
  const params = useParams<{ id: string }>()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getQuestionById(params.id).then((q) => {
      setQuestion(q)
      setLoading(false)
    })
  }, [params.id])

  if (loading) return <div className="py-12 text-center text-gray-400">Carregando...</div>
  if (!question) return <div className="py-12 text-center text-gray-400">Questão não encontrada.</div>

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar Questão</h1>
      <QuestionForm initial={question} />
    </div>
  )
}
