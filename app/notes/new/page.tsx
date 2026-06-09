import NoteForm from '@/components/notes/NoteForm'

export default function NewNotePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">新規ナレッジ</h1>
      <NoteForm />
    </div>
  )
}
