import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null | undefined, period?: string | null): string {
  if (price === null || price === undefined) return "Custom";
  if (price === 0) return "Free";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
  if (period === "MONTHLY") return `${formatted}/mo`;
  if (period === "ANNUAL") return `${formatted}/yr`;
  return formatted;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function parseJSON<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  SAAS: "SaaS",
  VM_IMAGE: "VM Image",
  KUBERNETES_APP: "Kubernetes App",
  AI_MODEL: "AI Model",
  CONTAINER_IMAGE: "Container Image",
  API: "API",
  DATASET: "Dataset",
  PROFESSIONAL_SERVICE: "Professional Service",
  FOUNDATIONAL_MODEL: "Foundational Model",
};

export const PRODUCT_TYPE_COLORS: Record<string, string> = {
  SAAS: "bg-blue-100 text-blue-700",
  VM_IMAGE: "bg-orange-100 text-orange-700",
  KUBERNETES_APP: "bg-indigo-100 text-indigo-700",
  AI_MODEL: "bg-purple-100 text-purple-700",
  CONTAINER_IMAGE: "bg-cyan-100 text-cyan-700",
  API: "bg-green-100 text-green-700",
  DATASET: "bg-teal-100 text-teal-700",
  PROFESSIONAL_SERVICE: "bg-yellow-100 text-yellow-700",
  FOUNDATIONAL_MODEL: "bg-violet-100 text-violet-700",
};
