/**
 * Server-side provider catalog (how to call each API).
 * UI labels and model dropdowns live in public/js/models.js — ids must match.
 */

export const PROVIDERS = {
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    kind: "anthropic",
    envKeys: ["ANTHROPIC_API_KEY"],
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    kind: "openai",
    envKeys: ["OPENAI_API_KEY"],
    url: "https://api.openai.com/v1/chat/completions",
  },
  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    kind: "openai",
    envKeys: ["OPENROUTER_API_KEY"],
    url: "https://openrouter.ai/api/v1/chat/completions",
    extraHeaders: {
      "HTTP-Referer": "https://github.com/bits-of-ai/pr-review",
      "X-Title": "PR Review",
    },
  },
  google: {
    id: "google",
    label: "Google AI Studio",
    kind: "google",
    envKeys: ["GOOGLE_AI_API_KEY", "GEMINI_API_KEY"],
  },
  groq: {
    id: "groq",
    label: "Groq",
    kind: "openai",
    envKeys: ["GROQ_API_KEY"],
    url: "https://api.groq.com/openai/v1/chat/completions",
  },
  mistral: {
    id: "mistral",
    label: "Mistral",
    kind: "openai",
    envKeys: ["MISTRAL_API_KEY"],
    url: "https://api.mistral.ai/v1/chat/completions",
  },
  cerebras: {
    id: "cerebras",
    label: "Cerebras",
    kind: "openai",
    envKeys: ["CEREBRAS_API_KEY"],
    url: "https://api.cerebras.ai/v1/chat/completions",
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDERS);

export function getProvider(id) {
  return PROVIDERS[id] || null;
}

export function hostedKeys(env) {
  const flags = {};
  for (const [id, provider] of Object.entries(PROVIDERS)) {
    flags[id] = provider.envKeys.some((key) => Boolean(env?.[key]));
  }
  return flags;
}

export function resolveApiKey(env, providerId, userKey) {
  const typed = String(userKey || "").trim();
  if (typed) return typed;
  const provider = getProvider(providerId);
  if (!provider) return "";
  for (const key of provider.envKeys) {
    const value = String(env?.[key] || "").trim();
    if (value) return value;
  }
  return "";
}

export function missingKeyMessage(providerId) {
  const provider = getProvider(providerId);
  const envName = provider?.envKeys[0] || "the provider API key";
  const label = provider?.label || "this provider";
  return `Enter a ${label} API key, or set ${envName} on the server.`;
}
