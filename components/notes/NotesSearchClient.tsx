'use client'

import { useState, useMemo } from 'react'
import type { Note } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import NoteCard from './NoteCard'
import { Search } from 'lucide-react'

interface Props {
  notes: Note[]
  allTags: string[]
}

type FilterType = 'all' | 'telesales' | 'meeting'

export default function NotesSearchClient({ notes, allTags }: Props) {
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const filtered = useMemo(() => {
    return notes.filter((note) => {
      if (typeFilter !== 'all' && note.type !== typeFilter) return false
      if (selectedTags.length > 0 && !selectedTags.every((t) => note.tags.includes(t))) return false
      if (query) {
        const q = query.toLowerCase()
        return (
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q) ||
          (note.raw_transcript ?? '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [notes, query, selectedTags, typeFilter])

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="タイトル・内容で検索..."
            className="pl-9"
          />
        </div>
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as FilterType)}>
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="telesales">テレアポ</TabsTrigger>
            <TabsTrigger value="meeting">MTG</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer select-none text-xs"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">該当するナレッジがありません</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}
