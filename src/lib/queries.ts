import { supabase } from './supabase'
import { Question, Attempt, Comment, QuestionWithStatus, QuestionFilters, DashboardStats } from './types'
import { deriveStatus } from './utils'

export async function getQuestions(filters: QuestionFilters = {}): Promise<QuestionWithStatus[]> {
  let query = supabase
    .from('questions')
    .select('*, attempts(id, is_correct, answer_given, created_at)')
    .order('created_at', { ascending: false })

  if (filters.area) query = query.eq('area', filters.area)
  if (filters.subtopic) query = query.eq('subtopic', filters.subtopic)
  if (filters.institution) query = query.eq('institution', filters.institution)
  if (filters.year) query = query.eq('year', filters.year)
  if (filters.difficulty) query = query.gte('difficulty', filters.difficulty)
  if (filters.search) query = query.ilike('question_text', `%${filters.search}%`)

  const { data, error } = await query
  if (error) throw error

  return (data || [])
    .map((q: any) => {
      const attempts: Attempt[] = (q.attempts || []).sort(
        (a: Attempt, b: Attempt) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      const lastAttempt = attempts[0] || null
      const { attempts: _a, ...question } = q
      return { ...question, last_attempt: lastAttempt, status: deriveStatus(lastAttempt) }
    })
    .filter((q: QuestionWithStatus) => !filters.status || q.status === filters.status)
}

export async function getQuestionById(id: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createQuestion(
  question: Omit<Question, 'id' | 'created_at'>
): Promise<Question> {
  const { data, error } = await supabase
    .from('questions')
    .insert(question)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateQuestion(
  id: string,
  updates: Partial<Omit<Question, 'id' | 'created_at'>>
): Promise<Question> {
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) throw error
}

export async function getAttemptsByQuestionId(questionId: string): Promise<Attempt[]> {
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createAttempt(
  attempt: Omit<Attempt, 'id' | 'created_at'>
): Promise<Attempt> {
  const { data, error } = await supabase
    .from('attempts')
    .insert(attempt)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getCommentsByQuestionId(questionId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createComment(
  comment: Omit<Comment, 'id' | 'created_at'>
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}

export async function getDistinctValues(
  field: 'area' | 'subtopic' | 'institution'
): Promise<string[]> {
  const { data, error } = await supabase.from('questions').select(field).not(field, 'is', null)
  if (error) throw error
  const rows = (data || []) as Record<string, unknown>[]
  const values = rows.map((row) => row[field]).filter((v): v is string => typeof v === 'string')
  return [...new Set(values)].sort()
}

export async function getSubtopicsForArea(area: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('subtopic')
    .eq('area', area)
    .not('subtopic', 'is', null)
  if (error) throw error
  const values = (data || []).map((row: any) => row.subtopic).filter(Boolean) as string[]
  return [...new Set(values)].sort()
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [questionsResult, attemptsResult] = await Promise.all([
    supabase.from('questions').select('id', { count: 'exact', head: true }),
    supabase
      .from('attempts')
      .select('id, is_correct, created_at, question_id, questions(area)'),
  ])

  const totalQuestions = questionsResult.count || 0
  const attempts = (attemptsResult.data || []) as any[]
  const totalAttempts = attempts.length
  const correctAttempts = attempts.filter((a) => a.is_correct).length
  const globalAccuracy =
    totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

  const areaMap: Record<string, { correct: number; total: number }> = {}
  for (const a of attempts) {
    const area = a.questions?.area
    if (!area) continue
    if (!areaMap[area]) areaMap[area] = { correct: 0, total: 0 }
    areaMap[area].total++
    if (a.is_correct) areaMap[area].correct++
  }
  const accuracyByArea = Object.entries(areaMap).map(([area, { correct, total }]) => ({
    area,
    accuracy: Math.round((correct / total) * 100),
    total,
  }))

  const weeklyMap: Record<string, { correct: number; total: number }> = {}
  for (const a of attempts) {
    const date = new Date(a.created_at)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const key = weekStart.toISOString().split('T')[0]
    if (!weeklyMap[key]) weeklyMap[key] = { correct: 0, total: 0 }
    weeklyMap[key].total++
    if (a.is_correct) weeklyMap[key].correct++
  }
  const weeklyEvolution = Object.entries(weeklyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, { correct, total }]) => ({
      week,
      accuracy: Math.round((correct / total) * 100),
    }))

  const qMap: Record<string, { total: number; incorrect: number }> = {}
  for (const a of attempts) {
    if (!qMap[a.question_id]) qMap[a.question_id] = { total: 0, incorrect: 0 }
    qMap[a.question_id].total++
    if (!a.is_correct) qMap[a.question_id].incorrect++
  }
  const mostMissed = Object.entries(qMap)
    .filter(([, { total }]) => total >= 2)
    .map(([question_id, { total, incorrect }]) => ({
      question_id,
      total,
      incorrect,
      error_rate: Math.round((incorrect / total) * 100),
    }))
    .sort((a, b) => b.error_rate - a.error_rate)
    .slice(0, 5)

  return { totalQuestions, totalAttempts, globalAccuracy, accuracyByArea, weeklyEvolution, mostMissed }
}
