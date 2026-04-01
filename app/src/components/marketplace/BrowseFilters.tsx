"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface BrowseFiltersProps {
  categories: Array<{ id: string; name: string; slug: string; color: string }>;
  productTypes: Array<{ value: string; label: string }>;
  activeCategory?: string;
  activeType?: string;
  activeSort?: string;
  activePricing?: string;
  searchQuery?: string;
}

const PRICING_FILTERS = [
  { value: "free", label: "Free" },
  { value: "subscription", label: "Subscription" },
  { value: "usage-based", label: "Usage-based" },
  { value: "byol", label: "Bring your own license" },
];

export function BrowseFilters({
  categories,
  productTypes,
  activeCategory,
  activeType,
  activePricing,
}: BrowseFiltersProps) {
  const [typesExpanded, setTypesExpanded] = useState(true);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [pricingExpanded, setPricingExpanded] = useState(true);

  const buildHref = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (key !== "category" && activeCategory) params.set("category", activeCategory);
    if (key !== "type" && activeType) params.set("type", activeType);
    if (key !== "pricing" && activePricing) params.set("pricing", activePricing);
    if (value) params.set(key, value);
    return `/browse?${params.toString()}`;
  };

  return (
    <div className="space-y-1">
      {/* Clear all */}
      {(activeCategory || activeType || activePricing) && (
        <Link
          href="/browse"
          className="block w-full text-xs text-[#D93025] hover:underline mb-3 font-medium"
        >
          Clear all filters
        </Link>
      )}

      {/* Product types */}
      <FilterSection
        title="Type"
        expanded={typesExpanded}
        onToggle={() => setTypesExpanded(!typesExpanded)}
      >
        {productTypes.map((t) => (
          <FilterItem
            key={t.value}
            label={t.label}
            href={activeType === t.value ? "/browse" : buildHref("type", t.value)}
            active={activeType === t.value}
          />
        ))}
      </FilterSection>

      {/* Categories */}
      <FilterSection
        title="Category"
        expanded={categoriesExpanded}
        onToggle={() => setCategoriesExpanded(!categoriesExpanded)}
      >
        {categories.map((cat) => (
          <FilterItem
            key={cat.id}
            label={cat.name}
            href={activeCategory === cat.slug ? "/browse" : buildHref("category", cat.slug)}
            active={activeCategory === cat.slug}
            color={cat.color}
          />
        ))}
      </FilterSection>

      {/* Pricing */}
      <FilterSection
        title="Pricing"
        expanded={pricingExpanded}
        onToggle={() => setPricingExpanded(!pricingExpanded)}
      >
        {PRICING_FILTERS.map((p) => (
          <FilterItem
            key={p.value}
            label={p.label}
            href={activePricing === p.value ? "/browse" : buildHref("pricing", p.value)}
            active={activePricing === p.value}
          />
        ))}
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#E8EAED] pb-3 mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[#3C4043] uppercase tracking-wider hover:text-[#202124]"
      >
        {title}
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {expanded && (
        <div className="space-y-0.5 mt-1">
          {children}
        </div>
      )}
    </div>
  );
}

function FilterItem({ label, href, active, color }: { label: string; href: string; active: boolean; color?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
        active
          ? "bg-[#D3E4FD] text-[#1B73E8] font-medium"
          : "text-[#3C4043] hover:bg-[#F1F3F4] hover:text-[#202124]"
      )}
    >
      {color && (
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      )}
      <span className="text-xs">{label}</span>
    </Link>
  );
}
