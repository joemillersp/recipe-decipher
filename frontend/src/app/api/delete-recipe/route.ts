import fs from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  const body = await req.json()

  const filePath = path.join(
    process.cwd(),
    "src/data/recipes.json"
  )

  const file = await fs.readFile(filePath, "utf8")

  const recipes = JSON.parse(file)

  const updatedRecipes = recipes.filter(
    (r: any) => r.slug !== body.slug
  )

  await fs.writeFile(
    filePath,
    JSON.stringify(updatedRecipes, null, 2)
  )

  return Response.json({
    success: true,
  })
}