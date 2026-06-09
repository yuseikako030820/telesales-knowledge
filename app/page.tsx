import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { todayISO, formatDateShort } from '@/lib/utils'
import type { Note, PdcaTheme, DailyReport } from '@/lib/types'
import { Plus, Phone, Calendar, Target, FileText } from 'lucide-react'

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <span className="text-sm text-gray-400">{today}</span>
      </div>

      {/* Today Report */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Phone className="w-4 h-4" /> 今日の活動
          </h2>
          <Link href={`/daily/${today}`}>
            <Button variant="outline" size="sm">
              {todayReport ? '更新' : '記録する'}
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-3xl font-bold">{todayReport?.call_count ?? '-'}</p>
              <p className="text-xs text-gray-500 mt-1">コール数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-3xl font-bold">{todayReport?.appointment_count ?? '-'}</p>
              <p className="text-xs text-gray-500 mt-1">アポ獲得数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-3xl font-bold">
                {todayReport && todayReport.call_count > 0
                  ? `${((todayReport.appointment_count / todayReport.call_count) * 100).toFixed(1)}%`
                  : '-'}
              </p>
              <p className="text-xs text-gray-500 mt-1">アポ獲得率</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Active PDCA */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Target className="w-4 h-4" /> 進行中のPDCA
          </h2>
          <Link href="/pdca" className="text-sm text-blue-600 hover:underline">すべて見る</Link>
        </div>
        {activeThemes.length === 0 ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-400">進行中のPDCAテーマはありません</p>
            <Link href="/pdca/new">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                テーマを作成
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeThemes.map((theme) => (
              <Link key={theme.id} href={`/pdca/${theme.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-1 pt-3 px-4">
                    <CardTitle className="text-sm">{theme.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3 px-4">
                    {theme.kpi_target && (
                      <p className="text-xs text-blue-600">KPI: {theme.kpi_target}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Notes */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" /> 最近のナレッジ
          </h2>
          <div className="flex items-center gap-2">
            <Link href="/notes/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                追加
              </Button>
            </Link>
            <Link href="/notes" className="text-sm text-blue-600 hover:underline">すべて見る</Link>
          </div>
        </div>
        {notes.length === 0 ? (
          <p className="text-sm text-gray-400">ナレッジがまだありません</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {notes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-3 pb-3 px-4 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium line-clamp-2">{note.title}</span>
                      <Badge variant={note.type === 'telesales' ? 'default' : 'secondary'} className="text-xs shrink-0">
                        {typeLabel[note.type]}
                      </Badge>
                    </div>
                    {note.content && (
                      <p className="text-xs text-gray-400 line-clamp-2">{note.content}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-1 py-0">{tag}</Badge>
                        ))}
                      </div>
                      <span className="text-xs text-gray-300">{formatDateShort(note.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Add */}
      <section>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="py-4 px-5">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-medium">クイック追加</p>
                <p className="text-xs text-gray-500">テレアポ・MTGの知見をすぐに記録</p>
              </div>
              <div className="flex gap-2 ml-auto">
                <Link href="/notes/new">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    ナレッジ
                  </Button>
                </Link>
                <Link href={`/daily/${today}`}>
                  <Button size="sm" variant="outline">
                    <Calendar className="w-4 h-4 mr-1" />
                    日報
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
