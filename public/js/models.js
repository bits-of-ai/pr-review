export const PROVIDERS = [
  {
    id: "anthropic",
    label: "Claude",
    keyLabel: "Anthropic API key",
    docs: "https://console.anthropic.com/settings/keys",
    models: [
      { id: "claude-sonnet-4-6", label: "Sonnet 4.6 (recommended)" },
      { id: "claude-sonnet-5", label: "Sonnet 5" },
      { id: "claude-opus-4-7", label: "Opus 4.7" },
      { id: "claude-haiku-4-5", label: "Haiku 4.5 (fast)" },
    ],
  },
  {
    id: "openai",
    label: "OpenAI",
    keyLabel: "OpenAI API key",
    docs: "https://platform.openai.com/api-keys",
    models: [
      { id: "gpt-5.6-terra", label: "GPT-5.6 Terra (recommended)" },
      { id: "gpt-5.6-sol", label: "GPT-5.6 Sol" },
      { id: "gpt-5.6-luna", label: "GPT-5.6 Luna (fast)" },
      { id: "gpt-4.1", label: "GPT-4.1" },
    ],
  },
  {
    id: "openrouter",
    label: "OpenRouter (free models)",
    keyLabel: "OpenRouter API key",
    docs: "https://openrouter.ai/keys",
    models: [
      { id: "openrouter/free", label: "Free router (recommended)" },
      { id: "cohere/north-mini-code:free", label: "North Mini Code (free)" },
      { id: "thinkingmachines/inkling:free", label: "Inkling (free)" },
      { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B (free)" },
      { id: "nvidia/nemotron-3.5-lightning:free", label: "Nemotron 3.5 Lightning (free)" },
    ],
  },
  {
    id: "google",
    label: "Google AI Studio (free tier)",
    keyLabel: "Google AI Studio API key",
    docs: "https://aistudio.google.com/apikey",
    models: [
      { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash (recommended)" },
      { id: "gemini-3.7-flash", label: "Gemini 3.7 Flash" },
      { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
      { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite (fast)" },
    ],
  },
  {
    id: "groq",
    label: "Groq (free tier)",
    keyLabel: "Groq API key",
    docs: "https://console.groq.com/keys",
    models: [
      { id: "openai/gpt-oss-120b", label: "GPT OSS 120B (recommended)" },
      { id: "openai/gpt-oss-20b", label: "GPT OSS 20B (fast)" },
      { id: "qwen/qwen3.8-27b", label: "Qwen 3.8 27B" },
    ],
  },
  {
    id: "mistral",
    label: "Mistral",
    keyLabel: "Mistral API key",
    docs: "https://console.mistral.ai/api-keys",
    models: [
      { id: "mistral-small-latest", label: "Mistral Small (recommended)" },
      { id: "codestral-latest", label: "Codestral" },
      { id: "mistral-medium-latest", label: "Mistral Medium" },
      { id: "mistral-large-latest", label: "Mistral Large" },
    ],
  },
  {
    id: "cerebras",
    label: "Cerebras (free tier)",
    keyLabel: "Cerebras API key",
    docs: "https://cloud.cerebras.ai",
    models: [
      { id: "gpt-oss-120b", label: "GPT OSS 120B (recommended)" },
      { id: "qwen-3.8-27b", label: "Qwen 3.8 27B" },
    ],
  },
];

export function getProvider(id) {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}
