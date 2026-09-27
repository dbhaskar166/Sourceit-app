import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { createLovableAiGatewayRunIdFetch } from "./run-id.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

export type CodeReviewInput = {
  code: string;
  language: string;
  focus: "balanced" | "performance" | "security" | "readability";
};

export async function reviewCode(input: CodeReviewInput) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new Error("AI review is not configured yet. Please try again later.");
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: runIdFetch.fetch,
  });

  try {
    const result = streamText({
      model: provider.responses(MODEL),
      system:
        "You are a precise senior software engineer. Explain submitted code without inventing context. Identify behavior, risks, and practical improvements. Keep the response concise and useful. Use exactly these markdown headings: ## What it does, ## How it works, ## Improvements. Under Improvements, use bullets ordered by impact. Include short code examples only when they materially help.",
      prompt: `Language: ${input.language}\nReview focus: ${input.focus}\n\nCode:\n\`\`\`${input.language}\n${input.code}\n\`\`\``,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "medium",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    const text = await result.text;
    if (!text.trim()) {
      throw new Error("The AI returned an empty review. Please try again.");
    }

    return { text, runId: runIdFetch.getRunId() };
  } catch (error) {
    const status = getStatus(error);
    const safeMessage = getSafeMessage(error);

    if (status === 401) throw new Error("AI review is not configured correctly.");
    if (status === 402) throw new Error(safeMessage || "AI credits are unavailable. Add credits and try again.");
    if (status === 403) throw new Error(safeMessage || "This AI request is not permitted for the workspace.");
    if (status === 429) throw new Error(safeMessage || "AI review is busy right now. Wait a moment, then try again.");
    if (status && status >= 500) throw new Error(safeMessage || "The AI service is temporarily unavailable. Try again shortly.");
    throw new Error(safeMessage || "The code review could not be completed.");
  }
}

function getStatus(error: unknown) {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as { statusCode?: unknown; status?: unknown };
  const status = candidate.statusCode ?? candidate.status;
  return typeof status === "number" ? status : undefined;
}

function getSafeMessage(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 400);
  return "";
}