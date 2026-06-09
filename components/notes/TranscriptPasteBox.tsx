import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface TranscriptPasteBoxProps {
  value: string
  onChange: (value: string) => void
}

export default function TranscriptPasteBox({ value, onChange }: TranscriptPasteBoxProps) {
  return (
    <div className="space-y-2">
      <Label>Nottaトランスクリプト（貼り付け）</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nottaの議事録テキストをここに貼り付けてください..."
        rows={6}
        className="text-sm font-mono"
      />
      <p className="text-xs text-gray-400">
        Nottaで書き出したテキストをそのまま貼り付けて保存できます。
      </p>
    </div>
  )
}
