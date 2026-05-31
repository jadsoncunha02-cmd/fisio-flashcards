import Link from 'next/link'
import { QuestionWithStatus } from '@/lib/types'
import { truncate } from '@/lib/utils'
import DifficultyStars from './DifficultyStars'
import StatusBadge from './StatusBadge'

export default function QuestionCard({ question }: { question: QuestionWithStatus }) {
  return (
    <Link href={`/questoes/${question.id}`} className="ff-question-card">
      <p className="ff-question-text">{truncate(question.question_text, 120)}</p>
      <div className="ff-question-meta">
        <span className="ff-pill ff-pill-blue">{question.area}</span>
        {question.subtopic && (
          <span className="ff-pill ff-pill-indigo">{question.subtopic}</span>
        )}
        {question.institution && (
          <span className="ff-pill ff-pill-purple">
            {question.institution}{question.year ? ` ${question.year}` : ''}
          </span>
        )}
        <DifficultyStars value={question.difficulty} />
        <StatusBadge status={question.status} />
      </div>
    </Link>
  )
}
