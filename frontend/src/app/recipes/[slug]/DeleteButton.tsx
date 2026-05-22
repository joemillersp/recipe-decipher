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
      className="mt-6 border px-4 py-2 rounded-xl"
    >
      Delete Recipe
    </button>
  )
}