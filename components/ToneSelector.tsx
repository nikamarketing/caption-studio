"use client";

import { TONES, type Tone } from "@/lib/types";
import clsx from "clsx";

interface Props {
  value: Tone;
  onChange: (t: Tone) => void;
}

export function ToneSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {TONES.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          title={t.description}
          className={clsx(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
            value === t.id
              ? "border-brand-500 bg-brand-500/15 text-white"
              : "border-[#2e2e3a] bg-[#18181f] text-gray-400 hover:border-gray-500 hover:text-white"
          )}
        >
          <span>{t.emoji}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
