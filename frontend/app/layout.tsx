import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'SummrAI — AI Email & Article Summarizer', template: '%s | SummrAI' },
  description: 'Summarize emails, articles, research papers and PDFs in seconds with enterprise-grade AI. Extract key takeaways, action items, and sentiment instantly.',
  keywords: ['AI summarizer', 'email summarizer', 'article summarizer', 'text summarization', 'AI writing assistant'],
  authors: [{ name: 'SummrAI' }],
  creator: 'SummrAI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://summrai.app',
    title: 'SummrAI — AI Email & Article Summarizer',
    description: 'Summarize any text in seconds with enterprise-grade AI.',
    siteName: 'SummrAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SummrAI — AI Email & Article Summarizer',
    description: 'Summarize any text in seconds with enterprise-grade AI.',
    creator: '@summrai',
  },
  robots: { index: true, follow: true },
  themeColor: '#0a0a0f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
