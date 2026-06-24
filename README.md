# Caption Studio 🎬✨

AI-powered social media caption generator. Drop images, pick a platform & tone, choose your AI model, and get a ready-to-post caption with hashtags in seconds.

## Features

- **Multi-image drop zone** — drag up to 10 images; AI reads the visuals
- **4 platforms** — Instagram, TikTok, LinkedIn, Twitter / X (with correct char limits)
- **5 tones** — Casual, Professional, Funny, Inspirational, Educational
- **3 AI models** — Claude (Anthropic), ChatGPT (OpenAI), Gemini (Google)
- **Hashtag & emoji generation** — per-platform limits enforced
- **Optional website URL** — give the AI brand context
- **Keys stored locally** — your API keys never leave your browser (localStorage)

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Click **API Keys** in the top-right and paste in at least one provider key:
- **Claude** → [console.anthropic.com](https://console.anthropic.com) → API Keys
- **ChatGPT** → [platform.openai.com](https://platform.openai.com) → API Keys
- **Gemini** → [aistudio.google.com](https://aistudio.google.com) → Get API key

---

## Deploy to Vercel via GitHub

### Step 1 — Push to GitHub

```bash
cd caption-studio
git init
git add .
git commit -m "Initial commit — Caption Studio"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/caption-studio.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your `caption-studio` repo
3. Leave all settings as-is (Vercel auto-detects Next.js)
4. Click **Deploy**

That's it — Vercel gives you a live URL like `caption-studio.vercel.app`.

> **Note:** No environment variables are needed. API keys are entered by the user in the UI and stored in their browser's localStorage.

### Step 3 — Auto-deploys

Every `git push` to `main` automatically triggers a new Vercel deployment.

---

## Project Structure

```
caption-studio/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard
│   ├── globals.css         # Dark theme styles
│   └── api/generate/
│       └── route.ts        # AI proxy (Claude / OpenAI / Gemini)
├── components/
│   ├── ImageDropzone.tsx   # Multi-image drag & drop
│   ├── PlatformSelector.tsx
│   ├── ToneSelector.tsx
│   ├── ModelSelector.tsx
│   ├── SettingsModal.tsx   # API key management
│   └── CaptionResult.tsx  # Output display + copy
└── lib/
    ├── types.ts            # Shared types & config
    └── storage.ts          # localStorage helpers
```

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** — dark glassmorphic UI
- **react-dropzone** — image upload
- **lucide-react** — icons
- **TypeScript** — full type safety
