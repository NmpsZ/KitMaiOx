import { Plus, SearchCheck, X } from "lucide-react";
import { categoryIcons } from "../data/fallbackIngredients";
import type { Ingredient, IngredientLookup } from "../types";

interface IngredientPickerProps {
  ingredients: Ingredient[];
  selected: string[];
  query: string;
  category: string;
  onCategoryChange: (category: string) => void;
  onToggle: (name: string) => void;
  onRemove: (name: string) => void;
  lookup: IngredientLookup | null;
  isLookingUp: boolean;
  onUseLookup: () => void;
}

export function IngredientPicker({
  ingredients,
  selected,
  query,
  category,
  onCategoryChange,
  onToggle,
  onRemove,
  lookup,
  isLookingUp,
  onUseLookup
}: IngredientPickerProps) {
  const categories = ["All", ...Array.from(new Set(ingredients.map((item) => item.category)))];
  const selectedSet = new Set(selected);
  const visibleIngredients = ingredients.filter((item) => category === "All" || item.category === category);

  return (
    <section className="bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="rounded-[28px] border border-[#F0E3D7] bg-white/92 p-4 shadow-premium sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Ingredient Pantry</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#2B211D]">What's in your fridge?</h2>
              <p className="mt-1 text-sm text-[#8B7568]">Pick what you have. KitmaiOx will turn it into recipe ideas.</p>
            </div>
            <p className="rounded-full bg-[#FFF9F3] px-3 py-1.5 text-xs font-medium text-[#8B7568]">
              {visibleIngredients.length} items visible
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {categories.map((item) => {
              const isActive = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onCategoryChange(item)}
                  className={`flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all ${
                    isActive
                      ? "border-accent bg-accent text-white shadow-glow"
                      : "border-[#F0E3D7] bg-white text-[#6F5B50] hover:border-accent/35 hover:bg-accent-soft hover:text-accent-dark"
                  }`}
                >
                  <span aria-hidden="true">{categoryIcons[item] ?? "•"}</span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>

          {visibleIngredients.length === 0 && query.trim().length > 0 ? (
            <div className="rounded-3xl border border-dashed border-[#E4D5C9] bg-[#FFF9F3] px-5 py-6 text-center">
              {isLookingUp ? (
                <p className="text-sm font-medium text-[#8B7568]">Checking database first, then asking AI...</p>
              ) : lookup?.isRealIngredient ? (
                <div className="mx-auto max-w-md">
                  <SearchCheck className="mx-auto text-herb-text" size={28} aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-[#2B211D]">{lookup.name}</p>
                  <p className="mt-1 text-xs leading-5 text-[#8B7568]">{lookup.message}</p>
                  <button
                    type="button"
                    onClick={onUseLookup}
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-xs font-semibold text-white shadow-glow transition hover:bg-accent-dark"
                  >
                    <Plus size={14} aria-hidden="true" />
                    <span>Add ingredient</span>
                  </button>
                </div>
              ) : lookup ? (
                <div className="mx-auto max-w-md">
                  <p className="text-sm font-semibold text-[#2B211D]">No real ingredient found</p>
                  <p className="mt-1 text-xs leading-5 text-[#8B7568]">{lookup.message}</p>
                </div>
              ) : (
                <p className="text-sm font-medium text-[#8B7568]">No database matches yet.</p>
              )}
            </div>
          ) : null}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-3">
            {visibleIngredients.map((item) => {
              const isSelected = selectedSet.has(item.name);
              return (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={isSelected}
                  onClick={() => onToggle(item.name)}
                  className={`group flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center transition-all ${
                    isSelected
                      ? "border-accent bg-accent-soft text-accent-dark shadow-glow ring-2 ring-accent/10"
                      : "border-[#F0E3D7] bg-[#FFFCF8] text-[#4A3A33] hover:-translate-y-0.5 hover:border-accent/35 hover:bg-white hover:shadow-md"
                  }`}
                >
                  <span className="text-2xl transition-transform group-hover:scale-110" aria-hidden="true">
                    {item.iconEmoji}
                  </span>
                  <span className="max-w-full text-[12px] font-medium leading-4">{item.name}</span>
                </button>
              );
            })}
          </div>

          {selected.length > 0 ? (
            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-[#F0E3D7] bg-[#FFF9F3] p-3">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-[#8B7568]">Selected</span>
              {selected.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => onRemove(item)}
                  className="flex h-8 items-center gap-1.5 rounded-full border border-accent/20 bg-white px-3 text-xs font-medium text-accent-dark transition hover:border-accent/45 hover:bg-accent-soft"
                >
                  <span>{item}</span>
                  <X size={13} aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}



