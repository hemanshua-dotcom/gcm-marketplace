"use client";

import { useState } from "react";

interface SecurityToggleProps {
  label: string;
  description: string;
}

export function SecurityToggle({ label, description }: SecurityToggleProps) {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#202124]">{label}</p>
        <p className="text-xs text-[#5F6368] mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => setEnabled((prev) => !prev)}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B73E8] focus-visible:ring-offset-2 ${
          enabled ? "bg-[#1B73E8]" : "bg-[#DADCE0]"
        }`}
        aria-pressed={enabled}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
