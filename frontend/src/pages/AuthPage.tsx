import { useEffect, useState } from "react";
import { User, Lock, ChefHat, HelpCircle } from "lucide-react";
import { login, register, loginWithGoogle } from "../services/api";

interface AuthPageProps {
  onLogin: (token: string, username: string) => void;
  initialIsLogin?: boolean;
  onClose?: () => void;
}

export function AuthPage({ onLogin, initialIsLogin = true, onClose }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfigTip, setShowConfigTip] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const data = await login(username, password);
        onLogin(data.token, data.username);
      } else {
        const data = await register(username, password);
        onLogin(data.token, data.username);
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        setError(data.errors[firstErrorKey][0]);
      } else {
        setError(data?.error || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(idToken: string) {
    setError("");
    setLoading(true);

    try {
      const data = await loginWithGoogle(idToken);
      onLogin(data.token, data.username);
    } catch (err: any) {
      setError(err.response?.data?.error || "Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    // Load Google GIS script dynamically
    const scriptId = "google-gis-client";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client?hl=en";
      script.id = scriptId;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const initGoogleAuth = () => {
      if (!(window as any).google || !active) return;

      try {
        // Read configuration from environment or use standard placeholder structure
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1036814674751-h95u7veojd7qff0u17070hggv6v2n9k9.apps.googleusercontent.com";

        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (active && response.credential) {
              handleGoogleLogin(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        const btnElement = document.getElementById("google-signin-btn");
        if (btnElement) {
          (window as any).google.accounts.id.renderButton(btnElement, {
            theme: "outline",
            size: "large",
            width: btnElement.clientWidth || 380,
            text: "continue_with",
            shape: "rectangular"
          });
        }

        // Try Google One Tap
        (window as any).google.accounts.id.prompt();
      } catch (err) {
        console.error("Failed to initialize Google Sign-in:", err);
      }
    };

    if ((window as any).google) {
      initGoogleAuth();
    } else {
      script.onload = () => {
        initGoogleAuth();
      };
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setIsLogin(initialIsLogin);
  }, [initialIsLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian text-[#2B211D] font-sans p-4 relative overflow-hidden">
      {/* Premium background decorative shapes */}
      <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-[#E4572E]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-[#E4572E]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-obsidian-border shadow-premium z-10 transition-all">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-soft text-accent border border-[#F0E3D7] shadow-sm transform hover:rotate-6 transition-transform mb-4">
            <ChefHat size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[#2B211D] mb-1.5 tracking-tight">KitmaiOx</h1>
          <p className="text-[#8B7568] text-sm font-medium">
            {isLogin ? "Sign in to your account to continue" : "Create an account to get cooking"}
          </p>
        </div>

        {error && (
          <div className="bg-[#FAECE7] border border-[#F0E3D7] text-[#993C1D] p-3.5 rounded-xl text-sm mb-6 text-center font-medium shadow-sm transition-all animate-glow-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8B7568] tracking-wider uppercase mb-1.5" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <User
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A38B7C] transition-colors"
                aria-hidden="true"
              />
              <input
                id="username"
                type="text"
                className="h-12 w-full rounded-xl border border-obsidian-border bg-white pl-11 pr-4 text-sm text-[#2B211D] shadow-sm transition-all placeholder:text-[#B8A79E] focus:border-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-accent/10"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B7568] tracking-wider uppercase mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A38B7C] transition-colors"
                aria-hidden="true"
              />
              <input
                id="password"
                type="password"
                className="h-12 w-full rounded-xl border border-obsidian-border bg-white pl-11 pr-4 text-sm text-[#2B211D] shadow-sm transition-all placeholder:text-[#B8A79E] focus:border-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-accent/10"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-[#8B7568] tracking-wider uppercase mb-1.5" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A38B7C] transition-colors"
                  aria-hidden="true"
                />
                <input
                  id="confirmPassword"
                  type="password"
                  className="h-12 w-full rounded-xl border border-obsidian-border bg-white pl-11 pr-4 text-sm text-[#2B211D] shadow-sm transition-all placeholder:text-[#B8A79E] focus:border-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-accent/10"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-dark text-white font-medium h-12 rounded-xl transition-all shadow-glow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2 transform active:scale-[0.98] flex items-center justify-center"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-obsidian-border"></div>
          <span className="flex-shrink mx-4 text-[#8B7568] text-xs font-bold uppercase tracking-wider">Or</span>
          <div className="flex-grow border-t border-obsidian-border"></div>
        </div>

        {/* Continue with Google Button */}
        <div className="flex flex-col items-center justify-center w-full space-y-3">
          <div className="flex justify-center w-full min-h-[44px]">
            <div id="google-signin-btn" className="w-full"></div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfigTip(!showConfigTip)}
            className="text-[11px] text-[#8B7568] hover:text-accent font-semibold transition-colors flex items-center gap-1 hover:underline decoration-accent/30"
          >
            <HelpCircle size={12} /> Needs help setting up Google Sign-in?
          </button>

          {showConfigTip && (
            <div className="w-full p-4 rounded-xl bg-obsidian border border-obsidian-border text-xs text-[#8B7568] space-y-1.5 text-left transition-all animate-scale-in">
              <p className="font-bold text-[#2B211D]">🔧 Google Client Setup Guide:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Go to Google Cloud Console Credentials page.</li>
                <li>Create an **OAuth 2.0 Client ID** as Web Application.</li>
                <li>Add `http://localhost:5173` to **Authorized JavaScript origins**.</li>
                <li>Add `VITE_GOOGLE_CLIENT_ID` to `frontend/.env`.</li>
                <li>Ensure the exact same Client ID is configured in your server `appsettings.json`.</li>
              </ol>
            </div>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-obsidian-border text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setUsername("");
              setPassword("");
              setConfirmPassword("");
            }}
            className="text-[#8B7568] hover:text-accent text-sm font-semibold transition-colors underline-offset-4 hover:underline mb-2"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
          
          {onClose && (
            <div className="mt-2 pt-2 border-t border-dashed border-obsidian-border">
              <button
                type="button"
                onClick={onClose}
                className="text-[#8B7568] hover:text-accent text-xs font-semibold transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <span>←</span> Browse as Guest
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
