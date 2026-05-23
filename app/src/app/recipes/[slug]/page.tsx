import recipes from "@/data/recipes.json"
import { notFound } from "next/navigation"
import DeleteButton from "./DeleteButton"

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const recipe = recipes.find(
    (r) => r.slug === slug
  )

  if (!recipe) {
    notFound()
  }

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
              {recipe.prepTime || "—"}
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-900 rounded-xl px-4 py-3">
            <div className="text-xs text-zinc-500 uppercase">
              Cook Time
            </div>

            <div className="text-lg font-medium">
              {recipe.cookTime || "—"}
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
          {recipe.ingredients.map((i, idx) => (
            <li key={idx}>
              <span className="font-medium text-white">
                {i.amount} {i.unit}
              </span>{" "}
              {i.ingredient}
            </li>
          ))}
        </ul>
      </div>

      <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6">
        <h2 className="text-3xl font-semibold mb-6">
          Instructions
        </h2>

        <ol className="space-y-5 list-decimal pl-6 text-zinc-300">
          {recipe.instructions.map((step, idx) => (
            <li key={idx} className="pl-2">
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}