"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

export type AskPanelLabels = {
  panelLabel: string;
  placeholder: string;
  helper: string;
  ask: string;
  asking: string;
  error: string;
  emptyState: string;
  examples: string[];
};

const markdownComponents: Components = {
  p: ({ children }) => <p className="leading-6">{children}</p>,
  ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-6">{children}</li>,
  strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} className="underline underline-offset-2" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">{children}</code>
  ),
  h1: ({ children }) => <h3 className="text-foreground font-semibold">{children}</h3>,
  h2: ({ children }) => <h3 className="text-foreground font-semibold">{children}</h3>,
  h3: ({ children }) => <h3 className="text-foreground font-semibold">{children}</h3>,
};

export function AskPanel({ labels }: { labels: AskPanelLabels }) {
  const [question, setQuestion] = useState<string>(labels.examples[0] ?? "");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function submitAsk(nextQuestion = question) {
    const cleanQuestion = nextQuestion.trim();
    if (!cleanQuestion || status === "loading") return;

    setQuestion(cleanQuestion);
    setAnswer("");
    setStatus("loading");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleanQuestion }),
      });

      if (!response.ok || !response.body) {
        setStatus("error");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setAnswer(accumulated);
      }

      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="border-border/70 bg-card/55 rounded-md border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6">
      <div className="space-y-2">
        <label htmlFor="portfolio-question" className="text-sm font-medium">
          {labels.panelLabel}
        </label>
        <textarea
          id="portfolio-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={4}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-none rounded-md border px-3 py-3 text-sm leading-6 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          placeholder={labels.placeholder}
        />
        <p className="text-muted-foreground text-xs">{labels.helper}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {labels.examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => submitAsk(example)}
            disabled={isLoading}
            className="border-border/70 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md border px-2.5 py-1.5 text-xs transition-colors active:translate-y-px disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          type="button"
          onClick={() => submitAsk()}
          disabled={isLoading}
          className="rounded-md active:translate-y-px"
        >
          {isLoading ? labels.asking : labels.ask}
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="border-border/70 bg-background/60 mt-6 min-h-32 rounded-md border p-4">
        {status === "error" ? (
          <p className="text-destructive text-sm">{labels.error}</p>
        ) : answer ? (
          <div className="space-y-3 text-sm leading-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {answer}
            </ReactMarkdown>
            {isLoading && (
              <span className="bg-foreground/70 inline-block h-4 w-1.5 animate-pulse align-middle" />
            )}
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            <div className="bg-muted h-3 w-5/6 animate-pulse rounded-sm" />
            <div className="bg-muted h-3 w-4/6 animate-pulse rounded-sm" />
            <div className="bg-muted h-3 w-3/6 animate-pulse rounded-sm" />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm leading-6">{labels.emptyState}</p>
        )}
      </div>
    </div>
  );
}
