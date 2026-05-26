import OpenAI from "openai"

import fs from "fs/promises"
import path from "path"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      title,
      description,
      ingredients,
    } = body

    const backgroundPath =
      path.join(
        process.cwd(),
        "src/assets/recipe-background.jpg"
      )

    const backgroundBuffer =
      await fs.readFile(
        backgroundPath
      )

    const backgroundImage =
      await OpenAI.toFile(
        backgroundBuffer,
        "recipe-background.jpg",
        {
          type: "image/jpeg",
        }
      )

    const prompt = `
Create a highly polished stylized 3D cartoon food render.

Style requirements:
- warm cozy kitchen aesthetic
- soft cinematic lighting
- clean modern Pixar-like style
- highly appetizing food
- centered composition
- consistent visual ecosystem
- same camera angle every time
- same lighting direction every time
- maintain visual consistency with provided kitchen scene

Recipe title:
${title}

Recipe description:
${description}

Key ingredients:
${ingredients
  ?.map(
    (
      ingredient: {
        ingredient: string
      }
    ) =>
      ingredient.ingredient
  )
  .join(", ")}
`

    const result =
      await client.images.edit({
        model: "gpt-image-1",

        prompt,

        size: "1536x1024",

        image: [backgroundImage],
      })

    return Response.json({
      success: true,

      image:
        result.data?.[0]
          ?.b64_json ??
        null,
    })
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error:
          "Failed to generate image",
      },
      {
        status: 500,
      }
    )
  }
}