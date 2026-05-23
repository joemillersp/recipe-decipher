export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold">
          About
        </h1>

        <p className="text-zinc-400 mt-4 text-lg">
          Recipe Decipher transforms messy,
          inconsistent recipe content into
          structured, normalized cooking
          data.
        </p>
      </div>

      <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold">
          Why
        </h2>

        <p className="text-zinc-300 leading-7">
          Most recipe content online is
          difficult to search, compare,
          analyze, or scale. Recipe
          Decipher uses AI to extract
          ingredients, timing,
          instructions, and metadata into
          a consistent format.
        </p>
      </div>

      <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold">
          Vision
        </h2>

        <p className="text-zinc-300 leading-7">
          Long term, the platform aims to
          become an intelligent cooking
          layer capable of understanding
          substitutions, pantry state,
          nutrition, timing, workflow, and
          recipe intent.
        </p>
      </div>
    </div>
  )
}