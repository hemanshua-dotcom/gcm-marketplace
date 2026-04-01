import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PRODUCT_TYPE_LABELS } from "@/lib/utils";
import {
  Plus, Eye, Edit2, Trash2, CheckCircle2, Clock,
  AlertCircle, Search, Filter, ArrowLeft, MoreVertical,
  TrendingUp, Star, Package
} from "lucide-react";

export default async function SellerListingsPage() {
  const user = await getSession();
  if (!user) redirect("/auth/signin");
  if (user.role === "BUYER") redirect("/");

  const publisherId = (user as { publisherId?: string }).publisherId;
  const listings = await db.product.findMany({
    where: publisherId ? { publisherId } : { publisher: { slug: "google-cloud" } },
    include: { pricingPlans: true, category: true, publisher: true },
    orderBy: { createdAt: "desc" },
  });

  function getColor(name: string) {
    const colors = ["#1B73E8", "#137333", "#D93025", "#F9AB00", "#7C3AED", "#0891B2"];
    return colors[name.charCodeAt(0) % colors.length];
  }

  const live = listings.filter((l) => l.verified).length;
  const review = listings.filter((l) => !l.verified).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/seller" className="p-2 rounded-lg hover:bg-[#E8EAED] text-[#5F6368] transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-normal text-[#202124]">All listings</h1>
              <p className="text-sm text-[#5F6368] mt-0.5">{listings.length} listings · {live} live · {review} in review</p>
            </div>
          </div>
          <Link href="/seller/listings/new">
            <Button variant="filled" size="md">
              <Plus className="w-4 h-4" /> New listing
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-[#DADCE0] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#137333]" />
            </div>
            <div>
              <p className="text-2xl font-medium text-[#202124]">{live}</p>
              <p className="text-xs text-[#5F6368]">Live listings</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#DADCE0] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#F9AB00]" />
            </div>
            <div>
              <p className="text-2xl font-medium text-[#202124]">{review}</p>
              <p className="text-xs text-[#5F6368]">In review</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#DADCE0] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8F0FE] flex items-center justify-center">
              <Package className="w-5 h-5 text-[#1B73E8]" />
            </div>
            <div>
              <p className="text-2xl font-medium text-[#202124]">{listings.length}</p>
              <p className="text-xs text-[#5F6368]">Total listings</p>
            </div>
          </div>
        </div>

        {/* Search & filter bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-white border border-[#DADCE0] rounded-xl px-4 h-10">
            <Search className="w-4 h-4 text-[#9AA0A6] shrink-0" />
            <span className="text-sm text-[#9AA0A6]">Search your listings...</span>
          </div>
          <button className="flex items-center gap-2 px-4 h-10 rounded-xl border border-[#DADCE0] bg-white text-sm text-[#5F6368] hover:bg-[#F1F3F4] transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <select className="h-10 px-3 rounded-xl border border-[#DADCE0] bg-white text-sm text-[#3C4043] outline-none">
            <option>All types</option>
            {Object.entries(PRODUCT_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        {/* Listings table */}
        <div className="bg-white rounded-2xl border border-[#DADCE0] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3 border-b border-[#E8EAED] bg-[#F8F9FA] text-xs font-medium text-[#5F6368] uppercase tracking-wide">
            <span className="w-8" />
            <span>Product</span>
            <span className="w-24 text-center">Type</span>
            <span className="w-20 text-center">Status</span>
            <span className="w-28 text-right">Deployments</span>
            <span className="w-20 text-right">Actions</span>
          </div>

          <div className="divide-y divide-[#F8F9FA]">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-[#F8F9FA] transition-colors"
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: getColor(listing.name) }}
                >
                  {listing.name.slice(0, 2).toUpperCase()}
                </div>

                {/* Name + meta */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#202124] truncate">{listing.name}</span>
                    {listing.featured && (
                      <Badge variant="primary" size="sm">Featured</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-[#5F6368]">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#F9AB00] text-[#F9AB00]" />
                      {listing.rating.toFixed(1)}
                    </span>
                    <span>·</span>
                    <span>{listing.pricingPlans.length} plan{listing.pricingPlans.length !== 1 ? "s" : ""}</span>
                    <span>·</span>
                    <span>{listing.category?.name}</span>
                  </div>
                </div>

                {/* Type */}
                <div className="w-24 text-center">
                  <Badge variant="default" size="sm">{PRODUCT_TYPE_LABELS[listing.type]}</Badge>
                </div>

                {/* Status */}
                <div className="w-20 text-center">
                  {listing.verified ? (
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Live
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      <Clock className="w-2.5 h-2.5 mr-0.5" /> Review
                    </Badge>
                  )}
                </div>

                {/* Deployments */}
                <div className="w-28 text-right">
                  <span className="text-sm font-medium text-[#202124]">{listing.deployCount.toLocaleString()}</span>
                  <div className="flex items-center justify-end gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-[#137333]" />
                    <span className="text-xs text-[#137333]">+12%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-20 flex items-center justify-end gap-1">
                  <Link href={`/products/${listing.slug}`}>
                    <button className="p-1.5 rounded-lg hover:bg-[#E8EAED] text-[#5F6368] transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                  <button className="p-1.5 rounded-lg hover:bg-[#E8EAED] text-[#5F6368] transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-[#FEE2E2] text-[#D93025] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {listings.length === 0 && (
            <div className="py-16 text-center">
              <Package className="w-10 h-10 text-[#BDC1C6] mx-auto mb-3" />
              <h3 className="text-base font-medium text-[#202124] mb-1">No listings yet</h3>
              <p className="text-sm text-[#5F6368] mb-4">Create your first listing to start selling on the marketplace.</p>
              <Link href="/seller/listings/new">
                <Button variant="filled">Create listing</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
