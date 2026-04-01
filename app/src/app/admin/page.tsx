import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PRODUCT_TYPE_LABELS } from "@/lib/utils";
import {
  Shield, Plus, Settings, Users, Package, BarChart3,
  Lock, Unlock, CheckCircle2, Search, Filter
} from "lucide-react";
import { AdminProductActions } from "@/components/admin/AdminProductActions";

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/auth/signin");
  if (user.role !== "ADMIN") redirect("/");

  const [products, publishers, categories, productCount, userCount, publisherCount] = await Promise.all([
    db.product.findMany({
      include: { publisher: true, category: true, pricingPlans: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.publisher.findMany({ orderBy: { name: "asc" } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.product.count(),
    db.user.count(),
    db.publisher.count(),
  ]);

  const PRIVATE_CATALOG_COLLECTIONS = [
    { id: "c1", name: "Approved AI Tools", products: 8, scope: "Organization", restricted: true },
    { id: "c2", name: "Security Baseline", products: 5, scope: "All folders", restricted: true },
    { id: "c3", name: "Developer Toolkit", products: 12, scope: "dev-team folder", restricted: false },
    { id: "c4", name: "Data Engineering Stack", products: 7, scope: "data-team folder", restricted: true },
  ];

  function getColor(name: string) {
    const colors = ["#1B73E8", "#137333", "#D93025", "#F9AB00", "#7C3AED", "#0891B2"];
    return colors[name.charCodeAt(0) % colors.length];
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#FDECEA] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#D93025]" />
          </div>
          <div>
            <h1 className="text-2xl font-normal text-[#202124]">Admin console</h1>
            <p className="text-sm text-[#5F6368]">Manage catalog, governance, and organization policies</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total products" value={productCount} icon={<Package className="w-5 h-5" />} color="#1B73E8" />
          <StatCard label="Publishers" value={publisherCount} icon={<Users className="w-5 h-5" />} color="#137333" />
          <StatCard label="Categories" value={categories.length} icon={<BarChart3 className="w-5 h-5" />} color="#7C3AED" />
          <StatCard label="Users" value={userCount} icon={<Users className="w-5 h-5" />} color="#F9AB00" />
        </div>

        {/* Tab sections */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Product management */}
          <div className="xl:col-span-2 space-y-6">
            {/* Catalog management */}
            <div className="bg-white rounded-2xl border border-[#DADCE0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E8EAED] flex items-center justify-between">
                <h2 className="text-base font-medium text-[#202124]">Product catalog ({productCount})</h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-[#F1F3F4] text-[#5F6368]"><Search className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-[#F1F3F4] text-[#5F6368]"><Filter className="w-4 h-4" /></button>
                  <Button variant="tonal" size="sm">
                    <Plus className="w-3.5 h-3.5" /> Add product
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-[#F8F9FA]">
                {products.slice(0, 10).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8F9FA] transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: getColor(p.name) }}>
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#202124] truncate">{p.name}</span>
                        {p.featured && <Badge variant="primary" size="sm">Featured</Badge>}
                        {p.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#1B73E8] shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#5F6368]">{p.publisher.name}</span>
                        <span className="text-xs text-[#BDC1C6]">·</span>
                        <span className="text-xs text-[#5F6368]">{PRODUCT_TYPE_LABELS[p.type]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant={p.verified ? "success" : "warning"} size="sm">
                        {p.verified ? "Live" : "Review"}
                      </Badge>
                      <AdminProductActions
                        productId={p.id}
                        productName={p.name}
                        productSlug={p.slug}
                        verified={p.verified}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {productCount > 10 && (
                <div className="px-5 py-3 border-t border-[#E8EAED] text-center">
                  <button className="text-sm text-[#1B73E8] hover:underline font-medium">
                    View all {productCount} products →
                  </button>
                </div>
              )}
            </div>

            {/* Publisher management */}
            <div className="bg-white rounded-2xl border border-[#DADCE0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E8EAED] flex items-center justify-between">
                <h2 className="text-base font-medium text-[#202124]">Publishers ({publisherCount})</h2>
                <Button variant="tonal" size="sm"><Plus className="w-3.5 h-3.5" /> Add publisher</Button>
              </div>
              <div className="divide-y divide-[#F8F9FA]">
                {publishers.map((pub) => (
                  <div key={pub.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8F9FA]">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: getColor(pub.name) }}>
                      {pub.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#202124]">{pub.name}</span>
                        {pub.verified && <Shield className="w-3.5 h-3.5 text-[#1B73E8]" />}
                      </div>
                    </div>
                    <Badge variant={pub.verified ? "success" : "default"} size="sm">
                      {pub.verified ? "Verified" : "Unverified"}
                    </Badge>
                    <button className="p-1.5 rounded-lg hover:bg-[#E8EAED] text-[#5F6368]"><Settings className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Private Marketplace */}
            <div className="bg-white rounded-2xl border border-[#DADCE0] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8EAED] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#1B73E8]" />
                  <h3 className="text-sm font-medium text-[#202124]">Private Catalog</h3>
                </div>
                <Button variant="tonal" size="sm">
                  <Plus className="w-3.5 h-3.5" /> New collection
                </Button>
              </div>
              <div className="divide-y divide-[#F8F9FA]">
                {PRIVATE_CATALOG_COLLECTIONS.map((col) => (
                  <div key={col.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#202124]">{col.name}</span>
                      {col.restricted ? (
                        <Lock className="w-3.5 h-3.5 text-[#D93025]" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-[#5F6368]" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#5F6368]">
                      <span>📦 {col.products} products</span>
                      <span>·</span>
                      <span>🏢 {col.scope}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Org policies */}
            <div className="bg-white rounded-2xl border border-[#DADCE0] p-4">
              <h3 className="text-sm font-medium text-[#202124] mb-3">Organization policies</h3>
              <div className="space-y-3">
                {[
                  { label: "Block unapproved deployments", enabled: true, color: "#D93025" },
                  { label: "Enforce private catalog only", enabled: false, color: "#D93025" },
                  { label: "Require deployment justification", enabled: true, color: "#F9AB00" },
                  { label: "Restrict to approved regions", enabled: true, color: "#1B73E8" },
                  { label: "Audit all deployments", enabled: true, color: "#137333" },
                ].map((policy) => (
                  <div key={policy.label} className="flex items-center justify-between">
                    <span className="text-xs text-[#3C4043] flex-1 mr-3">{policy.label}</span>
                    <button className={`relative w-9 h-5 rounded-full transition-colors ${policy.enabled ? "bg-[#1B73E8]" : "bg-[#DADCE0]"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${policy.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* IAM roles */}
            <div className="bg-white rounded-2xl border border-[#DADCE0] p-4">
              <h3 className="text-sm font-medium text-[#202124] mb-3">IAM roles</h3>
              <div className="space-y-2">
                {[
                  { role: "consumerprocurement.orderAdmin", desc: "Can make purchases" },
                  { role: "consumerprocurement.orderViewer", desc: "Can view orders" },
                  { role: "cloudbilling.admin", desc: "Billing account admin" },
                ].map((r) => (
                  <div key={r.role} className="p-2 bg-[#F8F9FA] rounded-xl">
                    <p className="text-xs font-mono text-[#1B73E8] truncate">{r.role}</p>
                    <p className="text-xs text-[#5F6368] mt-0.5">{r.desc}</p>
                  </div>
                ))}
                <button className="text-xs text-[#1B73E8] hover:underline font-medium mt-1">Manage IAM →</button>
              </div>
            </div>

            {/* Audit log preview */}
            <div className="bg-white rounded-2xl border border-[#DADCE0] p-4">
              <h3 className="text-sm font-medium text-[#202124] mb-3">Audit log</h3>
              <div className="space-y-2">
                {[
                  { action: "Product deployed", user: "jane@co.com", product: "BigQuery", time: "2m ago" },
                  { action: "Listing approved", user: "admin", product: "Redis Enterprise", time: "1h ago" },
                  { action: "Policy updated", user: "admin", product: "Block deployments", time: "3h ago" },
                ].map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1B73E8] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-[#202124] font-medium">{log.action}</p>
                      <p className="text-[#5F6368]">{log.user} · {log.product} · {log.time}</p>
                    </div>
                  </div>
                ))}
                <button className="text-xs text-[#1B73E8] hover:underline font-medium mt-1">View full audit log →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#DADCE0] p-4">
      <div className="flex items-center justify-between mb-2">
        <span style={{ color }}>{icon}</span>
      </div>
      <p className="text-2xl font-medium text-[#202124]">{value}</p>
      <p className="text-xs text-[#5F6368] mt-0.5">{label}</p>
    </div>
  );
}
