import "./globals.css"
import Link from "next/link"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <header className="border-b border-zinc-800 bg-zinc-950">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold">
                RD
              </div>

              <div>
                <div className="font-bold text-lg leading-none">
                  Recipe Decipher
                </div>

                <div className="text-xs text-zinc-400">
                  Structured cooking intel
                </div>
              </div>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                Home
              </Link>

              <Link
                href="/recipes"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                Recipes
              </Link>

              <Link
                href="/parse"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                Parse
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-6 py-10">
            {children}
          </div>
        </main>

        <footer className="border-t border-zinc-800 bg-zinc-950 mt-20">
          <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-zinc-500">
            <div>
              © 2026 Recipe Decipher
            </div>

            <div>
              AI-powered recipe normalization
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}