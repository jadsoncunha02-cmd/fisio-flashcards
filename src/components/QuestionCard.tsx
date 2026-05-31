import Link from 'next/link'
import { QuestionWithStatus } from '@/lib/types'
import { truncate } from '@/lib/utils'
import DifficultyStars from './DifficultyStars'
import StatusBadge from './StatusBadge'

interface Props {
  question: QuestionWithStatus
}

export default function QuestionCard({ question }: Props) {
  return (
    <Link
      href={`/questoes/${question.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
    >
      <p className="text-sm text-gray-800 mb-3 leading-relaxed">
        {truncate(question.question_text, 120)}
      </p>
      <div className="flex flex-wrap items-center gap-2 text-xs">
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
        <DifficultyStars value={question.difficulty} />
        <StatusBadge status={question.status} />
      </div>
    </Link>
  )
}
