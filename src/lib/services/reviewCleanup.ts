import "server-only";

export interface ReviewCleanupService {
  clean(input: { review: string }): Promise<{ cleanedText: string; provider: string }>;
}

type ResponsesPayload = {
  output_text?: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
};

const fallbackProvider = "original-text";

function fallback(review: string) {
  return { cleanedText: review, provider: fallbackProvider };
}

function outputText(payload: ResponsesPayload) {
  if (typeof payload.output_text === "string") return payload.output_text;
  return payload.output?.flatMap((item) => item.content ?? []).find((content) => content.type === "output_text")?.text ?? "";
}

/**
 * The original review is retained separately. This cleaner is deliberately
 * limited to copy editing, and gracefully returns the original when OpenAI is
 * not configured or temporarily unavailable.
 */
export async function cleanReview(input: { review: string }): Promise<{ cleanedText: string; provider: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback(input.review);

  const model = process.env.OPENAI_REVIEW_CLEANUP_MODEL ?? "gpt-4.1-mini";
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 12_000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: abortController.signal,
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: 700,
        instructions: "You are a conservative copy editor for genuine bakery customer reviews. Correct only spelling, grammar, punctuation, capitalization, and basic readability. Preserve every fact, sentiment, claim, level of enthusiasm, and the customer's voice. Never add praise, details, marketing language, or facts. Return only the edited review text with no quotation marks, introduction, or explanation.",
        input: input.review,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI review cleanup returned ${response.status}.`);
    const cleanedText = outputText(await response.json() as ResponsesPayload).trim();
    if (!cleanedText || cleanedText.length > 2_000) throw new Error("OpenAI review cleanup returned an invalid response.");

    return { cleanedText, provider: `openai:${model}` };
  } catch (error) {
    console.error("Review cleanup failed; storing the original review.", error);
    return fallback(input.review);
  } finally {
    clearTimeout(timeout);
  }
}

export function reviewCleanupConfiguration() {
  return {
    configured: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_REVIEW_CLEANUP_MODEL ?? "gpt-4.1-mini",
    policy: "meaning-preserving grammar and spelling cleanup only",
  };
}
