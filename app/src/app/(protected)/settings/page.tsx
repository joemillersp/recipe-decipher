export default function SettingsPage() {
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

      <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 space-y-6">
        <div>
          <div className="text-sm text-zinc-500 mb-2">
            Display Name
          </div>

          <input
            placeholder="Coming soon"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
          />
        </div>

        <div>
          <div className="text-sm text-zinc-500 mb-2">
            Default Measurement System
          </div>

          <select className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3">
            <option>
              Imperial
            </option>

            <option>
              Metric
            </option>
          </select>
        </div>

        <div>
          <div className="text-sm text-zinc-500 mb-2">
            AI Parsing Strictness
          </div>

          <select className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3">
            <option>
              Conservative
            </option>

            <option>
              Balanced
            </option>

            <option>
              Aggressive
            </option>
          </select>
        </div>
      </div>
    </div>
  )
}