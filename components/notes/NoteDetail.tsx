'use client'

import { useRouter } from 'next/navigation'
import type { Note } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Pencil, Trash2, ArrowLeft } from 'lucide-react'

const typeLabel: Record<string, string> = {
  telesales: 'テレアポ知見',
  meeting: 'MTGメモ',
}

interface NoteDetailProps {
  note: Note
}

export default function NoteDetail({ note }: NoteDetailProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm('このナレッジを削除しますか？')) return
    const { error } = await supabase.from('notes').delete().eq('id', note.id)
    if (error) {
      toast.error('削除に失敗しました')
    } else {
      toast.success('削除しました')
      router.push('/notes')
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
        <Button variant="outline" size="sm" onClick={() => router.push(`/notes/${note.id}?edit=1`)}>
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
          <Badge variant={note.type === 'telesales' ? 'default' : 'secondary'}>
            {typeLabel[note.type]}
          </Badge>
          <span className="text-sm text-gray-400">{formatDate(note.created_at)}</span>
        </div>
        <h1 className="text-2xl font-bold">{note.title}</h1>
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
      </div>

      {note.content && (
        <Card>
          <CardContent className="pt-4">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{note.content}</pre>
          </CardContent>
        </Card>
      )}

      {note.raw_transcript && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500">Nottaトランスクリプト</h2>
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-gray-600 font-mono">{note.raw_transcript}</pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
