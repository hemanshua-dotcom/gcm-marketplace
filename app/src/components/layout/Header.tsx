"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Bell, HelpCircle, Menu, X, ChevronDown, LogOut, User, Settings, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PRODUCT_TYPE_LABELS } from "@/lib/utils";

interface HeaderUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface HeaderProps {
  user?: HeaderUser | null;
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  type: string;
  category: string;
  publisher: string;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.results ?? []);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSearch(searchValue), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchValue, fetchSearch]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      setSearchFocused(false);
      router.push(`/browse?search=${encodeURIComponent(searchValue.trim())}`);
    }
  }

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const showDropdown = searchFocused && (searchResults.length > 0 || (searchValue.length >= 2 && !searching));

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#DADCE0]">
      <div className="flex items-center h-14 px-4 gap-3">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-[#F1F3F4] text-[#5F6368]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
          <GoogleCloudLogo />
          <div className="hidden sm:flex items-center">
            <span className="text-[#5F6368] text-sm font-normal mx-1">|</span>
            <span className="text-[#202124] text-sm font-medium">Marketplace</span>
          </div>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className={`flex items-center gap-2 rounded-full border transition-all duration-150 px-4 h-10 ${
              searchFocused
                ? "border-[#1B73E8] bg-white shadow-[0_1px_6px_rgba(32,33,36,0.28)]"
                : "bg-[#F1F3F4] border-transparent hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)] hover:bg-white"
            }`}>
              <Search className={`w-4 h-4 shrink-0 transition-colors ${searchFocused ? "text-[#1B73E8]" : "text-[#5F6368]"}`} />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search Marketplace"
                className="flex-1 bg-transparent outline-none text-sm text-[#202124] placeholder:text-[#9AA0A6] min-w-0"
              />
              {searchValue && (
                <button type="button" onClick={() => { setSearchValue(""); setSearchResults([]); }} className="text-[#5F6368] hover:text-[#202124]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Search dropdown */}
          {showDropdown && (
            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl border border-[#DADCE0] shadow-[var(--md-elev-4)] overflow-hidden z-50">
              {searchResults.length > 0 ? (
                <>
                  {searchResults.map((r) => (
                    <Link
                      key={r.id}
                      href={`/products/${r.slug}`}
                      onClick={() => { setSearchFocused(false); setSearchValue(""); }}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[#F8F9FA] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: getLogoColor(r.name) }}>
                        {r.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#202124] truncate">{r.name}</p>
                        <p className="text-xs text-[#5F6368]">{r.publisher} · {PRODUCT_TYPE_LABELS[r.type] ?? r.type}</p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/browse?search=${encodeURIComponent(searchValue)}`}
                    onClick={() => setSearchFocused(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-[#1B73E8] hover:bg-[#F8F9FA] border-t border-[#F1F3F4] font-medium"
                  >
                    <Search className="w-4 h-4" />
                    See all results for "{searchValue}"
                  </Link>
                </>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-[#5F6368]">
                  No results for "{searchValue}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          <button className="p-2 rounded-full hover:bg-[#F1F3F4] text-[#5F6368]"><HelpCircle className="w-5 h-5" /></button>
          <button className="p-2 rounded-full hover:bg-[#F1F3F4] text-[#5F6368]"><Bell className="w-5 h-5" /></button>

          {user ? (
            <div className="relative ml-1" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-8 h-8 rounded-full text-white text-sm font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
                style={{ backgroundColor: getLogoColor(user.name) }}
              >
                {user.name.slice(0, 2).toUpperCase()}
              </button>
              {userMenuOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-64 bg-white rounded-2xl border border-[#DADCE0] shadow-[var(--md-elev-4)] overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#F1F3F4]">
                    <p className="text-sm font-medium text-[#202124]">{user.name}</p>
                    <p className="text-xs text-[#5F6368]">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#F1F3F4] text-xs text-[#5F6368] font-medium">{user.role}</span>
                  </div>
                  <div className="py-1">
                    <MenuLink href="/my-products" icon={<Package className="w-4 h-4" />} label="My products" onClick={() => setUserMenuOpen(false)} />
                    <MenuLink href="/account" icon={<User className="w-4 h-4" />} label="Account settings" onClick={() => setUserMenuOpen(false)} />
                    {(user.role === "SELLER" || user.role === "ADMIN") && (
                      <MenuLink href="/seller" icon={<Settings className="w-4 h-4" />} label="Seller portal" onClick={() => setUserMenuOpen(false)} />
                    )}
                    {user.role === "ADMIN" && (
                      <MenuLink href="/admin" icon={<Settings className="w-4 h-4" />} label="Admin console" onClick={() => setUserMenuOpen(false)} />
                    )}
                  </div>
                  <div className="border-t border-[#F1F3F4] py-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#D93025] hover:bg-[#F8F9FA] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link href="/auth/signin"><Button variant="text" size="sm">Sign in</Button></Link>
              <Link href="/auth/signup"><Button variant="filled" size="sm">Get started</Button></Link>
            </div>
          )}

          {/* Project selector */}
          <button className="hidden md:flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded border border-[#DADCE0] text-sm text-[#3C4043] hover:bg-[#F8F9FA] transition-colors">
            <div className="w-2 h-2 rounded-full bg-[#137333]" />
            <span className="max-w-[120px] truncate">my-project</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5F6368]" />
          </button>
        </div>
      </div>

      {/* Nav tabs */}
      <nav className="hidden md:flex items-center px-4 border-t border-[#F1F3F4]">
        <NavTab href="/" label="Home" />
        <NavTab href="/browse" label="Browse" />
        <NavTab href="/my-products" label="My products" />
        {user && (user.role === "SELLER" || user.role === "ADMIN") && (
          <NavTab href="/seller" label="Seller portal" />
        )}
        {user && user.role === "ADMIN" && (
          <NavTab href="/admin" label="Admin" />
        )}
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DADCE0] bg-white py-2">
          <MobileNavLink href="/" label="Home" onClick={() => setMobileMenuOpen(false)} />
          <MobileNavLink href="/browse" label="Browse" onClick={() => setMobileMenuOpen(false)} />
          <MobileNavLink href="/my-products" label="My products" onClick={() => setMobileMenuOpen(false)} />
          {user && (user.role === "SELLER" || user.role === "ADMIN") && (
            <MobileNavLink href="/seller" label="Seller portal" onClick={() => setMobileMenuOpen(false)} />
          )}
          {user && user.role === "ADMIN" && (
            <MobileNavLink href="/admin" label="Admin" onClick={() => setMobileMenuOpen(false)} />
          )}
          {!user && (
            <div className="px-6 pt-2 flex gap-2">
              <Link href="/auth/signin" className="flex-1"><Button variant="outlined" size="sm" className="w-full">Sign in</Button></Link>
              <Link href="/auth/signup" className="flex-1"><Button variant="filled" size="sm" className="w-full">Get started</Button></Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function NavTab({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="px-4 py-2.5 text-sm text-[#5F6368] hover:text-[#202124] hover:bg-[#F8F9FA] transition-colors relative group">
      {label}
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B73E8] scale-x-0 group-hover:scale-x-100 transition-transform duration-150 rounded-full" />
    </Link>
  );
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center px-6 py-3 text-sm text-[#202124] hover:bg-[#F8F9FA]">
      {label}
    </Link>
  );
}

function MenuLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3C4043] hover:bg-[#F8F9FA] transition-colors">
      <span className="text-[#5F6368]">{icon}</span>
      {label}
    </Link>
  );
}

function getLogoColor(name: string) {
  const colors = ["#1B73E8", "#137333", "#D93025", "#F9AB00", "#7C3AED", "#0891B2", "#DB2777", "#0D9488"];
  return colors[name.charCodeAt(0) % colors.length];
}

function GoogleCloudLogo() {
  return (
    <svg width="92" height="18" viewBox="0 0 92 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.9 7.4h-6.4v2.1h4.2c-.4 2.1-2.2 3.6-4.2 3.6-2.5 0-4.5-2-4.5-4.5S6 4.1 8.5 4.1c1.1 0 2.1.4 2.9 1.1l1.5-1.5C11.6 2.5 10.1 2 8.5 2 4.9 2 2 4.9 2 8.6s2.9 6.5 6.5 6.5c3.8 0 6.3-2.7 6.3-6.4 0-.5-.1-.9-.2-1.3h.3z" fill="#4285F4"/>
      <path d="M24 5.4c-2.5 0-4.5 1.9-4.5 4.7 0 2.7 2 4.6 4.5 4.6s4.5-1.9 4.5-4.6c0-2.8-2-4.7-4.5-4.7zm0 7.5c-1.4 0-2.6-1.2-2.6-2.8 0-1.7 1.2-2.8 2.6-2.8 1.4 0 2.6 1.2 2.6 2.8 0 1.6-1.2 2.8-2.6 2.8z" fill="#EA4335"/>
      <path d="M34.5 5.4c-2.5 0-4.5 1.9-4.5 4.7 0 2.7 2 4.6 4.5 4.6s4.5-1.9 4.5-4.6c0-2.8-2-4.7-4.5-4.7zm0 7.5c-1.4 0-2.6-1.2-2.6-2.8 0-1.7 1.2-2.8 2.6-2.8 1.4 0 2.6 1.2 2.6 2.8 0 1.6-1.2 2.8-2.6 2.8z" fill="#FBBC05"/>
      <path d="M45 5.4c-1.3 0-2.3.5-3 1.3V5.6h-1.8v12.6h1.9v-4.7c.7.8 1.7 1.2 3 1.2 2.6 0 4.6-2.1 4.6-4.7 0-2.5-2-4.6-4.7-4.6zm-.3 7.5c-1.5 0-2.7-1.3-2.7-2.8 0-1.6 1.2-2.8 2.7-2.8 1.4 0 2.6 1.2 2.6 2.8 0 1.5-1.2 2.8-2.6 2.8z" fill="#4285F4"/>
      <rect x="51" y="2" width="1.9" height="12.5" fill="#34A853"/>
      <path d="M61.5 12c-.9 1-1.7 1-2 1-1.3 0-2.4-.8-2.6-2.1h6.9v-.7c0-2.8-1.8-4.8-4.4-4.8s-4.5 1.9-4.5 4.7c0 2.8 2 4.6 4.6 4.6 1.6 0 2.8-.6 3.7-1.7l-1.7-1zm-4.6-3.3c.2-1.1 1.1-1.9 2.3-1.9 1.2 0 2 .8 2.2 1.9h-4.5z" fill="#EA4335"/>
      <path d="M74.2 2v5.1c-.8-.9-1.8-1.4-3-1.4-2.6 0-4.6 2-4.6 4.7s2 4.6 4.6 4.6c1.2 0 2.2-.5 3-1.4v1.2H76V2h-1.8zm-2.7 11c-1.5 0-2.7-1.2-2.7-2.8 0-1.6 1.2-2.8 2.7-2.8 1.4 0 2.7 1.2 2.7 2.8 0 1.6-1.3 2.8-2.7 2.8z" fill="#4285F4"/>
      <path d="M81.8 5.4c-2.5 0-4.5 1.9-4.5 4.7 0 2.7 2 4.6 4.5 4.6s4.5-1.9 4.5-4.6c0-2.8-2-4.7-4.5-4.7zm0 7.5c-1.4 0-2.6-1.2-2.6-2.8 0-1.7 1.2-2.8 2.6-2.8 1.4 0 2.6 1.2 2.6 2.8 0 1.6-1.2 2.8-2.6 2.8z" fill="#FBBC05"/>
      <path d="M88.8 11.9c0 1.4 1.1 2.8 2.8 2.8.7 0 1.3-.2 1.7-.6l.7 1.4c-.7.5-1.5.8-2.4.8-2.5 0-4.7-2-4.7-4.6V5.6h1.9v6.3z" fill="#EA4335"/>
    </svg>
  );
}
