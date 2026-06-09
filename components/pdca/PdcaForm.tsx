'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { PdcaTheme } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import VoiceInputButton from '@/components/voice/VoiceInputButton'
import { toast } from 'sonner'

interface Props {
  theme?: PdcaTheme
}

export default function PdcaForm({ theme }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(theme?.name ?? '')
  const [goal, setGoal] = useState(theme?.goal ?? '')
  const [kpiTarget, setKpiTarget] = useState(theme?.kpi_target ?? '')
  const [doContent, setDoContent] = useState(theme?.do_content ?? '')
  const [checkAct, setCheckAct] = useState(theme?.check_act ?? '')
  const [isActive, setIsActive] = useState(theme?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [voiceTarget, setVoiceTarget] = useState<'do' | 'checkact'>('do')

  function handleTranscript(text: string) {
    if (voiceTarget === 'do') {
      setDoContent((prev) => prev ? prev + '\n' + text : text)
    } else {
      setCheckAct((prev) => prev ? prev + '\n' + text : text)
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error('テーマ名を入力してください')
      return
    }
    setSaving(true)
    try {
      const payload = { name, goal, kpi_target: kpiTarget, do_content: doContent, check_act: checkAct, is_active: isActive }
      if (theme) {
        const { error } = await supabase.from('pdca_themes').update(payload).eq('id', theme.id)
        if (error) throw error
        toast.success('更新しました')
      } else {
        const { error } = await supabase.from('pdca_themes').insert(payload)
        if (error) throw error
        toast.success('作成しました')
      }
      router.push('/pdca')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="name">テーマ名 *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: アポ獲得率を3%に改善する" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal">目標</Label>
        <Textarea id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="このテーマで達成したいこと" rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="kpi">KPI・数値目標</Label>
        <Input id="kpi" value={kpiTarget} onChange={(e) => setKpiTarget(e.target.value)} placeholder="例: 月アポ50件、転換率20%" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="do">Do（実施内容）</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">音声入力先: Do</span>
            <VoiceInputButton onTranscript={handleTranscript} />
          </div>
        </div>
        <Textarea
          id="do"
          value={doContent}
          onChange={(e) => setDoContent(e.target.value)}
          onFocus={() => setVoiceTarget('do')}
          placeholder="試したこと・実施した施策を記録"
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="checkact">Check / Act（振り返り）</Label>
          <button type="button" className="text-xs text-blue-600 hover:underline" onClick={() => setVoiceTarget('checkact')}>
            音声入力先をこちらに切替
          </button>
        </div>
        <Textarea
          id="checkact"
          value={checkAct}
          onChange={(e) => setCheckAct(e.target.value)}
          onFocus={() => setVoiceTarget('checkact')}
          placeholder="結果・気づき・次のアクションを記録"
          rows={5}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="active">アクティブ（進行中）</Label>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : theme ? '更新する' : '作成する'}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>キャンセル</Button>
      </div>
    </div>
  )
}
