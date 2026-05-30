"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { createClient } from "@/utils/supabase/client"

type SettingsFormProps = {
  email: string
  metadata: Record<string, unknown>
}

function getMetadataString(
  metadata: Record<string, unknown>,
  key: string
) {
  const value = metadata[key]

  return typeof value === "string"
    ? value
    : ""
}

function normalizeUrl(value: string) {
  const trimmed = value.trim()

  if (
    !trimmed ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed
  }

  return `https://${trimmed}`
}

export default function SettingsForm({
  email,
  metadata,
}: SettingsFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] =
    useState(
      getMetadataString(
        metadata,
        "display_name"
      )
    )

  const [username, setUsername] =
    useState(
      getMetadataString(
        metadata,
        "username"
      )
    )

  const [avatarUrl, setAvatarUrl] =
    useState(
      getMetadataString(
        metadata,
        "avatar_url"
      )
    )

  const [bio, setBio] =
    useState(
      getMetadataString(
        metadata,
        "bio"
      )
    )

  const [accountEmail, setAccountEmail] =
    useState(email)

  const [saving, setSaving] =
    useState(false)

  const [savingEmail, setSavingEmail] =
    useState(false)

  const [message, setMessage] =
    useState<string | null>(null)

  const [emailMessage, setEmailMessage] =
    useState<string | null>(null)

  async function saveSettings() {
    setSaving(true)
    setMessage(null)

    try {
      const { error } =
        await supabase.auth.updateUser({
          data: {
            ...metadata,
            display_name:
              displayName.trim(),
            username:
              username.trim(),
            avatar_url:
              normalizeUrl(avatarUrl),
            bio:
              bio.trim(),
          },
        })

      if (error) {
        setMessage(error.message)
        return
      }

      setMessage("Settings saved.")
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function updateEmail() {
    const nextEmail =
      accountEmail.trim()

    if (!nextEmail || nextEmail === email) {
      return
    }

    setSavingEmail(true)
    setEmailMessage(null)

    try {
      const { error } =
        await supabase.auth.updateUser({
          email: nextEmail,
        })

      if (error) {
        setEmailMessage(error.message)
        return
      }

      setEmailMessage(
        "Check your email to confirm the change."
      )
    } finally {
      setSavingEmail(false)
    }
  }

  return (
    <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-5 space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-sm text-zinc-500 mb-2">
            Email
          </div>

          <input
            type="email"
            value={accountEmail}
            onChange={(e) =>
              setAccountEmail(e.target.value)
            }
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3"
          />
        </div>

        <div>
          <div className="text-sm text-zinc-500 mb-2">
            Sign-in Provider
          </div>

          <input
            value="Magic link"
            readOnly
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-400"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
        <div className="space-y-1">
          <div className="text-sm font-medium">
            Account Access
          </div>

          <div className="text-sm text-zinc-500">
            Email changes require confirmation.
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={updateEmail}
            disabled={
              savingEmail ||
              !accountEmail.trim() ||
              accountEmail.trim() === email
            }
            className="border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {savingEmail
              ? "Sending..."
              : "Change Email"}
          </button>
        </div>
      </div>

      {emailMessage && (
        <div className="text-sm text-zinc-400">
          {emailMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm text-zinc-500 mb-2">
            Display Name
          </label>

          <input
            value={displayName}
            onChange={(e) =>
              setDisplayName(e.target.value)
            }
            placeholder="How your name appears"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-500 mb-2">
            Avatar URL
          </label>

          <input
            value={avatarUrl}
            onChange={(e) =>
              setAvatarUrl(e.target.value)
            }
            placeholder="https://..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-zinc-500 mb-2">
          Username
        </label>

        <input
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          placeholder="chefjoe"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-500 mb-2">
          Bio
        </label>

        <textarea
          value={bio}
          onChange={(e) =>
            setBio(e.target.value)
          }
          placeholder="A short note about you"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 h-24"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
          className="border border-emerald-500 bg-emerald-500 hover:bg-emerald-400 px-6 py-3 rounded-lg font-semibold text-zinc-950 transition-colors disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Settings"}
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
