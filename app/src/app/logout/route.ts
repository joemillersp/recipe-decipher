import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createActionClient } from "@/utils/supabase/server-actions"

export async function GET() {
  const supabase = await createActionClient()

  await supabase.auth.signOut()

  revalidatePath("/", "layout")

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000")

return NextResponse.redirect(
  new URL(
    "/?logout=true",
    appUrl
  )
)
}