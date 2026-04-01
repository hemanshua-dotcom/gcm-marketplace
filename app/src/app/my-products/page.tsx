import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Package, ExternalLink, Settings, Plus, ArrowRight } from "lucide-react";

export default async function MyProductsPage() {
  const user = await getSession();
  if (!user) redirect("/auth/signin");

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: {
      product: { include: { publisher: true, pricingPlans: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();
  const getColor = (name: string) => {
    const colors = ["#1B73E8", "#137333", "#D93025", "#F9AB00", "#7C3AED", "#0891B2"];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const activeOrders = orders.filter((o) => o.status === "ACTIVE");
  const totalMonthly = orders.reduce((sum, o) => sum + (o.monthlyCost ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-normal text-[#202124]">My products</h1>
            <p className="text-sm text-[#5F6368] mt-0.5">Manage your deployments and subscriptions</p>
          </div>
          <Link href="/browse">
            <Button variant="filled" size="md">
              <Plus className="w-4 h-4" /> Browse more
            </Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DADCE0] p-16 text-center">
            <Package className="w-12 h-12 text-[#BDC1C6] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#202124] mb-2">No deployments yet</h3>
            <p className="text-sm text-[#5F6368] mb-6">Browse the marketplace to find and deploy solutions to your GCP projects.</p>
            <Link href="/browse">
              <Button variant="filled">Browse marketplace</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deployments */}
            <div className="lg:col-span-2 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard value={activeOrders.length} label="Active deployments" color="#137333" />
                <StatCard value={`$${totalMonthly.toFixed(0)}`} label="Monthly spend" color="#1B73E8" />
                <StatCard value={orders.length} label="Total products" color="#7C3AED" />
              </div>

              <h2 className="text-base font-medium text-[#202124] mt-2">Active deployments</h2>

              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-[#DADCE0] p-4 hover:shadow-[var(--md-elev-1)] transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: getColor(order.product.name) }}
                      >
                        {getInitials(order.product.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/products/${order.product.slug}`} className="text-sm font-medium text-[#202124] hover:text-[#1B73E8] transition-colors">
                            {order.product.name}
                          </Link>
                          <Badge variant={order.status === "ACTIVE" ? "success" : "warning"} size="sm">
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#5F6368]">
                          {order.projectId && <span>📁 {order.projectId}</span>}
                          {order.region && <span>🌍 {order.region}</span>}
                          {order.planName && <span>📦 {order.planName}</span>}
                        </div>
                        <p className="text-xs text-[#5F6368] mt-0.5">
                          Deployed {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {order.monthlyCost != null && (
                        <p className="text-sm font-medium text-[#202124]">
                          {order.monthlyCost === 0 ? "Free" : `$${order.monthlyCost.toFixed(0)}/mo`}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        <button className="p-1.5 rounded-lg hover:bg-[#F1F3F4] text-[#5F6368]"><Settings className="w-3.5 h-3.5" /></button>
                        <Link href={`/products/${order.product.slug}`}>
                          <button className="p-1.5 rounded-lg hover:bg-[#F1F3F4] text-[#5F6368]"><ExternalLink className="w-3.5 h-3.5" /></button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Billing sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#DADCE0] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E8EAED] flex items-center justify-between">
                  <h3 className="text-sm font-medium text-[#202124]">Current billing</h3>
                  <Badge variant="primary" size="sm">
                    {new Date().toLocaleString("en-US", { month: "short", year: "numeric" })}
                  </Badge>
                </div>
                <div className="divide-y divide-[#F1F3F4]">
                  {orders.filter((o) => o.monthlyCost != null && o.monthlyCost > 0).map((order) => (
                    <div key={order.id} className="px-4 py-3 flex items-center justify-between">
                      <p className="text-xs text-[#3C4043] flex-1 mr-2">
                        {order.product.name}{order.planName ? ` – ${order.planName}` : ""}
                      </p>
                      <p className="text-xs font-medium text-[#202124] shrink-0">${order.monthlyCost!.toFixed(2)}</p>
                    </div>
                  ))}
                  {orders.filter((o) => o.monthlyCost != null && o.monthlyCost > 0).length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-[#9AA0A6]">No paid deployments yet</div>
                  )}
                </div>
                {totalMonthly > 0 && (
                  <div className="px-4 py-3 bg-[#F8F9FA] flex items-center justify-between border-t border-[#E8EAED]">
                    <p className="text-sm font-medium text-[#202124]">Total</p>
                    <p className="text-sm font-semibold text-[#202124]">${totalMonthly.toFixed(2)}/mo</p>
                  </div>
                )}
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-2xl border border-[#DADCE0] p-4">
                <h3 className="text-sm font-medium text-[#202124] mb-3">Quick actions</h3>
                <div className="space-y-1">
                  {[
                    { label: "Browse marketplace", href: "/browse" },
                    { label: "View billing reports", href: "#" },
                    { label: "Manage IAM access", href: "#" },
                    { label: "Contact support", href: "#" },
                  ].map((link) => (
                    <Link key={link.label} href={link.href} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-[#F8F9FA] text-sm text-[#1B73E8] hover:underline group">
                      {link.label}
                      <ArrowRight className="w-3.5 h-3.5 text-[#BDC1C6] group-hover:text-[#1B73E8] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#DADCE0] p-4">
      <p className="text-2xl font-medium" style={{ color }}>{value}</p>
      <p className="text-xs text-[#5F6368] mt-1">{label}</p>
    </div>
  );
}
