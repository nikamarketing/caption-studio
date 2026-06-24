"use client";

import { useState, useEffect } from "react";
import { Sparkles, Settings, Globe, Hash, Smile, AlertCircle, Loader2 } from "lucide-react";
import { ImageDropzone, makeThumbnail } from "@/components/ImageDropzone";
import { PlatformSelector } from "@/components/PlatformSelector";
import { ToneSelector } from "@/components/ToneSelector";
import { ModelSelector } from "@/components/ModelSelector";
import { SettingsModal } from "@/components/SettingsModal";
import { CaptionResult } from "@/components/CaptionResult";
import { ProjectHistory } from "@/components/ProjectHistory";
import { loadKeys, getKey, saveProject, type SavedProject } from "@/lib/storage";
import type { Platform, Tone, AIModel, GenerateResult } from "@/lib/types";

export default function Home() {
  const [images, setImages]             = useState<string[]>([]);
  const [websiteUrl, setWebsiteUrl]     = useState("");
  const [showUrl, setShowUrl]           = useState(false);
  const [extraContext, setExtraContext] = useState("");
  const [platform, setPlatform]         = useState<Platform>("instagram");
  const [tone, setTone]                 = useState<Tone>("casual");
  const [model, setModel]               = useState<AIModel>("claude");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis]     = useState(true);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState<GenerateResult | null>(null);
  const [error, setError]               = useState("");
  const [missingKeys, setMissingKeys]   = useState<AIModel[]>([]);
  const [historyKey, setHistoryKey]     = useState(0); // bump to refresh history panel

  useEffect(() => {
    const keys = loadKeys();
    setMissingKeys((["claude", "openai", "gemini"] as AIModel[]).filter((m) => !keys[m]));
  }, [settingsOpen]);

  const canGenerate = images.length > 0 || websiteUrl;

  const handleGenerate = async () => {
    const apiKey = getKey(model);
    if (!apiKey) {
      setError(`No API key for ${model}. Click ⚙ API Keys to add it, or we'll generate a template caption.`);
    }
    if (!canGenerate) {
      setError("Please drop at least one image or enter a website URL.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.slice(0, 3),
          websiteUrl: showUrl ? websiteUrl : undefined,
          platform,
          tone,
          model,
          apiKey,
          includeHashtags,
          includeEmojis,
          extraContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);

      // ── Auto-save to project history ──────────────────────────────────────
      const thumbnail = images[0] ? await makeThumbnail(images[0]) : "";
      const project: SavedProject = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        savedAt: Date.now(),
        platform,
        tone,
        model,
        websiteUrl: showUrl ? websiteUrl : "",
        extraContext,
        caption: data.caption,
        hashtags: data.hashtags ?? [],
        thumbnail,
      };
      saveProject(project);
      setHistoryKey((k) => k + 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (project: SavedProject) => {
    setPlatform(project.platform);
    setTone(project.tone);
    setModel(project.model);
    if (project.websiteUrl) { setWebsiteUrl(project.websiteUrl); setShowUrl(true); }
    setExtraContext(project.extraContext);
    setResult({ caption: project.caption, hashtags: project.hashtags, charCount: project.caption.length });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-[#2e2e3a] bg-[#0f0f13]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Caption Studio</span>
            <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-[10px] text-brand-400">AI</span>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#2e2e3a] px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-all"
          >
            <Settings className="h-3.5 w-3.5" />
            API Keys
            {missingKeys.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
                {missingKeys.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* LEFT: inputs */}
          <div className="space-y-5">
            <section className="rounded-2xl border border-[#2e2e3a] bg-[#18181f] p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">1 · Images</h2>
              <ImageDropzone images={images} onChange={setImages} />
            </section>

            <section className="rounded-2xl border border-[#2e2e3a] bg-[#18181f] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  2 · Website URL <span className="normal-case font-normal text-gray-600">(optional)</span>
                </h2>
                <button onClick={() => setShowUrl(!showUrl)} className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors">
                  {showUrl ? "Hide" : "+ Add URL"}
                </button>
              </div>
              {showUrl ? (
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://your-product.com"
                    className="w-full rounded-lg border border-[#2e2e3a] bg-[#0f0f13] py-2 pl-9 pr-3 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none transition-colors"
                  />
                </div>
              ) : (
                <p className="text-xs text-gray-600">Add a link to give the AI context about your product or brand.</p>
              )}
            </section>

            <section className="rounded-2xl border border-[#2e2e3a] bg-[#18181f] p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                3 · Extra context <span className="normal-case font-normal text-gray-600">(optional)</span>
              </h2>
              <textarea
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                placeholder="e.g. New product launch, summer sale 20% off, target audience: fitness enthusiasts…"
                rows={3}
                className="w-full resize-none rounded-lg border border-[#2e2e3a] bg-[#0f0f13] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none transition-colors"
              />
            </section>
          </div>

          {/* RIGHT: options + generate */}
          <div className="space-y-5">
            <section className="rounded-2xl border border-[#2e2e3a] bg-[#18181f] p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Platform</h2>
              <PlatformSelector value={platform} onChange={setPlatform} />
            </section>

            <section className="rounded-2xl border border-[#2e2e3a] bg-[#18181f] p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Tone</h2>
              <ToneSelector value={tone} onChange={setTone} />
            </section>

            <section className="rounded-2xl border border-[#2e2e3a] bg-[#18181f] p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Options</h2>
              <div className="space-y-2">
                {[
                  { icon: Hash,  label: "Include hashtags", value: includeHashtags, setter: setIncludeHashtags },
                  { icon: Smile, label: "Include emojis",   value: includeEmojis,   setter: setIncludeEmojis  },
                ].map(({ icon: Icon, label, value, setter }) => (
                  <button
                    key={label}
                    onClick={() => setter(!value)}
                    className="flex w-full items-center justify-between rounded-lg border border-[#2e2e3a] px-3 py-2.5 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Icon className="h-3.5 w-3.5 text-brand-400" />
                      {label}
                    </div>
                    <div className={`relative h-5 w-9 rounded-full transition-colors ${value ? "bg-brand-600" : "bg-[#2e2e3a]"}`}>
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#2e2e3a] bg-[#18181f] p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">AI Model</h2>
              <ModelSelector value={model} onChange={setModel} missingKeys={missingKeys} />
            </section>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !canGenerate}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-900/40 transition-all hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating caption…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Caption
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-8">
            <h2 className="mb-4 text-sm font-semibold text-gray-300">Generated Caption</h2>
            <CaptionResult result={result} platform={platform} />
          </div>
        )}

        {/* Saved project history */}
        <ProjectHistory onRestore={handleRestore} refreshKey={historyKey} />
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
