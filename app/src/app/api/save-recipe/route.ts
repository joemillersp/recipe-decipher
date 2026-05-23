import fs from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  const recipe = await req.json()

  const filePath = path.join(
    process.cwd(),
    "src/data/recipes.json"
  )

  const file = await fs.readFile(filePath, "utf8")

  const recipes = JSON.parse(file)

  recipes.push(recipe)

  await fs.writeFile(
    filePath,
    JSON.stringify(recipes, null, 2)
  )

  return Response.json({
    success: true,
  })
}