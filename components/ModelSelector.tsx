"use client";

import { MODELS, type AIModel } from "@/lib/types";
import clsx from "clsx";

interface Props {
  value: AIModel;
  onChange: (m: AIModel) => void;
  missingKeys: AIModel[];
}

export function ModelSelector({ value, onChange, missingKeys }: Props) {
  return (
    <div className="flex gap-2">
      {MODELS.map((m) => {
        const noKey = missingKeys.includes(m.id);
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={clsx(
              "relative flex flex-1 flex-col items-center gap-1 rounded-xl border py-3 px-2 text-xs font-medium transition-all",
              value === m.id
                ? "border-brand-500 bg-brand-500/15 text-white"
                : "border-[#2e2e3a] bg-[#18181f] text-gray-400 hover:border-gray-500 hover:text-white"
            )}
          >
            <span className="text-base font-bold" style={{ color: m.color }}>{m.label[0]}</span>
            <span>{m.label}</span>
            <span className="text-[10px] text-gray-500">{m.description}</span>
            {noKey && (
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] text-black font-bold">!</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
