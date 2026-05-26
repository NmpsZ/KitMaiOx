import { Clock, Flame, Heart } from "lucide-react";
import type { Recipe } from "../types";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onOpen: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => void;
}

const difficultyClass: Record<string, string> = {
  Easy: "bg-herb-soft text-herb-text border border-herb-border",
  Medium: "bg-honey-soft text-honey-text border border-honey-border",
  Hard: "bg-accent-soft text-accent-dark border border-accent/20"
};

const thumbGradients = [
  "from-[#FAECE7] to-[#FFF5EE]",
  "from-[#EAF3DE] to-[#F5FAF0]",
  "from-[#FAEEDA] to-[#FFFAED]",
  "from-[#E1F5EE] to-[#F0FBF7]",
  "from-[#EDE7FA] to-[#F5F2FF]",
];

export function RecipeCard({ recipe, isFavorite, onOpen, onToggleFavorite }: RecipeCardProps) {
  const gradientIndex = Math.abs(recipe.name.length + recipe.id) % thumbGradients.length;
  const gradient = thumbGradients[gradientIndex];
  const emoji = recipe.iconEmoji || "🍽️";

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#F0E3D7] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-premium">
      <div
        role="button"
        tabIndex={0}
        className="block w-full cursor-pointer text-left focus:outline-none"
        onClick={() => onOpen(recipe)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen(recipe);
          }
        }}
      >
        {/* Emoji Icon Thumbnail */}
        <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${gradient}`}>
          <span className="text-6xl drop-shadow-sm select-none" role="img" aria-label={recipe.name}>
            {emoji}
          </span>
          <div className="absolute right-4 top-4 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-[#6F5B50] shadow-sm backdrop-blur">
            {recipe.estimatedTime} min
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-h-12 text-base font-semibold leading-6 text-[#2B211D] line-clamp-2">
              {recipe.name}
            </h3>
            <button
              type="button"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite(recipe);
              }}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95 ${
                isFavorite
                  ? "border-accent bg-accent text-white shadow-glow"
                  : "border-[#F0E3D7] bg-[#FFF9F3] text-[#A38B7C] hover:border-accent/30 hover:text-accent"
              }`}
            >
              <Heart size={16} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
            </button>
          </div>

          {/* Badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                difficultyClass[recipe.difficulty] ?? difficultyClass.Easy
              }`}
            >
              {recipe.difficulty}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF9F3] px-2.5 py-1 text-[11px] font-medium text-[#6F5B50]">
              <Clock size={12} aria-hidden="true" className="text-accent" />
              {recipe.estimatedTime} min
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF9F3] px-2.5 py-1 text-[11px] font-medium text-[#6F5B50]">
              <Flame size={12} aria-hidden="true" className="text-accent" />
              {recipe.calorieEstimate} kcal
            </span>
          </div>

          {/* Macros */}
          {(recipe.protein > 0 || recipe.carbs > 0 || recipe.fat > 0) && (
            <div className="mt-3 flex gap-1.5">
              <MacroPill label="P" value={recipe.protein} color="text-blue-600 bg-blue-50 border-blue-100" />
              <MacroPill label="C" value={recipe.carbs} color="text-amber-600 bg-amber-50 border-amber-100" />
              <MacroPill label="F" value={recipe.fat} color="text-rose-600 bg-rose-50 border-rose-100" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${color}`}>
      {label} <span className="font-bold">{value}g</span>
    </span>
  );
}
