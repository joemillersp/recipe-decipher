import Link from "next/link"

import { createClient } from "@/utils/supabase/server"

export default async function RecipesPage() {
  const supabase =
    await createClient()

  const {
    data: recipes,
    error,
  } = await supabase
    .from("recipes")
    .select(`
      id,
      slug,
      title,
      description,
      visibility,
      hero_image_url,
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

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {recipes?.map(
          (recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.slug}`}
              className="block border border-zinc-800 bg-zinc-900 rounded-2xl overflow-hidden hover:bg-zinc-800 transition-colors"
            >
              {recipe.hero_image_url && (
                <img
                  src={
                    recipe.hero_image_url
                  }
                  alt={recipe.title}
                  className="w-full aspect-[4/3] object-cover border-b border-zinc-800"
                />
              )}

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold">
                    {recipe.title}
                  </h2>

                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${recipe.visibility ===
                      "public"
                        ? "border-green-700 text-green-400 bg-green-950"
                        : "border-zinc-700 text-zinc-400 bg-zinc-950"
                      }`}
                  >
                    {recipe.visibility ===
                    "public"
                      ? "Public"
                      : "Private"}
                  </span>
                </div>

                <p className="text-zinc-400 line-clamp-3">
                  {
                    recipe.description
                  }
                </p>
              </div>
            </Link>
          )
        )}

        {recipes?.length ===
          0 && (
          <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-6 text-zinc-400">
            No recipes yet.
          </div>
        )}
      </div>
    </div>
  )
}