import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "error" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "md", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        variant === "default" && "bg-[#F1F3F4] text-[#3C4043]",
        variant === "primary" && "bg-[#D3E4FD] text-[#1B73E8]",
        variant === "success" && "bg-[#CEEAD6] text-[#137333]",
        variant === "warning" && "bg-[#FEF3C7] text-[#D97706]",
        variant === "error" && "bg-[#FDECEA] text-[#D93025]",
        variant === "outline" && "border border-[#DADCE0] text-[#5F6368] bg-white",
        className
      )}
    >
      {children}
    </span>
  );
}
