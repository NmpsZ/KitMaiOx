import { Lock, ShieldAlert, Sparkles } from "lucide-react";

interface LockedViewProps {
  title: string;
  description: string;
  onRequireAuth: () => void;
}

export function LockedView({ title, description, onRequireAuth }: LockedViewProps) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center select-none">
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#F0E3D7] bg-white shadow-premium">
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-glow animate-bounce">
          <Sparkles size={12} />
        </div>
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Lock size={26} aria-hidden="true" />
        </span>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-[#2B211D]">{title}</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#8B7568]">{description}</p>

      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={onRequireAuth}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-white shadow-glow transition-all hover:bg-accent-dark active:scale-[0.98]"
        >
          Sign In or Sign Up
        </button>
        <p className="text-[11px] font-medium text-[#A38B7C]">
          ⚡ Instantly unlock custom saving, history tracking & metrics!
        </p>
      </div>
    </div>
  );
}
