import { notFound } from "next/navigation"

import { createClient } from "@/utils/supabase/server"

import DeleteButton from "./DeleteButton"

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()

  const {
    data: recipe,
    error,
  } = await supabase
    .from("recipes")
    .select(`
      id,
      slug,
      title,
      description,
      prep_time,
      cook_time,
      servings
    `)
    .eq("slug", slug)
    .is("deleted_at", null)
    .single()

  if (error || !recipe) {
    notFound()
  }

  const {
    data: ingredients,
  } = await supabase
    .from("recipe_ingredients")
    .select(`
      id,
      amount,
      unit,
      ingredient_text,
      position
    `)
    .eq("recipe_id", recipe.id)
    .is("deleted_at", null)
    .order("position")

  const {
    data: instructions,
  } = await supabase
    .from("recipe_instructions")
    .select(`
      id,
      instruction,
      step_number
    `)
    .eq("recipe_id", recipe.id)
    .is("deleted_at", null)
    .order("step_number")

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-5xl font-bold">
            {recipe.title}
          </h1>

          <p className="text-xl text-zinc-400 mt-4">
            {recipe.description}
          </p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="border border-zinc-800 bg-zinc-900 rounded-xl px-4 py-3">
            <div className="text-xs text-zinc-500 uppercase">
              Prep Time
            </div>

            <div className="text-lg font-medium">
              {recipe.prep_time || "—"}
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-900 rounded-xl px-4 py-3">
            <div className="text-xs text-zinc-500 uppercase">
              Cook Time
            </div>

            <div className="text-lg font-medium">
              {recipe.cook_time || "—"}
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-900 rounded-xl px-4 py-3">
            <div className="text-xs text-zinc-500 uppercase">
              Servings
            </div>

            <div className="text-lg font-medium">
              {recipe.servings || "—"}
            </div>
          </div>
        </div>

        <DeleteButton slug={recipe.slug} />
      </div>

      <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6">
        <h2 className="text-3xl font-semibold mb-6">
          Ingredients
        </h2>

        <ul className="space-y-3 text-zinc-300">
          {ingredients?.map(
            (ingredient) => (
              <li key={ingredient.id}>
                <span className="font-medium text-white">
                  {ingredient.amount}{" "}
                  {ingredient.unit}
                </span>{" "}
                {
                  ingredient.ingredient_text
                }
              </li>
            )
          )}
        </ul>
      </div>

      <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6">
        <h2 className="text-3xl font-semibold mb-6">
          Instructions
        </h2>

        <ol className="space-y-5 list-decimal pl-6 text-zinc-300">
          {instructions?.map(
            (step) => (
              <li
                key={step.id}
                className="pl-2"
              >
                {step.instruction}
              </li>
            )
          )}
        </ol>
      </div>
    </div>
  )
}