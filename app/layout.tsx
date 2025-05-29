import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ThemeToggleButton from '@/components/ThemeToggleButton'

export const metadata: Metadata = {
  title: 'CanvasNote App',
  description: 'Created with CanvasNote',
  generator: 'CanvasNote',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeToggleButton />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
