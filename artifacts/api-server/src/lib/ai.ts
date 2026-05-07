import { logger } from "./logger";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const REQUEST_TIMEOUT_MS = 60000;

// Ordered list of models to try. We attempt each in order until one succeeds.
// This handles region restrictions (preview models), rate limits (503), and
// deprecated models gracefully without any manual intervention.
const MODEL_CHAIN: string[] = (process.env.GEMINI_MODEL ?? "")
  ? [process.env.GEMINI_MODEL!]
  : [
      "gemini-2.0-flash",       // GA, available everywhere, fast
      "gemini-2.5-flash",       // GA but sometimes 503 under load
      "gemini-1.5-flash",       // Older but universally available
    ];

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

async function tryModel(
  model: string,
  apiKey: string,
  body: object,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${GEMINI_BASE}/models/${model}:generateContent`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      logger.warn({ status: res.status, model, body: text }, "Gemini request failed for model");
      return null;
    }

    const json = (await res.json()) as GeminiResponse;
    const text = json.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();
    return text || null;
  } catch (err) {
    logger.warn({ err, model }, "Gemini request errored for model");
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateGeminiText({
  system,
  prompt,
}: {
  system?: string;
  prompt: string;
}): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const body = {
    ...(system
      ? { systemInstruction: { parts: [{ text: system }] } }
      : {}),
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  };

  // Try each model in the chain until one returns a response
  for (const model of MODEL_CHAIN) {
    logger.info({ model }, "Attempting Gemini generation");
    const result = await tryModel(model, apiKey, body);
    if (result) {
      logger.info({ model, chars: result.length }, "Gemini generation succeeded");
      return result;
    }
  }

  logger.warn("All Gemini models failed, using fallback candidates");
  return null;
}

export function extractJsonArray(text: string): Array<Record<string, unknown>> | null {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
