import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
