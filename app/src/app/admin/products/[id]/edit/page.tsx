import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { PRODUCT_TYPE_LABELS } from "@/lib/utils";
import { updateProduct } from "@/app/admin/actions";
import { ArrowLeft, Save } from "lucide-react";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect("/auth/signin");
  if (user.role !== "ADMIN") redirect("/");

  const product = await db.product.findUnique({
    where: { id },
    include: { publisher: true, category: true, pricingPlans: true },
  });
  if (!product) notFound();

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  const publishers = await db.publisher.findMany({ orderBy: { name: "asc" } });

  async function handleSave(formData: FormData) {
    "use server";
    await updateProduct(id, {
      name: formData.get("name") as string,
      shortDescription: formData.get("shortDescription") as string,
      featured: formData.get("featured") === "on",
      verified: formData.get("verified") === "on",
    });
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header user={user} />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin" className="p-2 rounded-lg hover:bg-[#E8EAED] text-[#5F6368] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-normal text-[#202124]">Edit product</h1>
            <p className="text-sm text-[#5F6368] mt-0.5">{product.name}</p>
          </div>
        </div>

        <form action={handleSave} className="space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-[#DADCE0] p-6 space-y-5">
            <h2 className="text-base font-medium text-[#202124]">Basic information</h2>

            <div>
              <label className="block text-sm font-medium text-[#3C4043] mb-1.5">Product name</label>
              <input
                name="name"
                defaultValue={product.name}
                required
                className="w-full h-10 px-3 rounded-xl border border-[#DADCE0] text-sm text-[#202124] outline-none focus:border-[#1B73E8] focus:ring-2 focus:ring-[#1B73E8]/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C4043] mb-1.5">Short description</label>
              <textarea
                name="shortDescription"
                defaultValue={product.shortDescription}
                rows={2}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#DADCE0] text-sm text-[#202124] outline-none focus:border-[#1B73E8] focus:ring-2 focus:ring-[#1B73E8]/20 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3C4043] mb-1.5">Product type</label>
                <div className="h-10 px-3 rounded-xl border border-[#E8EAED] bg-[#F8F9FA] text-sm text-[#5F6368] flex items-center">
                  {PRODUCT_TYPE_LABELS[product.type] ?? product.type}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3C4043] mb-1.5">Publisher</label>
                <div className="h-10 px-3 rounded-xl border border-[#E8EAED] bg-[#F8F9FA] text-sm text-[#5F6368] flex items-center">
                  {product.publisher.name}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C4043] mb-1.5">Category</label>
              <div className="h-10 px-3 rounded-xl border border-[#E8EAED] bg-[#F8F9FA] text-sm text-[#5F6368] flex items-center">
                {product.category?.name ?? "—"}
              </div>
            </div>
          </div>

          {/* Listing status */}
          <div className="bg-white rounded-2xl border border-[#DADCE0] p-6">
            <h2 className="text-base font-medium text-[#202124] mb-4">Listing status</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-[#3C4043]">Live / Verified</p>
                  <p className="text-xs text-[#5F6368]">Product is visible and approved in the catalog</p>
                </div>
                <input
                  type="checkbox"
                  name="verified"
                  defaultChecked={product.verified}
                  className="w-4 h-4 accent-[#1B73E8]"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-[#3C4043]">Featured</p>
                  <p className="text-xs text-[#5F6368]">Shown in the Featured section on the homepage</p>
                </div>
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={product.featured}
                  className="w-4 h-4 accent-[#1B73E8]"
                />
              </label>
            </div>
          </div>

          {/* Pricing plans (read-only) */}
          <div className="bg-white rounded-2xl border border-[#DADCE0] p-6">
            <h2 className="text-base font-medium text-[#202124] mb-4">
              Pricing plans ({product.pricingPlans.length})
            </h2>
            <div className="space-y-2">
              {product.pricingPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FA]">
                  <div>
                    <p className="text-sm font-medium text-[#202124]">{plan.name}</p>
                    <p className="text-xs text-[#5F6368]">{plan.type} · {plan.description}</p>
                  </div>
                  {plan.price != null && (
                    <span className="text-sm font-medium text-[#202124]">
                      ${plan.price}{plan.billingPeriod ? `/${plan.billingPeriod.toLowerCase()}` : ""}
                    </span>
                  )}
                  {plan.unitPrice != null && (
                    <span className="text-sm font-medium text-[#202124]">
                      ${plan.unitPrice}/{plan.unit}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#5F6368] hover:bg-[#F1F3F4] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#1B73E8] hover:bg-[#1557B0] transition-colors"
            >
              <Save className="w-4 h-4" />
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
