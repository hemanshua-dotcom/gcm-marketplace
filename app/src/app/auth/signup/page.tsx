"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "BUYER" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign up failed");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 6.4L20.8 8.8L25.6 6.4L20.8 4L16 6.4Z" fill="#4285F4"/>
          <path d="M6.4 11.2L11.2 13.6L16 11.2L11.2 8.8L6.4 11.2Z" fill="#EA4335"/>
          <path d="M25.6 11.2L20.8 13.6L16 11.2L20.8 8.8L25.6 11.2Z" fill="#FBBC05"/>
          <path d="M16 16L20.8 13.6L25.6 16L20.8 18.4L16 16Z" fill="#34A853"/>
          <path d="M6.4 16L11.2 13.6L16 16L11.2 18.4L6.4 16Z" fill="#4285F4"/>
          <path d="M16 20.8L11.2 18.4L6.4 20.8L11.2 23.2L16 20.8Z" fill="#EA4335"/>
          <path d="M16 20.8L20.8 18.4L25.6 20.8L20.8 23.2L16 20.8Z" fill="#FBBC05"/>
        </svg>
        <span className="text-[#5F6368] text-sm">|</span>
        <span className="text-[#202124] text-sm font-medium">Marketplace</span>
      </Link>

      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-3xl border border-[#DADCE0] shadow-[var(--md-elev-1)] p-8">
          <h1 className="text-2xl font-normal text-[#202124] mb-1">Create your account</h1>
          <p className="text-sm text-[#5F6368] mb-6">to start using Google Cloud Marketplace</p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-[#FDECEA] rounded-xl text-sm text-[#D93025]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3C4043] mb-1.5">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Jane Smith"
                className="w-full h-11 px-4 rounded-xl border border-[#DADCE0] text-sm text-[#202124] placeholder:text-[#9AA0A6] outline-none focus:border-[#1B73E8] focus:ring-2 focus:ring-[#1B73E8]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3C4043] mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="your@email.com"
                className="w-full h-11 px-4 rounded-xl border border-[#DADCE0] text-sm text-[#202124] placeholder:text-[#9AA0A6] outline-none focus:border-[#1B73E8] focus:ring-2 focus:ring-[#1B73E8]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3C4043] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full h-11 px-4 pr-10 rounded-xl border border-[#DADCE0] text-sm text-[#202124] placeholder:text-[#9AA0A6] outline-none focus:border-[#1B73E8] focus:ring-2 focus:ring-[#1B73E8]/20 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F6368] hover:text-[#202124]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Account type */}
            <div>
              <label className="block text-sm font-medium text-[#3C4043] mb-2">Account type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "BUYER", label: "Buyer", desc: "Deploy & use products" },
                  { value: "SELLER", label: "Seller / ISV", desc: "Publish products" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: opt.value })}
                    className={`relative p-3 rounded-xl border text-left transition-all ${
                      form.role === opt.value
                        ? "border-[#1B73E8] bg-[#F6FAFE]"
                        : "border-[#DADCE0] hover:border-[#BDC1C6]"
                    }`}
                  >
                    {form.role === opt.value && (
                      <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-[#1B73E8]" />
                    )}
                    <p className="text-sm font-medium text-[#202124]">{opt.label}</p>
                    <p className="text-xs text-[#5F6368] mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" variant="filled" size="lg" loading={loading} className="w-full rounded-xl mt-2">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-[#5F6368] mt-4">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-[#1B73E8] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
