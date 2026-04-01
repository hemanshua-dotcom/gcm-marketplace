"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "tonal" | "outlined" | "text" | "elevated";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "filled", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B73E8] disabled:opacity-40 disabled:cursor-not-allowed select-none",
          size === "sm" && "px-3 h-8 text-[13px]",
          size === "md" && "px-4 h-9 text-sm",
          size === "lg" && "px-6 h-11 text-sm",
          variant === "filled" && "bg-[#1B73E8] text-white hover:bg-[#1557B0] hover:shadow-md active:bg-[#0D47A1]",
          variant === "tonal" && "bg-[#D3E4FD] text-[#1B73E8] hover:bg-[#B8D0FA] active:bg-[#9BBCF7]",
          variant === "outlined" && "border border-[#DADCE0] text-[#1B73E8] bg-white hover:bg-[#F6FAFE] active:bg-[#E8F1FD]",
          variant === "text" && "text-[#1B73E8] hover:bg-[#F6FAFE] active:bg-[#E8F1FD]",
          variant === "elevated" && "bg-white text-[#1B73E8] shadow-[var(--md-elev-1)] hover:shadow-[var(--md-elev-2)]",
          className
        )}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
