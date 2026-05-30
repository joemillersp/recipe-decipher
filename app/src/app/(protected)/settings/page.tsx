import SettingsForm from "@/components/SettingsForm"
import { createClient } from "@/utils/supabase/server"

export default async function SettingsPage() {
  const supabase =
    await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const metadata =
    user?.user_metadata ?? {}

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-5xl font-bold">
          Settings
        </h1>

        <p className="text-zinc-400 mt-4 text-lg">
          Manage your account and
          application preferences.
        </p>
      </div>

      <SettingsForm
        email={user?.email ?? ""}
        metadata={metadata}
      />
    </div>
  )
}
