import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PdcaForm from '@/components/pdca/PdcaForm'
import PdcaDetail from '@/components/pdca/PdcaDetail'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

export default async function PdcaDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { edit } = await searchParams
  const supabase = await createClient()

  const { data: theme } = await supabase.from('pdca_themes').select('*').eq('id', id).single()
  if (!theme) notFound()

  if (edit === '1') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">PDCAテーマを編集</h1>
        <PdcaForm theme={theme} />
      </div>
    )
  }

  return <PdcaDetail theme={theme} />
}
