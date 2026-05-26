import { History, RotateCcw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { SearchInput } from "../components/SearchInput";
import type { SearchHistory } from "../types";

interface HistoryPageProps {
  history: SearchHistory[];
  onReplay: (item: SearchHistory) => void;
  onClearHistory: () => void;
}

export function HistoryPage({ history, onReplay, onClearHistory }: HistoryPageProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? history.filter((item) =>
          item.ingredients.some((ingredient) =>
            ingredient.toLowerCase().includes(normalized)
          )
        )
      : history;
  }, [history, query]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            <History size={14} aria-hidden="true" />
            History
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2B211D]">Search history</h1>
          <p className="mt-1 text-sm text-[#8B7568]">
            Showing your last {filtered.length} {filtered.length === 1 ? "search" : "searches"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-full shrink-0 sm:w-64">
            <SearchInput value={query} onChange={setQuery} placeholder="Search by ingredient..." />
          </div>
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100 hover:text-red-700"
            >
              <Trash2 size={14} aria-hidden="true" />
              Clear
            </button>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-[24px] border border-[#F0E3D7] bg-white p-4 shadow-sm transition hover:shadow-premium">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2B211D]">
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    }).format(new Date(item.searchedAt))}
                  </p>
                  <p className="mt-1 text-xs text-[#8B7568]">
                    Generated <span className="font-semibold text-accent">{item.resultCount}</span> recipes
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onReplay(item)}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#F0E3D7] bg-[#FFF9F3] px-4 text-xs font-semibold text-[#6F5B50] transition hover:border-accent/35 hover:bg-accent-soft hover:text-accent-dark"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Replay search
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.ingredients.map((ingredient) => {
                  const isMatch = query.trim() && ingredient.toLowerCase().includes(query.trim().toLowerCase());
                  return (
                    <span
                      key={ingredient}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        isMatch
                          ? "border-accent/30 bg-accent-soft text-accent-dark"
                          : "border-[#F0E3D7] bg-[#FFF9F3] text-[#6F5B50]"
                      }`}
                    >
                      {ingredient}
                    </span>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      ) : query.trim() ? (
        <EmptyState
          title="No matching history"
          description={`No past searches contain "${query.trim()}". Try a different ingredient name.`}
        />
      ) : (
        <EmptyState
          title="No search history yet"
          description="Recipe searches will appear here so you can replay useful ingredient combinations."
        />
      )}
    </main>
  );
}
