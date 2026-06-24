export type Platform = "instagram" | "tiktok" | "linkedin" | "twitter";
export type Tone = "casual" | "professional" | "funny" | "inspirational" | "educational";
export type AIModel = "claude" | "openai" | "gemini";

export interface PlatformConfig {
  id: Platform;
  label: string;
  icon: string;
  maxChars: number;
  color: string;
  hashtagLimit: number;
}

export interface ToneConfig {
  id: Tone;
  label: string;
  emoji: string;
  description: string;
}

export interface ModelConfig {
  id: AIModel;
  label: string;
  model: string;
  description: string;
  color: string;
}

export interface GenerateRequest {
  images: string[]; // base64
  websiteUrl?: string;
  platform: Platform;
  tone: Tone;
  model: AIModel;
  apiKey: string;
  includeHashtags: boolean;
  includeEmojis: boolean;
  extraContext?: string;
}

export interface GenerateResult {
  caption: string;
  hashtags: string[];
  charCount: number;
}

export const PLATFORMS: PlatformConfig[] = [
  { id: "instagram", label: "Instagram", icon: "📸", maxChars: 2200, color: "#E1306C", hashtagLimit: 30 },
  { id: "tiktok",    label: "TikTok",    icon: "🎵", maxChars: 2200, color: "#69C9D0", hashtagLimit: 10 },
  { id: "linkedin",  label: "LinkedIn",  icon: "💼", maxChars: 3000, color: "#0A66C2", hashtagLimit: 5 },
  { id: "twitter",   label: "Twitter / X", icon: "🐦", maxChars: 280, color: "#1DA1F2", hashtagLimit: 3 },
];

export const TONES: ToneConfig[] = [
  { id: "casual",        label: "Casual",        emoji: "😊", description: "Friendly & relaxed" },
  { id: "professional",  label: "Professional",  emoji: "👔", description: "Polished & formal" },
  { id: "funny",         label: "Funny",         emoji: "😂", description: "Witty & humorous" },
  { id: "inspirational", label: "Inspirational", emoji: "✨", description: "Motivating & uplifting" },
  { id: "educational",   label: "Educational",   emoji: "🎓", description: "Informative & clear" },
];

export const MODELS: ModelConfig[] = [
  {
    id: "claude",
    label: "Claude",
    model: "claude-opus-4-5",
    description: "Anthropic",
    color: "#d946ef",
  },
  {
    id: "openai",
    label: "ChatGPT",
    model: "gpt-4o",
    description: "OpenAI",
    color: "#10b981",
  },
  {
    id: "gemini",
    label: "Gemini",
    model: "gemini-1.5-pro",
    description: "Google",
    color: "#3b82f6",
  },
];
