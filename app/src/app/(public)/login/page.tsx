"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

export default function LoginPage() {
  const supabase = createClient()

  const [email, setEmail] = useState("")

  async function signIn() {
    const { error } =
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
        },
      })

    if (!error) {
      alert("Check your email")
    }
  }

  async function signInWithGithub() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo:
          `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
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
          Sign in with GitHub or magic link.
        </p>
      </div>

      <button
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
          className="w-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-6 py-3 rounded-xl transition-colors"
        >
          Send Magic Link
        </button>
      </div>
    </div>
  )
}