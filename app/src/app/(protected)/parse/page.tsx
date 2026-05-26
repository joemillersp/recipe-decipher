"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ParsePage() {
  const router = useRouter()

  const [recipe, setRecipe] = useState("")
  const [result, setResult] = useState<any>(null)

  const [loading, setLoading] =
    useState(false)

  const [saving, setSaving] =
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

      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  async function saveRecipe() {
    setSaving(true)

    try {
      const res = await fetch(
        "/api/save-recipe",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(result),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        alert(
          data.error ??
            "Failed to save recipe"
        )

        return
      }

      router.push(
        `/recipes/${data.slug}`
      )
    } finally {
      setSaving(false)
    }
  }

  function updateField(
    field: string,
    value: string
  ) {
    setResult({
      ...result,
      [field]: value,
    })
  }

  function updateIngredient(
    idx: number,
    field: string,
    value: string
  ) {
    const updated = [
      ...result.ingredients,
    ]

    updated[idx] = {
      ...updated[idx],
      [field]: value,
    }

    setResult({
      ...result,
      ingredients: updated,
    })
  }

  function updateInstruction(
    idx: number,
    value: string
  ) {
    const updated = [
      ...result.instructions,
    ]

    updated[idx] = value

    setResult({
      ...result,
      instructions: updated,
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold">
          Parse Recipe
        </h1>

        <p className="text-zinc-400 mt-3">
          Paste messy recipe content and
          normalize it into structured
          data.
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
        <div className="space-y-8">
          <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 space-y-6">
            <div>
              <label className="text-sm text-zinc-400">
                Title
              </label>

              <input
                value={result.title}
                onChange={(e) =>
                  updateField(
                    "title",
                    e.target.value
                  )
                }
                className="w-full mt-2 bg-zinc-950 border border-zinc-700 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Description
              </label>

              <textarea
                value={result.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                className="w-full mt-2 bg-zinc-950 border border-zinc-700 rounded-xl p-3 h-24"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-zinc-400">
                  Prep Time
                </label>

                <input
                  value={result.prepTime}
                  onChange={(e) =>
                    updateField(
                      "prepTime",
                      e.target.value
                    )
                  }
                  className="w-full mt-2 bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">
                  Cook Time
                </label>

                <input
                  value={result.cookTime}
                  onChange={(e) =>
                    updateField(
                      "cookTime",
                      e.target.value
                    )
                  }
                  className="w-full mt-2 bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">
                  Servings
                </label>

                <input
                  value={result.servings}
                  onChange={(e) =>
                    updateField(
                      "servings",
                      e.target.value
                    )
                  }
                  className="w-full mt-2 bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                />
              </div>
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 space-y-4">
            <h2 className="text-3xl font-semibold">
              Ingredients
            </h2>

            {result.ingredients.map(
              (
                ingredient: any,
                idx: number
              ) => (
                <div
                  key={idx}
                  className="grid md:grid-cols-3 gap-3"
                >
                  <input
                    value={
                      ingredient.amount
                    }
                    onChange={(e) =>
                      updateIngredient(
                        idx,
                        "amount",
                        e.target.value
                      )
                    }
                    placeholder="Amount"
                    className="bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                  />

                  <input
                    value={
                      ingredient.unit
                    }
                    onChange={(e) =>
                      updateIngredient(
                        idx,
                        "unit",
                        e.target.value
                      )
                    }
                    placeholder="Unit"
                    className="bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                  />

                  <input
                    value={
                      ingredient.ingredient
                    }
                    onChange={(e) =>
                      updateIngredient(
                        idx,
                        "ingredient",
                        e.target.value
                      )
                    }
                    placeholder="Ingredient"
                    className="bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                  />
                </div>
              )
            )}
          </div>

          <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 space-y-4">
            <h2 className="text-3xl font-semibold">
              Instructions
            </h2>

            {result.instructions.map(
              (
                step: string,
                idx: number
              ) => (
                <textarea
                  key={idx}
                  value={step}
                  onChange={(e) =>
                    updateInstruction(
                      idx,
                      e.target.value
                    )
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 h-28"
                />
              )
            )}
          </div>

          <button
            onClick={saveRecipe}
            disabled={saving}
            className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Recipe"}
          </button>
        </div>
      )}
    </div>
  )
}