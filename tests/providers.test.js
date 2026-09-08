import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PROVIDERS as UI_PROVIDERS } from "../public/js/models.js";
import {
  PROVIDER_IDS,
  getProvider,
  hostedKeys,
  missingKeyMessage,
  resolveApiKey,
} from "../lib/providers.js";
import { geminiText, openaiMessageText } from "../lib/ai.js";

describe("providers", () => {
  it("keeps UI and server provider ids in sync", () => {
    assert.deepEqual(
      UI_PROVIDERS.map((p) => p.id).sort(),
      [...PROVIDER_IDS].sort(),
    );
  });

  it("prefers a pasted key over a hosted key", () => {
    assert.equal(
      resolveApiKey({ OPENROUTER_API_KEY: "hosted" }, "openrouter", " user-key "),
      "user-key",
    );
  });

  it("accepts GEMINI_API_KEY as an alias for Google AI Studio", () => {
    assert.equal(resolveApiKey({ GEMINI_API_KEY: "g" }, "google", ""), "g");
    assert.equal(
      resolveApiKey({ GOOGLE_AI_API_KEY: "studio", GEMINI_API_KEY: "g" }, "google", ""),
      "studio",
    );
  });

  it("reports hosted keys for every known provider", () => {
    const flags = hostedKeys({
      ANTHROPIC_API_KEY: "a",
      GROQ_API_KEY: "g",
    });
    assert.equal(flags.anthropic, true);
    assert.equal(flags.groq, true);
    assert.equal(flags.openai, false);
    assert.equal(flags.openrouter, false);
    assert.equal(flags.google, false);
  });

  it("rejects unknown providers", () => {
    assert.equal(getProvider("nope"), null);
    assert.equal(resolveApiKey({ OPENAI_API_KEY: "x" }, "nope", ""), "");
    assert.match(missingKeyMessage("openrouter"), /OPENROUTER_API_KEY/);
  });
});

describe("provider response parsing", () => {
  it("reads OpenAI-compatible message content", () => {
    assert.equal(
      openaiMessageText({ choices: [{ message: { content: "  ok  " } }] }),
      "ok",
    );
    assert.equal(
      openaiMessageText({
        choices: [{ message: { content: [{ text: "part" }, { text: "s" }] } }],
      }),
      "part\ns",
    );
    assert.equal(
      openaiMessageText({ choices: [{ message: { reasoning: "think" } }] }),
      "think",
    );
  });

  it("reads Gemini text parts and skips thoughts", () => {
    assert.equal(
      geminiText({
        candidates: [
          {
            content: {
              parts: [{ thought: true, text: "secret" }, { text: "visible" }],
            },
          },
        ],
      }),
      "visible",
    );
  });
});
