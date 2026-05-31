export type QuestionType = 'multiple_choice' | 'open'
export type QuestionStatus = 'unanswered' | 'correct' | 'incorrect'

export interface QuestionOption {
  letter: 'A' | 'B' | 'C' | 'D' | 'E'
  text: string
}

export interface Question {
  id: string
  type: QuestionType
  question_text: string
  correct_answer: string
  options: QuestionOption[] | null
  area: string
  subtopic: string | null
  institution: string | null
  year: number | null
  difficulty: number
  tags: string[]
  notes: string | null
  image_urls: string[]
  created_at: string
}

export interface Attempt {
  id: string
  question_id: string
  is_correct: boolean
  answer_given: string | null
  duration_seconds: number | null
  created_at: string
}

export interface Comment {
  id: string
  question_id: string
  content: string
  created_at: string
}

export interface QuestionWithStatus extends Question {
  last_attempt: Attempt | null
  status: QuestionStatus
}

export interface QuestionFilters {
  area?: string
  subtopic?: string
  institution?: string
  year?: number
  difficulty?: number
  status?: QuestionStatus
  search?: string
}

export interface ExternalResult {
  id: string
  banca: string | null
  institution: string | null
  total_questions: number
  correct_answers: number
  difficulty: number | null
  duration_minutes: number | null
  exam_date: string
  notes: string | null
  created_at: string
}

export interface DashboardStats {
  totalQuestions: number
  totalAttempts: number
  globalAccuracy: number
  accuracyByArea: { area: string; accuracy: number; total: number }[]
  weeklyEvolution: { week: string; accuracy: number }[]
  mostMissed: { question_id: string; total: number; incorrect: number; error_rate: number }[]
}
