import "./globals.css"
import Link from "next/link"

import { getUser } from "@/lib/getUser"
import HeaderNav from "@/components/HeaderNav"

export const dynamic = "force-dynamic"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser()

  const displayName =
    typeof user?.user_metadata
      ?.display_name === "string"
      ? user.user_metadata
        .display_name
      : undefined

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="min-w-0 flex items-center gap-3"
            >
              <div className="w-9 h-9 shrink-0 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold">
                RD
              </div>

              <div className="min-w-0">
                <div className="font-bold text-lg leading-none truncate">
                  Recipe Decipher
                </div>

                <div className="hidden sm:block text-xs text-zinc-400">
                  Structured cooking intel
                </div>
              </div>
            </Link>

            <HeaderNav
              user={
                user
                  ? {
                    email:
                      user.email ?? "",
                    displayName,
                  }
                  : null
              }
            />
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
