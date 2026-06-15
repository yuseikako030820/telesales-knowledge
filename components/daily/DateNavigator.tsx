'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function DateNavigator() {
  const router = useRouter()
  const [date, setDate] = useState('')

  function go() {
    if (date) router.push(`/daily/${date}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-40"
      />
      <Button size="sm" variant="outline" onClick={go} disabled={!date}>
        この日の日報
      </Button>
    </div>
  )
}
