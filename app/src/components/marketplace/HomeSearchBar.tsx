"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Sparkles, ArrowRight, Loader2, X } from "lucide-react";

const PLACEHOLDER_QUERIES = [
  "AI models for text generation",
  "Kubernetes monitoring",
  "container security scanning",
  "managed databases on GCP",
  "CI/CD pipeline tools",
  "Redis on Google Cloud",
  "observability and logging",
];

// Each chip has a direct browse URL — guaranteed to show results
const EXAMPLE_CHIPS = [
  { label: "AI & ML models", href: "/browse?category=ai-ml" },
  { label: "Free tools", href: "/browse?pricing=free" },
  { label: "Kubernetes apps", href: "/browse?type=KUBERNETES_APP" },
  { label: "Security", href: "/browse?category=security" },
  { label: "Databases", href: "/browse?category=databases" },
  { label: "DevOps & CI/CD", href: "/browse?category=devops" },
  { label: "Analytics", href: "/browse?category=analytics" },
];

function isNaturalLanguage(q: string) {
  if (q.trim().length < 18) return false;
  const nlWords = ["best", " for ", "how", "what", "which", "find", "i need", "looking for", "help", "tools to", "way to", "solutions for"];
  return nlWords.some((w) => q.toLowerCase().includes(w));
}

interface AiResult {
  answer: string;
  browseUrl: string;
  products: { id: string; name: string; slug: string; type: string; publisher: string }[];
}

export function HomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Typewriter animation ─────────────────────────────────────────
  const [displayText, setDisplayText] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [queryIdx, setQueryIdx] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const t = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(t);
  }, []);

  // Typewriter
  useEffect(() => {
    if (query) return;
    const current = PLACEHOLDER_QUERIES[queryIdx];

    if (paused) {
      const t = setTimeout(() => { setPaused(false); setDeleting(true); }, 2200);
      return () => clearTimeout(t);
    }
    if (deleting) {
      if (charIdx === 0) {
        setDeleting(false);
        setQueryIdx((i) => (i + 1) % PLACEHOLDER_QUERIES.length);
        return;
      }
      const t = setTimeout(() => {
        setDisplayText(current.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      }, 28);
      return () => clearTimeout(t);
    }
    if (charIdx < current.length) {
      const t = setTimeout(() => {
        setDisplayText(current.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, 55);
      return () => clearTimeout(t);
    } else {
      setPaused(true);
    }
  }, [charIdx, deleting, paused, queryIdx, query]);

  // ── AI search ────────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAI = useCallback(async (q: string) => {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/search/ai?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
        setShowDropdown(true);
      }
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (isNaturalLanguage(query)) {
      debounceRef.current = setTimeout(() => fetchAI(query), 650);
    } else {
      setAiResult(null);
      setShowDropdown(false);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchAI]);

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowDropdown(false);
    // If AI returned a browseUrl, use it; otherwise fall back to keyword search
    if (aiResult?.browseUrl) {
      router.push(aiResult.browseUrl);
    } else if (query.trim()) {
      router.push(`/browse?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/browse");
    }
  }

  function handleChipClick(href: string) {
    setShowDropdown(false);
    router.push(href);
  }

  const showAiBadge = isNaturalLanguage(query);
  const placeholder = query ? "" : displayText + (cursorVisible ? "|" : " ");

  return (
    <div className="mb-10 max-w-xl" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-3">
          {/* Search input */}
          <label className="flex-1 flex items-center gap-3 bg-white border border-[#DADCE0] rounded-full px-5 h-12 shadow-[0_1px_4px_rgba(32,33,36,0.12)] hover:shadow-[0_2px_8px_rgba(32,33,36,0.2)] transition-all duration-200 focus-within:shadow-[0_2px_8px_rgba(32,33,36,0.2)] focus-within:border-[#1B73E8] cursor-text">
            {aiLoading ? (
              <Loader2 className="w-4 h-4 text-[#1B73E8] shrink-0 animate-spin" />
            ) : showAiBadge ? (
              <Sparkles className="w-4 h-4 text-[#1B73E8] shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-[#9AA0A6] shrink-0" />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => aiResult && setShowDropdown(true)}
              placeholder={placeholder}
              className="flex-1 text-sm text-[#202124] bg-transparent outline-none"
            />
            <div className="flex items-center gap-1 shrink-0">
              {showAiBadge && (
                <span className="flex items-center gap-1 text-[10px] text-[#1B73E8] font-semibold bg-[#D3E4FD] px-2 py-0.5 rounded-full tracking-wide">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              )}
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); setAiResult(null); setShowDropdown(false); }}
                  className="text-[#9AA0A6] hover:text-[#5F6368] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </label>

          <button
            type="submit"
            className="h-12 px-6 rounded-full bg-[#1B73E8] text-white text-sm font-medium hover:bg-[#1557B0] active:bg-[#0D47A1] transition-colors shrink-0 shadow-sm"
          >
            Browse all
          </button>
        </div>

        {/* AI answer dropdown */}
        {showDropdown && aiResult && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-16 bg-white rounded-2xl border border-[#DADCE0] shadow-[0_4px_24px_rgba(32,33,36,0.18)] overflow-hidden z-30 animate-in fade-in slide-in-from-top-1 duration-150">
            {/* AI answer */}
            <div className="p-4 bg-gradient-to-r from-[#F0F4FF] to-[#F6FAFE] border-b border-[#E8EAED]">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#1B73E8] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#1B73E8] uppercase tracking-wide mb-1">AI-powered answer</p>
                  <p className="text-sm text-[#202124] leading-relaxed">{aiResult.answer}</p>
                </div>
              </div>
            </div>

            {/* Matched products */}
            {aiResult.products.length > 0 && (
              <>
                {aiResult.products.slice(0, 3).map((p) => (
                  <a
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8F9FA] transition-colors"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: ["#1B73E8","#137333","#D93025","#F9AB00","#7C3AED"][p.name.charCodeAt(0) % 5] }}
                    >
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#202124] truncate">{p.name}</p>
                      <p className="text-xs text-[#5F6368]">{p.publisher}</p>
                    </div>
                  </a>
                ))}
                <a
                  href={aiResult.browseUrl}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-[#1B73E8] hover:bg-[#F8F9FA] border-t border-[#F1F3F4] font-medium transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  See all matching results
                </a>
              </>
            )}
          </div>
        )}
      </form>

      {/* Example chips */}
      <div className="flex flex-wrap gap-2 mt-4">
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => handleChipClick(chip.href)}
            className="px-3.5 py-1.5 rounded-full bg-white border border-[#DADCE0] text-xs font-medium text-[#3C4043] hover:border-[#1B73E8] hover:text-[#1B73E8] hover:bg-[#F0F6FF] hover:shadow-sm transition-all duration-150 shadow-sm"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
