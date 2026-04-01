import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

export function StarRating({ rating, count, size = "md", className }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const fill = Math.min(1, Math.max(0, rating - i));
    return fill;
  });

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {stars.map((fill, i) => (
          <svg
            key={i}
            className={cn(size === "sm" ? "w-3 h-3" : "w-4 h-4")}
            viewBox="0 0 24 24"
          >
            <defs>
              <linearGradient id={`star-grad-${i}-${rating}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset={`${fill * 100}%`} stopColor="#F9AB00" />
                <stop offset={`${fill * 100}%`} stopColor="#DADCE0" />
              </linearGradient>
            </defs>
            <path
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              fill={`url(#star-grad-${i}-${rating})`}
            />
          </svg>
        ))}
      </div>
      <span className={cn("text-[#3C4043] font-medium", size === "sm" ? "text-xs" : "text-sm")}>
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className={cn("text-[#5F6368]", size === "sm" ? "text-xs" : "text-sm")}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
