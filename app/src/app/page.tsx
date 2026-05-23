import Link from "next/link"

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="py-6">
        <div className="max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400 mb-6">
            AI-powered recipe normalization
          </div>

          <h1 className="text-6xl md:text-7xl font-bold leading-tight">
            Recipe content,
            <br />
            structured intelligently.
          </h1>

          <p className="text-xl text-zinc-400 mt-8 max-w-2xl leading-relaxed">
            Parse messy recipes into structured cooking data using AI. 
            Build searchable, normalized recipes from screenshots,
            copied text, PDFs, and more.
          </p>

          <div className="flex gap-4 mt-10">
            <Link
              href="/parse"
              className="border border-zinc-700 bg-white text-zinc-950 hover:bg-zinc-200 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Parse Recipe
            </Link>

            <Link
              href="/recipes"
              className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Browse Recipes
            </Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Normalize
          </h2>

          <p className="text-zinc-400 leading-relaxed">
            Convert inconsistent recipe formats into structured,
            reusable cooking data.
          </p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Parse Anything
          </h2>

          <p className="text-zinc-400 leading-relaxed">
            Support for pasted text, screenshots, PDFs,
            recipe blogs, and handwritten notes.
          </p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Build Intelligence
          </h2>

          <p className="text-zinc-400 leading-relaxed">
            Enable semantic search, substitutions,
            recommendations, and future cooking assistance.
          </p>
        </div>
      </section>
    </div>
  )
}