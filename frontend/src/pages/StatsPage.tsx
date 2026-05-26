import { BarChart3, HelpCircle, TrendingUp } from "lucide-react";
import type { Stats } from "../types";

interface StatsPageProps {
  stats: Stats;
}

export function StatsPage({ stats }: StatsPageProps) {
  const max = Math.max(1, ...stats.topIngredients.map((item) => item.useCount));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          <BarChart3 size={14} aria-hidden="true" />
          Statistics
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2B211D]">Cooking insights</h1>
        <p className="mt-1 text-sm text-[#8B7568]">A simple look at searches, favorites, and frequently used ingredients.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Searches" value={stats.totalSearches} tone="orange" />
        <MetricCard label="Favorites" value={stats.favoriteCount} tone="green" />
        <MetricCard label="Recipes" value={stats.recipeCount} tone="yellow" />
      </div>

      <section className="mt-6 rounded-[28px] border border-[#F0E3D7] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2B211D]">
              <TrendingUp size={18} className="text-accent" />
              Popular ingredients
            </h2>
            <p className="mt-1 text-sm text-[#8B7568]">
              Used <span className="font-semibold text-accent">{stats.ingredientUseCount}</span> times across searches.
            </p>
          </div>
        </div>

        {stats.topIngredients.length > 0 ? (
          <div className="space-y-4">
            {stats.topIngredients.map((item) => (
              <div key={item.name} className="grid grid-cols-[120px_1fr_56px] items-center gap-3 text-sm">
                <span className="truncate font-medium text-[#4A3A33]">{item.name}</span>
                <span className="h-3 overflow-hidden rounded-full bg-[#F3E7DC]">
                  <span
                    className="block h-full rounded-full bg-accent transition-all duration-700"
                    style={{ width: `${(item.useCount / max) * 100}%` }}
                  />
                </span>
                <span className="text-right text-xs font-semibold text-[#8B7568]">{item.useCount}x</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#E4D5C9] py-10 text-center">
            <HelpCircle size={30} className="mx-auto mb-2 text-[#A38B7C]" />
            <p className="text-sm font-semibold text-[#4A3A33]">No ingredient stats yet</p>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#8B7568]">
              Stats will appear once you generate recipe suggestions from the Home page.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  tone = "orange"
}: {
  label: string;
  value: number;
  tone?: "orange" | "green" | "yellow";
}) {
  const toneClass = {
    orange: "bg-accent-soft text-accent-dark",
    green: "bg-herb-soft text-herb-text",
    yellow: "bg-honey-soft text-honey-text"
  }[tone];

  return (
    <article className="rounded-[24px] border border-[#F0E3D7] bg-white p-5 shadow-sm transition hover:shadow-premium">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#8B7568]">{label}</p>
      <span className={`mt-4 inline-flex rounded-2xl px-3 py-1 text-3xl font-semibold tracking-tight ${toneClass}`}>
        {value}
      </span>
    </article>
  );
}
