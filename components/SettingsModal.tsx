"use client";

import { useState, useEffect } from "react";
import { X, Eye, EyeOff, KeyRound } from "lucide-react";
import { loadKeys, saveKeys, type StoredKeys } from "@/lib/storage";

interface Props {
  open: boolean;
  onClose: () => void;
}

const fields: { key: keyof StoredKeys; label: string; placeholder: string; color: string }[] = [
  { key: "claude", label: "Anthropic (Claude)", placeholder: "sk-ant-...", color: "#d946ef" },
  { key: "openai", label: "OpenAI (ChatGPT)", placeholder: "sk-...", color: "#10b981" },
  { key: "gemini", label: "Google (Gemini)", placeholder: "AIza...", color: "#3b82f6" },
];

export function SettingsModal({ open, onClose }: Props) {
  const [keys, setKeys] = useState<StoredKeys>({ claude: "", openai: "", gemini: "" });
  const [show, setShow] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) setKeys(loadKeys());
  }, [open]);

  const save = () => {
    saveKeys(keys);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#2e2e3a] bg-[#18181f] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20">
            <KeyRound className="h-4 w-4 text-brand-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">API Keys</h2>
            <p className="text-xs text-gray-500">Stored locally in your browser only</p>
          </div>
        </div>

        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-300 mb-1.5">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: f.color }} />
                {f.label}
              </label>
              <div className="relative">
                <input
                  type={show[f.key] ? "text" : "password"}
                  value={keys[f.key]}
                  onChange={(e) => setKeys({ ...keys, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-[#2e2e3a] bg-[#0f0f13] px-3 py-2 pr-9 text-xs text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none transition-colors"
                />
                <button
                  onClick={() => setShow((s) => ({ ...s, [f.key]: !s[f.key] }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {show[f.key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#2e2e3a] py-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition-colors"
          >
            Save Keys
          </button>
        </div>

        <p className="mt-3 text-center text-[10px] text-gray-600">
          Keys never leave your device. They&apos;re only sent to the AI provider when you generate.
        </p>
      </div>
    </div>
  );
}
