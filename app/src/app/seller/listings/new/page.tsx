"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChevronRight, ChevronLeft, Check, Plus, X, Upload, AlertCircle } from "lucide-react";

const STEPS = [
  { id: "basics", label: "Basic info" },
  { id: "type", label: "Product type" },
  { id: "pricing", label: "Pricing" },
  { id: "details", label: "Details" },
  { id: "review", label: "Review" },
];

const PRODUCT_TYPES = [
  { value: "SAAS", label: "SaaS", desc: "Cloud-hosted software billed by Google" },
  { value: "VM_IMAGE", label: "VM Image", desc: "Pre-configured Compute Engine images" },
  { value: "KUBERNETES_APP", label: "Kubernetes App", desc: "Containerized apps for GKE" },
  { value: "AI_MODEL", label: "AI Model", desc: "Machine learning models and APIs" },
  { value: "FOUNDATIONAL_MODEL", label: "Foundational Model", desc: "Large language or multimodal models" },
  { value: "CONTAINER_IMAGE", label: "Container Image", desc: "Docker/OCI container images" },
  { value: "API", label: "API", desc: "REST or gRPC API products" },
  { value: "DATASET", label: "Dataset", desc: "Commercial or public data products" },
  { value: "PROFESSIONAL_SERVICE", label: "Professional Service", desc: "Consulting and managed services" },
];

const PRICING_TYPES = [
  { value: "FREE", label: "Free", desc: "No charge to customers" },
  { value: "SUBSCRIPTION", label: "Subscription", desc: "Fixed monthly or annual fee" },
  { value: "USAGE_BASED", label: "Usage-based", desc: "Pay per unit consumed" },
  { value: "BYOL", label: "BYOL", desc: "Bring your own license" },
];

const CATEGORIES = [
  "ai-ml", "security", "devops", "databases", "networking",
  "analytics", "storage", "business", "infrastructure", "dev-tools"
];

