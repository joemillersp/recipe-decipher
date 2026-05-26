import Link from "next/link"

import { createClient } from "@/utils/supabase/server"

export default async function RecipesPage() {
  const supabase = await createClient()

  const { data: recipes, error } =
    await supabase
      .from("recipes")
      .select(`
        id,
        slug,
        title,
        description,
        created_at
      `)
      .is("deleted_at", null)
      .order("created_at", {
        ascending: false,
      })

  if (error) {
    return (
      <div>
        Failed to load recipes.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold">
          Recipes
        </h1>

        <p className="text-zinc-400 mt-3">
          Structured and AI-normalized
          recipe data.
        </p>
      </div>

      <div className="space-y-4">
        {recipes?.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.slug}`}
            className="block border border-zinc-800 bg-zinc-900 rounded-xl p-5 hover:bg-zinc-800 transition-colors"
          >
            <h2 className="text-2xl font-semibold">
              {recipe.title}
            </h2>

            <p className="text-zinc-400 mt-2">
              {recipe.description}
            </p>
          </Link>
        ))}

        {recipes?.length === 0 && (
          <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-6 text-zinc-400">
            No recipes yet.
          </div>
        )}
      </div>
    </div>
  )
}