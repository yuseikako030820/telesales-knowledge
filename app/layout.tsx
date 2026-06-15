import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'テレアポ君',
  description: 'テレアポ知見・PDCA・日報を管理するナレッジアプリ',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = !user

  return (
    <html lang="ja" className={inter.variable}>
      <body className="font-sans antialiased">
        {isAuthPage ? (
          children
        ) : (
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar email={user?.email ?? ''} />
              <main className="flex-1 p-6 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        )}
        <Toaster richColors />
      </body>
    </html>
  )
}
