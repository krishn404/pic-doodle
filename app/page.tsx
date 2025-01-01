import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { Delicious_Handrawn } from 'next/font/google'

const deliciousHandrawn = Delicious_Handrawn({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  adjustFontFallback: false
})

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-xl p-12 max-w-md w-full border border-purple-100">
        <h1 className={`${deliciousHandrawn.className} text-6xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 inline-block text-transparent bg-clip-text`}>
          Image Doodle
        </h1>
        <p className="text-xl mb-10 text-gray-600">
          Upload, doodle, and export your images with ease.
        </p>
        <Link href="/doodle">
          <Button className={`${deliciousHandrawn.className} text-xl py-6 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-md`}>
            <Pencil className="mr-2 h-6 w-6" /> Start Doodling
          </Button>
        </Link>
      </div>
    </main>
  )
}

