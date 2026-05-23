import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  revalidatePath("/", "layout")

  return NextResponse.redirect(
    new URL(
      "/?logout=true",
      process.env.NEXT_PUBLIC_APP_URL
    )
  )
}