import "./globals.css"
import Link from "next/link"

import { getUser } from "@/lib/getUser"
import UserMenu from "@/components/UserMenu"

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
              {user && (
                <>
                  <Link
                    href="/recipes"
                    className="text-zinc-300 hover:text-white transition-colors"
                  >
                    Recipes
                  </Link>

                  <Link
                    href="/recipes/my"
                    className="text-zinc-300 hover:text-white transition-colors"
                  >
                    My Recipes
                  </Link>

                  <Link
                    href="/parse"
                    className="text-zinc-300 hover:text-white transition-colors"
                  >
                    Parse
                  </Link>
                </>
              )}

              {!user ? (
                <>
                  <Link
                    href="/create-account"
                    className="text-zinc-300 hover:text-white transition-colors"
                  >
                    Create Account
                  </Link>

                  <Link
                    href="/login"
                    className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-xl transition-colors"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <UserMenu
                  email={user.email ?? ""}
                  displayName={displayName}
                />
              )}
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
