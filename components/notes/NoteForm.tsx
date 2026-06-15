'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Note, NoteType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import TagInput from './TagInput'
import TranscriptPasteBox from './TranscriptPasteBox'
import VoiceInputButton from '@/components/voice/VoiceInputButton'
import { toast } from 'sonner'

interface NoteFormProps {
  note?: Note
}

export default function NoteForm({ note }: NoteFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [type, setType] = useState<NoteType>(note?.type ?? 'telesales')
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [rawTranscript, setRawTranscript] = useState(note?.raw_transcript ?? '')
  const [tags, setTags] = useState<string[]>(note?.tags ?? [])
  const [saving, setSaving] = useState(false)

  function handleTranscript(text: string) {
    setContent((prev) => prev ? prev + '\n' + text : text)
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error('タイトルを入力してください')
      return
    }
    setSaving(true)
    try {
      const payload = {
        type,
        title: title.trim(),
        content,
        raw_transcript: type === 'meeting' ? (rawTranscript || null) : null,
        tags,
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')
      if (note) {
        const { error } = await supabase
          .from('notes')
          .update(payload)
          .eq('id', note.id)
        if (error) throw error
        toast.success('更新しました')
      } else {
        const { error } = await supabase.from('notes').insert({ ...payload, user_id: user.id })
        if (error) throw error
        toast.success('保存しました')
      }
      router.push('/notes')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存に失敗しました'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label>タイプ</Label>
        <div className="flex gap-2">
          {(['telesales', 'meeting'] as NoteType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                type === t
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
              }`}
            >
              {t === 'telesales' ? 'テレアポ知見' : 'MTGメモ'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">タイトル *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 断り文句への対処法"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">内容</Label>
          <VoiceInputButton onTranscript={handleTranscript} />
        </div>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="知見・メモを入力（音声入力ボタンで話すこともできます）"
          rows={8}
        />
      </div>

      {type === 'meeting' && (
        <TranscriptPasteBox value={rawTranscript} onChange={setRawTranscript} />
      )}

      <div className="space-y-2">
        <Label>タグ</Label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : note ? '更新する' : '保存する'}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </div>
  )
}
