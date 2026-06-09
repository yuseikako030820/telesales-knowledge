'use client'

import { useRouter } from 'next/navigation'
import type { PdcaTheme } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Pencil, Trash2, ArrowLeft } from 'lucide-react'

interface Props {
  theme: PdcaTheme
}

function Section({ title, content }: { title: string; content: string }) {
  if (!content) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{content}</pre>
      </CardContent>
    </Card>
  )
}

export default function PdcaDetail({ theme }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm('このPDCAテーマを削除しますか？')) return
    const { error } = await supabase.from('pdca_themes').delete().eq('id', theme.id)
    if (error) {
      toast.error('削除に失敗しました')
    } else {
      toast.success('削除しました')
      router.push('/pdca')
      router.refresh()
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          戻る
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => router.push(`/pdca/${theme.id}?edit=1`)}>
          <Pencil className="w-4 h-4 mr-1" />
          編集
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-1" />
          削除
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant={theme.is_active ? 'default' : 'secondary'}>
            {theme.is_active ? '進行中' : '完了'}
          </Badge>
          <span className="text-sm text-gray-400">{formatDate(theme.created_at)}</span>
        </div>
        <h1 className="text-2xl font-bold">{theme.name}</h1>
        {theme.kpi_target && (
          <p className="text-blue-600 font-medium text-sm">KPI: {theme.kpi_target}</p>
        )}
      </div>

      <Section title="目標" content={theme.goal} />
      <Section title="Do（実施内容）" content={theme.do_content} />
      <Section title="Check / Act（振り返り）" content={theme.check_act} />
    </div>
  )
}
