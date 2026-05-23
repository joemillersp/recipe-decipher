export const recipeSchema = `
{
  "slug": string,
  "title": string,
  "description": string,
  "ingredients": [
    {
      "amount": string,
      "unit": string,
      "ingredient": string
    }
  ],
  "instructions": string[],
  "prepTime": string,
  "cookTime": string,
  "servings": string
}
`