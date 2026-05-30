"use client"

import Link from "next/link"
import { useState } from "react"

import { createClient } from "@/utils/supabase/client"

export default function CreateAccountPage() {
  const supabase = createClient()

  const [email, setEmail] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [message, setMessage] =
    useState<string | null>(null)

  async function createAccount() {
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
            shouldCreateUser: true,
            emailRedirectTo:
              `${window.location.origin}/auth/confirm`,
          },
        })

      if (error) {
        setMessage(error.message)
        return
      }

      setMessage(
        "Check your email to finish creating your account."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-5xl font-bold">
          Create Account
        </h1>

        <p className="text-zinc-400 mt-3">
          Enter your email and we will send a magic link to finish setup.
        </p>
      </div>

      <div className="space-y-4">
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
          onClick={createAccount}
          disabled={loading}
          className="w-full border border-emerald-500 bg-emerald-500 hover:bg-emerald-400 px-6 py-3 rounded-xl font-semibold text-zinc-950 transition-colors disabled:opacity-50"
        >
          {loading
            ? "Sending..."
            : "Create Account"}
        </button>

        {message && (
          <div className="text-sm text-zinc-400">
            {message}
          </div>
        )}
      </div>

      <div className="text-sm text-zinc-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-zinc-300 hover:text-white"
        >
          Log in
        </Link>
      </div>
    </div>
  )
}
