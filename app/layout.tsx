import './globals.css'
import { Inter, Caveat } from 'next/font/google'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' })

export const metadata = {
  title: 'Image Doodle',
  description: 'Upload, doodle, and export images',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>
      <body className={`${inter.className} ${caveat.variable}`}>{children}</body>
    </html>
  )
}

