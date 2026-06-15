import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { todayISO, formatDateShort } from '@/lib/utils'
import type { Note, PdcaTheme, DailyReport } from '@/lib/types'
import { Plus, Phone, Calendar, Target, FileText, TrendingUp, BookOpen } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = todayISO()

  const [notesRes, pdcaRes, todayReportRes] = await Promise.all([
    supabase.from('notes').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('pdca_themes').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('daily_reports').select('*').eq('report_date', today).single(),
  ])

  const notes: Note[] = notesRes.data ?? []
  const activeThemes: PdcaTheme[] = pdcaRes.data ?? []
  const todayReport: DailyReport | null = todayReportRes.data ?? null

  const typeLabel: Record<string, string> = { telesales: 'テレアポ', meeting: 'MTG' }
  const appointmentRate = todayReport && todayReport.call_count > 0
    ? `${((todayReport.appointment_count / todayReport.call_count) * 100).toFixed(1)}%`
    : '-'

  return (
    <div className="space-y-8 max-w-5xl">

      {/* 今日の活動 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
            <Phone className="w-4 h-4" /> 今日の活動
          </h2>
          <Link href={`/daily/${today}`}>
            <Button variant="outline" size="sm">{todayReport ? '更新する' : '記録する'}</Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'コール数', value: todayReport?.call_count ?? '-', unit: '件', color: 'text-blue-600' },
            { label: 'アポ獲得数', value: todayReport?.appointment_count ?? '-', unit: '件', color: 'text-green-600' },
            { label: 'アポ獲得率', value: appointmentRate, unit: '', color: 'text-orange-500' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="bg-white rounded-xl border p-5 text-center shadow-sm">
              <p className={`text-4xl font-bold ${color}`}>{value}<span className="text-lg font-normal text-gray-400 ml-1">{unit}</span></p>
              <p className="text-xs text-gray-400 mt-2">{label}</p>
            </div>
          ))}
        </div>
        {todayReport?.notes && (
          <div className="mt-3 bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3 text-sm text-gray-700">
            <span className="font-medium text-yellow-700 mr-2">今日のメモ</span>{todayReport.notes}
          </div>
        )}
      </section>

      {/* 進行中のPDCA */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
            <Target className="w-4 h-4" /> 進行中のPDCA
          </h2>
          <Link href="/pdca" className="text-xs text-blue-600 hover:underline">すべて見る</Link>
        </div>
        {activeThemes.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 text-center">
            <p className="text-sm text-gray-400 mb-3">進行中のPDCAテーマはありません</p>
            <Link href="/pdca/new"><Button size="sm"><Plus className="w-4 h-4 mr-1" />テーマを作成</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeThemes.map((theme) => (
              <Link key={theme.id} href={`/pdca/${theme.id}`}>
                <div className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer h-full space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm leading-snug">{theme.name}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">進行中</span>
                  </div>
                  {theme.kpi_target && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />{theme.kpi_target}
                    </p>
                  )}
                  {theme.do_content && (
                    <p className="text-xs text-gray-400 line-clamp-2">{theme.do_content}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 最近のナレッジ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> 最近のナレッジ
          </h2>
          <div className="flex items-center gap-3">
            <Link href="/notes/new">
              <Button size="sm"><Plus className="w-4 h-4 mr-1" />追加</Button>
            </Link>
            <Link href="/notes" className="text-xs text-blue-600 hover:underline">すべて見る</Link>
          </div>
        </div>
        {notes.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 text-center">
            <p className="text-sm text-gray-400">ナレッジがまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {notes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <div className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer h-full space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium line-clamp-2 leading-snug">{note.title}</span>
                    <Badge variant={note.type === 'telesales' ? 'default' : 'secondary'} className="text-xs shrink-0">
                      {typeLabel[note.type]}
                    </Badge>
                  </div>
                  {note.content && (
                    <p className="text-xs text-gray-400 line-clamp-2">{note.content}</p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-300">{formatDateShort(note.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* クイック追加 */}
      <section>
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">クイック追加</p>
            <p className="text-blue-100 text-xs mt-0.5">テレアポ・MTGの知見をすぐに記録</p>
          </div>
          <div className="flex gap-2">
            <Link href="/notes/new">
              <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
                <FileText className="w-4 h-4 mr-1" />ナレッジ
              </Button>
            </Link>
            <Link href={`/daily/${today}`}>
              <Button size="sm" variant="outline" className="border-white text-white hover:bg-blue-700">
                <Calendar className="w-4 h-4 mr-1" />日報
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
