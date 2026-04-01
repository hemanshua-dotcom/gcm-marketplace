"use client";

import { useState, useTransition } from "react";
import { Star, Loader2, CheckCircle2 } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  productSlug: string;
  userSignedIn: boolean;
}

export function ReviewForm({ productId, productSlug, userSignedIn }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!userSignedIn) {
    return (
      <div className="border border-[#E8EAED] rounded-xl p-5 text-center">
        <p className="text-sm text-[#5F6368]">
          <a href="/auth/signin" className="text-[#1B73E8] hover:underline font-medium">Sign in</a>{" "}
          to write a review for this product.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="border border-[#CEEAD6] bg-[#F6FEF8] rounded-xl p-5 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-[#137333] shrink-0" />
        <div>
          <p className="text-sm font-medium text-[#137333]">Review submitted!</p>
          <p className="text-xs text-[#5F6368] mt-0.5">Thank you for your feedback. Your review will appear after moderation.</p>
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0 || !title.trim() || !body.trim()) return;

    startTransition(async () => {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body }),
      });
      setSubmitted(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#E8EAED] rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-medium text-[#202124]">Write a review</h3>

      {/* Star rating */}
      <div>
        <p className="text-xs text-[#5F6368] mb-2">Your rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hovered || rating)
                    ? "fill-[#F9AB00] text-[#F9AB00]"
                    : "text-[#DADCE0]"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-xs text-[#5F6368] ml-2">
              {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-[#3C4043] mb-1.5">Review title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={80}
          required
          className="w-full h-9 px-3 rounded-lg border border-[#DADCE0] text-sm text-[#202124] placeholder-[#9AA0A6] outline-none focus:border-[#1B73E8] focus:ring-2 focus:ring-[#1B73E8]/20 transition-colors"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-medium text-[#3C4043] mb-1.5">Your review</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you like or dislike? How did you use this product?"
          rows={3}
          maxLength={1000}
          required
          className="w-full px-3 py-2.5 rounded-lg border border-[#DADCE0] text-sm text-[#202124] placeholder-[#9AA0A6] outline-none focus:border-[#1B73E8] focus:ring-2 focus:ring-[#1B73E8]/20 transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={rating === 0 || !title.trim() || !body.trim() || isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#1B73E8] hover:bg-[#1557B0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        Submit review
      </button>
    </form>
  );
}
