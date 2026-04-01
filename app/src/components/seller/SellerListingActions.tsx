"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, Edit2, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deleteSellerListing } from "@/app/seller/listings/actions";

interface Props {
  productId: string;
  productName: string;
  productSlug: string;
}

export function SellerListingActions({ productId, productName, productSlug }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteSellerListing(productId);
      setShowConfirm(false);
    });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Link href={`/products/${productSlug}`}>
          <button className="p-1.5 rounded-lg hover:bg-[#E8EAED] text-[#5F6368] transition-colors" title="View">
            <Eye className="w-3.5 h-3.5" />
          </button>
        </Link>
        <Link href={`/seller/listings/${productId}/edit`}>
          <button className="p-1.5 rounded-lg hover:bg-[#E8EAED] text-[#5F6368] transition-colors" title="Edit">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </Link>
        <button
          onClick={() => setShowConfirm(true)}
          className="p-1.5 rounded-lg hover:bg-[#FEE2E2] text-[#D93025] transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FDECEA] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#D93025]" />
              </div>
              <div>
                <h3 className="text-base font-medium text-[#202124]">Delete listing?</h3>
                <p className="text-sm text-[#5F6368] mt-1">
                  <strong className="text-[#202124]">{productName}</strong> will be permanently removed. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#5F6368] hover:bg-[#F1F3F4] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#D93025] hover:bg-[#B31412] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
