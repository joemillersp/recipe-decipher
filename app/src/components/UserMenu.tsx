"use client"

import Link from "next/link"
import { useState } from "react"

export default function UserMenu({
  email,
  displayName,
}: {
  email: string
  displayName?: string
}) {
  const [open, setOpen] =
    useState(false)

  const label =
    displayName || email

  const initial =
    label?.[0]?.toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() =>
          setOpen(!open)
        }
        className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-xl transition-colors flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
          {initial}
        </div>

        <div className="text-left">
          <div className="text-xs text-zinc-500">
            Signed in
          </div>

          <div className="max-w-[160px] truncate">
            {label}
          </div>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 border border-zinc-800 bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="p-3 border-b border-zinc-800">
            <div className="text-xs text-zinc-500">
              Signed in as
            </div>

            <div className="truncate text-sm mt-1">
              {label}
            </div>

            {displayName && (
              <div className="truncate text-xs text-zinc-500 mt-1">
                {email}
              </div>
            )}
          </div>

          <div className="p-2">
            <Link
              href="/settings"
              onClick={() =>
                setOpen(false)
              }
              className="block px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Settings
            </Link>
          </div>

          <div className="border-t border-zinc-800 p-2">
            <a
              href="/logout"
              onClick={() =>
                setOpen(false)
              }
              className="block px-3 py-2 rounded-lg hover:bg-red-950 hover:text-red-200 transition-colors"
            >
              Logout
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
