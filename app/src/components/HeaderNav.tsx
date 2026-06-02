"use client"

import Link from "next/link"
import { useState } from "react"

import UserMenu from "@/components/UserMenu"

type HeaderNavProps = {
  user:
    | {
      email: string
      displayName?: string
    }
    | null
}

export default function HeaderNav({
  user,
}: HeaderNavProps) {
  const [open, setOpen] =
    useState(false)

  const closeMenu = () =>
    setOpen(false)

  return (
    <div className="relative">
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
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
            email={user.email}
            displayName={user.displayName}
          />
        )}
      </nav>

      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() =>
          setOpen(!open)
        }
        className="md:hidden h-10 w-10 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors flex flex-col items-center justify-center gap-1.5"
      >
        <span className="h-0.5 w-5 rounded-full bg-zinc-200" />
        <span className="h-0.5 w-5 rounded-full bg-zinc-200" />
        <span className="h-0.5 w-5 rounded-full bg-zinc-200" />
      </button>

      {open && (
        <div className="md:hidden absolute right-0 mt-3 w-[min(20rem,calc(100vw-3rem))] border border-zinc-800 bg-zinc-900 rounded-xl shadow-2xl overflow-hidden">
          {user && (
            <div className="p-2">
              <Link
                href="/recipes"
                onClick={closeMenu}
                className="block px-3 py-3 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Recipes
              </Link>

              <Link
                href="/recipes/my"
                onClick={closeMenu}
                className="block px-3 py-3 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                My Recipes
              </Link>

              <Link
                href="/parse"
                onClick={closeMenu}
                className="block px-3 py-3 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Parse
              </Link>
            </div>
          )}

          {!user ? (
            <div className="p-2">
              <Link
                href="/create-account"
                onClick={closeMenu}
                className="block px-3 py-3 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Create Account
              </Link>

              <Link
                href="/login"
                onClick={closeMenu}
                className="block px-3 py-3 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Login
              </Link>
            </div>
          ) : (
            <>
              <div className="p-3 border-t border-zinc-800">
                <div className="text-xs text-zinc-500">
                  Signed in as
                </div>

                <div className="truncate text-sm mt-1">
                  {user.displayName ||
                    user.email}
                </div>

                {user.displayName && (
                  <div className="truncate text-xs text-zinc-500 mt-1">
                    {user.email}
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-zinc-800">
                <Link
                  href="/settings"
                  onClick={closeMenu}
                  className="block px-3 py-3 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Settings
                </Link>

                <a
                  href="/logout"
                  onClick={closeMenu}
                  className="block px-3 py-3 rounded-lg hover:bg-red-950 hover:text-red-200 transition-colors"
                >
                  Logout
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
