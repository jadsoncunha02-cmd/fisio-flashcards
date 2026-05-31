'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Question, Attempt, Comment } from '@/lib/types'
import {
  getQuestionById, getAttemptsByQuestionId, getCommentsByQuestionId,
  createComment, deleteComment, deleteQuestion,
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
    ]).then(([q, a, c]) => { setQuestion(q); setAttempts(a); setComments(c); setLoading(false) })
  }, [params.id])

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setSavingComment(true)
    const c = await createComment({ question_id: params.id, content: newComment.trim() })
    setComments([c, ...comments])
    setNewComment('')
    setSavingComment(false)
  }

  const handleDelete = async () => {
    if (!confirm('Excluir esta questão?')) return
    await deleteQuestion(params.id)
    router.push('/questoes')
  }

  if (loading) return <div className="ff-loading">Carregando...</div>
  if (!question) return <div className="ff-empty"><p className="ff-empty-title">Questão não encontrada.</p></div>

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/questoes" className="ff-btn ff-btn-ghost ff-btn-sm">← Questões</Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/questoes/${params.id}/edit`} className="ff-btn ff-btn-secondary ff-btn-sm">Editar</Link>
          <button onClick={handleDelete} className="ff-btn ff-btn-danger ff-btn-sm">Excluir</button>
        </div>
      </div>

      {/* Question card */}
      <div className="ff-card">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          <span className="ff-pill ff-pill-blue">{question.area}</span>
          {question.subtopic && <span className="ff-pill ff-pill-indigo">{question.subtopic}</span>}
          {question.institution && (
            <span className="ff-pill ff-pill-purple">
              {question.institution}{question.year ? ` ${question.year}` : ''}
            </span>
          )}
          <span className="ff-pill ff-pill-gray">
            {question.type === 'multiple_choice' ? 'Múltipla escolha' : 'Dissertativa'}
          </span>
          <DifficultyStars value={question.difficulty} />
        </div>

        <p style={{ fontSize: '14px', color: 'var(--ink-900)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: '0 0 16px 0' }}>
          {question.question_text}
        </p>

        {question.type === 'multiple_choice' && question.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {question.options.map((opt) => (
              <div key={opt.letter}
                className={showAnswer && opt.letter === question.correct_answer ? 'ff-option correct disabled' : 'ff-option disabled'}
                style={{ cursor: 'default' }}>
                <span className="ff-option-letter">{opt.letter}.</span>
                <span>{opt.text}</span>
              </div>
            ))}
          </div>
        )}

        {!showAnswer ? (
          <button onClick={() => setShowAnswer(true)} className="ff-btn ff-btn-secondary ff-btn-sm">
            Revelar gabarito
          </button>
        ) : (
          <div className="ff-answer-box">
            <p className="ff-answer-box-label">Gabarito</p>
            <p className="ff-answer-box-text">{question.correct_answer}</p>
            {question.notes && (
              <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--success-text)', whiteSpace: 'pre-wrap' }}>
                {question.notes}
              </p>
            )}
          </div>
        )}

        {question.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
            {question.tags.map((tag) => (
              <span key={tag} className="ff-pill ff-pill-gray">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Attempts */}
      <div className="ff-card">
        <p className="ff-section-title">Histórico de tentativas ({attempts.length})</p>
        {attempts.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--ink-500)' }}>Nenhuma tentativa registrada ainda.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attempts.map((a) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: a.is_correct ? 'var(--success-text)' : 'var(--error-text)', fontWeight: 500 }}>
                  {a.is_correct ? '✓ Correto' : '✗ Incorreto'}
                  {a.answer_given ? ` — ${a.answer_given}` : ''}
                </span>
                <span style={{ color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  {formatDate(a.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="ff-card">
        <p className="ff-section-title">Comentários ({comments.length})</p>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <textarea
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicionar comentário, dica ou anotação..."
            className="ff-textarea"
            style={{ flex: 1 }}
          />
          <button
            onClick={handleAddComment}
            disabled={savingComment || !newComment.trim()}
            className="ff-btn ff-btn-primary"
            style={{ alignSelf: 'flex-end' }}
          >
            Salvar
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {comments.map((c) => (
            <div key={c.id} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)', padding: '12px 14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--ink-700)', whiteSpace: 'pre-wrap', margin: '0 0 6px 0' }}>
                {c.content}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>
                  {formatDate(c.created_at)}
                </span>
                <button
                  onClick={() => { deleteComment(c.id); setComments(comments.filter((x) => x.id !== c.id)) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--error-text)', fontFamily: 'var(--font-mono)' }}
                >
                  remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
