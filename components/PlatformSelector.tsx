"use client";

import { PLATFORMS, type Platform } from "@/lib/types";
import clsx from "clsx";

interface Props {
  value: Platform;
  onChange: (p: Platform) => void;
}

export function PlatformSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {PLATFORMS.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={clsx(
            "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
            value === p.id
              ? "border-brand-500 bg-brand-500/15 text-white shadow-[0_0_12px_rgba(217,70,239,0.2)]"
              : "border-[#2e2e3a] bg-[#18181f] text-gray-400 hover:border-gray-500 hover:text-white"
          )}
        >
          <span className="text-base">{p.icon}</span>
          <span>{p.label}</span>
          {value === p.id && (
            <span className="ml-auto text-[10px] text-gray-400">{p.maxChars} chars</span>
          )}
        </button>
      ))}
    </div>
  );
}
