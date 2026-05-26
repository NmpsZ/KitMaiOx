export type View = "home" | "favorites" | "history" | "stats" | "auth";

export interface Ingredient {
  id: number;
  name: string;
  category: string;
  iconEmoji: string;
  isCustom: boolean;
}

export interface IngredientLookup {
  existsInDatabase: boolean;
  isRealIngredient: boolean;
  name: string;
  category: string;
  iconEmoji: string;
  message: string;
  suggestions: Ingredient[];
}

export interface Recipe {
  id: number;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  estimatedTime: number;
  calorieEstimate: number;
  protein: number;
  carbs: number;
  fat: number;
  iconEmoji: string;
  ingredients: string[];
  steps: string[];
  language: "en" | "th" | string;
  createdAt?: string;
  imageUrl?: string;
}

export interface FavoriteRecipe {
  id: number;
  savedAt: string;
  recipe: Recipe;
}

export interface SearchHistory {
  id: number;
  ingredients: string[];
  resultCount: number;
  searchedAt: string;
}

export interface Stats {
  totalSearches: number;
  favoriteCount: number;
  recipeCount: number;
  ingredientUseCount: number;
  topIngredients: IngredientStat[];
}

export interface IngredientStat {
  name: string;
  useCount: number;
}

export interface ReplayRequest {
  id: number;
  ingredients: string[];
}

