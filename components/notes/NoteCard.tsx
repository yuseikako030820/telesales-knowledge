import Link from 'next/link'
import type { Note } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

interface NoteCardProps {
  note: Note
}

const typeLabel: Record<string, string> = {
  telesales: 'テレアポ',
  meeting: 'MTG',
}

export default function NoteCard({ note }: NoteCardProps) {
  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <span className="font-medium text-sm line-clamp-2">{note.title}</span>
            <Badge variant={note.type === 'telesales' ? 'default' : 'secondary'} className="shrink-0 text-xs">
              {typeLabel[note.type]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {note.content && (
            <p className="text-xs text-gray-500 line-clamp-3">{note.content}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-400">{formatDate(note.created_at)}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
