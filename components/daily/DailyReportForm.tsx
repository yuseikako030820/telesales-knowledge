'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { DailyReport } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import VoiceInputButton from '@/components/voice/VoiceInputButton'
import { toast } from 'sonner'

interface Props {
  report?: DailyReport
  date: string
}

export default function DailyReportForm({ report, date }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [callCount, setCallCount] = useState(report?.call_count ?? 0)
  const [appointmentCount, setAppointmentCount] = useState(report?.appointment_count ?? 0)
  const [notes, setNotes] = useState(report?.notes ?? '')
  const [saving, setSaving] = useState(false)

  function handleTranscript(text: string) {
    setNotes((prev) => prev ? prev + '\n' + text : text)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')

      const payload = {
        report_date: date,
        call_count: callCount,
        appointment_count: appointmentCount,
        notes,
      }

      if (report) {
        const { error } = await supabase.from('daily_reports').update(payload).eq('id', report.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('daily_reports').insert({ ...payload, user_id: user.id })
        if (error) throw error
      }
      toast.success('保存しました')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const appointmentRate = callCount > 0 ? ((appointmentCount / callCount) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-6 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calls">コール数</Label>
          <Input
            id="calls"
            type="number"
            min={0}
            value={callCount}
            onChange={(e) => setCallCount(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="appts">アポ獲得数</Label>
          <Input
            id="appts"
            type="number"
            min={0}
            value={appointmentCount}
            onChange={(e) => setAppointmentCount(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="text-sm text-gray-500">
        アポ獲得率: <span className="font-semibold text-blue-600">{appointmentRate}%</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="notes">メモ・気づき</Label>
          <VoiceInputButton onTranscript={handleTranscript} />
        </div>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="今日の気づき・反省・良かった点を記録"
          rows={6}
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? '保存中...' : '保存する'}
      </Button>
    </div>
  )
}
