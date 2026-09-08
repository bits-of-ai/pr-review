export const PROVIDERS = [
  {
    id: "anthropic",
    label: "Claude",
    keyLabel: "Anthropic API key",
    keyPrefix: "sk-ant-",
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
    keyPrefix: "sk-",
    docs: "https://platform.openai.com/api-keys",
    models: [
      { id: "gpt-5.6-terra", label: "GPT-5.6 Terra (recommended)" },
      { id: "gpt-5.6-sol", label: "GPT-5.6 Sol" },
      { id: "gpt-5.6-luna", label: "GPT-5.6 Luna (fast)" },
      { id: "gpt-4.1", label: "GPT-4.1" },
    ],
  },
];

export function getProvider(id) {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}