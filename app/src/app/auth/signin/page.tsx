"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "buyer@example.com", password: "buyer123", label: "Buyer account" },
  { email: "seller@example.com", password: "seller123", label: "Seller account" },
  { email: "admin@example.com", password: "admin123", label: "Admin account" },
];

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign in failed");
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

  function fillDemo(account: typeof DEMO_ACCOUNTS[0]) {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <GcpLogo />
        <span className="text-[#5F6368] text-sm">|</span>
        <span className="text-[#202124] text-sm font-medium">Marketplace</span>
      </Link>

      <div className="w-full max-w-[400px]">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#DADCE0] shadow-[var(--md-elev-1)] p-8">
          <h1 className="text-2xl font-normal text-[#202124] mb-1">Sign in</h1>
          <p className="text-sm text-[#5F6368] mb-6">to continue to Google Cloud Marketplace</p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-[#FDECEA] rounded-xl text-sm text-[#D93025]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3C4043] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-10 rounded-xl border border-[#DADCE0] text-sm text-[#202124] placeholder:text-[#9AA0A6] outline-none focus:border-[#1B73E8] focus:ring-2 focus:ring-[#1B73E8]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F6368] hover:text-[#202124]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="filled" size="lg" loading={loading} className="w-full rounded-xl mt-2">
              Sign in
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/auth/signup" className="text-sm text-[#1B73E8] hover:underline">
              Create account
            </Link>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 bg-white rounded-2xl border border-[#DADCE0] p-4">
          <p className="text-xs font-semibold text-[#5F6368] uppercase tracking-wider mb-3">Demo accounts</p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => fillDemo(acc)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F8F9FA] transition-colors text-left"
              >
                <div>
                  <p className="text-xs font-medium text-[#202124]">{acc.label}</p>
                  <p className="text-xs text-[#5F6368]">{acc.email}</p>
                </div>
                <span className="text-xs text-[#1B73E8]">Fill →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GcpLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 6.4L20.8 8.8L25.6 6.4L20.8 4L16 6.4Z" fill="#4285F4"/>
      <path d="M6.4 11.2L11.2 13.6L16 11.2L11.2 8.8L6.4 11.2Z" fill="#EA4335"/>
      <path d="M25.6 11.2L20.8 13.6L16 11.2L20.8 8.8L25.6 11.2Z" fill="#FBBC05"/>
      <path d="M16 16L20.8 13.6L25.6 16L20.8 18.4L16 16Z" fill="#34A853"/>
      <path d="M6.4 16L11.2 13.6L16 16L11.2 18.4L6.4 16Z" fill="#4285F4"/>
      <path d="M16 20.8L11.2 18.4L6.4 20.8L11.2 23.2L16 20.8Z" fill="#EA4335"/>
      <path d="M16 20.8L20.8 18.4L25.6 20.8L20.8 23.2L16 20.8Z" fill="#FBBC05"/>
    </svg>
  );
}
