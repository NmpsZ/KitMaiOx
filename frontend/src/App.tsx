import { useMemo, useState } from "react";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { HistoryPage } from "./pages/HistoryPage";
import { StatsPage } from "./pages/StatsPage";
import { AuthPage } from "./pages/AuthPage";
import { LockedView } from "./components/LockedView";
import { deleteFavorite, saveFavorite, getFavorites, getHistory, api } from "./services/api";
import type { Recipe, ReplayRequest, SearchHistory, Stats, View } from "./types";
import { readStorage, writeStorage } from "./utils/storage";

const FAVORITES_KEY = "kitmaiox:favorites";
const HISTORY_KEY = "kitmaiox:history";

export default function App() {
  const [activeView, setActiveView] = useState<View>("home");
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("kitmaiox:token"));
  const [username, setUsername] = useState<string>(() => localStorage.getItem("kitmaiox:username") || "");
  
  const [favorites, setFavorites] = useState<Recipe[]>(() => readStorage(FAVORITES_KEY, []));
  const [history, setHistory] = useState<SearchHistory[]>(() => readStorage(HISTORY_KEY, []));
  const [replayRequest, setReplayRequest] = useState<ReplayRequest | null>(null);

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestModalMsg, setGuestModalMsg] = useState("");

  const stats = useMemo<Stats>(() => {
    const counts = new Map<string, number>();
    history.forEach((item) => {
      item.ingredients.forEach((ingredient) => {
        counts.set(ingredient, (counts.get(ingredient) ?? 0) + 1);
      });
    });

    const topIngredients = Array.from(counts.entries())
      .map(([name, useCount]) => ({ name, useCount }))
      .sort((a, b) => b.useCount - a.useCount || a.name.localeCompare(b.name))
      .slice(0, 8);

    return {
      totalSearches: history.length,
      favoriteCount: favorites.length,
      recipeCount: history.reduce((sum, item) => sum + item.resultCount, 0),
      ingredientUseCount: topIngredients.reduce((sum, item) => sum + item.useCount, 0),
      topIngredients
    };
  }, [favorites.length, history]);

  function handleSearchComplete(ingredients: string[], recipes: Recipe[]) {
    const nextHistory: SearchHistory[] = [
      {
        id: Date.now(),
        ingredients,
        resultCount: recipes.length,
        searchedAt: new Date().toISOString()
      },
      ...history
    ].slice(0, 20);

    setHistory(nextHistory);
    writeStorage(HISTORY_KEY, nextHistory);
  }

  function handleToggleFavorite(recipe: Recipe) {
    if (!token) {
      setGuestModalMsg("Sign in to save your favorite dishes, track history, and view kitchen stats.");
      setShowGuestModal(true);
      return;
    }
    const exists = favorites.some((item) => item.id === recipe.id);
    const nextFavorites = exists
      ? favorites.filter((item) => item.id !== recipe.id)
      : [recipe, ...favorites].slice(0, 50);

    setFavorites(nextFavorites);
    writeStorage(FAVORITES_KEY, nextFavorites);

    if (recipe.id > 0) {
      if (exists) {
        void deleteFavorite(recipe.id).catch(() => undefined);
      } else {
        void saveFavorite(recipe.id).catch(() => undefined);
      }
    }
  }

  function handleReplay(item: SearchHistory) {
    setReplayRequest({ id: Date.now(), ingredients: item.ingredients });
    setActiveView("home");
  }
  function handleClearHistory() {
    setHistory([]);
    writeStorage(HISTORY_KEY, []);
  }

  function handleLogin(newToken: string, newUsername: string) {
    localStorage.setItem("kitmaiox:token", newToken);
    localStorage.setItem("kitmaiox:username", newUsername);
    setToken(newToken);
    setUsername(newUsername);
    setActiveView("home");
    
    // Fetch user's data from API on login
    getFavorites().then(items => {
      const recipes = items.map(f => f.recipe).filter(Boolean) as Recipe[];
      setFavorites(recipes);
      writeStorage(FAVORITES_KEY, recipes);
    }).catch(console.error);

    getHistory().then(items => {
      setHistory(items);
      writeStorage(HISTORY_KEY, items);
    }).catch(console.error);
  }

  function handleLogout() {
    localStorage.removeItem("kitmaiox:token");
    localStorage.removeItem("kitmaiox:username");
    setToken(null);
    setUsername("");
    setFavorites([]);
    setHistory([]);
    writeStorage(FAVORITES_KEY, []);
    writeStorage(HISTORY_KEY, []);
  }

  const [authInitialIsLogin, setAuthInitialIsLogin] = useState(true);

  function handleAuthRequest(isLogin: boolean) {
    setAuthInitialIsLogin(isLogin);
    setActiveView("auth");
  }

  return (
    <div className="min-h-screen bg-obsidian text-stone-100 font-sans select-none antialiased relative">
      <Navbar 
        activeView={activeView} 
        onChange={setActiveView}
        onAuthRequest={handleAuthRequest}
        favoriteCount={favorites.length} 
        username={username} 
        onLogout={handleLogout} 
      />

      {activeView === "home" ? (
        <HomePage
          favorites={favorites}
          replayRequest={replayRequest}
          onToggleFavorite={handleToggleFavorite}
          onSearchComplete={handleSearchComplete}
        />
      ) : null}
      
      {activeView === "favorites" ? (
        token ? (
          <FavoritesPage favorites={favorites} onToggleFavorite={handleToggleFavorite} />
        ) : (
          <LockedView 
            title="Favorites is locked" 
            description="Create an account to save your favorite dishes, track history, and view personalized kitchen metrics." 
            onRequireAuth={() => handleAuthRequest(false)} 
          />
        )
      ) : null}

      {activeView === "history" ? (
        token ? (
          <HistoryPage history={history} onReplay={handleReplay} onClearHistory={handleClearHistory} />
        ) : (
          <LockedView 
            title="Search History is locked" 
            description="Track your selected ingredient lists and AI-generated recipe suggestions. Sign in to save your history." 
            onRequireAuth={() => handleAuthRequest(true)} 
          />
        )
      ) : null}

      {activeView === "stats" ? (
        token ? (
          <StatsPage stats={stats} />
        ) : (
          <LockedView 
            title="Kitchen Stats are locked" 
            description="Analyze your frequently used food items, track suggestion volumes, and view personal metrics." 
            onRequireAuth={() => handleAuthRequest(true)} 
          />
        )
      ) : null}

      {activeView === "auth" ? (
        <AuthPage onLogin={handleLogin} initialIsLogin={authInitialIsLogin} onClose={() => setActiveView("home")} />
      ) : null}

      {/* Elegant Guest Lock Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[32px] border border-[#F0E3D7] bg-white p-6 shadow-premium text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <span className="text-xl font-semibold">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-[#2B211D]">Premium Feature</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#8B7568]">{guestModalMsg}</p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowGuestModal(false);
                  handleAuthRequest(false);
                }}
                className="w-full h-11 bg-accent hover:bg-accent-dark text-white font-semibold rounded-2xl shadow-glow transition-colors"
              >
                Sign In / Sign Up
              </button>
              <button
                onClick={() => setShowGuestModal(false)}
                className="w-full h-11 bg-white hover:bg-obsidian-hover border border-obsidian-border text-[#8B7568] font-semibold rounded-2xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
