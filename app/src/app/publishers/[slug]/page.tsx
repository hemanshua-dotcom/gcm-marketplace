import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { formatNumber } from "@/lib/utils";
import {
  Shield,
  ExternalLink,
  Package,
  Globe,
  Star,
  Download,
  ChevronRight,
} from "lucide-react";

interface PublisherPageProps {
  params: Promise<{ slug: string }>;
}

function getColor(name: string) {
  const colors = ["#1B73E8", "#137333", "#D93025", "#F9AB00", "#7C3AED", "#0891B2"];
  return colors[name.charCodeAt(0) % colors.length];
}

export default async function PublisherPage({ params }: PublisherPageProps) {
  const { slug } = await params;
  const user = await getSession();

  const publisher = await db.publisher.findUnique({
    where: { slug },
  });

  if (!publisher) notFound();

  const products = await db.product.findMany({
    where: { publisherId: publisher.id },
    include: {
      pricingPlans: { orderBy: { price: "asc" } },
      category: true,
      publisher: true,
    },
    orderBy: { deployCount: "desc" },
  });

  // Compute stats
  const productCount = products.length;
  const totalDeployments = products.reduce((sum, p) => sum + p.deployCount, 0);
  const avgRating =
    productCount > 0
      ? products.reduce((sum, p) => sum + p.rating, 0) / productCount
      : 0;

  const logoColor = getColor(publisher.name);
  const initials = publisher.name.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} />

      {/* Breadcrumb */}
      <div className="border-b border-[#E8EAED] bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6 py-2.5">
          <nav className="flex items-center gap-1 text-xs text-[#5F6368]">
            <Link href="/" className="hover:text-[#1B73E8]">
              Marketplace
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/browse" className="hover:text-[#1B73E8]">
              Publishers
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#3C4043] font-medium">{publisher.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Publisher header card */}
        <div className="bg-white border border-[#DADCE0] rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-6">
            {/* Large logo */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-semibold text-2xl shrink-0"
              style={{ backgroundColor: logoColor }}
            >
              {initials}
            </div>

            {/* Name, verified, description, website */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-normal text-[#202124]">
                  {publisher.name}
                </h1>
                {publisher.verified && (
                  <Badge variant="primary" size="sm">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified publisher
                  </Badge>
                )}
              </div>

              <p className="text-sm text-[#5F6368] leading-relaxed mb-3 max-w-2xl">
                {publisher.description}
              </p>

              {publisher.website && (
                <a
                  href={publisher.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#1B73E8] hover:underline font-medium"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {publisher.website.replace(/^https?:\/\//, "")}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#E8EAED]">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Package className="w-4 h-4 text-[#1B73E8]" />
                <span className="text-xl font-medium text-[#202124]">
                  {productCount}
                </span>
              </div>
              <p className="text-xs text-[#5F6368]">
                {productCount === 1 ? "Product" : "Products"}
              </p>
            </div>

            <div className="text-center border-x border-[#E8EAED]">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Download className="w-4 h-4 text-[#1B73E8]" />
                <span className="text-xl font-medium text-[#202124]">
                  {formatNumber(totalDeployments)}
                </span>
              </div>
              <p className="text-xs text-[#5F6368]">Total deployments</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Star className="w-4 h-4 text-[#F9AB00] fill-[#F9AB00]" />
                <span className="text-xl font-medium text-[#202124]">
                  {productCount > 0 ? avgRating.toFixed(1) : "—"}
                </span>
              </div>
              <p className="text-xs text-[#5F6368]">Avg. rating</p>
            </div>
          </div>
        </div>

        {/* About section */}
        {publisher.description && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-[#202124] mb-3">About</h2>
            <div className="bg-[#F8F9FA] border border-[#E8EAED] rounded-2xl p-5">
              <p className="text-sm text-[#3C4043] leading-relaxed whitespace-pre-line">
                {publisher.description}
              </p>
              {publisher.website && (
                <a
                  href={publisher.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#1B73E8] hover:underline font-medium"
                >
                  Visit website
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Products section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[#202124]">
              Products
              {productCount > 0 && (
                <span className="ml-2 text-sm font-normal text-[#5F6368]">
                  ({productCount})
                </span>
              )}
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-[#E8EAED] rounded-2xl bg-[#F8F9FA]">
              <div className="w-16 h-16 rounded-2xl bg-[#E8EAED] flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-[#BDC1C6]" />
              </div>
              <h3 className="text-base font-medium text-[#202124] mb-1">
                No products yet
              </h3>
              <p className="text-sm text-[#5F6368] max-w-sm">
                {publisher.name} hasn&apos;t published any products on the
                marketplace yet.
              </p>
              <Link
                href="/browse"
                className="mt-4 text-sm text-[#1B73E8] hover:underline font-medium"
              >
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
