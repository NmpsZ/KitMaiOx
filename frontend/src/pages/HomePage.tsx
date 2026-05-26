import { Carrot, Clock3, Database, Leaf, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { IngredientPicker } from "../components/IngredientPicker";
import { RecipeCard } from "../components/RecipeCard";
import { RecipeDetailModal } from "../components/RecipeDetailModal";
import { SearchInput } from "../components/SearchInput";
import { fallbackIngredients } from "../data/fallbackIngredients";
import { getRecommendations } from "../data/flavorGraph";
import { buildLocalSuggestions } from "../data/localRecipes";
import { createIngredient, getIngredients, lookupIngredient, suggestRecipes } from "../services/api";
import type { Ingredient, IngredientLookup, Recipe, ReplayRequest } from "../types";

interface HomePageProps {
  favorites: Recipe[];
  replayRequest: ReplayRequest | null;
  onToggleFavorite: (recipe: Recipe) => void;
  onSearchComplete: (ingredients: string[], recipes: Recipe[]) => void;
}

export function HomePage({
  favorites,
  replayRequest,
  onToggleFavorite,
  onSearchComplete
}: HomePageProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(fallbackIngredients);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [lookup, setLookup] = useState<IngredientLookup | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  useEffect(() => {
    let isActive = true;
    const trimmedQuery = query.trim();

    const handle = window.setTimeout(() => {
      setLookup(null);
      setIsLookingUp(trimmedQuery.length >= 2);

      getIngredients(trimmedQuery)
        .then(async (items) => {
          if (!isActive) return;

          setIngredients(items);

          if (trimmedQuery.length >= 2 && items.length === 0) {
            const result = await lookupIngredient(trimmedQuery, "en");
            if (isActive) setLookup(result);
          }
        })
        .catch(() => {
          if (!isActive) return;

          const normalized = trimmedQuery.toLowerCase();
          const fallback = normalized
            ? fallbackIngredients.filter(
                (item) =>
                  item.name.toLowerCase().includes(normalized) ||
                  item.category.toLowerCase().includes(normalized)
              )
            : fallbackIngredients;

          setIngredients(fallback);
        })
        .finally(() => {
          if (isActive) setIsLookingUp(false);
        });
    }, 300);

    return () => {
      isActive = false;
      window.clearTimeout(handle);
    };
  }, [query]);

  useEffect(() => {
    if (!replayRequest) return;
    setSelected(replayRequest.ingredients);
  }, [replayRequest?.id]);

  const favoriteIds = useMemo(() => new Set(favorites.map((recipe) => recipe.id)), [favorites]);
  const quickPicks = ["Chicken breast", "Egg", "Broccoli", "Rice", "Garlic"];

  const recommendedIngredients = useMemo(() => {
    return getRecommendations(selected, 5);
  }, [selected]);

  function toggleIngredient(name: string) {
    setSelected((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );
  }


  async function useLookupIngredient() {
    if (!lookup?.isRealIngredient) return;

    const name = lookup.name.trim();
    if (!name) return;

    const fallbackIngredient: Ingredient = {
      id: -Date.now(),
      name,
      category: lookup.category || "Custom",
      iconEmoji: lookup.iconEmoji || "🥬",
      isCustom: true
    };

    let ingredientToAdd = fallbackIngredient;
    if (!lookup.existsInDatabase) {
      try {
        ingredientToAdd = await createIngredient(name, fallbackIngredient.category, fallbackIngredient.iconEmoji);
      } catch {
        ingredientToAdd = fallbackIngredient;
      }
    }

    setSelected((current) =>
      current.some((item) => item.toLowerCase() === ingredientToAdd.name.toLowerCase())
        ? current
        : [...current, ingredientToAdd.name]
    );
    setIngredients((current) => {
      if (current.some((item) => item.name.toLowerCase() === ingredientToAdd.name.toLowerCase())) return current;
      return [ingredientToAdd, ...current];
    });
    setQuery("");
    setLookup(null);
    setNotice(lookup.existsInDatabase ? null : "AI verified and saved this ingredient for future autocomplete.");
  }
  async function requestSuggestions(ingredientList = selected) {
    if (ingredientList.length === 0) {
      setNotice("Please select at least 1 ingredient.");
      return;
    }

    setIsLoading(true);
    setNotice(null);

    try {
      const result = await suggestRecipes(ingredientList, "en");
      setRecipes(result);
      onSearchComplete(ingredientList, result);
    } catch {
      const result = buildLocalSuggestions(ingredientList, "en");
      setRecipes(result);
      onSearchComplete(ingredientList, result);
      setNotice("API is offline, so KitmaiOx loaded local demo recipes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-[#F0E3D7] bg-[#FFF9F3]">
        <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[-120px] h-80 w-80 rounded-full bg-herb-soft blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#F0E3D7] bg-white px-3 py-1.5 text-xs font-semibold text-accent-dark shadow-sm">
              <Sparkles size={14} aria-hidden="true" />
              AI-powered kitchen companion
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.06] tracking-tight text-[#2B211D] sm:text-6xl">
              Not sure what to cook?<br/>Look in your fridge!
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#6F5B50]">
              Can't decide on a meal? Just select the ingredients you already have, and let KitmaiOx be your personal chef to help you discover and cook delicious recipes instantly.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <FeaturePill icon={Zap} label="Smart Chef AI" />
              <FeaturePill icon={Carrot} label="50+ ingredients" />
            </div>
          </div>

          <div className="rounded-[32px] border border-[#F0E3D7] bg-white p-4 shadow-premium sm:p-5">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard value="50+" label="Ingredients" tone="accent" />
              <MetricCard value="1M+" label="Combinations" tone="honey" runTo={1000000} />
              <div className="col-span-2 rounded-3xl bg-[#FFF9F3] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#2B211D]">Quick picks</p>
                    <p className="mt-1 text-xs text-[#8B7568]">Tap common staples to start faster.</p>
                  </div>
                  <Leaf className="text-herb-text" size={20} aria-hidden="true" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {quickPicks.map((name) => {
                    const isSelected = selected.includes(name);
                    return (
                      <button
                        type="button"
                        key={name}
                        onClick={() => toggleIngredient(name)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${isSelected
                            ? "border-accent bg-accent text-white shadow-glow"
                            : "border-[#F0E3D7] bg-white text-[#6F5B50] hover:border-accent/35 hover:bg-accent-soft hover:text-accent-dark"
                          }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <SearchInput value={query} onChange={setQuery} placeholder="Search ingredients in your fridge..." />
        </div>
      </section>

      <IngredientPicker
        ingredients={ingredients}
        selected={selected}
        query={query}
        category={category}
        onCategoryChange={setCategory}
        onToggle={toggleIngredient}
        onRemove={(name) => setSelected((current) => current.filter((item) => item !== name))}
        lookup={lookup}
        isLookingUp={isLookingUp}
        onUseLookup={useLookupIngredient}
      />

      {recommendedIngredients.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/60 px-4 py-3 border border-[#F0E3D7] shadow-sm">
            <span className="text-xs font-semibold text-[#8B7568] flex items-center gap-1.5">
              <Sparkles size={14} className="text-accent" /> Pairs well with:
            </span>
            {recommendedIngredients.map(name => (
              <button
                key={name}
                onClick={() => toggleIngredient(name)}
                className="flex items-center gap-1 rounded-full border border-accent/20 bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent-dark transition-all hover:bg-accent hover:text-white active:scale-95 shadow-sm"
              >
                {name} <span className="font-bold">+</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-[24px] border border-[#F0E3D7] bg-white p-4 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="text-sm font-semibold text-[#2B211D]">{selected.length} ingredients selected</p>
            <p className="mt-1 text-xs text-[#8B7568]">Ready to generate recipe ideas from your kitchen list.</p>
          </div>
          <button
            type="button"
            disabled={selected.length === 0 || isLoading}
            onClick={() => void requestSuggestions()}
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-white shadow-glow transition-all hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-[#D8C8BC] disabled:shadow-none sm:mt-0 sm:w-auto"
          >
            <Sparkles size={16} className={isLoading ? "animate-spin" : ""} aria-hidden="true" />
            {isLoading ? "Cooking ideas..." : "Suggest recipes"}
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Recipe Results</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#2B211D]">Recommended recipes</h2>
            <p className="mt-1 text-sm text-[#8B7568]">
              {recipes.length > 0
                ? `Generated ideas from ${selected.length} selected ingredients.`
                : "Select ingredients above, then generate a fresh set of ideas."}
            </p>
          </div>
          {notice ? (
            <div className="rounded-2xl border border-accent/20 bg-accent-soft px-4 py-2 text-sm font-medium text-accent-dark">
              {notice}
            </div>
          ) : null}
        </div>

        {recipes.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={favoriteIds.has(recipe.id)}
                onOpen={setActiveRecipe}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-[#E4D5C9] bg-white/70 px-6 py-14 text-center shadow-sm">
            <Clock3 className="mx-auto text-accent" size={30} aria-hidden="true" />
            <p className="mt-4 text-base font-semibold text-[#2B211D]">No recipes suggested yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8B7568]">
              Pick a few ingredients and KitmaiOx will turn them into simple, cookable recipe cards.
            </p>
          </div>
        )}
      </section>

      <RecipeDetailModal recipe={activeRecipe} onClose={() => setActiveRecipe(null)} />
    </>
  );
}

function FeaturePill({ icon: Icon, label }: { icon: typeof Sparkles; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#F0E3D7] bg-white px-3.5 py-2 text-sm font-medium text-[#6F5B50] shadow-sm">
      <Icon size={15} className="text-accent" aria-hidden="true" />
      {label}
    </span>
  );
}

function MetricCard({ value, label, tone, runTo }: { value: string; label: string; tone: "accent" | "herb" | "honey", runTo?: number }) {
  const toneClass = 
    tone === "accent" ? "bg-accent-soft text-accent-dark" : 
    tone === "herb" ? "bg-herb-soft text-herb-text" : 
    "bg-honey-soft text-honey-text";
  
  const numericString = value.replace(/[^\d]/g, '');
  const targetNumber = runTo ?? (numericString ? parseInt(numericString, 10) : 0);
  
  const [displayNumber, setDisplayNumber] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (targetNumber === 0) {
      setDisplayNumber(0);
      setIsFinished(true);
      return;
    }
    
    setIsFinished(false);
    let startTimestamp: number;
    const duration = 2000; // 2.0 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayNumber(Math.floor(easeProgress * targetNumber));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayNumber(targetNumber);
        setIsFinished(true);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetNumber]);

  function formatDisplay(num: number) {
    if (num >= 1000000) return (num / 1000000).toFixed(0) + "M";
    if (num >= 1000) return Math.floor(num / 1000) + "K";
    return num.toString();
  }

  return (
    <article className={`rounded-3xl p-5 text-center flex flex-col justify-center min-h-[104px] ${toneClass}`}>
      <p className="text-4xl font-semibold tracking-tight">
        {isFinished ? value : (targetNumber > 0 ? `${formatDisplay(displayNumber)}+` : value)}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-75">{label}</p>
    </article>
  );
}



