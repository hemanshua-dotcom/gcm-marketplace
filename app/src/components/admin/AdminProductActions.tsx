"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, Edit2, Trash2, X, AlertTriangle, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { deleteProduct, setProductVerified } from "@/app/admin/actions";

interface Props {
  productId: string;
  productName: string;
  productSlug: string;
  verified: boolean;
}

export function AdminProductActions({ productId, productName, productSlug, verified }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteProduct(productId);
      setShowConfirm(false);
    });
  }

  function handleApprove() {
    startTransition(async () => {
      await setProductVerified(productId, true);
    });
  }

  function handleReject() {
    startTransition(async () => {
      await setProductVerified(productId, false);
      setShowRejectConfirm(false);
    });
  }

  return (
    <>
      <div className="flex items-center gap-1 shrink-0">
        {/* Approve button — shown for unverified listings */}
        {!verified && (
          <button
            onClick={handleApprove}
            disabled={isPending}
            title="Approve listing"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#E8F5E9] hover:bg-[#CEEAD6] text-[#137333] text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Approve
          </button>
        )}

        {/* Reject / Unpublish button */}
        {verified ? (
          <button
            onClick={() => setShowRejectConfirm(true)}
            disabled={isPending}
            title="Unpublish listing"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] text-xs font-medium transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            Unpublish
          </button>
        ) : (
          <button
            onClick={() => setShowRejectConfirm(true)}
            disabled={isPending}
            title="Reject listing"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FDECEA] hover:bg-[#FEE2E2] text-[#D93025] text-xs font-medium transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </button>
        )}

        <Link href={`/products/${productSlug}`}>
          <button className="p-1.5 rounded-lg hover:bg-[#E8EAED] text-[#5F6368] transition-colors" title="View">
            <Eye className="w-3.5 h-3.5" />
          </button>
        </Link>
        <Link href={`/admin/products/${productId}/edit`}>
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

      {/* Reject / Unpublish confirmation dialog */}
      {showRejectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FDECEA] flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-[#D93025]" />
              </div>
              <div>
                <h3 className="text-base font-medium text-[#202124]">
                  {verified ? "Unpublish listing?" : "Reject listing?"}
                </h3>
                <p className="text-sm text-[#5F6368] mt-1">
                  <strong className="text-[#202124]">{productName}</strong>{" "}
                  {verified
                    ? "will be taken down from the marketplace and marked as pending review."
                    : "will be marked as rejected and removed from the public catalog."}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRejectConfirm(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#5F6368] hover:bg-[#F1F3F4] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#D93025] hover:bg-[#B31412] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {verified ? "Unpublish" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FDECEA] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#D93025]" />
              </div>
              <div>
                <h3 className="text-base font-medium text-[#202124]">Delete product?</h3>
                <p className="text-sm text-[#5F6368] mt-1">
                  <strong className="text-[#202124]">{productName}</strong> will be permanently removed from the catalog. This cannot be undone.
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
