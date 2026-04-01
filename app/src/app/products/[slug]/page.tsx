import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { DeployButton } from "./DeployButton";
import { ReviewForm } from "./ReviewForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPE_COLORS, parseJSON, formatPrice, formatNumber } from "@/lib/utils";
import {
  CheckCircle2, ExternalLink, ChevronRight, Shield,
  Download, Star, Globe, CheckCheck
} from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const user = await getSession();

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      publisher: true,
      pricingPlans: { orderBy: { price: "asc" } },
      category: true,
      reviews: {
        include: { user: true },
        orderBy: { helpful: "desc" },
        take: 5,
      },
    },
  });

  if (!product) notFound();

  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { publisher: true, pricingPlans: true },
    take: 4,
  });

  const tags = parseJSON<string[]>(product.tags, []);
  const metadata = parseJSON<Record<string, unknown>>(product.metadata, {});
  const hasFree = product.pricingPlans.some((p) => p.type === "FREE");
  const highlightedPlan = product.pricingPlans.find((p) => p.highlighted) ?? product.pricingPlans[0];

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} />

      {/* Breadcrumb */}
      <div className="border-b border-[#E8EAED] bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6 py-2.5">
          <nav className="flex items-center gap-1 text-xs text-[#5F6368]">
            <Link href="/" className="hover:text-[#1B73E8]">Marketplace</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/browse?category=${product.category.slug}`} className="hover:text-[#1B73E8]">
              {product.category.name}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#3C4043] font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product header */}
            <div className="flex items-start gap-5">
              <ProductLogo name={product.name} size={72} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-normal text-[#202124]">{product.name}</h1>
                  {product.verified && (
                    <CheckCircle2 className="w-5 h-5 text-[#1B73E8]" />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-[#5F6368]">By</span>
                  <Link href={`/publishers/${product.publisher.slug}`} className="text-sm text-[#1B73E8] font-medium hover:underline">
                    {product.publisher.name}
                  </Link>
                  {product.publisher.verified && (
                    <Shield className="w-3.5 h-3.5 text-[#1B73E8]" aria-label="Verified publisher" />
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <StarRating rating={product.rating} count={product.reviewCount} />
                  <span className="text-sm text-[#5F6368]">•</span>
                  <span className="text-sm text-[#5F6368]">{formatNumber(product.deployCount)} deployments</span>
                  <Badge
                    variant="default"
                    className={PRODUCT_TYPE_COLORS[product.type]}
                  >
                    {PRODUCT_TYPE_LABELS[product.type] ?? product.type}
                  </Badge>
                  {hasFree && <Badge variant="success">Free tier</Badge>}
                </div>
              </div>
            </div>

            {/* Short description */}
            <p className="text-base text-[#3C4043] leading-relaxed">{product.shortDescription}</p>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link key={tag} href={`/browse?search=${tag}`}>
                    <Badge variant="outline">{tag}</Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-[#F8F9FA] rounded-2xl">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-[#F9AB00] mb-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-lg font-medium text-[#202124]">{product.rating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-[#5F6368]">{product.reviewCount.toLocaleString()} reviews</p>
              </div>
              <div className="text-center border-x border-[#E8EAED]">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Download className="w-4 h-4 text-[#1B73E8]" />
                  <span className="text-lg font-medium text-[#202124]">{formatNumber(product.deployCount)}</span>
                </div>
                <p className="text-xs text-[#5F6368]">Deployments</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Globe className="w-4 h-4 text-[#137333]" />
                  <span className="text-lg font-medium text-[#202124]">Global</span>
                </div>
                <p className="text-xs text-[#5F6368]">Availability</p>
              </div>
            </div>

            {/* Full description */}
            <div>
              <h2 className="text-lg font-medium text-[#202124] mb-3">About</h2>
              <div className="text-sm text-[#3C4043] leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>

            {/* Getting started */}
            <div>
              <h2 className="text-lg font-medium text-[#202124] mb-3">Getting started</h2>
              <div className="space-y-3">
                {[
                  { step: "1", title: "Enable the API", desc: `Enable ${product.name} in your GCP project from the Cloud Console or using gcloud CLI.`, code: `gcloud services enable ${product.slug.replace(/-/g, "")}.googleapis.com` },
                  { step: "2", title: "Configure IAM permissions", desc: `Grant the necessary IAM roles to your service account to access ${product.name}.`, code: `gcloud projects add-iam-policy-binding PROJECT_ID \\\n  --member="serviceAccount:SA@PROJECT_ID.iam.gserviceaccount.com" \\\n  --role="roles/viewer"` },
                  { step: "3", title: "Deploy and connect", desc: "Choose a pricing plan, select your GCP project and region, then click Deploy.", code: null },
                ].map(({ step, title, desc, code }) => (
                  <div key={step} className="border border-[#E8EAED] rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#1B73E8] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-white">{step}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#202124]">{title}</p>
                        <p className="text-xs text-[#5F6368] mt-0.5">{desc}</p>
                        {code && (
                          <pre className="mt-2 bg-[#202124] text-[#E8EAED] text-xs rounded-lg px-3 py-2 overflow-x-auto font-mono whitespace-pre">{code}</pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {product.publisher.website && (
                <a
                  href={`${product.publisher.website}/docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#1B73E8] hover:underline font-medium"
                >
                  View full documentation <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Metadata / technical details */}
            {Object.keys(metadata).length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-[#202124] mb-3">Technical details</h2>
                <div className="bg-[#F8F9FA] rounded-2xl overflow-hidden border border-[#E8EAED]">
                  {Object.entries(metadata).map(([key, value], i) => (
                    <div
                      key={key}
                      className={`flex items-start gap-4 px-4 py-3 ${i > 0 ? "border-t border-[#E8EAED]" : ""}`}
                    >
                      <span className="text-xs font-medium text-[#5F6368] w-32 shrink-0 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="text-xs text-[#3C4043]">
                        {Array.isArray(value) ? value.join(", ") : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="text-lg font-medium text-[#202124] mb-3">
                Reviews ({product.reviewCount.toLocaleString()})
              </h2>
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border border-[#E8EAED] rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-[#202124]">{review.title}</p>
                        <p className="text-xs text-[#5F6368]">{review.user.name}</p>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-sm text-[#3C4043] leading-relaxed">{review.body}</p>
                  </div>
                ))}
                <ReviewForm productId={product.id} productSlug={product.slug} userSignedIn={!!user} />
              </div>
            </div>

            {/* Related products */}
            {relatedProducts.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-[#202124] mb-3">
                  More in {product.category.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedProducts.map((p) => (
                    <Link key={p.id} href={`/products/${p.slug}`}>
                      <div className="flex items-center gap-3 p-3 border border-[#DADCE0] rounded-xl hover:border-[#1B73E8] hover:shadow-[var(--md-elev-1)] transition-all">
                        <ProductLogo name={p.name} size={40} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#202124] truncate">{p.name}</p>
                          <p className="text-xs text-[#5F6368]">{p.publisher.name}</p>
                          <StarRating rating={p.rating} size="sm" className="mt-0.5" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — pricing + actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              {/* Primary CTA */}
              <div className="bg-white border border-[#DADCE0] rounded-2xl overflow-hidden shadow-[var(--md-elev-1)] mb-4">
                <div className="p-5 border-b border-[#E8EAED]">
                  <div className="flex items-baseline gap-1 mb-1">
                    {hasFree ? (
                      <span className="text-2xl font-medium text-[#137333]">Free</span>
                    ) : highlightedPlan ? (
                      <>
                        <span className="text-2xl font-medium text-[#202124]">
                          {highlightedPlan.type === "USAGE_BASED"
                            ? `$${highlightedPlan.unitPrice}`
                            : formatPrice(highlightedPlan.price, highlightedPlan.billingPeriod)}
                        </span>
                        {highlightedPlan.unit && (
                          <span className="text-sm text-[#5F6368]">/{highlightedPlan.unit}</span>
                        )}
                      </>
                    ) : null}
                  </div>
                  {highlightedPlan && (
                    <p className="text-xs text-[#5F6368]">{highlightedPlan.description}</p>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  <DeployButton product={{ id: product.id, name: product.name, type: product.type, pricingPlans: product.pricingPlans.map(p => ({ id: p.id, name: p.name, type: p.type, price: p.price, unitPrice: p.unitPrice, unit: p.unit, billingPeriod: p.billingPeriod, description: p.description })) }} />
                  <a
                    href={product.publisher.website ? `${product.publisher.website}/docs` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-[#DADCE0] text-sm font-medium text-[#3C4043] hover:bg-[#F1F3F4] hover:border-[#BDC1C6] transition-colors"
                  >
                    View documentation
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                {product.publisher.website && (
                  <div className="px-5 pb-4">
                    <a
                      href={product.publisher.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[#1B73E8] hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Visit publisher website
                    </a>
                  </div>
                )}
              </div>

              {/* Pricing plans */}
              {product.pricingPlans.length > 1 && (
                <div className="bg-white border border-[#DADCE0] rounded-2xl overflow-hidden mb-4">
                  <div className="p-4 border-b border-[#E8EAED]">
                    <h3 className="text-sm font-medium text-[#202124]">Pricing plans</h3>
                  </div>
                  <div className="divide-y divide-[#F1F3F4]">
                    {product.pricingPlans.map((plan) => {
                      const planFeatures = parseJSON<string[]>(plan.features, []);
                      return (
                        <div
                          key={plan.id}
                          className={`p-4 ${plan.highlighted ? "bg-[#F6FAFE]" : ""}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-[#202124]">{plan.name}</p>
                              <p className="text-xs text-[#5F6368] mt-0.5">{plan.description}</p>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              {plan.type === "FREE" ? (
                                <span className="text-sm font-medium text-[#137333]">Free</span>
                              ) : plan.type === "BYOL" ? (
                                <span className="text-xs text-[#5F6368]">BYOL</span>
                              ) : plan.type === "USAGE_BASED" ? (
                                <div>
                                  <span className="text-sm font-medium text-[#202124]">${plan.unitPrice}</span>
                                  <span className="text-xs text-[#5F6368]">/{plan.unit}</span>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-sm font-medium text-[#202124]">${plan.price}</span>
                                  <span className="text-xs text-[#5F6368]">/mo</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {planFeatures.length > 0 && (
                            <ul className="space-y-1 mt-2">
                              {planFeatures.slice(0, 3).map((f) => (
                                <li key={f} className="flex items-center gap-1.5 text-xs text-[#3C4043]">
                                  <CheckCheck className="w-3 h-3 text-[#137333] shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Publisher info */}
              <div className="bg-[#F8F9FA] border border-[#E8EAED] rounded-2xl p-4">
                <h3 className="text-sm font-medium text-[#202124] mb-3">Publisher</h3>
                <div className="flex items-start gap-3">
                  <ProductLogo name={product.publisher.name} size={36} />
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-[#202124]">{product.publisher.name}</p>
                      {product.publisher.verified && (
                        <Shield className="w-3.5 h-3.5 text-[#1B73E8]" />
                      )}
                    </div>
                    <p className="text-xs text-[#5F6368] mt-0.5 leading-relaxed">{product.publisher.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductLogo({ name, size }: { name: string; size: number }) {
  const colors = ["#1B73E8", "#137333", "#D93025", "#F9AB00", "#7C3AED", "#0891B2", "#DB2777", "#0D9488"];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const initials = name.slice(0, 2).toUpperCase();
  const fontSize = Math.max(10, size * 0.38);

  return (
    <div
      className="rounded-2xl flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, backgroundColor: colors[colorIndex], fontSize }}
    >
      {initials}
    </div>
  );
}
