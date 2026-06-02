export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="py-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-900 rounded-full px-4 py-2 text-sm text-zinc-400 mb-8">
            AI-powered cooking intelligence
          </div>

          <h1 className="text-7xl font-bold leading-tight tracking-tight">
            Recipe Decipher
          </h1>

          <p className="text-2xl text-zinc-400 mt-8 leading-relaxed max-w-3xl">
            Transform messy recipe content
            into structured, searchable,
            editable cooking intelligence.
          </p>

          <div className="flex items-center gap-4 mt-10">
            <a
              href="/parse"
              className="border border-white bg-white text-zinc-950 hover:bg-zinc-200 px-6 py-4 rounded-2xl font-semibold transition-colors"
            >
              Start Parsing
            </a>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="border border-zinc-800 bg-zinc-900 rounded-3xl p-8">
          <div className="text-4xl mb-5">
            🧠
          </div>

          <h2 className="text-2xl font-semibold mb-4">
            AI Structured Parsing
          </h2>

          <p className="text-zinc-400 leading-7">
            Normalize inconsistent recipe
            text into clean ingredients,
            instructions, timing, and
            metadata.
          </p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900 rounded-3xl p-8">
          <div className="text-4xl mb-5">
            ✍️
          </div>

          <h2 className="text-2xl font-semibold mb-4">
            Human Editable
          </h2>

          <p className="text-zinc-400 leading-7">
            Review, refine, and correct AI
            generated recipe structure
            before saving.
          </p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900 rounded-3xl p-8">
          <div className="text-4xl mb-5">
            📚
          </div>

          <h2 className="text-2xl font-semibold mb-4">
            Structured Recipe Library
          </h2>

          <p className="text-zinc-400 leading-7">
            Build a consistent recipe
            database optimized for search,
            analysis, and future cooking
            intelligence.
          </p>
        </div>
      </section>
    </div>
  )
}