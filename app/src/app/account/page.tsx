import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { AccountForm } from "@/components/account/AccountForm";
import { PreferencesToggles } from "@/components/account/PreferencesToggles";
import { SecurityToggle } from "@/components/account/SecurityToggle";
import { User, Shield, Bell, Key, Trash2 } from "lucide-react";

function getColor(name: string) {
  const colors = ["#1B73E8", "#137333", "#D93025", "#F9AB00", "#7C3AED", "#0891B2"];
  return colors[name.charCodeAt(0) % colors.length];
}

export default async function AccountPage() {
  const user = await getSession();
  if (!user) redirect("/auth/signin");

  const ordersCount = await db.order.count({ where: { userId: user.id } });

  const avatarColor = getColor(user.name);
  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header user={user} />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-normal text-[#202124]">Account settings</h1>
          <p className="text-sm text-[#5F6368] mt-0.5">
            Manage your profile, preferences, and security
          </p>
        </div>

        <div className="space-y-6">
          {/* ── Profile ─────────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-[#DADCE0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8EAED] flex items-center gap-2">
              <User className="w-4 h-4 text-[#1B73E8]" />
              <h2 className="text-sm font-medium text-[#202124]">Profile</h2>
            </div>

            <div className="px-5 py-5">
              {/* Avatar + meta */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-medium text-[#202124]">{user.name}</p>
                    <Badge
                      variant={
                        user.role === "ADMIN"
                          ? "error"
                          : user.role === "SELLER"
                          ? "warning"
                          : "primary"
                      }
                      size="sm"
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#5F6368]">{user.email}</p>
                  <p className="text-xs text-[#9AA0A6] mt-1">
                    {ordersCount} deployment{ordersCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Editable form (client component) */}
              <AccountForm initialName={user.name} email={user.email} />
            </div>
          </section>

          {/* ── Preferences ─────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-[#DADCE0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8EAED] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1B73E8]" />
              <h2 className="text-sm font-medium text-[#202124]">Preferences</h2>
            </div>
            <div className="px-5 py-5">
              <p className="text-xs text-[#5F6368] mb-4">
                Choose which notifications you receive.
              </p>
              <PreferencesToggles />
            </div>
          </section>

          {/* ── Security ────────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-[#DADCE0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8EAED] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#1B73E8]" />
              <h2 className="text-sm font-medium text-[#202124]">Security</h2>
            </div>
            <div className="px-5 py-5 space-y-5">
              {/* Change password */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F1F3F4] flex items-center justify-center shrink-0">
                    <Key className="w-4 h-4 text-[#5F6368]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#202124]">Change password</p>
                    <p className="text-xs text-[#5F6368] mt-0.5">
                      Password changes are disabled in this demo — credentials are managed by the
                      mock auth layer.
                    </p>
                  </div>
                </div>
                <button
                  disabled
                  className="px-4 py-2 rounded-xl border border-[#DADCE0] text-sm text-[#BDBDBD] font-medium cursor-not-allowed shrink-0"
                >
                  Change
                </button>
              </div>

              <div className="border-t border-[#F1F3F4]" />

              {/* Active sessions */}
              <div>
                <p className="text-sm font-medium text-[#202124] mb-2">Active sessions</p>
                <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#137333]" />
                    <div>
                      <p className="text-xs font-medium text-[#202124]">Current session</p>
                      <p className="text-xs text-[#5F6368]">Chrome · This device · Active now</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    Active
                  </Badge>
                </div>
              </div>

              <div className="border-t border-[#F1F3F4]" />

              {/* 2-Step Verification toggle (client component) */}
              <SecurityToggle
                label="2-Step Verification"
                description="Add an extra layer of security to your account with a second factor at sign-in."
              />
            </div>
          </section>

          {/* ── Danger zone ─────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-[#DADCE0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8EAED] flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#D93025]" />
              <h2 className="text-sm font-medium text-[#D93025]">Danger zone</h2>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#202124]">Delete account</p>
                  <p className="text-xs text-[#5F6368] mt-0.5">
                    Permanently remove your account and all associated data.
                  </p>
                </div>
                {/* Disabled button with tooltip */}
                <div className="relative group shrink-0">
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl border border-[#FDECEA] bg-[#FDECEA] text-sm font-medium text-[#D93025] opacity-50 cursor-not-allowed"
                  >
                    Delete account
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10 pointer-events-none">
                    <div className="bg-[#202124] text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
                      Contact support to delete your account
                    </div>
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#202124]" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
