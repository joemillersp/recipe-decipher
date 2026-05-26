import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createActionClient } from "@/utils/supabase/server-actions"

export async function GET() {
  const supabase = await createActionClient()

  await supabase.auth.signOut()

  revalidatePath("/", "layout")

  return NextResponse.redirect(
    new URL(
      "/?logout=true",
      process.env.NEXT_PUBLIC_APP_URL
    )
  )
}