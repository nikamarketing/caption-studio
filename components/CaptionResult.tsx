"use client";

import { useState } from "react";
import { Copy, Check, Hash } from "lucide-react";
import type { GenerateResult, Platform } from "@/lib/types";
import { PLATFORMS } from "@/lib/types";

interface Props {
  result: GenerateResult;
  platform: Platform;
}

export function CaptionResult({ result, platform }: Props) {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const pConfig = PLATFORMS.find((p) => p.id === platform)!;
  const charPct = Math.min((result.charCount / pConfig.maxChars) * 100, 100);
  const charColor = charPct > 90 ? "#ef4444" : charPct > 70 ? "#f59e0b" : "#10b981";

  const copy = async (text: string, setter: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const fullText = result.hashtags.length
    ? `${result.caption}\n\n${result.hashtags.join(" ")}`
    : result.caption;

  return (
    <div className="rounded-2xl border border-[#2e2e3a] bg-[#18181f] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2e2e3a] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">{pConfig.icon}</span>
          <span className="text-xs font-medium text-gray-300">{pConfig.label} Caption</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-20 rounded-full bg-[#2e2e3a] overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${charPct}%`, background: charColor }} />
            </div>
            <span className="text-[10px]" style={{ color: charColor }}>
              {result.charCount}/{pConfig.maxChars}
            </span>
          </div>
          <button
            onClick={() => copy(result.caption, setCopiedCaption)}
            className="flex items-center gap-1 rounded-lg border border-[#2e2e3a] px-2 py-1 text-[10px] text-gray-400 hover:text-white hover:border-gray-500 transition-all"
          >
            {copiedCaption ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
            {copiedCaption ? "Copied!" : "Caption"}
          </button>
        </div>
      </div>

      {/* Caption body */}
      <div className="px-4 py-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{result.caption}</p>
      </div>

      {/* Hashtags */}
      {result.hashtags.length > 0 && (
        <div className="border-t border-[#2e2e3a] px-4 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Hash className="h-3 w-3 text-brand-400" />
            <span className="text-[10px] font-medium text-gray-400">Hashtags ({result.hashtags.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.hashtags.map((tag, i) => (
              <span key={i} className="rounded-full bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 text-[11px] text-brand-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Copy all button */}
      <div className="border-t border-[#2e2e3a] px-4 py-3">
        <button
          onClick={() => copy(fullText, setCopiedAll)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
        >
          {copiedAll ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copiedAll ? "Copied to clipboard!" : "Copy caption + hashtags"}
        </button>
      </div>
    </div>
  );
}
