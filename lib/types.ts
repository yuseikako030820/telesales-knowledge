export type NoteType = 'telesales' | 'meeting'

export interface Note {
  id: string
  user_id: string
  type: NoteType
  title: string
  content: string
  raw_transcript: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface PdcaTheme {
  id: string
  user_id: string
  name: string
  goal: string
  kpi_target: string
  do_content: string
  check_act: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DailyReport {
  id: string
  user_id: string
  report_date: string
  call_count: number
  appointment_count: number
  notes: string
  created_at: string
  updated_at: string
}
