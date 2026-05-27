export type Visibility =
  | "private"
  | "unlisted"
  | "public"

type Provenance =
    | "verbatim"
    | "normalized"
    | "inferred"
    | "altered"

export type Recipe = {
  id: string

  user_id: string

  slug: string

  title: string
  description: string | null

  prep_time: string | null
  cook_time: string | null
  servings: string | null

  source_text: string | null

  hero_image_url: string | null
  hero_image_style: string | null

  parse_confidence: number | null

  visibility: Visibility

  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type RecipeIngredient = {
  id: string

  recipe_id: string

  position: number

  amount: string | null
  unit: string | null

  ingredient_text: string

  normalized_ingredient: string | null

  provenance: Provenance

  confidence: number | null

  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type RecipeInstruction = {
  id: string

  recipe_id: string

  step_number: number

  instruction: string

  estimated_duration: string | null
  equipment: string | null
  temperature: string | null

  provenance: Provenance

  confidence: number | null

  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type RecipeImageType =
  | "hero"
  | "gallery"
  | "thumbnail"
  | "generated"

export type RecipeImage = {
  id: string

  recipe_id: string

  image_url: string

  image_type: RecipeImageType

  style_family: string | null

  prompt: string | null
  model: string | null

  generated_by_ai: boolean

  is_primary: boolean

  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type RecipeView = {
  id: string

  recipe_id: string

  user_id: string | null

  session_id: string | null

  viewed_at: string
}

export type RecipeRating = {
  id: string

  recipe_id: string

  user_id: string

  rating: number

  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type RecipeComment = {
  id: string

  recipe_id: string

  user_id: string

  parent_comment_id: string | null

  body: string

  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type RecipeVersion = {
  id: string

  recipe_id: string

  version_number: number

  snapshot: unknown

  created_by_user_id: string | null

  created_at: string
}

export type FullRecipe = {
  recipe: Recipe

  ingredients: RecipeIngredient[]

  instructions: RecipeInstruction[]

  images: RecipeImage[]

  ratings: RecipeRating[]

  comments: RecipeComment[]
}