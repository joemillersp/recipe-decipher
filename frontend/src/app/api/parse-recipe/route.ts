import OpenAI from "openai"

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
Extract the recipe into this exact JSON schema.

Generate a URL-safe slug from the title.

Preserve the original instruction wording as closely as possible.

Do not summarize instructions.

Do not shorten steps.

Do not combine steps.

Only minimally clean formatting or obvious OCR issues.

{
  slug: string,
  title: string,
  description: string,
  ingredients: {
    amount: string,
    unit: string,
    ingredient: string
  }[],
  instructions: string[],
  prepTime: string,
  cookTime: string,
  servings: string
}

Rules:
- Return ONLY valid JSON
- Do not include markdown
- Normalize ingredient names
- Preserve instruction order
- Empty values should be empty strings
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