import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PRODUCT_TYPE_LABELS } from "@/lib/utils";
import {
  Plus, TrendingUp, Users, DollarSign, Eye, Edit2,
  ArrowUpRight, BarChart3, CheckCircle2, Clock, AlertCircle
} from "lucide-react";

export default async function SellerPage() {
  const user = await getSession();
  if (!user) redirect("/auth/signin");
  if (user.role === "BUYER") redirect("/");

  // Show the seller's own publisher's products, fall back to google-cloud for demo
  const publisherId = (user as { publisherId?: string }).publisherId;
  const listings = await db.product.findMany({
    where: publisherId ? { publisherId } : { publisher: { slug: "google-cloud" } },
    include: { pricingPlans: true, category: true, publisher: true },
    orderBy: { deployCount: "desc" },
    take: 8,
  });

  const MOCK_ANALYTICS = {
    totalRevenue: 284312,
    monthlyRevenue: 28431,
    activeCustomers: 1842,
    totalDeployments: 12400,
    revenueGrowth: 18.4,
    customerGrowth: 12.1,
  };

  const MOCK_RECENT_ORDERS = [
    { id: "o1", customer: "Acme Corp", product: "BigQuery", plan: "Capacity", amount: 1700, date: "Mar 28" },
    { id: "o2", customer: "TechFlow Inc", product: "Vertex AI", plan: "Pay as you go", amount: 342, date: "Mar 27" },
    { id: "o3", customer: "DataStar", product: "Google Kubernetes Engine", plan: "Autopilot", amount: 891, date: "Mar 26" },
    { id: "o4", customer: "CloudNative LLC", product: "Cloud SQL", plan: "Dedicated Core", amount: 412, date: "Mar 25" },
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-normal text-[#202124]">Seller portal</h1>
            <p className="text-sm text-[#5F6368] mt-0.5">Manage your listings and track performance</p>
          </div>
          <Link href="/seller/listings/new">
            <Button variant="filled" size="md">
              <Plus className="w-4 h-4" /> New listing
            </Button>
          </Link>
        </div>

        {/* Analytics strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <AnalyticCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Monthly revenue"
            value={`$${MOCK_ANALYTICS.monthlyRevenue.toLocaleString()}`}
            change={`+${MOCK_ANALYTICS.revenueGrowth}%`}
            positive
          />
          <AnalyticCard
            icon={<Users className="w-5 h-5" />}
            label="Active customers"
            value={MOCK_ANALYTICS.activeCustomers.toLocaleString()}
            change={`+${MOCK_ANALYTICS.customerGrowth}%`}
            positive
          />
          <AnalyticCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Total deployments"
            value={MOCK_ANALYTICS.totalDeployments.toLocaleString()}
            change="+8.2%"
            positive
          />
          <AnalyticCard
            icon={<BarChart3 className="w-5 h-5" />}
            label="Total revenue"
            value={`$${(MOCK_ANALYTICS.totalRevenue / 1000).toFixed(0)}K`}
            change="All time"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-[#202124]">Your listings ({listings.length})</h2>
              <Link href="/seller/listings" className="text-sm text-[#1B73E8] hover:underline font-medium">Manage all →</Link>
            </div>
            <div className="space-y-3">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-2xl border border-[#DADCE0] p-4 hover:shadow-[var(--md-elev-1)] transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: getColor(listing.name) }}>
                      {listing.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#202124]">{listing.name}</span>
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Live
                        </Badge>
                        <Badge variant="default" size="sm">{PRODUCT_TYPE_LABELS[listing.type]}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-[#5F6368]">
                        <span>⭐ {listing.rating.toFixed(1)}</span>
                        <span>🚀 {listing.deployCount.toLocaleString()} deployments</span>
                        <span>📦 {listing.pricingPlans.length} plan{listing.pricingPlans.length !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/products/${listing.slug}`}>
                        <button className="p-2 rounded-lg hover:bg-[#F1F3F4] text-[#5F6368]"><Eye className="w-4 h-4" /></button>
                      </Link>
                      <Link href={`/seller/listings/${listing.id}/edit`}>
                        <button className="p-2 rounded-lg hover:bg-[#F1F3F4] text-[#5F6368]"><Edit2 className="w-4 h-4" /></button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Recent orders */}
            <div className="bg-white rounded-2xl border border-[#DADCE0] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8EAED] flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#202124]">Recent orders</h3>
                <button className="text-xs text-[#1B73E8] hover:underline">View all</button>
              </div>
              <div className="divide-y divide-[#F1F3F4]">
                {MOCK_RECENT_ORDERS.map((order) => (
                  <div key={order.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-[#202124]">{order.customer}</p>
                        <p className="text-xs text-[#5F6368]">{order.product} · {order.plan}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-[#202124]">${order.amount}</p>
                        <p className="text-xs text-[#5F6368]">{order.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller checklist */}
            <div className="bg-white rounded-2xl border border-[#DADCE0] p-4">
              <h3 className="text-sm font-medium text-[#202124] mb-3">Seller health</h3>
              <div className="space-y-2">
                {[
                  { label: "Identity verified", done: true },
                  { label: "Payment account connected", done: true },
                  { label: "At least 1 published listing", done: true },
                  { label: "Support contact configured", done: true },
                  { label: "Logo and assets uploaded", done: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-[#137333] shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#F9AB00] shrink-0" />
                    )}
                    <span className={item.done ? "text-[#3C4043]" : "text-[#F9AB00] font-medium"}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 w-full bg-[#E8EAED] rounded-full h-1.5">
                <div className="bg-[#137333] h-1.5 rounded-full" style={{ width: "80%" }} />
              </div>
              <p className="text-xs text-[#5F6368] mt-1">4/5 checklist items complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticCard({ icon, label, value, change, positive }: {
  icon: React.ReactNode; label: string; value: string; change: string; positive?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#DADCE0] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#5F6368]">{icon}</span>
        <span className={`text-xs font-medium flex items-center gap-0.5 ${positive ? "text-[#137333]" : "text-[#5F6368]"}`}>
          {positive && <ArrowUpRight className="w-3 h-3" />}
          {change}
        </span>
      </div>
      <p className="text-xl font-medium text-[#202124]">{value}</p>
      <p className="text-xs text-[#5F6368] mt-0.5">{label}</p>
    </div>
  );
}
