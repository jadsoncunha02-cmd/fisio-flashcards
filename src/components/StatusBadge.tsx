import { QuestionStatus } from '@/lib/types'

const CONFIG: Record<QuestionStatus, { label: string; cls: string }> = {
  correct:   { label: '✓ Acertei',       cls: 'ff-pill ff-status-correct' },
  incorrect: { label: '✗ Errei',         cls: 'ff-pill ff-status-incorrect' },
  unanswered:{ label: '— Não respondida', cls: 'ff-pill ff-status-unanswered' },
}

export default function StatusBadge({ status }: { status: QuestionStatus }) {
  const { label, cls } = CONFIG[status]
  return <span className={cls}>{label}</span>
}
