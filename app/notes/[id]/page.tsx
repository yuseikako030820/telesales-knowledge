import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NoteForm from '@/components/notes/NoteForm'
import NoteDetail from '@/components/notes/NoteDetail'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

export default async function NoteDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { edit } = await searchParams
  const supabase = await createClient()

  const { data: note } = await supabase.from('notes').select('*').eq('id', id).single()
  if (!note) notFound()

  if (edit === '1') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">ナレッジを編集</h1>
        <NoteForm note={note} />
      </div>
    )
  }

  return <NoteDetail note={note} />
}
