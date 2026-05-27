"use client"

import { useRouter } from "next/navigation"

export default function DeleteButton({
  slug,
}: {
  slug: string
}) {
  const router = useRouter()

  async function deleteRecipe() {
    const confirmed = confirm(
      "Delete this recipe?"
    )

    if (!confirmed) {
      return
    }

    await fetch("/api/delete-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug,
      }),
    })

    router.push("/recipes")
    router.refresh()
  }

  return (
    <button
      onClick={deleteRecipe}
      className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-5 py-3 rounded-xl transition-colors"
    >
      Delete Recipe
    </button>
  )
}