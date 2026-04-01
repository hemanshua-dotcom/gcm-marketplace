"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DeployModal } from "@/components/marketplace/DeployModal";
import { Zap } from "lucide-react";

interface DeployButtonProps {
  product: {
    id: string;
    name: string;
    type: string;
    pricingPlans: Array<{ id: string; name: string; type: string; price: number | null; unitPrice: number | null; unit: string | null; billingPeriod: string | null; description: string }>;
  };
}

export function DeployButton({ product }: DeployButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="filled" size="lg" className="w-full rounded-xl" onClick={() => setOpen(true)}>
        <Zap className="w-4 h-4" />
        {product.type === "PROFESSIONAL_SERVICE" ? "Contact sales" : "Deploy to GCP"}
      </Button>
      {open && <DeployModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
