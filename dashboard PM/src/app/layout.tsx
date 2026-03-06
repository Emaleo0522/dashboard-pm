import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'PM & CPO Dashboard',
  description: 'Strategy dashboard para reuniones PM/CPO',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-surface text-text-primary">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 ml-56 overflow-auto">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
