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

  let heroImageUrl: string | null =
    null

  if (recipe.generatedImage) {
    const base64Data =
      recipe.generatedImage.replace(
        /^data:image\/png;base64,/,
        ""
      )

    const buffer = Buffer.from(
      base64Data,
      "base64"
    )

    const fileName = `${crypto.randomUUID()}.png`

    const {
      error: uploadError,
    } = await supabase.storage
      .from("recipe-images")
      .upload(
        fileName,
        buffer,
        {
          contentType:
            "image/png",
        }
      )

    if (!uploadError) {
      const { data } =
        supabase.storage
          .from(
            "recipe-images"
          )
          .getPublicUrl(
            fileName
          )

      heroImageUrl =
        data.publicUrl
    }
  }

  const slug = slugify(
    recipe.title
  )

  const {
    data: savedRecipe,
    error,
  } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,

      slug,

      title: recipe.title,

      description:
        recipe.description,

      prep_time:
        recipe.prepTime,

      cook_time:
        recipe.cookTime,

      servings:
        recipe.servings,

      source_text:
        recipe.sourceText ??
        null,

      hero_image_url:
        heroImageUrl,

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
          provenance: string
        },
        index: number
      ) => ({
        recipe_id: savedRecipe.id,

        position: index,

        amount:
          ingredient.amount,

        unit:
          ingredient.unit,

        ingredient_text:
          ingredient.ingredient,

        provenance:
          ingredient.provenance,
      })
    )

  if (ingredientRows.length > 0) {
    const {
      error:
        ingredientError,
    } = await supabase
      .from(
        "recipe_ingredients"
      )
      .insert(ingredientRows)

    if (ingredientError) {
      return Response.json(
        {
          error:
            ingredientError.message,
        },
        {
          status: 500,
        }
      )
    }
  }

  const instructionRows =
    recipe.instructions.map(
      (
        instruction: {
          value: string
          provenance: string
        },
        index: number
      ) => ({
        recipe_id: savedRecipe.id,

        step_number:
          index + 1,

        instruction:
          instruction.value,

        provenance:
          instruction.provenance,
      })
    )

  if (
    instructionRows.length > 0
  ) {
    const {
      error:
        instructionError,
    } = await supabase
      .from(
        "recipe_instructions"
      )
      .insert(
        instructionRows
      )

    if (instructionError) {
      return Response.json(
        {
          error:
            instructionError.message,
        },
        {
          status: 500,
        }
      )
    }
  }

  return Response.json({
    success: true,

    recipeId:
      savedRecipe.id,

    slug:
      savedRecipe.slug,
  })
}