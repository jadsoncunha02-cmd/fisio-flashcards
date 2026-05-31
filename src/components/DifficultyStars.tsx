interface Props {
  value: number
  max?: number
}

export default function DifficultyStars({ value, max = 5 }: Props) {
  return (
    <span className="flex gap-0.5" aria-label={`Dificuldade ${value} de ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? 'text-yellow-400' : 'text-gray-300'} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  )
}
