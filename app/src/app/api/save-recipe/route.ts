import { createActionClient } from "@/utils/supabase/server-actions"
import { slugify } from "@/lib/slugify"

export async function POST(req: Request) {
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

  const recipe = await req.json()

  const slug = slugify(recipe.title)

  const { data: savedRecipe, error } =
    await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        slug,
        title: recipe.title,
        description:
          recipe.description,

        prep_time: recipe.prepTime,
        cook_time: recipe.cookTime,
        servings: recipe.servings,

        source_text:
          recipe.sourceText ?? null,

        visibility: "private",
      })
      .select()
      .single()

  if (error || !savedRecipe) {
    return Response.json(
      {
        error:
          error?.message ??
          "Failed to save recipe",
      },
      {
        status: 500,
      }
    )
  }

  const ingredientRows =
    recipe.ingredients.map(
      (
        ingredient: {
          amount: string
          unit: string
          ingredient: string
        },
        index: number
      ) => ({
        recipe_id: savedRecipe.id,
        position: index,
        amount:ingredient.amount,
        unit: ingredient.unit,
        ingredient_text: ingredient.ingredient,
        provenance: "verbatim",
      })
    )

  if (ingredientRows.length > 0) {
    await supabase
      .from("recipe_ingredients")
      .insert(ingredientRows)
  }

  const instructionRows =
    recipe.instructions.map(
      (
        instruction: string,
        index: number
      ) => ({
        recipe_id: savedRecipe.id,
        step_number: index + 1,
        instruction,
        provenance: "verbatim",
      })
    )

  if (instructionRows.length > 0) {
    await supabase
      .from("recipe_instructions")
      .insert(instructionRows)
  }

  return Response.json({
    success: true,

    recipeId: savedRecipe.id,

    slug: savedRecipe.slug,
  })
}