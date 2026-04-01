import Link from "next/link";
import { cn, PRODUCT_TYPE_LABELS, PRODUCT_TYPE_COLORS, formatPrice, parseJSON } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2 } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    type: string;
    logoUrl: string;
    verified: boolean;
    featured: boolean;
    rating: number;
    reviewCount: number;
    deployCount: number;
    publisher: { name: string; verified: boolean };
    pricingPlans: Array<{ type: string; price: number | null; unitPrice: number | null; billingPeriod: string | null; unit: string | null }>;
  };
  className?: string;
  variant?: "grid" | "list";
}

export function ProductCard({ product, className, variant = "grid" }: ProductCardProps) {
  const primaryPlan = product.pricingPlans[0];
  const hasFree = product.pricingPlans.some((p) => p.type === "FREE");

  const priceLabel = () => {
    if (hasFree) return <span className="text-[#137333] font-medium">Free</span>;
    if (!primaryPlan) return null;
    if (primaryPlan.type === "BYOL") return <span className="text-[#5F6368]">BYOL</span>;
    if (primaryPlan.type === "USAGE_BASED") {
      return <span className="text-[#3C4043]">From ${primaryPlan.unitPrice}/{primaryPlan.unit}</span>;
    }
    if (primaryPlan.type === "SUBSCRIPTION" && primaryPlan.price) {
      return <span className="text-[#3C4043]">{formatPrice(primaryPlan.price, primaryPlan.billingPeriod)}</span>;
    }
    return null;
  };

  if (variant === "list") {
    return (
      <Link href={`/products/${product.slug}`}>
        <div className={cn(
          "flex items-start gap-4 p-4 bg-white border border-[#DADCE0] rounded-xl hover:border-[#1B73E8] hover:shadow-[var(--md-elev-2)] transition-all duration-150 group",
          className
        )}>
          <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] border border-[#E8EAED] flex items-center justify-center shrink-0 overflow-hidden">
            <ProductLogo url={product.logoUrl} name={product.name} size={32} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-medium text-[#202124] text-sm group-hover:text-[#1B73E8] transition-colors">
                    {product.name}
                  </span>
                  {product.verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B73E8]" />
                  )}
                </div>
                <p className="text-xs text-[#5F6368]">{product.publisher.name}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs">{priceLabel()}</div>
              </div>
            </div>
            <p className="text-xs text-[#3C4043] mt-1.5 line-clamp-2">{product.shortDescription}</p>
            <div className="flex items-center gap-3 mt-2">
              <StarRating rating={product.rating} count={product.reviewCount} size="sm" />
              <Badge variant="default" size="sm">{PRODUCT_TYPE_LABELS[product.type] ?? product.type}</Badge>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <div className={cn(
        "flex flex-col bg-white border border-[#DADCE0] rounded-2xl p-5 hover:border-[#1B73E8] hover:shadow-[var(--md-elev-3)] transition-all duration-200 group cursor-pointer h-full",
        className
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] border border-[#E8EAED] flex items-center justify-center overflow-hidden">
            <ProductLogo url={product.logoUrl} name={product.name} size={32} />
          </div>
          {product.featured && (
            <Badge variant="primary" size="sm">Featured</Badge>
          )}
        </div>

        {/* Name + publisher */}
        <div className="mb-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-medium text-[#202124] text-sm leading-snug group-hover:text-[#1B73E8] transition-colors">
              {product.name}
            </h3>
            {product.verified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1B73E8] shrink-0" />
            )}
          </div>
          <p className="text-xs text-[#5F6368]">{product.publisher.name}</p>
        </div>

        {/* Description */}
        <p className="text-xs text-[#3C4043] leading-relaxed line-clamp-3 flex-1 mb-4">
          {product.shortDescription}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F1F3F4]">
          <StarRating rating={product.rating} count={product.reviewCount} size="sm" />
          <div className="text-xs text-right">{priceLabel()}</div>
        </div>

        <div className="mt-2">
          <Badge
            variant="default"
            size="sm"
            className={cn(PRODUCT_TYPE_COLORS[product.type])}
          >
            {PRODUCT_TYPE_LABELS[product.type] ?? product.type}
          </Badge>
        </div>
      </div>
    </Link>
  );
}

function ProductLogo({ url, name, size }: { url: string; name: string; size: number }) {
  const colors = ["#1B73E8", "#137333", "#D93025", "#F9AB00", "#7C3AED", "#0891B2"];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const initials = name.slice(0, 2).toUpperCase();

  // For external logos we'd use next/image, but since these are placeholder URLs, use a text fallback
  return (
    <div
      className="rounded-lg flex items-center justify-center text-white font-semibold"
      style={{ width: size, height: size, backgroundColor: colors[colorIndex], fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
