import Link from "next/link"
import recipes from "@/data/recipes.json"

export default async function RecipesPage() {

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold">
          Recipes
        </h1>

        <p className="text-zinc-400 mt-3">
          Structured and AI-normalized recipe data.
        </p>
      </div>

      <div className="space-y-4">
        {recipes.map((recipe) => (
          <Link
            key={recipe.slug}
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
      </div>
    </div>
  )
}