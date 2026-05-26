import { ChevronLeft, ChevronRight, Clock, Eye, Flame, Play, Printer, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Recipe } from "../types";

const thumbGradients = [
  "from-[#FAECE7] to-[#FFF5EE]",
  "from-[#EAF3DE] to-[#F5FAF0]",
  "from-[#FAEEDA] to-[#FFFAED]",
  "from-[#E1F5EE] to-[#F0FBF7]",
  "from-[#EDE7FA] to-[#F5F2FF]",
];

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export function RecipeDetailModal({ recipe, onClose }: RecipeDetailModalProps) {
  const [isCookMode, setIsCookMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    setIsCookMode(false);
    setCurrentStep(0);
    setCheckedIngredients(new Set());
    setCompletedSteps(new Set());
  }, [recipe?.id]);

  if (!recipe) return null;

  const totalSteps = recipe.steps.length;
  const progressPercent = Math.round((currentStep / (totalSteps - 1 || 1)) * 100);
  const gradientIndex = Math.abs(recipe.name.length + recipe.id) % thumbGradients.length;
  const gradient = thumbGradients[gradientIndex];
  const emoji = recipe.iconEmoji || "🍽️";

  // Macro totals for bar chart
  const totalMacros = (recipe.protein || 0) + (recipe.carbs || 0) + (recipe.fat || 0);
  const hasMacros = totalMacros > 0;
  const proteinPct = hasMacros ? Math.round(((recipe.protein || 0) / totalMacros) * 100) : 0;
  const carbsPct = hasMacros ? Math.round(((recipe.carbs || 0) / totalMacros) * 100) : 0;
  const fatPct = hasMacros ? 100 - proteinPct - carbsPct : 0;

  function toggleIngredient(name: string) {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function toggleStepCompletion(index: number) {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  function nextStep() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    setIsCookMode(false);
    setCurrentStep(0);
  }

  function prevStep() {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B211D]/45 px-4 py-6 backdrop-blur-sm">
      <section className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-[#F0E3D7] bg-white text-[#2B211D] shadow-premium">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#F0E3D7] bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold leading-tight tracking-tight text-[#2B211D]">{recipe.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full border border-accent/20 bg-accent-soft px-2.5 py-1 text-accent-dark">
                {recipe.difficulty}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF9F3] px-2.5 py-1 text-[#6F5B50]">
                <Clock size={12} className="text-accent" />
                {recipe.estimatedTime} min
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF9F3] px-2.5 py-1 text-[#6F5B50]">
                <Flame size={12} className="text-accent" />
                {recipe.calorieEstimate} kcal
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F0E3D7] bg-[#FFF9F3] text-[#8B7568] transition hover:border-accent/30 hover:text-accent"
            aria-label="Close"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* Emoji Hero */}
          {!isCookMode ? (
            <div className={`-mx-5 -mt-5 mb-5 flex h-44 items-center justify-center bg-gradient-to-br ${gradient}`}>
              <span className="text-7xl drop-shadow-md select-none" role="img" aria-label={recipe.name}>
                {emoji}
              </span>
            </div>
          ) : null}

          {/* Nutrition Facts Card */}
          {!isCookMode && hasMacros ? (
            <div className="mb-5 rounded-2xl border border-[#F0E3D7] bg-[#FFF9F3] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6F5B50]">Nutrition per serving</h3>

              {/* Macro Bar */}
              <div className="mt-3 flex h-3 overflow-hidden rounded-full">
                <div className="bg-blue-400 transition-all" style={{ width: `${proteinPct}%` }} />
                <div className="bg-amber-400 transition-all" style={{ width: `${carbsPct}%` }} />
                <div className="bg-rose-400 transition-all" style={{ width: `${fatPct}%` }} />
              </div>

              {/* Macro Labels */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-blue-50 px-2 py-2.5">
                  <p className="text-lg font-bold text-blue-600">{recipe.protein}g</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">Protein</p>
                </div>
                <div className="rounded-xl bg-amber-50 px-2 py-2.5">
                  <p className="text-lg font-bold text-amber-600">{recipe.carbs}g</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">Carbs</p>
                </div>
                <div className="rounded-xl bg-rose-50 px-2 py-2.5">
                  <p className="text-lg font-bold text-rose-600">{recipe.fat}g</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-400">Fat</p>
                </div>
              </div>
            </div>
          ) : null}

          {isCookMode ? (
            <div className="space-y-6 py-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Cooking Mode</span>
                <button
                  type="button"
                  onClick={() => setIsCookMode(false)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#8B7568] hover:text-accent"
                >
                  <Eye size={13} />
                  <span>View all</span>
                </button>
              </div>

              <div className="rounded-3xl border border-[#F0E3D7] bg-[#FFF9F3] p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8B7568]">
                  Step {currentStep + 1} of {totalSteps}
                </p>
                <h3 className="mt-3 text-lg font-medium leading-relaxed text-[#2B211D]">
                  {recipe.steps[currentStep]}
                </h3>
              </div>

              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-[#F3E7DC]">
                  <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-[#A38B7C]">
                  <span>START</span>
                  <span>{progressPercent}% COMPLETE</span>
                  <span>FINISH</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[#F0E3D7] pt-4">
                <button
                  type="button"
                  disabled={currentStep === 0}
                  onClick={prevStep}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-[#F0E3D7] px-4 text-xs font-semibold text-[#6F5B50] transition hover:bg-[#FFF9F3] disabled:pointer-events-none disabled:opacity-35"
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-accent text-xs font-semibold text-white shadow-glow transition hover:bg-accent-dark"
                >
                  <span>{currentStep === totalSteps - 1 ? "Finish cooking" : "Next step"}</span>
                  {currentStep !== totalSteps - 1 && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => {
                  setIsCookMode(true);
                  setCurrentStep(0);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-dark transition hover:border-accent/35"
              >
                <Play size={15} fill="currentColor" />
                <span>Start cook mode</span>
              </button>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6F5B50]">Ingredients</h3>
                <p className="mt-1 text-xs text-[#A38B7C]">Tap items to check them off while prepping.</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {recipe.ingredients.map((ingredient) => {
                    const isChecked = checkedIngredients.has(ingredient);
                    return (
                      <button
                        type="button"
                        key={ingredient}
                        onClick={() => toggleIngredient(ingredient)}
                        className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2 text-left text-xs transition ${
                          isChecked
                            ? "border-herb-border bg-herb-soft text-herb-text line-through decoration-herb-text/40"
                            : "border-[#F0E3D7] bg-[#FFF9F3] text-[#4A3A33] hover:border-accent/25 hover:bg-white"
                        }`}
                      >
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border ${isChecked ? "border-herb-text bg-white" : "border-[#D8C8BC] bg-white"}`}>
                          {isChecked && <span className="text-[10px]">✓</span>}
                        </span>
                        <span className="truncate">{ingredient}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6F5B50]">Directions</h3>
                <ol className="mt-3 space-y-3">
                  {recipe.steps.map((step, index) => {
                    const isCompleted = completedSteps.has(index);
                    return (
                      <li
                        key={`${step}-${index}`}
                        onClick={() => toggleStepCompletion(index)}
                        className="group flex cursor-pointer gap-3 text-sm leading-6 select-none"
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                          isCompleted ? "bg-herb-soft text-herb-text" : "bg-accent text-white group-hover:bg-accent-dark"
                        }`}>
                          {isCompleted ? "✓" : index + 1}
                        </span>
                        <span className={`pt-0.5 ${isCompleted ? "text-[#A38B7C] line-through" : "text-[#4A3A33]"}`}>
                          {step}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="flex gap-2 border-t border-[#F0E3D7] pt-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#F0E3D7] bg-[#FFF9F3] px-3 text-xs font-semibold text-[#6F5B50] transition hover:bg-white"
                >
                  <Printer size={14} aria-hidden="true" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigator.share?.({ title: recipe.name, text: recipe.steps.join("\n") })}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#F0E3D7] bg-[#FFF9F3] px-3 text-xs font-semibold text-[#6F5B50] transition hover:bg-white"
                >
                  <Share2 size={14} aria-hidden="true" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
