"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Provenance =
  | "verbatim"
  | "normalized"
  | "inferred"

type ParsedField = {
  value: string
  provenance: Provenance
}

type ParsedIngredient = {
  amount: ParsedField
  unit: ParsedField
  ingredient: ParsedField
}

type ParsedInstruction = {
  value: string
  provenance: Provenance
}

type ParsedRecipe = {
  slug: string

  title: ParsedField

  description: ParsedField

  ingredients: ParsedIngredient[]

  instructions: ParsedInstruction[]

  prepTime: ParsedField

  cookTime: ParsedField

  servings: ParsedField
}

function provenanceClasses(
  provenance: Provenance
) {
  switch (provenance) {
    case "verbatim":
      return "border-emerald-700 bg-emerald-950/30 text-emerald-300"

    case "normalized":
      return "border-amber-700 bg-amber-950/30 text-amber-300"

    case "inferred":
      return "border-red-700 bg-red-950/30 text-red-300"

    default:
      return "border-zinc-700 bg-zinc-900 text-zinc-300"
  }
}

function ProvenanceBadge({
  provenance,
}: {
  provenance: Provenance
}) {
  return (
    <div
      className={`text-xs px-2 py-1 rounded-full border uppercase tracking-wide ${provenanceClasses(
        provenance
      )}`}
    >
      {provenance}
    </div>
  )
}

