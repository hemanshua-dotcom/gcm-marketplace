"use client";

import { useState } from "react";

interface Toggle {
  key: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const TOGGLES: Toggle[] = [
  {
    key: "deployment_alerts",
    label: "Deployment alerts",
    description: "Get notified when your deployments succeed or fail.",
    defaultOn: true,
  },
  {
    key: "billing_alerts",
    label: "Billing alerts",
    description: "Receive alerts when your spend exceeds configured thresholds.",
    defaultOn: true,
  },
  {
    key: "newsletter",
    label: "Product newsletter",
    description: "Occasional emails about new products and marketplace updates.",
    defaultOn: false,
  },
];

export function PreferencesToggles() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map((t) => [t.key, t.defaultOn]))
  );

  function toggle(key: string) {
    setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-4">
      {TOGGLES.map((t) => (
        <div key={t.key} className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#202124]">{t.label}</p>
            <p className="text-xs text-[#5F6368] mt-0.5">{t.description}</p>
          </div>
          <button
            type="button"
            onClick={() => toggle(t.key)}
            className={`relative w-9 h-5 rounded-full transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B73E8] focus-visible:ring-offset-2 ${
              enabled[t.key] ? "bg-[#1B73E8]" : "bg-[#DADCE0]"
            }`}
            aria-pressed={enabled[t.key]}
            aria-label={t.label}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                enabled[t.key] ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
