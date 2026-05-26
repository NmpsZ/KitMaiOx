import { fallbackIngredients } from "./fallbackIngredients";

/**
 * A lightweight static flavor graph to recommend complimentary ingredients
 * based on the user's current selection, saving API tokens.
 */
export const flavorGraph: Record<string, string[]> = {
  // Meats & Seafood
  "Chicken breast": ["Garlic", "Broccoli", "Soy sauce", "Mushroom", "Rice"],
  "Pork": ["Garlic", "Soy sauce", "Rice", "Cabbage", "Basil"],
  "Beef": ["Onion", "Potato", "Garlic", "Tomato", "Carrot"],
  "Bacon": ["Egg", "Bread", "Cheese", "Tomato", "Mushroom"],
  "Shrimp": ["Garlic", "Chili", "Lime", "Noodles", "Cilantro"],
  "Squid": ["Garlic", "Chili", "Lime", "Basil", "Rice"],
  "Salmon": ["Lime", "Garlic", "Rice", "Broccoli", "Soy sauce"],

  // Dairy & Proteins
  "Egg": ["Rice", "Pork", "Soy sauce", "Tomato", "Onion"],
  "Tofu": ["Soy sauce", "Mushroom", "Pork", "Garlic", "Cabbage"],
  "Milk": ["Egg", "Bread", "Butter"],
  "Cheese": ["Bread", "Tomato", "Bacon", "Pasta"],

  // Vegetables
  "Tomato": ["Egg", "Onion", "Cheese", "Garlic", "Basil"],
  "Potato": ["Beef", "Onion", "Carrot", "Butter"],
  "Mushroom": ["Chicken breast", "Garlic", "Soy sauce", "Tofu"],
  "Cabbage": ["Pork", "Garlic", "Carrot", "Soy sauce"],
  "Broccoli": ["Chicken breast", "Garlic", "Carrot", "Shrimp"],
  "Onion": ["Beef", "Garlic", "Tomato", "Potato"],

  // Carbs
  "Rice": ["Egg", "Pork", "Chicken breast", "Garlic", "Soy sauce"],
  "Pasta": ["Garlic", "Cheese", "Tomato", "Bacon", "Olive oil"],
  "Noodles": ["Pork", "Egg", "Cabbage", "Soy sauce", "Garlic"],
  "Bread": ["Egg", "Cheese", "Bacon", "Butter"],

  // Base Flavor Profiles (If selected first)
  "Garlic": ["Pork", "Chicken breast", "Rice", "Chili", "Soy sauce"],
  "Soy sauce": ["Rice", "Egg", "Garlic", "Pork"],
  "Basil": ["Pork", "Chili", "Garlic", "Egg", "Rice"],
  "Curry paste": ["Coconut milk", "Chicken breast", "Pork", "Basil"]
};

const MAIN_PROTEINS = new Set(["Meat", "Seafood"]);

/**
 * Computes top recommended ingredients that pair well with the currently selected ones.
 */
export function getRecommendations(selectedNames: string[], max = 5): string[] {
  if (selectedNames.length === 0) return [];

  const scores = new Map<string, number>();

  // Check if user already selected a main protein
  let hasMainProtein = false;
  selectedNames.forEach(name => {
    const item = fallbackIngredients.find(i => i.name === name);
    if (item && MAIN_PROTEINS.has(item.category)) {
      hasMainProtein = true;
    }
  });

  selectedNames.forEach(ingredient => {
    const pairs = flavorGraph[ingredient];
    if (pairs) {
      pairs.forEach((pair, index) => {
        // Exclude logic: if a main protein is already selected, do not recommend another main protein
        const pairItem = fallbackIngredients.find(i => i.name === pair);
        if (pairItem && MAIN_PROTEINS.has(pairItem.category) && hasMainProtein) {
          return;
        }

        // Weight: First item in array gets higher score, decreasing
        const weight = pairs.length - index;
        scores.set(pair, (scores.get(pair) || 0) + weight);
      });
    }
  });

  // Remove already selected items from recommendations
  selectedNames.forEach(item => scores.delete(item));

  // Sort by highest score
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
    .slice(0, max);
}
