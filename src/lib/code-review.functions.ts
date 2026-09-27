import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const reviewInput = z.object({
  code: z.string().trim().min(1).max(30_000),
  language: z.string().trim().min(1).max(40),
  focus: z.enum(["balanced", "performance", "security", "readability"]),
});

export const analyzeCode = createServerFn({ method: "POST" })
  .inputValidator((data) => reviewInput.parse(data))
  .handler(async ({ data }) => {
    const { reviewCode } = await import("./ai/code-review.server");
    return reviewCode(data);
  });