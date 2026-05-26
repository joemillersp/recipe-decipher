import OpenAI from "openai"
import { recipeSchema } from "@/lib/recipeSchema"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const body = await req.json()

const completion = await client.chat.completions.create({
  model: "gpt-4.1-mini",
  messages: [
    {
      role: "system",
      content: `

You are a structured recipe extraction engine.

Extract recipes into structured JSON.

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

Extract the recipe into this exact JSON schema:

{
  "slug": string,

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
      "amount": {
        "value": string,
        "provenance": "verbatim" | "normalized" | "inferred"
      },

      "unit": {
        "value": string,
        "provenance": "verbatim" | "normalized" | "inferred"
      },

      "ingredient": {
        "value": string,
        "provenance": "verbatim" | "normalized" | "inferred"
      }
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

If prep time, cook time, or servings are not explicitly stated, infer a reasonable estimate when possible.

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
      content: body.recipe,
    },
  ],
  response_format: {
    type: "json_object",
  },
})

  return Response.json(
    JSON.parse(
      completion.choices[0].message.content || "{}"
    )
  )
}