import type { Metadata } from 'next'
import './globals.css'
import { AppLayout } from '@/components/layout/AppLayout'
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
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  )
}
