import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { BrowseFilters } from "@/components/marketplace/BrowseFilters";
import { PRODUCT_TYPE_LABELS } from "@/lib/utils";

interface BrowsePageProps {
  searchParams: Promise<{
    category?: string;
    type?: string;
    search?: string;
    sort?: string;
    featured?: string;
    pricing?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const [params, user] = await Promise.all([searchParams, getSession()]);

  const where: Record<string, unknown> = {};

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { shortDescription: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.category) {
    where.category = { slug: params.category };
  }
  if (params.type) {
    where.type = params.type;
  }
  if (params.featured === "true") {
    where.featured = true;
  }
  if (params.pricing) {
    const pricingMap: Record<string, string> = {
      "free": "FREE",
      "subscription": "SUBSCRIPTION",
      "usage-based": "USAGE_BASED",
      "byol": "BYOL",
    };
    const pricingType = pricingMap[params.pricing];
    if (pricingType) {
      where.pricingPlans = { some: { type: pricingType } };
    }
  }

  const orderBy: Record<string, string> =
    params.sort === "newest" ? { createdAt: "desc" }
    : params.sort === "rating" ? { rating: "desc" }
    : params.sort === "popular" ? { deployCount: "desc" }
    : { deployCount: "desc" };

  const [products, categories, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      include: { publisher: true, pricingPlans: true, category: true },
      orderBy,
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.product.count({ where }),
  ]);

  const productTypes = Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-normal text-[#202124]">
            {params.category
              ? categories.find((c) => c.slug === params.category)?.name ?? "Browse"
              : params.search
              ? `Results for "${params.search}"`
              : "Browse Marketplace"}
          </h1>
          <p className="text-sm text-[#5F6368] mt-1">{totalCount} solutions found</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className="hidden lg:block w-56 shrink-0">
            <BrowseFilters
              categories={categories}
              productTypes={productTypes}
              activeCategory={params.category}
              activeType={params.type}
              activeSort={params.sort}
              activePricing={params.pricing}
              searchQuery={params.search}
            />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8EAED]">
              <div className="flex items-center gap-2 flex-wrap">
                {params.category && (
                  <ActiveFilter label={categories.find((c) => c.slug === params.category)?.name ?? params.category} paramKey="category" currentParams={params} />
                )}
                {params.type && (
                  <ActiveFilter label={PRODUCT_TYPE_LABELS[params.type] ?? params.type} paramKey="type" currentParams={params} />
                )}
                {params.featured === "true" && (
                  <ActiveFilter label="Featured" paramKey="featured" currentParams={params} />
                )}
              </div>
              <SortSelect activeSort={params.sort} currentParams={params} />
            </div>

            {products.length === 0 ? (
              <EmptyState search={params.search} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

type BrowseParams = { category?: string; type?: string; search?: string; sort?: string; featured?: string; pricing?: string };

function buildUrl(currentParams: BrowseParams, overrides: Partial<BrowseParams>, remove?: string): string {
  const merged = { ...currentParams, ...overrides };
  if (remove) delete (merged as Record<string, unknown>)[remove];
  const qs = new URLSearchParams(
    Object.entries(merged).filter(([, v]) => v != null && v !== "") as [string, string][]
  ).toString();
  return qs ? `?${qs}` : "/browse";
}

function ActiveFilter({ label, paramKey, currentParams }: { label: string; paramKey: string; currentParams: BrowseParams }) {
  return (
    <a
      href={buildUrl(currentParams, {}, paramKey)}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D3E4FD] text-[#1B73E8] text-xs font-medium hover:bg-[#C5D9FB] transition-colors"
    >
      {label}
      <span className="text-[#1B73E8] opacity-70 hover:opacity-100 text-sm leading-none">×</span>
    </a>
  );
}

function SortSelect({ activeSort, currentParams }: { activeSort?: string; currentParams: BrowseParams }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#5F6368]">
      <span className="hidden sm:inline">Sort by:</span>
      <div className="flex items-center gap-1">
        {[
          { value: "popular", label: "Most deployed" },
          { value: "rating", label: "Highest rated" },
          { value: "newest", label: "Newest" },
        ].map((opt) => (
          <a
            key={opt.value}
            href={buildUrl(currentParams, { sort: opt.value })}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeSort === opt.value || (!activeSort && opt.value === "popular")
                ? "bg-[#1B73E8] text-white"
                : "bg-[#F1F3F4] text-[#3C4043] hover:bg-[#E8EAED]"
            }`}
          >
            {opt.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ search }: { search?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F1F3F4] flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[#BDC1C6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <h3 className="text-lg font-medium text-[#202124] mb-2">No results found</h3>
      <p className="text-sm text-[#5F6368] max-w-sm">
        {search ? `No solutions match "${search}". Try a different search term or browse by category.` : "No solutions match your current filters. Try adjusting your filters."}
      </p>
      <a href="/browse" className="mt-4 text-sm text-[#1B73E8] hover:underline font-medium">
        Clear all filters
      </a>
    </div>
  );
}
