'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Question, Attempt, Comment } from '@/lib/types'
import {
  getQuestionById,
  getAttemptsByQuestionId,
  getCommentsByQuestionId,
  createComment,
  deleteComment,
  deleteQuestion,
} from '@/lib/queries'
import { formatDate } from '@/lib/utils'
import DifficultyStars from '@/components/DifficultyStars'

export default function QuestaoDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [question, setQuestion] = useState<Question | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingComment, setSavingComment] = useState(false)

  useEffect(() => {
    Promise.all([
      getQuestionById(params.id),
      getAttemptsByQuestionId(params.id),
      getCommentsByQuestionId(params.id),
    ]).then(([q, a, c]) => {
      setQuestion(q)
      setAttempts(a)
      setComments(c)
      setLoading(false)
    })
  }, [params.id])

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setSavingComment(true)
    const comment = await createComment({ question_id: params.id, content: newComment.trim() })
    setComments([comment, ...comments])
    setNewComment('')
    setSavingComment(false)
  }

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId)
    setComments(comments.filter((c) => c.id !== commentId))
  }

  const handleDelete = async () => {
    if (!confirm('Excluir esta questão? Esta ação não pode ser desfeita.')) return
    await deleteQuestion(params.id)
    router.push('/questoes')
  }

  if (loading) return <div className="py-12 text-center text-gray-400">Carregando...</div>
  if (!question) return <div className="py-12 text-center text-gray-400">Questão não encontrada.</div>

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <Link href="/questoes" className="text-sm text-gray-500 hover:text-gray-700">
          ← Voltar
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/questoes/${params.id}/edit`}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Excluir
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 font-medium">
            {question.area}
          </span>
          {question.subtopic && (
            <span className="rounded-full bg-indigo-100 text-indigo-800 px-2.5 py-0.5">
              {question.subtopic}
            </span>
          )}
          {question.institution && (
            <span className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5">
              {question.institution}{question.year ? ` ${question.year}` : ''}
            </span>
          )}
          <span className="rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5">
            {question.type === 'multiple_choice' ? 'Múltipla escolha' : 'Dissertativa'}
          </span>
          <DifficultyStars value={question.difficulty} />
        </div>

        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{question.question_text}</p>

        {question.type === 'multiple_choice' && question.options && (
          <div className="mt-4 space-y-2">
            {question.options.map((opt) => (
              <div
                key={opt.letter}
                className={`flex gap-3 rounded-md border p-3 text-sm ${
                  showAnswer && opt.letter === question.correct_answer
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <span className="font-bold text-gray-600">{opt.letter}.</span>
                <span>{opt.text}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              Revelar gabarito
            </button>
          ) : (
            <div className="rounded-md border border-green-300 bg-green-50 p-3">
              <p className="text-sm font-semibold text-green-800">Gabarito: {question.correct_answer}</p>
              {question.notes && (
                <p className="mt-1 text-sm text-green-700 whitespace-pre-wrap">{question.notes}</p>
              )}
            </div>
          )}
        </div>

        {question.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {question.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Histórico de tentativas ({attempts.length})
        </h2>
        {attempts.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma tentativa registrada ainda.</p>
        ) : (
          <div className="space-y-2">
            {attempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className={a.is_correct ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                  {a.is_correct ? '✓ Correto' : '✗ Incorreto'}
                  {a.answer_given ? ` — Resposta: ${a.answer_given}` : ''}
                </span>
                <span className="text-gray-400">{formatDate(a.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Comentários ({comments.length})
        </h2>
        <div className="mb-4 flex gap-2">
          <textarea
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicionar comentário, dica ou anotação..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          />
          <button
            onClick={handleAddComment}
            disabled={savingComment || !newComment.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 self-end"
          >
            Salvar
          </button>
        </div>
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.content}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                <button
                  onClick={() => handleDeleteComment(c.id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
