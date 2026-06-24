import type { AIModel, Platform, Tone } from "./types";

const KEYS_KEY     = "caption_studio_keys";
const PROJECTS_KEY = "caption_studio_projects";

// ── API keys ──────────────────────────────────────────────────────────────────

export interface StoredKeys {
  claude: string;
  openai: string;
  gemini: string;
}

export function loadKeys(): StoredKeys {
  if (typeof window === "undefined") return { claude: "", openai: "", gemini: "" };
  try {
    return { claude: "", openai: "", gemini: "", ...JSON.parse(localStorage.getItem(KEYS_KEY) ?? "{}") };
  } catch {
    return { claude: "", openai: "", gemini: "" };
  }
}

export function saveKeys(keys: StoredKeys) {
  localStorage.setItem(KEYS_KEY, JSON.stringify(keys));
}

export function getKey(model: AIModel): string {
  return loadKeys()[model] ?? "";
}

// ── Project history ───────────────────────────────────────────────────────────

export interface SavedProject {
  id: string;
  savedAt: number;
  platform: Platform;
  tone: Tone;
  model: AIModel;
  websiteUrl: string;
  extraContext: string;
  caption: string;
  hashtags: string[];
  thumbnail: string; // 256 px JPEG base64 of first image (or "")
}

export function loadProjects(): SavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveProject(project: SavedProject) {
  const rest = loadProjects().filter((p) => p.id !== project.id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify([project, ...rest].slice(0, 30)));
}

export function deleteProject(id: string) {
  localStorage.setItem(
    PROJECTS_KEY,
    JSON.stringify(loadProjects().filter((p) => p.id !== id))
  );
}
