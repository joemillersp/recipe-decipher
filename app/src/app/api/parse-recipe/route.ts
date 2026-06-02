import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type ParsedRecipeCandidate = {
  title?: {
    value?: string
  }
  ingredients?: Array<{
    ingredient?: string
  }>
  instructions?: Array<{
    value?: string
  }>
}

function hasRecipeShape(
  recipe: ParsedRecipeCandidate | undefined
) {
  return Boolean(
    recipe?.title?.value?.trim() &&
    recipe.ingredients?.some(
      (ingredient) =>
        ingredient.ingredient?.trim()
    ) &&
    recipe.instructions?.some(
      (instruction) =>
        instruction.value?.trim()
    )
  )
}

export async function POST(req: Request) {
  const body = await req.json()
  const source =
    typeof body.recipe === "string"
      ? body.recipe.trim()
      : ""

  if (!source) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "empty_input",
          message:
            "Paste recipe content before parsing.",
        },
      },
      {
        status: 400,
      }
    )
  }

  const completion =
    await client.chat.completions.create(
      {
        model: "gpt-4.1-mini",

        messages: [
          {
            role: "system",

            content: `

You are a structured recipe extraction engine.

First determine whether the user-provided text is actually a recipe or contains enough recipe information to extract one.

Valid recipe content must identify food being prepared and include enough cooking structure to extract at least one ingredient and at least one instruction.

If the content is junk, random text, a shopping list, a restaurant review, a meal idea with no procedure, a single ingredient, a product description, or otherwise not enough to extract a recipe, do not invent a recipe.

For invalid content, return this exact JSON shape:

{
  "ok": false,
  "error": {
    "code": "not_a_recipe",
    "message": string
  }
}

The error message should be short, clear, and explain what the user should paste instead.

For valid recipe content, return this exact JSON shape:

{
  "ok": true,
  "recipe": {
    "slug": string,

    "visibility": "private" | "public",

    "title": {
      "value": string,
      "provenance": "verbatim" | "normalized" | "inferred"
    },

    "description": {
      "value": string,
      "provenance": "verbatim" | "normalized" | "inferred"
    },

    "ingredients": [
      {
        "amount": string,

        "unit": string,

        "ingredient": string,

        "provenance": "verbatim" | "normalized" | "inferred"
      }
    ],

    "instructions": [
      {
        "value": string,
        "provenance": "verbatim" | "normalized" | "inferred"
      }
    ],

    "prepTime": {
      "value": string,
      "provenance": "verbatim" | "normalized" | "inferred"
    },

    "cookTime": {
      "value": string,
      "provenance": "verbatim" | "normalized" | "inferred"
    },

    "servings": {
      "value": string,
      "provenance": "verbatim" | "normalized" | "inferred"
    }
  }
}

Extract valid recipes into structured JSON.

Generate a URL-safe slug from the title.

Preserve the original instruction wording as closely as possible.

Do not summarize instructions.

Do not shorten steps.

Do not combine steps.

Only minimally clean formatting or obvious OCR issues.

Track provenance carefully.

If information is directly stated in the source recipe, mark provenance as "verbatim".

If information was normalized slightly, mark as "normalized".

If information was inferred or guessed, mark as "inferred".

Never falsely mark inferred information as verbatim.

Never use "altered". That provenance value is reserved for user edits after parsing.

Default visibility to "private".

Ingredient provenance applies to the FULL ingredient line, not individual amount/unit/ingredient components.

If prep time, cook time, or servings are not explicitly stated, infer a reasonable estimate when possible.

Similarly, if a description is not provided, infer one based on the title, ingredients, and instructions.

Use culinary common sense and typical recipe expectations.

Estimated values must always use provenance: "inferred".

Do not leave these fields empty unless there is truly insufficient information to make a reasonable estimate.

Rules:
- Return ONLY valid JSON
- Do not include markdown
- Preserve instruction order
- Empty values should be empty strings
- Never invent provenance carelessly
`,
          },

          {
            role: "user",

            content: source,
          },
        ],

        response_format: {
          type: "json_object",
        },
      }
    )

  const parsed = JSON.parse(
    completion.choices[0]
      .message.content || "{}"
  )

  if (!parsed.ok) {
    return Response.json(
      {
        ok: false,
        error: {
          code:
            parsed.error?.code ??
            "not_a_recipe",
          message:
            parsed.error?.message ??
            "This does not look like a recipe. Paste recipe text with ingredients and instructions, then try again.",
        },
      },
      {
        status: 422,
      }
    )
  }

  if (!hasRecipeShape(parsed.recipe)) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "incomplete_recipe",
          message:
            "I could not find enough recipe structure. Paste text with a recipe title, ingredients, and instructions, then try again.",
        },
      },
      {
        status: 422,
      }
    )
  }

  return Response.json({
    ok: true,
    recipe: parsed.recipe,
  })
}
