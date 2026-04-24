# APEX — Elite Pitch Coach

A full AI-powered pitch training system with progressive levels, live coaching feedback, voice input, token-based access control, and a founder (always-free) mode.

---

## Quick Start

1. Open `index.html` in any modern browser
2. The app runs entirely client-side — no backend required to get started
3. By default, `IS_FOUNDER = true` is set at the top of the script, giving you unlimited free access
4. Others who use the hosted version will need tokens

---

## Configuration

Open `index.html` and find the **CONFIG** block near the top of the `<script>` tag:

```js
const API_URL    = "https://api.anthropic.com/v1/messages";
const MODEL      = "claude-sonnet-4-20250514";
const IS_FOUNDER = true;   // ← set false for all other users
const COST_ANALYZE = 5;    // tokens per pitch analysis
const COST_CHAT    = 1;    // tokens per chat message
const COST_VOICE   = 3;    // tokens per voice session
```

### API Key

The Anthropic API key is handled by your hosting layer (reverse proxy, Cloudflare Worker, or backend middleware) — never expose it client-side in production.

**For local/personal use only**, you can add it directly to the fetch headers:
```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": "sk-ant-YOUR_KEY_HERE",
  "anthropic-version": "2023-06-01"
}
```

**For production**, proxy all API calls through a server endpoint that injects the key server-side.

---

## Voice Integration

### Option 1 — Web Speech API (free, zero setup)
Already wired. Works in Chrome and Edge with no configuration. Tap the mic button in the Arena tab.

### Option 2 — Grok / xAI (recommended)
Replace the `startRecording()` function's recognition block with:
```js
const response = await fetch("https://api.x.ai/v1/audio/transcriptions", {
  method: "POST",
  headers: { "Authorization": "Bearer YOUR_GROK_KEY" },
  body: formData  // audio blob
});
const { text } = await response.json();
document.getElementById('pitch-input').value = text;
```

For **text-to-speech** (APEX speaking feedback aloud), pipe any coaching response through:
```js
const ttsRes = await fetch("https://api.x.ai/v1/audio/speech", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_GROK_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ model: "grok-2", input: coachText, voice: "nova" })
});
const audioBlob = await ttsRes.blob();
new Audio(URL.createObjectURL(audioBlob)).play();
```

### Option 3 — ElevenLabs (best voice quality, free tier available)
```js
const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID`, {
  method: "POST",
  headers: {
    "xi-api-key": "YOUR_ELEVENLABS_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ text: coachText, model_id: "eleven_monolingual_v1" })
});
const audioBlob = await res.blob();
new Audio(URL.createObjectURL(audioBlob)).play();
```

---

## Token & Payment System

### How it works
- `IS_FOUNDER = true` → unlimited, always free (your access)
- All other users start with 50 tokens (set in `let tokens = IS_FOUNDER ? Infinity : 50`)
- Tokens deducted per action (configurable costs at top of script)
- Token packs shown in the Tokens tab (Starter $4 / Builder $12 / Pro $29)

### Wiring Stripe
Replace the `buyTokens()` function stub:
```js
async function buyTokens(amount, price) {
  const session = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokens: amount, price })
  });
  const { url } = await session.json();
  window.location.href = url;  // redirect to Stripe checkout
}
```

On your server, handle the Stripe webhook to credit tokens to the user's account after successful payment.

### Wiring Paystack (Africa/Nigeria)
```js
const handler = PaystackPop.setup({
  key: 'pk_live_YOUR_KEY',
  email: userEmail,
  amount: priceInKobo,
  currency: 'NGN',
  callback: function(response) {
    // verify on server, then credit tokens
    creditTokens(response.reference, amount);
  }
});
handler.openIframe();
```

---

## Hosting Options

| Option | Cost | Setup |
|--------|------|-------|
| **Netlify Drop** | Free | Drag the folder to netlify.com/drop |
| **Vercel** | Free | `vercel deploy` in this folder |
| **GitHub Pages** | Free | Push to a repo, enable Pages |
| **Cloudflare Pages** | Free | Connect repo, auto-deploy |
| **VPS / DigitalOcean** | ~$6/mo | `nginx` serving the HTML file |

For the API key proxy in production, use a Cloudflare Worker or Vercel Edge Function to inject the key server-side.

---

## Customization

### Changing levels/prompts
Edit the `LEVELS` array in the script. Each level has: `n`, `name`, `xpNeeded`, `desc`, `prompts[]`.

### Changing the coach voice
Edit `COACH_SYSTEM` and `CHAT_SYSTEM` constants. The coach is currently calibrated as an aggregate of Jobs, Sinek, Kawasaki, YC, TED, Buffett, and Brown. You can shift the balance by emphasizing specific mentors.

### Changing token costs
Edit `COST_ANALYZE`, `COST_CHAT`, `COST_VOICE` at the top of the script.

### Changing pricing
Edit the token pack HTML in the Tokens tab section. Match to your `buyTokens()` implementation.

---

## What's Included

| Feature | Status |
|---------|--------|
| Pitch analysis with 6-dimension scoring | ✅ Live |
| Progressive level system (5 levels) | ✅ Live |
| XP progression + unlock system | ✅ Live |
| Coach chat (conversational) | ✅ Live |
| Voice input (Web Speech API) | ✅ Live |
| 15 drill prompts across 5 levels | ✅ Live |
| 8-section coaching playbook | ✅ Live |
| Pitch history with score tracking | ✅ Live |
| Token economy + founder access | ✅ Live |
| Daily streak tracker | ✅ Live |
| Score ring visualization | ✅ Live |
| Elite rewrite of weakest line | ✅ Live |
| Specific drill per session | ✅ Live |
| Grok voice synthesis | 🔌 Plug in (see above) |
| Stripe / Paystack payment | 🔌 Plug in (see above) |
| User accounts / persistence | 🔌 Add backend (Supabase/Firebase) |

---

## Built With
- Vanilla HTML/CSS/JS — no framework, no build step
- Anthropic Claude Sonnet 4 (analysis + chat)
- Web Speech API (voice input)
- Google Fonts: Syne + DM Sans

---

*APEX — synthesized from Jobs, Sinek, Kawasaki, YC, TED, Buffett, and Brown.*
*Built to make you the most dangerous communicator in any room.*
