import dns from "node:dns/promises"
import net from "node:net"

const MAX_HTML_CHARS = 2_000_000
const MAX_EXTRACTED_CHARS = 25_000
const MAX_REDIRECTS = 5

export const runtime = "nodejs"

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | {
    [key: string]: JsonValue
  }

type JsonObject = {
  [key: string]: JsonValue
}

type LookupAddress = {
  address: string
}

function isPrivateIPv4(address: string) {
  const parts = address
    .split(".")
    .map(Number)

  if (parts.length !== 4) {
    return true
  }

  const [a, b] = parts

  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    a === 0
  )
}

function isBlockedAddress(address: string) {
  const ipVersion = net.isIP(address)

  if (ipVersion === 4) {
    return isPrivateIPv4(address)
  }

  if (ipVersion === 6) {
    const normalized =
      address.toLowerCase()

    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:")
    )
  }

  return true
}

async function validateUrl(value: string) {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error(
      "Enter a valid recipe URL."
    )
  }

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "Recipe URLs must start with http or https."
    )
  }

  const hostname =
    url.hostname.toLowerCase()

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost")
  ) {
    throw new Error(
      "Local URLs cannot be imported."
    )
  }

  if (net.isIP(hostname)) {
    if (isBlockedAddress(hostname)) {
      throw new Error(
        "Private network URLs cannot be imported."
      )
    }

    return url
  }

  let addresses: LookupAddress[]

  try {
    addresses = await dns.lookup(
      hostname,
      {
        all: true,
      }
    )
  } catch {
    throw new Error(
      "Could not resolve that recipe URL."
    )
  }

  if (
    addresses.some(({ address }) =>
      isBlockedAddress(address)
    )
  ) {
    throw new Error(
      "Private network URLs cannot be imported."
    )
  }

  return url
}

function decodeHtml(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: "\"",
  }

  return value.replace(
    /&(#x?[0-9a-f]+|[a-z]+);/gi,
    (match, entity: string) => {
      if (entity[0] === "#") {
        const isHex =
          entity[1]?.toLowerCase() === "x"

        const codePoint =
          Number.parseInt(
            entity.slice(isHex ? 2 : 1),
            isHex ? 16 : 10
          )

        return Number.isNaN(codePoint)
          ? match
          : String.fromCodePoint(codePoint)
      }

      return (
        namedEntities[
          entity.toLowerCase()
        ] ?? match
      )
    }
  )
}

function cleanText(value: string) {
  return decodeHtml(value)
    .replace(/\s+/g, " ")
    .trim()
}

function getString(value: JsonValue | undefined) {
  return typeof value === "string"
    ? cleanText(value)
    : ""
}

function getStringList(
  value: JsonValue | undefined
): string[] {
  if (!value) {
    return []
  }

  if (typeof value === "string") {
    return [cleanText(value)]
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item): string[] =>
        getStringList(item)
      )
      .filter(Boolean)
  }

  if (
    typeof value === "object" &&
    "text" in value
  ) {
    return getStringList(value.text)
  }

  return []
}

function isJsonObject(
  value: JsonValue
): value is JsonObject {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value)
  )
}

function typeMatchesRecipe(value: JsonValue) {
  if (typeof value === "string") {
    return value.toLowerCase() === "recipe"
  }

  if (Array.isArray(value)) {
    return value.some(typeMatchesRecipe)
  }

  return false
}

function findRecipeObject(
  value: JsonValue
): JsonObject | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const recipe =
        findRecipeObject(item)

      if (recipe) {
        return recipe
      }
    }
  }

  if (!isJsonObject(value)) {
    return null
  }

  if (typeMatchesRecipe(value["@type"])) {
    return value
  }

  const graph = value["@graph"]

  if (graph) {
    return findRecipeObject(graph)
  }

  return null
}

