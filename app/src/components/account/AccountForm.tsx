"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Mail, User } from "lucide-react";

interface AccountFormProps {
  initialName: string;
  email: string;
}

export function AccountForm({ initialName, email }: AccountFormProps) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim() === initialName) return;

    setSaving(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) throw new Error("Failed to save");
      setStatus("success");

      // Auto-reset after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  }

  const isDirty = name.trim() !== initialName && name.trim() !== "";

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Name field */}
      <div>
        <label className="block text-xs font-medium text-[#5F6368] mb-1.5">
          Display name
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6]">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (status !== "idle") setStatus("idle");
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DADCE0] text-sm text-[#202124] placeholder:text-[#9AA0A6] bg-white focus:outline-none focus:border-[#1B73E8] focus:ring-1 focus:ring-[#1B73E8] transition-colors"
            placeholder="Your name"
          />
        </div>
      </div>

      {/* Email field (read-only) */}
      <div>
        <label className="block text-xs font-medium text-[#5F6368] mb-1.5">
          Email address
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6]">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DADCE0] text-sm text-[#5F6368] bg-[#F8F9FA] cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-[#9AA0A6] mt-1">
          Email cannot be changed in this demo.
        </p>
      </div>

      {/* Save row */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={!isDirty || saving}
          className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#1B73E8" }}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </span>
          ) : (
            "Save changes"
          )}
        </button>

        {status === "success" && (
          <span className="flex items-center gap-1.5 text-sm text-[#137333]">
            <CheckCircle2 className="w-4 h-4" />
            Saved successfully
          </span>
        )}
        {status === "error" && (
          <span className="flex items-center gap-1.5 text-sm text-[#D93025]">
            <AlertCircle className="w-4 h-4" />
            Something went wrong
          </span>
        )}
      </div>
    </form>
  );
}
