import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search..." }: SearchInputProps) {
  return (
    <label className="relative block w-full">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A38B7C] transition-colors"
        aria-hidden="true"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-[#F0E3D7] bg-white pl-11 pr-4 text-sm text-[#2B211D] shadow-sm transition-all placeholder:text-[#B8A79E] focus:border-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-accent/10"
      />
    </label>
  );
}
