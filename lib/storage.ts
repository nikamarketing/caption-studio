import type { AIModel } from "./types";

const KEY = "caption_studio_keys";

export interface StoredKeys {
  claude: string;
  openai: string;
  gemini: string;
}

export function loadKeys(): StoredKeys {
  if (typeof window === "undefined") return { claude: "", openai: "", gemini: "" };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { claude: "", openai: "", gemini: "" };
  } catch {
    return { claude: "", openai: "", gemini: "" };
  }
}

export function saveKeys(keys: StoredKeys): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(keys));
}

export function getKey(model: AIModel): string {
  return loadKeys()[model] ?? "";
}
