import axios from "axios";
import type { FavoriteRecipe, Ingredient, IngredientLookup, Recipe, SearchHistory, Stats } from "../types";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kitmaiox:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(username: string, password: string) {
  const { data } = await api.post("/auth/login", { username, password });
  return data;
}

export async function register(username: string, password: string) {
  const { data } = await api.post("/auth/register", { username, password });
  return data;
}

export async function loginWithGoogle(idToken: string) {
  const { data } = await api.post("/auth/google", { idToken });
  return data;
}

export async function getIngredients(query = "") {
  const trimmedQuery = query.trim();
  const { data } = await api.get<Ingredient[]>("/ingredients", {
    params: {
      ...(trimmedQuery ? { q: trimmedQuery } : {}),
      t: Date.now() // Prevent browser caching so newly added ingredients show up
    }
  });
  return data;
}



export async function createIngredient(name: string, category = "Custom", iconEmoji = "🥬") {
  const { data } = await api.post<Ingredient>("/ingredients/custom", { name, category, iconEmoji });
  return data;
}
export async function lookupIngredient(query: string, language: "en" | "th" = "en") {
  const { data } = await api.get<IngredientLookup>("/ingredients/lookup", {
    params: { q: query.trim(), language }
  });
  return data;
}
export async function suggestRecipes(ingredients: string[], language: "en" | "th" = "en") {
  const { data } = await api.post<Recipe[]>("/recipes/suggest", { ingredients, language });
  return data;
}

export async function getFavorites() {
  const { data } = await api.get<FavoriteRecipe[]>("/favorites");
  return data;
}

export async function saveFavorite(recipeId: number) {
  const { data } = await api.post<FavoriteRecipe>("/favorites", { recipeId });
  return data;
}

export async function deleteFavorite(id: number) {
  await api.delete(`/favorites/${id}`);
}

export async function getHistory() {
  const { data } = await api.get<SearchHistory[]>("/history");
  return data;
}

export async function replayHistory(id: number) {
  const { data } = await api.get<Recipe[]>(`/history/${id}/replay`);
  return data;
}

export async function getStats() {
  const { data } = await api.get<Stats>("/stats");
  return data;
}


