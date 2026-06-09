import Link from 'next/link'
import type { PdcaTheme } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

interface Props {
  theme: PdcaTheme
}

export default function PdcaCard({ theme }: Props) {
  return (
    <Link href={`/pdca/${theme.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <span className="font-medium text-sm">{theme.name}</span>
            <Badge variant={theme.is_active ? 'default' : 'secondary'} className="shrink-0 text-xs">
              {theme.is_active ? '進行中' : '完了'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          {theme.goal && <p className="text-xs text-gray-500 line-clamp-2">{theme.goal}</p>}
          {theme.kpi_target && (
            <p className="text-xs text-blue-600 font-medium">KPI: {theme.kpi_target}</p>
          )}
          <p className="text-xs text-gray-400">{formatDate(theme.created_at)}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
