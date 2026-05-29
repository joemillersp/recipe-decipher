"use client"

import { useState } from "react"

import RecipeEditor, {
  RecipeEditorResult,
} from "@/components/RecipeEditor"

export default function ParsePage() {
  const [recipe, setRecipe] =
    useState("")

  const [result, setResult] =
    useState<RecipeEditorResult | null>(
      null
    )

  const [loading, setLoading] =
    useState(false)

  async function parseRecipe() {
    setLoading(true)

    try {
      const res = await fetch(
        "/api/parse-recipe",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            recipe,
          }),
        }
      )

      const data = await res.json()

      setResult({
        ...data,

        ingredients:
          data.ingredients?.map(
            (ingredient: any) => ({
              ...ingredient,

              id:
                crypto.randomUUID(),
            })
          ) ?? [],

        instructions:
          data.instructions?.map(
            (instruction: any) => ({
              ...instruction,

              id:
                crypto.randomUUID(),
            })
          ) ?? [],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold">
          Parse Recipe
        </h1>

        <p className="text-zinc-400 mt-3">
          Paste messy recipe content
          and normalize it into
          structured data.
        </p>
      </div>

      <textarea
        value={recipe}
        onChange={(e) =>
          setRecipe(e.target.value)
        }
        className="border border-zinc-800 bg-zinc-900 rounded-xl w-full h-64 p-4"
        placeholder="Paste recipe..."
      />

      <button
        onClick={parseRecipe}
        disabled={loading}
        className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-6 py-3 rounded-xl min-w-[140px] transition-colors disabled:opacity-50"
      >
        {loading
          ? "Parsing..."
          : "Parse"}
      </button>

      {result && (
        <RecipeEditor
          mode="create"
          initialRecipe={result}
          sourceText={recipe}
          saveEndpoint="/api/save-recipe"
        />
      )}
    </div>
  )
}