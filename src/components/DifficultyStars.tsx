interface Props {
  value: number
  max?: number
  size?: 'sm' | 'md'
}

export default function DifficultyStars({ value, max = 5, size = 'sm' }: Props) {
  const fontSize = size === 'sm' ? '13px' : '18px'
  return (
    <span style={{ display: 'inline-flex', gap: '1px' }} aria-label={`Dificuldade ${value} de ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ fontSize, color: i < value ? 'var(--brand)' : '#D1CECC' }} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  )
}
