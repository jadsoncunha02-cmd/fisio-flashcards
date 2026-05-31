import { QuestionStatus } from '@/lib/types'

const CONFIG: Record<QuestionStatus, { label: string; className: string }> = {
  correct: { label: '✓ Acertei', className: 'bg-green-100 text-green-800' },
  incorrect: { label: '✗ Errei', className: 'bg-red-100 text-red-800' },
  unanswered: { label: '— Não respondida', className: 'bg-gray-100 text-gray-600' },
}

interface Props {
  status: QuestionStatus
}

export default function StatusBadge({ status }: Props) {
  const { label, className } = CONFIG[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