function extractJsonLdRecipe(html: string) {
  const scriptMatches =
    html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )

  for (const match of scriptMatches) {
    try {
      const parsed =
        JSON.parse(
          decodeHtml(match[1]).trim()
        ) as JsonValue

      const recipe =
        findRecipeObject(parsed)

      if (!recipe) {
        continue
      }

      const lines = [
        getString(recipe.name),
        getString(recipe.description),
        getString(recipe.recipeYield)
          ? `Servings: ${getString(recipe.recipeYield)}`
          : "",
        getString(recipe.prepTime)
          ? `Prep time: ${getString(recipe.prepTime)}`
          : "",
        getString(recipe.cookTime)
          ? `Cook time: ${getString(recipe.cookTime)}`
          : "",
        getString(recipe.totalTime)
          ? `Total time: ${getString(recipe.totalTime)}`
          : "",
      ].filter(Boolean)

      const ingredients =
        getStringList(
          recipe.recipeIngredient
        )

      const instructions =
        getStringList(
          recipe.recipeInstructions
        )

      if (ingredients.length > 0) {
        lines.push(
          "Ingredients:",
          ...ingredients.map(
            (ingredient) =>
              `- ${ingredient}`
          )
        )
      }

      if (instructions.length > 0) {
        lines.push(
          "Instructions:",
          ...instructions.map(
            (instruction, index) =>
              `${index + 1}. ${instruction}`
          )
        )
      }

      const text =
        lines.join("\n").trim()

      if (text) {
        return text
      }
    } catch {
      continue
    }
  }

  return ""
}

function extractTitle(html: string) {
  const titleMatch =
    html.match(
      /<title[^>]*>([\s\S]*?)<\/title>/i
    )

  return titleMatch
    ? cleanText(titleMatch[1])
    : ""
}

function extractReadableText(html: string) {
  const title = extractTitle(html)

  const bodyMatch =
    html.match(
      /<body[^>]*>([\s\S]*?)<\/body>/i
    )

  const body =
    bodyMatch?.[1] ?? html

  const cleaned = body
    .replace(
      /<(script|style|svg|noscript|iframe|nav|footer|header|form|aside)[^>]*>[\s\S]*?<\/\1>/gi,
      " "
    )
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .split("\n")
    .map(cleanText)
    .filter((line) => line.length > 1)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  return [title, cleaned]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, MAX_EXTRACTED_CHARS)
}

async function fetchHtml(url: URL) {
  let currentUrl = url

  for (
    let redirectCount = 0;
    redirectCount <= MAX_REDIRECTS;
    redirectCount++
  ) {
    const response = await fetch(
      currentUrl,
      {
        redirect: "manual",
        signal:
          AbortSignal.timeout(10_000),
        headers: {
          Accept:
            "text/html,application/xhtml+xml",
          "User-Agent":
            "RecipeDecipherBot/1.0 (+https://recipe-decipher.app)",
        },
      }
    )

    if (
      response.status >= 300 &&
      response.status < 400
    ) {
      const location =
        response.headers.get("location")

      if (!location) {
        throw new Error(
          "The recipe URL redirected without a destination."
        )
      }

      currentUrl =
        await validateUrl(
          new URL(
            location,
            currentUrl
          ).toString()
        )

      continue
    }

    if (!response.ok) {
      throw new Error(
        "Could not fetch that recipe URL."
      )
    }

    const contentType =
      response.headers.get("content-type") ?? ""

    if (
      !contentType
        .toLowerCase()
        .includes("text/html")
    ) {
      throw new Error(
        "That URL does not appear to be an HTML recipe page."
      )
    }

    const html =
      (await response.text()).slice(
        0,
        MAX_HTML_CHARS
      )

    return {
      html,
      finalUrl: currentUrl.toString(),
    }
  }

  throw new Error(
    "The recipe URL redirected too many times."
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const rawUrl =
      typeof body.url === "string"
        ? body.url.trim()
        : ""

    const url =
      await validateUrl(rawUrl)

    const {
      html,
      finalUrl,
    } = await fetchHtml(url)

    const extracted =
      extractJsonLdRecipe(html) ||
      extractReadableText(html)

    if (extracted.length < 80) {
      return Response.json(
        {
          ok: false,
          error: {
            message:
              "I could not find enough recipe text on that page. Try another URL or paste the recipe text directly.",
          },
        },
        {
          status: 422,
        }
      )
    }

    return Response.json({
      ok: true,
      text: extracted.slice(
        0,
        MAX_EXTRACTED_CHARS
      ),
      sourceUrl: finalUrl,
    })
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Could not import that recipe URL.",
        },
      },
      {
        status: 400,
      }
    )
  }
}
