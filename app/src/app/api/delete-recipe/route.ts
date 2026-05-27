import { createActionClient } from "@/utils/supabase/server-actions"

export async function POST(
  req: Request
) {
  const supabase =
    await createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    )
  }

  const { slug } =
    await req.json()

  const {
    data: recipe,
    error: lookupError,
  } = await supabase
    .from("recipes")
    .select(`
      id,
      user_id
    `)
    .eq("slug", slug)
    .single()

  if (
    lookupError ||
    !recipe
  ) {
    return Response.json(
      {
        error:
          "Recipe not found",
      },
      {
        status: 404,
      }
    )
  }

  if (
    recipe.user_id !==
    user.id
  ) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    )
  }

  const timestamp =
    new Date().toISOString()

  const {
    error:
      ingredientDeleteError,
  } = await supabase
    .from(
      "recipe_ingredients"
    )
    .update({
      deleted_at:
        timestamp,
    })
    .eq(
      "recipe_id",
      recipe.id
    )

  if (
    ingredientDeleteError
  ) {
    return Response.json(
      {
        error:
          ingredientDeleteError.message,
      },
      {
        status: 500,
      }
    )
  }

  const {
    error:
      instructionDeleteError,
  } = await supabase
    .from(
      "recipe_instructions"
    )
    .update({
      deleted_at:
        timestamp,
    })
    .eq(
      "recipe_id",
      recipe.id
    )

  if (
    instructionDeleteError
  ) {
    return Response.json(
      {
        error:
          instructionDeleteError.message,
      },
      {
        status: 500,
      }
    )
  }

  const {
    error: recipeDeleteError,
  } = await supabase
    .from("recipes")
    .update({
      deleted_at:
        timestamp,
    })
    .eq("id", recipe.id)

  if (
    recipeDeleteError
  ) {
    return Response.json(
      {
        error:
          recipeDeleteError.message,
      },
      {
        status: 500,
      }
    )
  }

  return Response.json({
    success: true,
  })
}