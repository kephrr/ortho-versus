import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Instrument_Sans, Instrument_Serif } from 'next/font/google'
import './globals.css'

const display = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  display: 'swap',
})

const sans = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
  display: 'swap',
})

const serif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ortho Versus — La dictée en duel',
  description:
    'Écoute un extrait, écris-le sans fautes et défie tes amis. La dictée multijoueur, simple et ludique.',
  applicationName: 'Ortho Versus',
}

export const viewport: Viewport = {
  themeColor: '#f6f1e7',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${display.variable} ${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-ink">{children}</body>
    </html>
  )
}
