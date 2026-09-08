export class AiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "AiError";
    this.status = status;
  }
}

/**
 * @param {{ provider: "anthropic" | "openai", model: string, apiKey: string, prompt: string }} input
 */
export async function runReviewModel(input) {
  if (input.provider === "openai") return requestOpenAI(input);
  return requestAnthropic(input);
}

async function requestAnthropic({ model, apiKey, prompt }) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await readError(response, "Anthropic");
  const text = (data.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  if (!text) throw new AiError("Claude returned an empty response.");
  return text;
}

async function requestOpenAI({ model, apiKey, prompt }) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a senior engineer. Follow the user's instructions exactly, including the JSON-only output requirement.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await readError(response, "OpenAI");
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new AiError("OpenAI returned an empty response.");
  return text;
}

async function readError(response, label) {
  const data = await response.json().catch(() => ({}));
  if (response.ok) return data;

  const message =
    data.error?.message ||
    data.error?.type ||
    data.message ||
    `${label} request failed (${response.status})`;

  if (response.status === 401 || response.status === 403) {
    throw new AiError(
      `${label} rejected the API key. Check that it is valid and has model access.`,
      response.status,
    );
  }
  throw new AiError(message, response.status);
}

export function resolveApiKey(env, provider, userKey) {
  const hosted =
    provider === "openai" ? env.OPENAI_API_KEY : env.ANTHROPIC_API_KEY;
  return String(userKey || hosted || "").trim();
}