import Link from "next/link"

type RecipeSearchFormProps = {
  action: string
  query: string
  placeholder: string
}

export default function RecipeSearchForm({
  action,
  query,
  placeholder,
}: RecipeSearchFormProps) {
  return (
    <form
      action={action}
      className="flex flex-col sm:flex-row gap-3"
    >
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder={placeholder}
        className="min-h-12 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-500"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          className="min-h-12 rounded-xl border border-white bg-white px-5 font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          Search
        </button>

        {query && (
          <Link
            href={action}
            className="min-h-12 rounded-xl border border-zinc-700 bg-zinc-900 px-5 font-semibold text-zinc-100 transition-colors hover:bg-zinc-800 flex items-center"
          >
            Clear
          </Link>
        )}
      </div>
    </form>
  )
}
