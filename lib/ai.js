import { getProvider } from "./providers.js";

export { resolveApiKey } from "./providers.js";

export class AiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "AiError";
    this.status = status;
  }
}

const SYSTEM =
  "You are a senior engineer. Follow the user's instructions exactly, including the JSON-only output requirement.";

/**
 * @param {{ provider: string, model: string, apiKey: string, prompt: string }} input
 */
export async function runReviewModel(input) {
  const provider = getProvider(input.provider);
  if (!provider) throw new AiError("Unknown AI provider.", 400);
  if (provider.kind === "google") return requestGoogle(input);
  if (provider.kind === "anthropic") return requestAnthropic(input);
  return requestOpenAICompat(input, provider);
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

async function requestOpenAICompat({ model, apiKey, prompt }, provider) {
  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(provider.extraHeaders || {}),
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await readError(response, provider.label);
  const text = openaiMessageText(data);
  if (!text) throw new AiError(`${provider.label} returned an empty response.`);
  return text;
}

async function requestGoogle({ model, apiKey, prompt }) {
  const modelId = String(model || "").replace(/^models\//, "");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  const data = await readError(response, "Google AI Studio");
  const blocked = data.promptFeedback?.blockReason;
  if (blocked) {
    throw new AiError(`Google AI Studio blocked the prompt (${blocked}).`);
  }
  const finish = data.candidates?.[0]?.finishReason;
  const text = geminiText(data);
  if (!text) {
    throw new AiError(
      finish && finish !== "STOP"
        ? `Google AI Studio stopped early (${finish}).`
        : "Google AI Studio returned an empty response.",
    );
  }
  return text;
}

export function openaiMessageText(data) {
  const msg = data?.choices?.[0]?.message || {};
  const content = msg.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => part?.text || part?.content || "")
      .join("\n")
      .trim();
  }
  if (typeof msg.reasoning === "string" && msg.reasoning.trim()) {
    return msg.reasoning.trim();
  }
  return "";
}

export function geminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts
    .filter((part) => part?.text && !part.thought)
    .map((part) => part.text)
    .join("\n")
    .trim();
}

async function readError(response, label) {
  const raw = await response.text();
  let data = {};
  try {
    data = JSON.parse(raw);
  } catch {
    data = { message: raw };
  }
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
