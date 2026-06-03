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

type UrlExtractResponse =
  | {
    ok: true
    text: string
  }
  | {
    ok: false
    error?: {
      message?: string
    }
  }

type ParseMode =
  | "text"
  | "url"

export default function ParsePage() {
  const [mode, setMode] =
    useState<ParseMode>("text")

  const [recipe, setRecipe] =
    useState("")

  const [recipeUrl, setRecipeUrl] =
    useState("")

  const [sourceText, setSourceText] =
    useState("")

  const [result, setResult] =
    useState<RecipeEditorResult | null>(
      null
    )

  const [loading, setLoading] =
    useState(false)

  const [parseError, setParseError] =
    useState<string | null>(null)

  async function submitRecipeText(
    text: string
  ) {
    const res = await fetch(
      "/api/parse-recipe",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          recipe: text,
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
    setSourceText(text)
  }

  async function extractUrlText() {
    const res = await fetch(
      "/api/extract-recipe-url",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          url: recipeUrl,
        }),
      }
    )

    const data =
      await res.json() as UrlExtractResponse

    if (!res.ok || !data.ok) {
      throw new Error(
        !data.ok
          ? data.error?.message ??
          "Could not import that recipe URL."
          : "Could not import that recipe URL."
      )
    }

    return data.text
  }

  async function parseRecipe() {
    setLoading(true)
    setParseError(null)
    setResult(null)

    try {
      const text =
        mode === "url"
          ? await extractUrlText()
          : recipe

      await submitRecipeText(text)
    } catch (error) {
      setParseError(
        error instanceof Error
          ? error.message
          : mode === "url"
            ? "Could not import and parse that URL. Check the URL or paste the recipe text directly."
            : "Something went wrong while parsing. Try again in a moment."
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
          Paste recipe text or import a
          recipe URL and normalize it
          into structured data.
        </p>
      </div>

      <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-900 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("text")
            setParseError(null)
          }}
          className={`px-4 py-2 rounded-lg transition-colors ${mode === "text"
            ? "bg-white text-zinc-950"
            : "text-zinc-300 hover:bg-zinc-800"
            }`}
        >
          Parse Text
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("url")
            setParseError(null)
          }}
          className={`px-4 py-2 rounded-lg transition-colors ${mode === "url"
            ? "bg-white text-zinc-950"
            : "text-zinc-300 hover:bg-zinc-800"
            }`}
        >
          Parse URL
        </button>
      </div>

      {mode === "text" ? (
        <textarea
          value={recipe}
          onChange={(e) => {
            setRecipe(e.target.value)
            setParseError(null)
          }}
          className="border border-zinc-800 bg-zinc-900 rounded-xl w-full h-64 p-4"
          placeholder="Paste recipe..."
        />
      ) : (
        <input
          type="url"
          value={recipeUrl}
          onChange={(e) => {
            setRecipeUrl(e.target.value)
            setParseError(null)
          }}
          className="border border-zinc-800 bg-zinc-900 rounded-xl w-full p-4"
          placeholder="https://example.com/recipe"
        />
      )}

      <button
        onClick={parseRecipe}
        disabled={loading}
        className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-6 py-3 rounded-xl min-w-[140px] transition-colors disabled:opacity-50"
      >
        {loading
          ? mode === "url"
            ? "Importing..."
            : "Parsing..."
          : mode === "url"
            ? "Import and Parse"
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
          sourceText={sourceText}
          saveEndpoint="/api/save-recipe"
        />
      )}
    </div>
  )
}
