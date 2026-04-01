import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { updateSellerListing } from "@/app/seller/listings/actions";
import { ArrowLeft, Save } from "lucide-react";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect("/auth/signin");
  if (user.role === "BUYER") redirect("/");

  const publisherId = (user as { publisherId?: string }).publisherId;
  const product = await db.product.findUnique({
    where: { id },
    include: { pricingPlans: true, category: true },
  });

  if (!product) notFound();
  if (product.publisherId !== publisherId && user.role !== "ADMIN") redirect("/seller/listings");

  async function handleSave(formData: FormData) {
    "use server";
    await updateSellerListing(id, {
      name: formData.get("name") as string,
      shortDescription: formData.get("shortDescription") as string,
      description: formData.get("description") as string,
    });
    redirect("/seller/listings");
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header user={user} />

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/seller/listings" className="p-2 rounded-lg hover:bg-[#E8EAED] text-[#5F6368] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-normal text-[#202124]">Edit listing</h1>
            <p className="text-sm text-[#5F6368] mt-0.5">{product.name}</p>
          </div>
        </div>

        <form action={handleSave} className="space-y-5">
          <div className="bg-white rounded-2xl border border-[#DADCE0] p-6 space-y-5">
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
              <input
                name="shortDescription"
                defaultValue={product.shortDescription}
                maxLength={120}
                required
                className="w-full h-10 px-3 rounded-xl border border-[#DADCE0] text-sm text-[#202124] outline-none focus:border-[#1B73E8] focus:ring-2 focus:ring-[#1B73E8]/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3C4043] mb-1.5">Full description</label>
              <textarea
                name="description"
                defaultValue={product.description}
                rows={6}
                className="w-full px-3 py-2.5 rounded-xl border border-[#DADCE0] text-sm text-[#202124] outline-none focus:border-[#1B73E8] focus:ring-2 focus:ring-[#1B73E8]/20 transition-colors resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3C4043] mb-1.5">Category</label>
                <div className="h-10 px-3 rounded-xl border border-[#E8EAED] bg-[#F8F9FA] text-sm text-[#5F6368] flex items-center">
                  {product.category?.name ?? "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3C4043] mb-1.5">Status</label>
                <div className={`h-10 px-3 rounded-xl border text-sm flex items-center font-medium ${
                  product.verified
                    ? "border-[#CEEAD6] bg-[#F6FEF8] text-[#137333]"
                    : "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]"
                }`}>
                  {product.verified ? "Live" : "Pending review"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href="/seller/listings" className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#5F6368] hover:bg-[#F1F3F4] transition-colors">
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
