import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Button } from "@/components/ui/Button";
import { HomeSearchBar } from "@/components/marketplace/HomeSearchBar";
import {
  Sparkles, Shield, GitBranch, Database, Network,
  BarChart3, HardDrive, Briefcase, Server, Code2,
  ArrowRight, Zap, Globe, Lock
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "ai-ml": <Sparkles className="w-6 h-6" />,
  "security": <Shield className="w-6 h-6" />,
  "devops": <GitBranch className="w-6 h-6" />,
  "databases": <Database className="w-6 h-6" />,
  "networking": <Network className="w-6 h-6" />,
  "analytics": <BarChart3 className="w-6 h-6" />,
  "storage": <HardDrive className="w-6 h-6" />,
  "business": <Briefcase className="w-6 h-6" />,
  "infrastructure": <Server className="w-6 h-6" />,
  "dev-tools": <Code2 className="w-6 h-6" />,
};

export default async function HomePage() {
  const user = await getSession();
  const [featuredProducts, categories, recentProducts, productCount, publisherCount] = await Promise.all([
    db.product.findMany({
      where: { featured: true },
      include: { publisher: true, pricingPlans: true },
      take: 8,
      orderBy: { deployCount: "desc" },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({
      include: { publisher: true, pricingPlans: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    db.product.count(),
    db.publisher.count(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F8F9FA] to-white border-b border-[#E8EAED]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#D3E4FD]/40 to-[#E8EAED]/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#CEEAD6]/30 to-transparent blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D3E4FD] text-[#1B73E8] text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{productCount}+ solutions available</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-normal text-[#202124] leading-tight mb-6">
              Discover and deploy{" "}
              <span className="text-[#1B73E8]">enterprise software</span>{" "}
              on Google Cloud
            </h1>

            <p className="text-lg text-[#5F6368] mb-8 leading-relaxed max-w-2xl">
              Browse thousands of ready-to-deploy solutions — from AI models and SaaS to VMs, Kubernetes apps, and datasets. All consolidated in your Google Cloud bill.
            </p>

            <HomeSearchBar />

            <div className="flex items-center gap-8 flex-wrap">
              <Stat value={`${productCount}+`} label="Solutions" />
              <Stat value={`${publisherCount}+`} label="Publishers" />
              <Stat value="10" label="Categories" />
              <Stat value="Global" label="Availability" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-medium text-[#202124]">Featured solutions</h2>
            <p className="text-sm text-[#5F6368] mt-0.5">Curated picks for your cloud journey</p>
          </div>
          <Link href="/browse?featured=true" className="flex items-center gap-1 text-sm text-[#1B73E8] hover:underline font-medium">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-[#F8F9FA] border-y border-[#E8EAED]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-[#202124]">Browse by category</h2>
            <Link href="/browse" className="flex items-center gap-1 text-sm text-[#1B73E8] hover:underline font-medium">
              All categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/browse?category=${cat.slug}`}>
                <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-[#DADCE0] hover:border-[#1B73E8] hover:shadow-[var(--md-elev-2)] transition-all duration-150 text-center group">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                  >
                    {CATEGORY_ICONS[cat.slug] ?? <Server className="w-6 h-6" />}
                  </div>
                  <span className="text-xs font-medium text-[#3C4043] group-hover:text-[#1B73E8] transition-colors leading-snug">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently added */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-medium text-[#202124]">Recently added</h2>
            <p className="text-sm text-[#5F6368] mt-0.5">Newest additions to the catalog</p>
          </div>
          <Link href="/browse?sort=newest" className="flex items-center gap-1 text-sm text-[#1B73E8] hover:underline font-medium">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="bg-gradient-to-br from-[#1B73E8] to-[#0D47A1] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-normal mb-3">
              Why Google Cloud Marketplace?
            </h2>
            <p className="text-blue-100 max-w-xl mx-auto text-sm">
              The most trusted marketplace for cloud software, built for enterprises.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueProp icon={<Zap className="w-6 h-6" />} title="Deploy in minutes" description="Pre-configured solutions deploy directly into your GCP projects with one click. No manual setup required." />
            <ValueProp icon={<Globe className="w-6 h-6" />} title="Unified billing" description="All purchases consolidated into your Google Cloud bill. Use existing committed use discounts." />
            <ValueProp icon={<Lock className="w-6 h-6" />} title="Enterprise governance" description="Private catalogs, IAM controls, and organization policies to enforce compliance at scale." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DADCE0] bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-sm text-[#5F6368]">© 2026 Google LLC</span>
            <div className="flex items-center gap-6 text-sm text-[#5F6368]">
              <Link href="#" className="hover:text-[#1B73E8]">Privacy</Link>
              <Link href="#" className="hover:text-[#1B73E8]">Terms</Link>
              <Link href="#" className="hover:text-[#1B73E8]">Documentation</Link>
              <Link href="#" className="hover:text-[#1B73E8]">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-medium text-[#202124]">{value}</div>
      <div className="text-sm text-[#5F6368]">{label}</div>
    </div>
  );
}

function ValueProp({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">{icon}</div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-blue-100 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
