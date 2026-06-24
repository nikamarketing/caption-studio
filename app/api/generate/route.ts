import { NextRequest, NextResponse } from "next/server";
import type { GenerateRequest, GenerateResult } from "@/lib/types";
import { PLATFORMS, TONES } from "@/lib/types";

// ─── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(req: GenerateRequest): string {
  const platform = PLATFORMS.find((p) => p.id === req.platform)!;
  const tone = TONES.find((t) => t.id === req.tone)!;
  const hashtagNote = req.includeHashtags
    ? `Include ${platform.hashtagLimit} relevant hashtags as a separate list (do NOT embed them in the caption text).`
    : "Do NOT include any hashtags.";
  const emojiNote = req.includeEmojis
    ? "Naturally sprinkle relevant emojis throughout the caption."
    : "Do NOT use emojis.";
  const urlNote = req.websiteUrl
    ? `The content is related to this website: ${req.websiteUrl}. Use it for brand/product context.`
    : "";
  const extraNote = req.extraContext
    ? `Additional context provided by the user: "${req.extraContext}"`
    : "";

  return `You are an expert social media copywriter. Generate a ${tone.label.toLowerCase()}-toned caption for a ${platform.label} post.

Platform rules:
- Max character length: ${platform.maxChars} characters (caption text only, not hashtags)
- Tone: ${tone.label} — ${tone.description}
- ${emojiNote}
- ${hashtagNote}

${urlNote}
${extraNote}

The user has provided ${req.images.length > 0 ? `${req.images.length} image(s)` : "no images"}. Analyse any images provided to understand the visual content.

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "caption": "Your caption text here",
  "hashtags": ["#tag1", "#tag2"]
}

If hashtags are disabled, return "hashtags": [].`;
}

// ─── Parser ────────────────────────────────────────────────────────────────────

function parseResult(raw: string, platform: string): GenerateResult {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json?\n?/gi, "").replace(/```/g, "").trim();
  let parsed: { caption: string; hashtags: string[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback: treat whole response as caption
    parsed = { caption: cleaned, hashtags: [] };
  }
  const caption = (parsed.caption ?? cleaned).trim();
  const hashtags = (parsed.hashtags ?? []).map((h: string) =>
    h.startsWith("#") ? h : `#${h}`
  );
  return { caption, hashtags, charCount: caption.length };
}

// ─── Claude ────────────────────────────────────────────────────────────────────

async function callClaude(req: GenerateRequest): Promise<string> {
  const content: object[] = [];

  for (const img of req.images.slice(0, 3)) {
    const [header, data] = img.split(",");
    const mediaType = header.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
    content.push({ type: "image", source: { type: "base64", media_type: mediaType, data } });
  }
  content.push({ type: "text", text: buildPrompt(req) });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": req.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Claude API error ${res.status}`);
  }
  const data = await res.json() as { content: Array<{ type: string; text?: string }> };
  return data.content.find((c) => c.type === "text")?.text ?? "";
}

// ─── OpenAI ────────────────────────────────────────────────────────────────────

async function callOpenAI(req: GenerateRequest): Promise<string> {
  const content: object[] = [];
  content.push({ type: "text", text: buildPrompt(req) });

  for (const img of req.images.slice(0, 3)) {
    content.push({ type: "image_url", image_url: { url: img, detail: "low" } });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${req.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `OpenAI error ${res.status}`);
  }
  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message?.content ?? "";
}

// ─── Gemini ────────────────────────────────────────────────────────────────────

async function callGemini(req: GenerateRequest): Promise<string> {
  const parts: object[] = [{ text: buildPrompt(req) }];

  for (const img of req.images.slice(0, 3)) {
    const [header, data] = img.split(",");
    const mimeType = header.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
    parts.push({ inline_data: { mime_type: mimeType, data } });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${req.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Gemini error ${res.status}`);
  }
  const data = await res.json() as { candidates: Array<{ content: { parts: Array<{ text: string }> } }> };
  return data.candidates[0]?.content?.parts[0]?.text ?? "";
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body.apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }
    if (!body.model || !["claude", "openai", "gemini"].includes(body.model)) {
      return NextResponse.json({ error: "Invalid model" }, { status: 400 });
    }

    let raw: string;
    if (body.model === "claude") raw = await callClaude(body);
    else if (body.model === "openai") raw = await callOpenAI(body);
    else raw = await callGemini(body);

    const result = parseResult(raw, body.platform);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
