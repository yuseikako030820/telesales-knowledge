import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import PdcaCard from '@/components/pdca/PdcaCard'
import type { PdcaTheme } from '@/lib/types'

export default async function PdcaPage() {
  const supabase = await createClient()
  const { data: themes } = await supabase
    .from('pdca_themes')
    .select('*')
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false })

  const active = (themes ?? []).filter((t: PdcaTheme) => t.is_active)
  const completed = (themes ?? []).filter((t: PdcaTheme) => !t.is_active)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">PDCAテーマ</h1>
        <Link href="/pdca/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            新規テーマ
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-700">進行中 ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-gray-400 text-sm">進行中のテーマはありません</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((t: PdcaTheme) => <PdcaCard key={t.id} theme={t} />)}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-400">完了済み ({completed.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map((t: PdcaTheme) => <PdcaCard key={t.id} theme={t} />)}
          </div>
        </div>
      )}
    </div>
  )
}
