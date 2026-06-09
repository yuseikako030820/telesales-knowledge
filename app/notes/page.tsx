import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import NotesSearchClient from '@/components/notes/NotesSearchClient'
import type { Note } from '@/lib/types'

export default async function NotesPage() {
  const supabase = await createClient()

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  // Collect all distinct tags
  const allTags = Array.from(new Set((notes ?? []).flatMap((n: Note) => n.tags))).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ナレッジ一覧</h1>
        <Link href="/notes/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            新規追加
          </Button>
        </Link>
      </div>
      <NotesSearchClient notes={notes ?? []} allTags={allTags} />
    </div>
  )
}
