import { createActionClient } from "@/utils/supabase/server-actions"

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

  const {
    data: existingRecipe,
    error: recipeLookupError,
  } = await supabase
    .from("recipes")
    .select(`
      id,
      user_id,
      hero_image_url
    `)
    .eq("slug", recipe.slug)
    .is("deleted_at", null)
    .single()

  if (
    recipeLookupError ||
    !existingRecipe
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
    existingRecipe.user_id !==
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

  let heroImageUrl =
    existingRecipe.hero_image_url

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

  const {
    error: updateError,
  } = await supabase
    .from("recipes")
    .update({
      visibility:
        recipe.visibility ??
        "private",

      title: recipe.title,

      title_provenance:
        recipe.titleProvenance,

      description:
        recipe.description,

      description_provenance:
        recipe.descriptionProvenance,

      prep_time:
        recipe.prepTime,

      prep_time_provenance:
        recipe.prepTimeProvenance,

      cook_time:
        recipe.cookTime,

      cook_time_provenance:
        recipe.cookTimeProvenance,

      servings:
        recipe.servings,

      servings_provenance:
        recipe.servingsProvenance,

      hero_image_url:
        heroImageUrl,
    })
    .eq(
      "id",
      existingRecipe.id
    )

  if (updateError) {
    return Response.json(
      {
        error:
          updateError.message,
      },
      {
        status: 500,
      }
    )
  }

  const incomingIngredientIds =
    recipe.ingredients
      .filter(
        (
          ingredient: {
            id?: string
          }
        ) => ingredient.id
      )
      .map(
        (
          ingredient: {
            id: string
          }
        ) => ingredient.id
      )

  const {
    data:
    existingIngredients,
  } = await supabase
    .from(
      "recipe_ingredients"
    )
    .select(`
      id
    `)
    .eq(
      "recipe_id",
      existingRecipe.id
    )

  const ingredientIdsToDelete =
    existingIngredients
      ?.filter(
        (
          existingIngredient
        ) =>
          !incomingIngredientIds.includes(
            existingIngredient.id
          )
      )
      .map(
        (
          ingredient
        ) => ingredient.id
      ) ?? []

  if (
    ingredientIdsToDelete.length >
    0
  ) {
    const {
      error:
      ingredientDeleteError,
    } = await supabase
      .from(
        "recipe_ingredients"
      )
      .delete()
      .in(
        "id",
        ingredientIdsToDelete
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
  }

  for (
    let index = 0;
    index <
    recipe.ingredients.length;
    index++
  ) {
    const ingredient =
      recipe.ingredients[index]

    const ingredientExists =
      existingIngredients?.some(
        (
          existingIngredient
        ) =>
          existingIngredient.id ===
          ingredient.id
      )

    if (ingredientExists) {
      const {
        error:
        ingredientUpdateError,
      } = await supabase
        .from(
          "recipe_ingredients"
        )
        .update({
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
        .eq(
          "id",
          ingredient.id
        )

      if (
        ingredientUpdateError
      ) {
        return Response.json(
          {
            error:
              ingredientUpdateError.message,
          },
          {
            status: 500,
          }
        )
      }
    } else {
      const {
        error:
        ingredientInsertError,
      } = await supabase
        .from(
          "recipe_ingredients"
        )
        .insert({
          id:
            ingredient.id,

          recipe_id:
            existingRecipe.id,

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

      if (
        ingredientInsertError
      ) {
        return Response.json(
          {
            error:
              ingredientInsertError.message,
          },
          {
            status: 500,
          }
        )
      }
    }
  }

  const incomingInstructionIds =
    recipe.instructions
      .filter(
        (
          instruction: {
            id?: string
          }
        ) => instruction.id
      )
      .map(
        (
          instruction: {
            id: string
          }
        ) => instruction.id
      )

  const {
    data:
    existingInstructions,
  } = await supabase
    .from(
      "recipe_instructions"
    )
    .select(`
      id
    `)
    .eq(
      "recipe_id",
      existingRecipe.id
    )

  const instructionIdsToDelete =
    existingInstructions
      ?.filter(
        (
          existingInstruction
        ) =>
          !incomingInstructionIds.includes(
            existingInstruction.id
          )
      )
      .map(
        (
          instruction
        ) => instruction.id
      ) ?? []

  if (
    instructionIdsToDelete.length >
    0
  ) {
    const {
      error:
      instructionDeleteError,
    } = await supabase
      .from(
        "recipe_instructions"
      )
      .delete()
      .in(
        "id",
        instructionIdsToDelete
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
  }

  for (
    let index = 0;
    index <
    recipe.instructions.length;
    index++
  ) {
    const instruction =
      recipe.instructions[index]

    const instructionExists =
      existingInstructions?.some(
        (
          existingInstruction
        ) =>
          existingInstruction.id ===
          instruction.id
      )

    if (instructionExists) {
      const {
        error:
        instructionUpdateError,
      } = await supabase
        .from(
          "recipe_instructions"
        )
        .update({
          step_number:
            index + 1,

          instruction:
            instruction.value,

          provenance:
            instruction.provenance,
        })
        .eq(
          "id",
          instruction.id
        )

      if (
        instructionUpdateError
      ) {
        return Response.json(
          {
            error:
              instructionUpdateError.message,
          },
          {
            status: 500,
          }
        )
      }
    } else {
      const {
        error:
        instructionInsertError,
      } = await supabase
        .from(
          "recipe_instructions"
        )
        .insert({
          id:
            instruction.id,

          recipe_id:
            existingRecipe.id,

          step_number:
            index + 1,

          instruction:
            instruction.value,

          provenance:
            instruction.provenance,
        })

      if (
        instructionInsertError
      ) {
        return Response.json(
          {
            error:
              instructionInsertError.message,
          },
          {
            status: 500,
          }
        )
      }
    }
  }

  return Response.json({
    success: true,

    slug: recipe.slug,
  })
}