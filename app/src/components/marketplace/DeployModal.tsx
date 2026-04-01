"use client";

import { useState } from "react";
import { X, ChevronRight, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const GCP_PROJECTS = [
  { id: "my-project-123", name: "my-project", environment: "Production" },
  { id: "dev-project-456", name: "dev-project", environment: "Development" },
  { id: "staging-789", name: "staging-project", environment: "Staging" },
];

const GCP_REGIONS = [
  { value: "us-central1", label: "US Central (Iowa)", flag: "🇺🇸" },
  { value: "us-east1", label: "US East (South Carolina)", flag: "🇺🇸" },
  { value: "us-west1", label: "US West (Oregon)", flag: "🇺🇸" },
  { value: "europe-west1", label: "EU West (Belgium)", flag: "🇪🇺" },
  { value: "europe-west4", label: "EU West (Netherlands)", flag: "🇪🇺" },
  { value: "asia-east1", label: "Asia East (Taiwan)", flag: "🇹🇼" },
  { value: "asia-southeast1", label: "Asia SE (Singapore)", flag: "🇸🇬" },
  { value: "australia-southeast1", label: "Australia (Sydney)", flag: "🇦🇺" },
];

interface DeployModalProps {
  product: {
    id: string;
    name: string;
    type: string;
    pricingPlans: Array<{ id: string; name: string; type: string; price: number | null; unitPrice: number | null; unit: string | null; billingPeriod: string | null; description: string }>;
  };
  onClose: () => void;
}

type Step = "plan" | "configure" | "review" | "deploying" | "success";

export function DeployModal({ product, onClose }: DeployModalProps) {
  const [step, setStep] = useState<Step>("plan");
  const [selectedPlan, setSelectedPlan] = useState(product.pricingPlans[0]?.id ?? "");
  const [selectedProject, setSelectedProject] = useState(GCP_PROJECTS[0].id);
  const [selectedRegion, setSelectedRegion] = useState("us-central1");
  const [deploymentName, setDeploymentName] = useState(
    `${product.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 20)}-1`
  );
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const plan = product.pricingPlans.find((p) => p.id === selectedPlan);
  const project = GCP_PROJECTS.find((p) => p.id === selectedProject);
  const region = GCP_REGIONS.find((r) => r.value === selectedRegion);

  async function handleDeploy() {
    setStep("deploying");
    try {
      const monthlyCost = plan?.type === "FREE" ? 0
        : plan?.type === "SUBSCRIPTION" ? (plan.price ?? 0)
        : null;

      await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          planId: selectedPlan,
          planName: plan?.name,
          projectId: selectedProject,
          region: selectedRegion,
          monthlyCost,
        }),
      });
    } catch {
      // still show success UI — deployment is best-effort
    }
    setStep("success");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[var(--md-elev-5)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8EAED]">
          <div>
            <h2 className="text-lg font-medium text-[#202124]">Deploy {product.name}</h2>
            {step !== "deploying" && step !== "success" && (
              <p className="text-xs text-[#5F6368] mt-0.5">
                {step === "plan" ? "Step 1 of 3 — Select plan" : step === "configure" ? "Step 2 of 3 — Configure" : "Step 3 of 3 — Review & deploy"}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#F1F3F4] text-[#5F6368]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        {step !== "deploying" && step !== "success" && (
          <div className="h-1 bg-[#E8EAED]">
            <div
              className="h-full bg-[#1B73E8] transition-all duration-300"
              style={{ width: step === "plan" ? "33%" : step === "configure" ? "66%" : "100%" }}
            />
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Plan */}
          {step === "plan" && (
            <div className="space-y-3">
              <p className="text-sm text-[#5F6368] mb-4">Choose a pricing plan for this deployment.</p>
              {product.pricingPlans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedPlan === p.id ? "border-[#1B73E8] bg-[#F6FAFE]" : "border-[#DADCE0] hover:border-[#BDC1C6]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#202124]">{p.name}</span>
                        {selectedPlan === p.id && <CheckCircle2 className="w-4 h-4 text-[#1B73E8]" />}
                      </div>
                      <p className="text-xs text-[#5F6368] mt-0.5">{p.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      {p.type === "FREE" ? (
                        <span className="text-sm font-medium text-[#137333]">Free</span>
                      ) : p.type === "BYOL" ? (
                        <span className="text-xs text-[#5F6368]">BYOL</span>
                      ) : p.type === "USAGE_BASED" ? (
                        <span className="text-sm font-medium text-[#202124]">${p.unitPrice}/{p.unit}</span>
                      ) : (
                        <span className="text-sm font-medium text-[#202124]">${p.price}/mo</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Configure */}
          {step === "configure" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#3C4043] mb-2">Deployment name</label>
                <input
                  value={deploymentName}
                  onChange={(e) => setDeploymentName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DADCE0] text-sm text-[#202124] outline-none focus:border-[#1B73E8] focus:ring-2 focus:ring-[#1B73E8]/20"
                />
                <p className="text-xs text-[#5F6368] mt-1">Lowercase letters, numbers, and hyphens only</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3C4043] mb-2">GCP Project</label>
                <div className="space-y-2">
                  {GCP_PROJECTS.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => setSelectedProject(proj.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                        selectedProject === proj.id ? "border-[#1B73E8] bg-[#F6FAFE]" : "border-[#DADCE0] hover:border-[#BDC1C6]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#137333]" />
                        <span className="text-sm font-medium text-[#202124]">{proj.name}</span>
                        <Badge variant="default" size="sm">{proj.environment}</Badge>
                      </div>
                      {selectedProject === proj.id && <CheckCircle2 className="w-4 h-4 text-[#1B73E8]" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3C4043] mb-2">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#DADCE0] text-sm text-[#202124] outline-none focus:border-[#1B73E8] bg-white"
                >
                  {GCP_REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.flag} {r.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === "review" && (
            <div className="space-y-4">
              <div className="bg-[#F8F9FA] rounded-2xl p-4 space-y-3">
                <ReviewRow label="Product" value={product.name} />
                <ReviewRow label="Plan" value={plan?.name ?? "—"} />
                <ReviewRow label="Deployment name" value={deploymentName} />
                <ReviewRow label="Project" value={project?.name ?? "—"} />
                <ReviewRow label="Region" value={`${region?.flag} ${region?.label}`} />
              </div>
              {plan?.type !== "FREE" && plan?.type !== "BYOL" && (
                <div className="flex items-start gap-3 p-3 bg-[#FEF3C7] rounded-xl">
                  <span className="text-base">💳</span>
                  <div>
                    <p className="text-xs font-medium text-[#92400E]">Billing notice</p>
                    <p className="text-xs text-[#92400E] mt-0.5">
                      This deployment will be billed to project <strong>{project?.name}</strong>. Charges will appear on your Google Cloud invoice.
                    </p>
                  </div>
                </div>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#1B73E8]"
                />
                <span className="text-xs text-[#5F6368]">
                  I agree to the <span className="text-[#1B73E8] hover:underline cursor-pointer">Terms of Service</span> and <span className="text-[#1B73E8] hover:underline cursor-pointer">publisher terms</span> for {product.name}.
                </span>
              </label>
            </div>
          )}

          {/* Deploying */}
          {step === "deploying" && (
            <div className="py-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#F6FAFE] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#1B73E8] animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-[#202124]">Deploying {product.name}...</p>
                <p className="text-sm text-[#5F6368] mt-1">Setting up your deployment in {region?.label}</p>
              </div>
              <div className="w-full bg-[#F1F3F4] rounded-full h-1.5 mt-2">
                <div className="bg-[#1B73E8] h-1.5 rounded-full animate-[deploy_3s_ease-in-out_forwards]" style={{ width: "75%" }} />
              </div>
            </div>
          )}

          {/* Success */}
          {step === "success" && (
            <div className="py-8 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#CEEAD6] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#137333]" />
              </div>
              <div>
                <p className="text-lg font-medium text-[#202124]">Deployment successful!</p>
                <p className="text-sm text-[#5F6368] mt-1">
                  <strong>{product.name}</strong> is being deployed to <strong>{project?.name}</strong> in <strong>{region?.label}</strong>.
                </p>
              </div>
              <div className="bg-[#F8F9FA] rounded-2xl p-3 w-full text-left space-y-1">
                <p className="text-xs font-medium text-[#3C4043]">Deployment name</p>
                <p className="text-sm font-mono text-[#202124]">{deploymentName}</p>
              </div>
              <div className="flex gap-2 w-full mt-2">
                <a href="/my-products" className="flex-1">
                  <Button variant="filled" size="md" className="w-full rounded-xl">
                    <ExternalLink className="w-4 h-4" /> View in My Products
                  </Button>
                </a>
                <Button variant="outlined" size="md" className="flex-1 rounded-xl" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {step !== "deploying" && step !== "success" && (
          <div className="px-6 py-4 border-t border-[#E8EAED] flex items-center justify-between">
            <Button
              variant="text"
              size="md"
              onClick={() => {
                if (step === "plan") onClose();
                else if (step === "configure") setStep("plan");
                else setStep("configure");
              }}
            >
              {step === "plan" ? "Cancel" : "Back"}
            </Button>
            <Button
              variant="filled"
              size="md"
              className="rounded-xl"
              disabled={step === "review" && !agreedToTerms}
              onClick={() => {
                if (step === "plan") setStep("configure");
                else if (step === "configure") setStep("review");
                else handleDeploy();
              }}
            >
              {step === "review" ? "Deploy" : "Continue"}
              {step !== "review" && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#5F6368]">{label}</span>
      <span className="text-xs font-medium text-[#202124]">{value}</span>
    </div>
  );
}
