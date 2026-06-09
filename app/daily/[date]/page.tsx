import { createClient } from '@/lib/supabase/server'
import DailyReportForm from '@/components/daily/DailyReportForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ date: string }>
}

export default async function DailyReportPage({ params }: Props) {
  const { date } = await params
  const supabase = await createClient()

  const { data: report } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('report_date', date)
    .single()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/daily" className="flex items-center text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" />
          日報一覧
        </Link>
      </div>
      <h1 className="text-2xl font-bold">{date} の日報</h1>
      <DailyReportForm report={report ?? undefined} date={date} />
    </div>
  )
}
