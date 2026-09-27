import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Braces,
  Check,
  ChevronDown,
  Clipboard,
  Code2,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { analyzeCode } from "@/lib/code-review.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sourceit — Understand code faster" },
      {
        name: "description",
        content: "Paste a code snippet for a clear AI explanation and practical improvement suggestions.",
      },
      { property: "og:title", content: "Sourceit — Understand code faster" },
      {
        property: "og:description",
        content: "Paste a code snippet for a clear AI explanation and practical improvement suggestions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STARTER_CODE = `async function fetchUserProfile(userId) {
  const response = await fetch('/api/users/' + userId);
  const data = await response.json();
  return data;
}`;

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "Other"];
const FOCUSES = [
  { value: "balanced", label: "Balanced" },
  { value: "performance", label: "Performance" },
  { value: "security", label: "Security" },
  { value: "readability", label: "Readability" },
] as const;

function Index() {
  const runAnalysis = useServerFn(analyzeCode);
  const [code, setCode] = useState(STARTER_CODE);
  const [language, setLanguage] = useState("JavaScript");
  const [focus, setFocus] = useState<(typeof FOCUSES)[number]["value"]>("balanced");
  const [review, setReview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const sections = useMemo(() => parseReview(review), [review]);

  async function handleAnalyze() {
    if (!code.trim() || loading) return;
    setLoading(true);
    setError("");
    setReview("");
    try {
      const result = await runAnalysis({ data: { code, language, focus } });
      setReview(result.text);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The code review could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!review) return;
    await navigator.clipboard.writeText(review);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Braces className="size-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-base font-bold leading-none">Sourceit</div>
              <div className="mt-1 text-xs text-muted-foreground">Code review workspace</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex">
            <span className="size-2 rounded-full bg-primary" />
            AI ready
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-7 sm:py-10">
        <div className="mb-7 max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
            AI code analysis
          </div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Understand unfamiliar code, faster.</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Paste a snippet to get a clear explanation, trace its behavior, and find improvements worth making.
          </p>
        </div>

        <div className="grid min-h-[610px] overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:grid-cols-2">
          <section className="flex min-h-[520px] flex-col border-b border-border lg:border-b-0 lg:border-r" aria-label="Code input">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Code2 className="size-4 text-primary" aria-hidden="true" />
                Your code
              </div>
              <div className="relative">
                <select
                  aria-label="Programming language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="h-9 appearance-none rounded-md border border-border bg-background py-1 pl-3 pr-8 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
                >
                  {LANGUAGES.map((item) => <option key={item}>{item}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-muted-foreground" aria-hidden="true" />
              </div>
            </div>

            <div className="relative flex-1 bg-code">
              <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-12 border-r border-code-border bg-code-gutter pt-5 text-right font-mono text-xs leading-6 text-code-muted" aria-hidden="true">
                {Array.from({ length: Math.max(20, code.split("\n").length) }, (_, index) => (
                  <div className="pr-3" key={index}>{index + 1}</div>
                ))}
              </div>
              <textarea
                aria-label="Code snippet"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                spellCheck={false}
                placeholder="Paste your code here…"
                className="h-full min-h-[360px] w-full resize-none bg-transparent py-5 pl-16 pr-5 font-mono text-sm leading-6 text-code-foreground outline-none placeholder:text-code-muted"
              />
            </div>

            <div className="border-t border-border p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-medium text-muted-foreground">Focus</span>
                {FOCUSES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFocus(item.value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${focus === item.value ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <Button className="w-full sm:w-auto" disabled={!code.trim() || loading} onClick={handleAnalyze}>
                {loading ? <LoaderCircle className="size-4 animate-spin" /> : <WandSparkles className="size-4" />}
                {loading ? "Reviewing code…" : "Explain & improve"}
                {!loading && <ArrowRight className="size-4" />}
              </Button>
            </div>
          </section>

          <section className="flex min-h-[520px] flex-col" aria-label="AI review">
            <div className="flex h-[58px] items-center justify-between border-b border-border px-4 sm:px-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
                Review
              </div>
              {review && (
                <Button variant="ghost" className="h-8 px-2" onClick={handleCopy} aria-label="Copy review">
                  {copied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
                  <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-auto p-5 sm:p-7">
              {loading ? <LoadingState /> : error ? (
                <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                    <RotateCcw className="size-5" />
                  </div>
                  <h2 className="font-semibold">Review interrupted</h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{error}</p>
                  <Button variant="secondary" className="mt-5" onClick={handleAnalyze}>Try again</Button>
                </div>
              ) : review ? (
                <div className="space-y-7">
                  {sections.map((section) => (
                    <article key={section.title}>
                      <h2 className="mb-3 text-sm font-bold uppercase text-primary">{section.title}</h2>
                      <ReviewText text={section.content} />
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                  <div className="mb-5 flex size-12 items-center justify-center rounded-md border border-border bg-secondary text-primary">
                    <Code2 className="size-6" />
                  </div>
                  <h2 className="text-base font-semibold">Ready when you are</h2>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                    Your explanation and prioritized suggestions will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8" aria-live="polite">
      <div className="flex items-center gap-3 text-sm font-medium"><LoaderCircle className="size-4 animate-spin text-primary" />Analyzing behavior and trade-offs…</div>
      {["w-28", "w-32", "w-24"].map((width, index) => (
        <div className="space-y-3" key={width}>
          <div className={`h-3 ${width} animate-pulse rounded bg-accent`} />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
          {index === 1 && <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />}
        </div>
      ))}
    </div>
  );
}

function ReviewText({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-sm leading-7 text-card-foreground">
      {text.split("\n").filter(Boolean).map((line, index) =>
        line.startsWith("- ") ? (
          <div className="flex gap-3" key={index}><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" /><p>{line.slice(2)}</p></div>
        ) : line.startsWith("```") ? null : (
          <p key={index}>{line}</p>
        ),
      )}
    </div>
  );
}

function parseReview(text: string) {
  if (!text) return [];
  const chunks = text.split(/^##\s+/m).filter(Boolean);
  return chunks.map((chunk, index) => {
    const [rawFirst, ...rest] = chunk.trim().split("\n");
    const first = rawFirst ?? "Review";
    return rest.length ? { title: first, content: rest.join("\n").trim() } : { title: index === 0 ? "Review" : first, content: rest.join("\n").trim() || first };
  });
}
