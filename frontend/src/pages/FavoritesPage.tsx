import { Heart, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { RecipeCard } from "../components/RecipeCard";
import { RecipeDetailModal } from "../components/RecipeDetailModal";
import { SearchInput } from "../components/SearchInput";
import type { Recipe } from "../types";

interface FavoritesPageProps {
  favorites: Recipe[];
  onToggleFavorite: (recipe: Recipe) => void;
}

export function FavoritesPage({ favorites, onToggleFavorite }: FavoritesPageProps) {
  const [query, setQuery] = useState("");
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? favorites.filter((recipe) => recipe.name.toLowerCase().includes(normalized))
      : favorites;
  }, [favorites, query]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            <Heart size={14} aria-hidden="true" fill="currentColor" />
            Favorites
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2B211D]">Your saved recipes</h1>
          <p className="mt-1 text-sm text-[#8B7568]">
            {favorites.length} {favorites.length === 1 ? "recipe" : "recipes"} bookmarked
          </p>
        </div>
        <div className="w-full shrink-0 sm:w-80">
          <SearchInput value={query} onChange={setQuery} placeholder="Search saved recipes..." />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((recipe) => (
            <div key={recipe.id} className="relative">
              <RecipeCard
                recipe={recipe}
                isFavorite
                onOpen={setActiveRecipe}
                onToggleFavorite={onToggleFavorite}
              />
              <button
                type="button"
                onClick={() => onToggleFavorite(recipe)}
                className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#F0E3D7] bg-white text-[#A38B7C] shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500"
                aria-label="Remove from favorites"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No favorites saved yet"
          description="Click the heart icon on any recipe card, and your favorite meals will stay here."
        />
      )}

      <RecipeDetailModal recipe={activeRecipe} onClose={() => setActiveRecipe(null)} />
    </main>
  );
}
