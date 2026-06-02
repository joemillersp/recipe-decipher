"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

export default function LoginPage() {
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [loading, setLoading] =
    useState(false)
  const [message, setMessage] =
    useState<string | null>(null)

  async function signIn() {
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setMessage("Enter your email first.")
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } =
        await supabase.auth.signInWithOtp({
          email: trimmedEmail,
          options: {
            shouldCreateUser: false,
            emailRedirectTo:
              `${window.location.origin}/auth/confirm`,
          },
        })

      if (error) {
        setMessage(error.message)
        return
      }

      setMessage(
        "If that account exists, check your email for a magic link."
      )
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGithub() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo:
          `${window.location.origin}/auth/confirm`,
      },
    })
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-5xl font-bold">
          Login
        </h1>

        <p className="text-zinc-400 mt-3">
          Sign in with GitHub or use a magic link for an existing account.
        </p>
      </div>

      <button
        type="button"
        onClick={signInWithGithub}
        className="w-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-6 py-3 rounded-xl transition-colors"
      >
        Continue with GitHub
      </button>

      <div className="border-t border-zinc-800 pt-6 space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3"
        />

        <button
          onClick={signIn}
          disabled={loading}
          className="w-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading
            ? "Sending..."
            : "Send Magic Link"}
        </button>

        {message && (
          <div className="text-sm text-zinc-400">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
