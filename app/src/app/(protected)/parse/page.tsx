"use client"

import { useState } from "react"

import RecipeEditor, {
  RecipeEditorResult,
} from "@/components/RecipeEditor"

type ParsedRecipe = Omit<
  RecipeEditorResult,
  "ingredients" | "instructions"
> & {
  ingredients: Array<
    Omit<
      RecipeEditorResult["ingredients"][number],
      "id"
    >
  >
  instructions: Array<
    Omit<
      RecipeEditorResult["instructions"][number],
      "id"
    >
  >
}

type ParseResponse =
  | {
    ok: true
    recipe: ParsedRecipe
  }
  | {
    ok: false
    error?: {
      message?: string
    }
  }

export default function ParsePage() {
  const [recipe, setRecipe] =
    useState("")

  const [result, setResult] =
    useState<RecipeEditorResult | null>(
      null
    )

  const [loading, setLoading] =
    useState(false)

  const [parseError, setParseError] =
    useState<string | null>(null)

  async function parseRecipe() {
    setLoading(true)
    setParseError(null)
    setResult(null)

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

      const data =
        await res.json() as ParseResponse

      if (!res.ok || !data.ok) {
        setParseError(
          !data.ok
            ? data.error?.message ??
            "That does not look like a recipe. Try pasting recipe text with ingredients and instructions."
            : "Failed to parse recipe. Try again."
        )

        return
      }

      setResult({
        ...data.recipe,

        ingredients:
          data.recipe.ingredients.map(
            (ingredient) => ({
              ...ingredient,

              id:
                crypto.randomUUID(),
            })
          ) ?? [],

        instructions:
          data.recipe.instructions.map(
            (instruction) => ({
              ...instruction,

              id:
                crypto.randomUUID(),
            })
          ) ?? [],
      })
    } catch {
      setParseError(
        "Something went wrong while parsing. Try again in a moment."
      )
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
        onChange={(e) => {
          setRecipe(e.target.value)
          setParseError(null)
        }}
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

      {parseError && (
        <div className="border border-red-800 bg-red-950/40 rounded-xl p-4 text-red-200">
          <div className="font-semibold">
            Could not parse recipe
          </div>

          <div className="text-sm mt-2 text-red-100/80">
            {parseError}
          </div>
        </div>
      )}

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
