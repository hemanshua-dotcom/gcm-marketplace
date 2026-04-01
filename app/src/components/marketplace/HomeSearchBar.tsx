"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function HomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/browse");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-xl mb-10">
      <label className="flex-1 flex items-center gap-3 bg-white border border-[#DADCE0] rounded-full px-5 h-12 shadow-[var(--md-elev-1)] hover:shadow-[var(--md-elev-2)] transition-shadow focus-within:shadow-[var(--md-elev-2)] focus-within:border-[#1B73E8] cursor-text">
        <Search className="w-4 h-4 text-[#9AA0A6] shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search solutions, publishers, categories..."
          className="flex-1 text-sm text-[#202124] placeholder-[#9AA0A6] bg-transparent outline-none"
        />
      </label>
      <button
        type="submit"
        className="h-12 px-6 rounded-full bg-[#1B73E8] text-white text-sm font-medium hover:bg-[#1557B0] transition-colors shrink-0"
      >
        Browse all
      </button>
    </form>
  );
}
