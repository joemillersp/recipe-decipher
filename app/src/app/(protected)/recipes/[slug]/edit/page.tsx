import { notFound } from "next/navigation"

import { createClient } from "@/utils/supabase/server"

import RecipeEditor, {
  RecipeEditorResult,
} from "@/components/RecipeEditor"

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{
    slug: string
  }>
}) {
  const { slug } =
    await params

  const supabase =
    await createClient()

  const {
    data: recipe,
    error,
  } = await supabase
    .from("recipes")
    .select(`
      id,
      slug,
      visibility,
      title,
      title_provenance,
      description,
      description_provenance,
      prep_time,
      prep_time_provenance,
      cook_time,
      cook_time_provenance,
      servings,
      servings_provenance
    `)
    .eq("slug", slug)
    .single()

  if (error || !recipe) {
    notFound()
  }

  const {
    data: ingredients,
  } = await supabase
    .from(
      "recipe_ingredients"
    )
    .select(`
      id,
      amount,
      unit,
      ingredient_text,
      provenance
    `)
    .eq(
      "recipe_id",
      recipe.id
    )
    .order("position")

  const {
    data: instructions,
  } = await supabase
    .from(
      "recipe_instructions"
    )
    .select(`
      id,
      instruction,
      provenance
    `)
    .eq(
      "recipe_id",
      recipe.id
    )
    .order("step_number")

  const formattedRecipe: RecipeEditorResult =
    {
      slug: recipe.slug,

      visibility:
        recipe.visibility ===
        "public"
          ? "public"
          : "private",

      title: {
        value: recipe.title,

        provenance:
          recipe.title_provenance ??
          "verbatim",
      },

      description: {
        value:
          recipe.description ??
          "",

        provenance:
          recipe.description_provenance ??
          "verbatim",
      },

      prepTime: {
        value:
          recipe.prep_time ??
          "",

        provenance:
          recipe.prep_time_provenance ??
          "verbatim",
      },

      cookTime: {
        value:
          recipe.cook_time ??
          "",

        provenance:
          recipe.cook_time_provenance ??
          "verbatim",
      },

      servings: {
        value:
          recipe.servings ??
          "",

        provenance:
          recipe.servings_provenance ??
          "verbatim",
      },

      ingredients:
        ingredients?.map(
          (
            ingredient
          ) => ({
            id:
              ingredient.id,

            amount:
              ingredient.amount ??
              "",

            unit:
              ingredient.unit ??
              "",

            ingredient:
              ingredient.ingredient_text,

            provenance:
              ingredient.provenance,
          })
        ) ?? [],

      instructions:
        instructions?.map(
          (
            instruction
          ) => ({
            id:
              instruction.id,

            value:
              instruction.instruction,

            provenance:
              instruction.provenance,
          })
        ) ?? [],
    }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold">
          Edit Recipe
        </h1>

        <p className="text-zinc-400 mt-3">
          Update recipe content
          and metadata.
        </p>
      </div>

      <RecipeEditor
        mode="edit"
        initialRecipe={
          formattedRecipe
        }
        saveEndpoint="/api/update-recipe"
      />
    </div>
  )
}