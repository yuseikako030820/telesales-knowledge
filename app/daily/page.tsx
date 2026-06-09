import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { todayISO } from '@/lib/utils'
import type { DailyReport } from '@/lib/types'
import { CalendarPlus } from 'lucide-react'

export default async function DailyPage() {
  const supabase = await createClient()
  const { data: reports } = await supabase
    .from('daily_reports')
    .select('*')
    .order('report_date', { ascending: false })
    .limit(30)

  const today = todayISO()
  const hasToday = (reports ?? []).some((r: DailyReport) => r.report_date === today)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">日報</h1>
        <Link href={`/daily/${today}`}>
          <Button size="sm">
            <CalendarPlus className="w-4 h-4 mr-1" />
            {hasToday ? '今日の日報を見る' : '今日の日報を記録'}
          </Button>
        </Link>
      </div>

      {(reports ?? []).length === 0 ? (
        <p className="text-gray-400 text-sm">日報がまだありません</p>
      ) : (
        <div className="space-y-2">
          {(reports as DailyReport[]).map((report) => (
            <Link key={report.id} href={`/daily/${report.report_date}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-3 px-4 flex items-center gap-4">
                  <span className="text-sm font-medium w-28 shrink-0">{report.report_date}</span>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>コール: <strong>{report.call_count}</strong></span>
                    <span>アポ: <strong>{report.appointment_count}</strong></span>
                    {report.call_count > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {((report.appointment_count / report.call_count) * 100).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  {report.notes && (
                    <p className="text-xs text-gray-400 line-clamp-1 flex-1">{report.notes}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
