import { BarChart3, ChefHat, Heart, History, Home } from "lucide-react";
import type { View } from "../types";

interface NavbarProps {
  activeView: View;
  onChange: (view: View) => void;
  onAuthRequest: (isLogin: boolean) => void;
  favoriteCount: number;
  username: string;
  onLogout: () => void;
}

const navItems: Array<{ id: View; label: string; icon: typeof Home }> = [
  { id: "home", label: "Home", icon: Home },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "history", label: "History", icon: History },
  { id: "stats", label: "Stats", icon: BarChart3 }
];

export function Navbar({ activeView, onChange, onAuthRequest, favoriteCount, username, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#F0E3D7] bg-white/90 shadow-glass backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          className="flex items-center gap-2.5 text-left transition-transform active:scale-95"
          onClick={() => onChange("home")}
          aria-label="KitmaiOx Home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-glow">
            <ChefHat size={20} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-semibold leading-none tracking-tight text-[#2B211D]">KitmaiOx</span>
            <span className="mt-1 block text-[11px] font-medium leading-none text-[#8B7568]">AI recipe kitchen</span>
          </span>
        </button>

        <nav className="flex items-center gap-1 overflow-x-auto rounded-full border border-[#F0E3D7] bg-[#FFF9F3] p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`relative flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-accent shadow-sm"
                    : "text-[#8B7568] hover:bg-white/70 hover:text-[#2B211D]"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.id === "favorites" && favoriteCount > 0 ? (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold leading-none text-white">
                    {favoriteCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {username ? (
            <div className="flex items-center gap-3 bg-[#FFF9F3] border border-[#F0E3D7] rounded-2xl p-1.5 pr-3 shadow-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white font-bold text-sm shadow-sm select-none">
                {username.charAt(0).toUpperCase()}
              </span>
              <span className="hidden md:inline text-xs font-semibold text-[#2B211D] tracking-wide">
                {username}
              </span>
              <button
                onClick={onLogout}
                className="ml-1 px-2.5 py-1.5 rounded-xl border border-red-100/50 bg-red-50/50 hover:bg-red-50 text-red-500 hover:text-red-600 hover:border-red-200 text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAuthRequest(true)}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-[#8B7568] hover:text-accent rounded-xl hover:bg-obsidian-hover transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onAuthRequest(false)}
                className="px-3.5 py-1.5 bg-accent hover:bg-accent-dark text-white font-bold text-xs rounded-xl shadow-glow hover:shadow-lg transition-all flex items-center gap-1 active:scale-95"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