export default function ParsePage() {
  const router = useRouter()

  const [recipe, setRecipe] =
    useState("")

  const [result, setResult] =
    useState<ParsedRecipe | null>(
      null
    )

  const [loading, setLoading] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [imageMode, setImageMode] =
    useState<"ai" | "upload">(
      "ai"
    )

  const [imageFile, setImageFile] =
    useState<File | null>(null)

  const [generatedImage, setGeneratedImage] =
    useState<string | null>(null)

  const [generatingImage, setGeneratingImage] =
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

  async function generateImage() {
    if (!result) return

    setGeneratingImage(true)

    try {
      const res = await fetch(
        "/api/generate-recipe-image",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title:
              result.title.value,

            description:
              result.description
                .value,

            ingredients:
              result.ingredients.map(
                (
                  ingredient
                ) => ({
                  ingredient:
                    ingredient
                      .ingredient
                      .value,
                })
              ),
          }),
        }
      )

      const data = await res.json()

      if (data.image) {
        setGeneratedImage(
          `data:image/png;base64,${data.image}`
        )
      }
    } finally {
      setGeneratingImage(false)
    }
  }

  async function saveRecipe() {
    if (!result) return

    setSaving(true)

    try {
      const normalizedRecipe = {
        slug: result.slug,

        title:
          result.title.value,

        description:
          result.description.value,

        prepTime:
          result.prepTime.value,

        cookTime:
          result.cookTime.value,

        servings:
          result.servings.value,

        sourceText: recipe,

        generatedImage,

        ingredients:
          result.ingredients.map(
            (ingredient) => ({
              amount:
                ingredient.amount
                  .value,

              unit:
                ingredient.unit
                  .value,

              ingredient:
                ingredient
                  .ingredient
                  .value,

              provenance:
                ingredient
                  .ingredient
                  .provenance,
            })
          ),

        instructions:
          result.instructions.map(
            (instruction) => ({
              value:
                instruction.value,

              provenance:
                instruction.provenance,
            })
          ),
      }

      const res = await fetch(
        "/api/save-recipe",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            normalizedRecipe
          ),
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
    field:
      | "title"
      | "description"
      | "prepTime"
      | "cookTime"
      | "servings",
    value: string
  ) {
    if (!result) return

    setResult({
      ...result,

      [field]: {
        ...result[field],

        value,
      },
    })
  }

  function updateIngredient(
    idx: number,
    field:
      | "amount"
      | "unit"
      | "ingredient",
    value: string
  ) {
    if (!result) return

    const updated = [
      ...result.ingredients,
    ]

    updated[idx] = {
      ...updated[idx],

      [field]: {
        ...updated[idx][field],

        value,
      },
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
    if (!result) return

    const updated = [
      ...result.instructions,
    ]

    updated[idx] = {
      ...updated[idx],

      value,
    }

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
        <div className="space-y-8">
          <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-zinc-400">
                  Title
                </label>

                <ProvenanceBadge
                  provenance={
                    result.title
                      .provenance
                  }
                />
              </div>

              <input
                value={
                  result.title.value
                }
                onChange={(e) =>
                  updateField(
                    "title",
                    e.target.value
                  )
                }
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-zinc-400">
                  Description
                </label>

                <ProvenanceBadge
                  provenance={
                    result
                      .description
                      .provenance
                  }
                />
              </div>

              <textarea
                value={
                  result.description
                    .value
                }
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 h-24"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-400">
                    Prep Time
                  </label>

                  <ProvenanceBadge
                    provenance={
                      result
                        .prepTime
                        .provenance
                    }
                  />
                </div>

                <input
                  value={
                    result.prepTime
                      .value
                  }
                  onChange={(e) =>
                    updateField(
                      "prepTime",
                      e.target.value
                    )
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-400">
                    Cook Time
                  </label>

                  <ProvenanceBadge
                    provenance={
                      result
                        .cookTime
                        .provenance
                    }
                  />
                </div>

                <input
                  value={
                    result.cookTime
                      .value
                  }
                  onChange={(e) =>
                    updateField(
                      "cookTime",
                      e.target.value
                    )
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-400">
                    Servings
                  </label>

                  <ProvenanceBadge
                    provenance={
                      result
                        .servings
                        .provenance
                    }
                  />
                </div>

                <input
                  value={
                    result.servings
                      .value
                  }
                  onChange={(e) =>
                    updateField(
                      "servings",
                      e.target.value
                    )
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
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
                ingredient,
                idx
              ) => (
                <div
                  key={idx}
                  className="grid md:grid-cols-3 gap-3"
                >
                  <div>
                    <div className="mb-2">
                      <ProvenanceBadge
                        provenance={
                          ingredient
                            .amount
                            .provenance
                        }
                      />
                    </div>

                    <input
                      value={
                        ingredient
                          .amount.value
                      }
                      onChange={(e) =>
                        updateIngredient(
                          idx,
                          "amount",
                          e.target
                            .value
                        )
                      }
                      placeholder="Amount"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                    />
                  </div>

                  <div>
                    <div className="mb-2">
                      <ProvenanceBadge
                        provenance={
                          ingredient
                            .unit
                            .provenance
                        }
                      />
                    </div>

                    <input
                      value={
                        ingredient.unit
                          .value
                      }
                      onChange={(e) =>
                        updateIngredient(
                          idx,
                          "unit",
                          e.target
                            .value
                        )
                      }
                      placeholder="Unit"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                    />
                  </div>

                  <div>
                    <div className="mb-2">
                      <ProvenanceBadge
                        provenance={
                          ingredient
                            .ingredient
                            .provenance
                        }
                      />
                    </div>

                    <input
                      value={
                        ingredient
                          .ingredient
                          .value
                      }
                      onChange={(e) =>
                        updateIngredient(
                          idx,
                          "ingredient",
                          e.target
                            .value
                        )
                      }
                      placeholder="Ingredient"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                    />
                  </div>
                </div>
              )
            )}
          </div>

          <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 space-y-4">
            <h2 className="text-3xl font-semibold">
              Instructions
            </h2>

            {result.instructions.map(
              (step, idx) => (
                <div
                  key={idx}
                  className="space-y-2"
                >
                  <ProvenanceBadge
                    provenance={
                      step.provenance
                    }
                  />

                  <textarea
                    value={step.value}
                    onChange={(e) =>
                      updateInstruction(
                        idx,
                        e.target.value
                      )
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 h-28"
                  />
                </div>
              )
            )}
          </div>

          <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-3xl font-semibold">
                Recipe Image
              </h2>

              <p className="text-zinc-400 mt-2">
                Upload an image or
                generate one with
                AI.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setImageMode(
                    "ai"
                  )
                }
                className={`px-4 py-2 rounded-xl border transition-colors ${
                  imageMode ===
                  "ai"
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 bg-zinc-950"
                }`}
              >
                AI Image
              </button>

              <button
                onClick={() =>
                  setImageMode(
                    "upload"
                  )
                }
                className={`px-4 py-2 rounded-xl border transition-colors ${
                  imageMode ===
                  "upload"
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 bg-zinc-950"
                }`}
              >
                Upload
              </button>
            </div>

            {imageMode ===
              "upload" && (
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(
                      e.target
                        .files?.[0] ??
                        null
                    )
                  }
                />

                {imageFile && (
                  <img
                    src={URL.createObjectURL(
                      imageFile
                    )}
                    alt="Preview"
                    className="rounded-2xl border border-zinc-800 max-w-xl"
                  />
                )}
              </div>
            )}

            {imageMode ===
              "ai" && (
              <div className="space-y-4">
                <button
                  onClick={
                    generateImage
                  }
                  disabled={
                    generatingImage
                  }
                  className="border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 px-5 py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {generatingImage
                    ? "Generating..."
                    : "Generate AI Image"}
                </button>

                {generatedImage && (
                  <img
                    src={
                      generatedImage
                    }
                    alt="Generated recipe"
                    className="rounded-2xl border border-zinc-800 max-w-xl"
                  />
                )}
              </div>
            )}

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
        </div>
      )}
    </div>
  )
}