export default function NewListingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    description: "",
    category: "",
    type: "",
    logoUrl: "",
    websiteUrl: "",
    supportEmail: "",
    tags: [] as string[],
    pricingType: "",
    price: "",
    unitPrice: "",
    unit: "",
    billingPeriod: "MONTHLY",
    planName: "Standard",
    planDescription: "",
    planFeatures: [""],
  });
  const [tagInput, setTagInput] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [logoDragOver, setLogoDragOver] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  function handleLogoFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) return; // 2MB limit
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setLogoPreview(dataUrl);
      update("logoUrl", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function update(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      update("tags", [...form.tags, tagInput.trim().toLowerCase().replace(/\s+/g, "-")]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    update("tags", form.tags.filter((t) => t !== tag));
  }

  const step = STEPS[currentStep];
  const canProceed = () => {
    if (step.id === "basics") return form.name && form.shortDescription && form.category;
    if (step.id === "type") return form.type;
    if (step.id === "pricing") return form.pricingType;
    return true;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#DADCE0] p-8 text-center shadow-[var(--md-elev-2)]">
          <div className="w-16 h-16 rounded-full bg-[#CEEAD6] flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-[#137333]" />
          </div>
          <h2 className="text-xl font-medium text-[#202124] mb-2">Listing submitted!</h2>
          <p className="text-sm text-[#5F6368] mb-2">
            <strong>{form.name}</strong> has been submitted for review by the Google Cloud Marketplace team.
          </p>
          <p className="text-xs text-[#5F6368] mb-6">Review typically takes 2–5 business days. You'll receive an email when approved.</p>
          <div className="flex gap-2">
            <Link href="/seller" className="flex-1">
              <Button variant="filled" className="w-full rounded-xl">Go to Seller portal</Button>
            </Link>
            <Button variant="outlined" className="flex-1 rounded-xl" onClick={() => { setSubmitted(false); setCurrentStep(0); }}>
              New listing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#DADCE0] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/seller" className="text-sm text-[#5F6368] hover:text-[#202124]">Seller portal</Link>
            <ChevronRight className="w-4 h-4 text-[#BDC1C6]" />
            <span className="text-sm font-medium text-[#202124]">New listing</span>
          </div>
          <Link href="/seller"><Button variant="text" size="sm">Cancel</Button></Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stepper */}
        <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => i < currentStep && setCurrentStep(i)}
                disabled={i > currentStep}
                className="flex items-center gap-2 shrink-0"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  i < currentStep ? "bg-[#137333] text-white" :
                  i === currentStep ? "bg-[#1B73E8] text-white" :
                  "bg-[#E8EAED] text-[#5F6368]"
                }`}>
                  {i < currentStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-sm hidden sm:block ${i === currentStep ? "font-medium text-[#202124]" : i < currentStep ? "text-[#137333]" : "text-[#5F6368]"}`}>
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 md:w-16 h-0.5 mx-2 shrink-0 ${i < currentStep ? "bg-[#137333]" : "bg-[#E8EAED]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl border border-[#DADCE0] shadow-[var(--md-elev-1)] p-8">

          {/* Step 1: Basics */}
          {step.id === "basics" && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-[#202124]">Basic information</h2>
              <Field label="Product name *">
                <input value={form.name} onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. My Awesome SaaS" className={inputCls} />
              </Field>
              <Field label="Short description *" hint="One sentence, max 120 characters">
                <input value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)}
                  placeholder="A concise description of what your product does"
                  maxLength={120} className={inputCls} />
                <p className="text-xs text-[#9AA0A6] mt-1">{form.shortDescription.length}/120</p>
              </Field>
              <Field label="Category *">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => update("category", cat)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium capitalize transition-all ${
                        form.category === cat ? "border-[#1B73E8] bg-[#F6FAFE] text-[#1B73E8]" : "border-[#DADCE0] text-[#5F6368] hover:border-[#BDC1C6]"
                      }`}>
                      {cat.replace("-", " & ").replace("ai-ml", "AI & ML").replace("dev-tools", "Dev tools")}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Tags">
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F1F3F4] text-xs text-[#3C4043]">
                      {tag}
                      <button onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add a tag and press Enter"
                    className={`flex-1 ${inputCls}`} />
                  <Button variant="outlined" size="sm" onClick={addTag}>Add</Button>
                </div>
              </Field>
              <Field label="Website URL">
                <input value={form.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)}
                  placeholder="https://yourproduct.com" type="url" className={inputCls} />
              </Field>
            </div>
          )}

          {/* Step 2: Product type */}
          {step.id === "type" && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-[#202124]">Product type</h2>
              <p className="text-sm text-[#5F6368]">Select the type that best describes your product. This affects how it's deployed and billed.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRODUCT_TYPES.map((t) => (
                  <button key={t.value} onClick={() => update("type", t.value)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      form.type === t.value ? "border-[#1B73E8] bg-[#F6FAFE]" : "border-[#DADCE0] hover:border-[#BDC1C6]"
                    }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#202124]">{t.label}</p>
                        <p className="text-xs text-[#5F6368] mt-0.5">{t.desc}</p>
                      </div>
                      {form.type === t.value && <Check className="w-4 h-4 text-[#1B73E8] shrink-0 mt-0.5" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {step.id === "pricing" && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-[#202124]">Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {PRICING_TYPES.map((pt) => (
                  <button key={pt.value} onClick={() => update("pricingType", pt.value)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      form.pricingType === pt.value ? "border-[#1B73E8] bg-[#F6FAFE]" : "border-[#DADCE0] hover:border-[#BDC1C6]"
                    }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#202124]">{pt.label}</p>
                        <p className="text-xs text-[#5F6368] mt-0.5">{pt.desc}</p>
                      </div>
                      {form.pricingType === pt.value && <Check className="w-4 h-4 text-[#1B73E8] shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>

              {form.pricingType === "SUBSCRIPTION" && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#F8F9FA] rounded-2xl">
                  <Field label="Plan name">
                    <input value={form.planName} onChange={(e) => update("planName", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Price (USD)">
                    <input value={form.price} onChange={(e) => update("price", e.target.value)} type="number" placeholder="99.00" className={inputCls} />
                  </Field>
                  <Field label="Billing period">
                    <select value={form.billingPeriod} onChange={(e) => update("billingPeriod", e.target.value)}
                      className={`${inputCls} bg-white`}>
                      <option value="MONTHLY">Monthly</option>
                      <option value="ANNUAL">Annual</option>
                    </select>
                  </Field>
                </div>
              )}

              {form.pricingType === "USAGE_BASED" && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#F8F9FA] rounded-2xl">
                  <Field label="Price per unit (USD)">
                    <input value={form.unitPrice} onChange={(e) => update("unitPrice", e.target.value)} type="number" placeholder="0.001" className={inputCls} />
                  </Field>
                  <Field label="Unit">
                    <input value={form.unit} onChange={(e) => update("unit", e.target.value)} placeholder="e.g. 1M tokens, GB, hour" className={inputCls} />
                  </Field>
                </div>
              )}

              <Field label="Plan description">
                <input value={form.planDescription} onChange={(e) => update("planDescription", e.target.value)}
                  placeholder="Brief description of what's included" className={inputCls} />
              </Field>

              <Field label="Features included">
                {form.planFeatures.map((feat, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={feat}
                      onChange={(e) => {
                        const f = [...form.planFeatures];
                        f[i] = e.target.value;
                        update("planFeatures", f);
                      }}
                      placeholder={`Feature ${i + 1}`} className={inputCls} />
                    <button onClick={() => update("planFeatures", form.planFeatures.filter((_, j) => j !== i))}
                      className="p-2 rounded-lg hover:bg-[#FEE2E2] text-[#D93025]"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <Button variant="text" size="sm" onClick={() => update("planFeatures", [...form.planFeatures, ""])}>
                  <Plus className="w-3.5 h-3.5" /> Add feature
                </Button>
              </Field>
            </div>
          )}

          {/* Step 4: Details */}
          {step.id === "details" && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-[#202124]">Product details</h2>
              <Field label="Full description *">
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe your product in detail. Include key features, use cases, and technical details."
                  rows={6} className={`${inputCls} resize-none`} />
              </Field>
              <Field label="Logo" hint="Square image, min 100x100px, PNG or SVG recommended">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); }}
                />
                <div
                  onClick={() => logoInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setLogoDragOver(true); }}
                  onDragLeave={() => setLogoDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setLogoDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleLogoFile(f); }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    logoDragOver ? "border-[#1B73E8] bg-[#F0F6FF]" : logoPreview ? "border-[#137333] bg-[#F6FEF8]" : "border-[#DADCE0] hover:border-[#1B73E8] hover:bg-[#F8F9FA]"
                  }`}
                >
                  {logoPreview ? (
                    <div className="flex items-center justify-center gap-4">
                      <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-xl object-contain border border-[#DADCE0] bg-white p-1" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-[#137333]">Logo uploaded</p>
                        <p className="text-xs text-[#5F6368] mt-0.5">Click to replace</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[#BDC1C6] mx-auto mb-2" />
                      <p className="text-sm text-[#5F6368]">Drop file here or <span className="text-[#1B73E8] font-medium">browse</span></p>
                      <p className="text-xs text-[#9AA0A6] mt-1">PNG, SVG, JPG, WebP up to 2MB</p>
                    </>
                  )}
                </div>
              </Field>
              <Field label="Support email">
                <input value={form.supportEmail} onChange={(e) => update("supportEmail", e.target.value)}
                  type="email" placeholder="support@yourcompany.com" className={inputCls} />
              </Field>
            </div>
          )}

          {/* Step 5: Review */}
          {step.id === "review" && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-[#202124]">Review & submit</h2>
              <div className="bg-[#F8F9FA] rounded-2xl p-5 space-y-3">
                <ReviewRow label="Product name" value={form.name || "—"} />
                <ReviewRow label="Short description" value={form.shortDescription || "—"} />
                <ReviewRow label="Category" value={form.category || "—"} />
                <ReviewRow label="Product type" value={form.type || "—"} />
                <ReviewRow label="Pricing model" value={form.pricingType || "—"} />
                {form.tags.length > 0 && (
                  <div className="flex items-start gap-4">
                    <span className="text-xs text-[#5F6368] w-36 shrink-0">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {form.tags.map((t) => <Badge key={t} variant="default" size="sm">{t}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#D3E4FD] rounded-2xl">
                <AlertCircle className="w-4 h-4 text-[#1B73E8] shrink-0 mt-0.5" />
                <p className="text-xs text-[#1A5E9A]">
                  After submission, the Google Cloud Marketplace team will review your listing for quality and security compliance. This typically takes 2–5 business days.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="outlined" size="md" onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)} disabled={currentStep === 0}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button variant="filled" size="md" disabled={!canProceed()} onClick={() => setCurrentStep(currentStep + 1)} className="rounded-xl">
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              {submitError && (
                <p className="text-xs text-[#D93025] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {submitError}
                </p>
              )}
              <Button
                variant="filled"
                size="md"
                className="rounded-xl"
                disabled={submitting}
                onClick={async () => {
                  setSubmitting(true);
                  setSubmitError("");
                  try {
                    const res = await fetch("/api/listings", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: form.name,
                        shortDescription: form.shortDescription,
                        description: form.description,
                        category: form.category,
                        type: form.type,
                        tags: form.tags,
                        logoUrl: form.logoUrl,
                        pricingType: form.pricingType,
                        price: form.price,
                        unitPrice: form.unitPrice,
                        unit: form.unit,
                        billingPeriod: form.billingPeriod,
                        planName: form.planName,
                        planDescription: form.planDescription,
                        planFeatures: form.planFeatures,
                      }),
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      setSubmitError(data.error || "Submission failed. Please try again.");
                    } else {
                      setSubmitted(true);
                    }
                  } catch {
                    setSubmitError("Network error. Please try again.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {submitting ? "Submitting…" : <>Submit for review <Check className="w-4 h-4" /></>}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full h-10 px-3 rounded-xl border border-[#DADCE0] text-sm text-[#202124] placeholder:text-[#9AA0A6] outline-none focus:border-[#1B73E8] focus:ring-2 focus:ring-[#1B73E8]/20 transition-all";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#3C4043] mb-1.5">{label}</label>
      {hint && <p className="text-xs text-[#5F6368] mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-xs text-[#5F6368] w-36 shrink-0">{label}</span>
      <span className="text-xs font-medium text-[#202124]">{value}</span>
    </div>
  );
}
