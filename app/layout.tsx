import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '우리동네 떨이',
  description: '지역 기반 실시간 마감 할인 마켓',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Feel native
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      {/* 
        [Premium App Feel] 
        - Gray background for desktop context
        - Centered 'Frame' for mobile content
        - Shadow for depth
      */}
      <body className={`${inter.className} bg-gray-100 min-h-screen flex justify-center text-gray-900 antialiased`}>
        <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative">
          {children}
          <Toaster position="top-center" />
        </div>
      </body>
    </html>
  )
}
