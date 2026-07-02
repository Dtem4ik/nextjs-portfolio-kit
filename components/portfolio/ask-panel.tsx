"use client";

import { useState, useTransition } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AskPanelLabels = {
  panelLabel: string;
  placeholder: string;
  helper: string;
  ask: string;
  asking: string;
  modeLabel: string;
  modeAi: string;
  modeFallback: string;
  error: string;
  emptyState: string;
  examples: string[];
};

export function AskPanel({ labels }: { labels: AskPanelLabels }) {
  const [question, setQuestion] = useState<string>(labels.examples[0] ?? "");
  const [answer, setAnswer] = useState("");
  const [mode, setMode] = useState<"ai" | "fallback" | "idle">("idle");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitAsk(nextQuestion = question) {
    const cleanQuestion = nextQuestion.trim();
    if (!cleanQuestion) return;

    setError("");
    setQuestion(cleanQuestion);

    startTransition(async () => {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleanQuestion }),
      });

      if (!response.ok) {
        setError(labels.error);
        return;
      }

      const payload = (await response.json()) as { answer: string; mode: "ai" | "fallback" };
      setAnswer(payload.answer);
      setMode(payload.mode);
    });
  }

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
            className="border-border/70 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md border px-2.5 py-1.5 text-xs transition-colors active:translate-y-px"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          type="button"
          onClick={() => submitAsk()}
          disabled={isPending}
          className="rounded-md active:translate-y-px"
        >
          {isPending ? labels.asking : labels.ask}
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="border-border/70 bg-background/60 mt-6 min-h-32 rounded-md border p-4">
        {isPending ? (
          <div className="space-y-3">
            <div className="bg-muted h-3 w-5/6 animate-pulse rounded-sm" />
            <div className="bg-muted h-3 w-4/6 animate-pulse rounded-sm" />
            <div className="bg-muted h-3 w-3/6 animate-pulse rounded-sm" />
          </div>
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : answer ? (
          <div className="space-y-3">
            <p className="text-sm leading-6">{answer}</p>
            <p className="text-muted-foreground font-mono text-xs uppercase">
              {labels.modeLabel}: {mode === "ai" ? labels.modeAi : labels.modeFallback}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm leading-6">{labels.emptyState}</p>
        )}
      </div>
    </div>
  );
}
