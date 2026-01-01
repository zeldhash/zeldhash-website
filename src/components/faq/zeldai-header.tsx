"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import ReactMarkdown from "react-markdown";

export function ZeldAIHeader() {
  const t = useTranslations("faq.ama");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const answerRef = useRef<HTMLDivElement>(null);
  const hasAutoSubmitted = useRef(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Scroll to answer when it appears
  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [answer]);

  const submitQuestion = useCallback(async (q: string) => {
    if (!q.trim() || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || t("genericError"));
      } else {
        setAnswer(data.answer);
      }
    } catch {
      setError(t("connectionError"));
    } finally {
      setLoading(false);
    }
  }, [loading, t]);

  // Check for query parameter and auto-submit
  useEffect(() => {
    const queryQuestion = searchParams.get("q");
    if (queryQuestion && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      const decodedQuestion = decodeURIComponent(queryQuestion);
      setQuestion(decodedQuestion);
      
      // Clear the query parameter from URL without reload
      router.replace(pathname, { scroll: false });
      
      // Submit the question
      submitQuestion(decodedQuestion);
    }
  }, [searchParams, pathname, router, submitQuestion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitQuestion(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <section className="w-full px-6 md:px-12 pt-6 pb-10 border-b border-gold-400/10 bg-black/30">
      <div className="max-w-[900px] mx-auto space-y-6">
        <h1 className="text-[clamp(40px,7vw,64px)] font-light leading-[1.1] tracking-[-1.5px] font-serif">
          ZeldAI
        </h1>
        <div className="max-w-[720px]">
          <label htmlFor="zeldai-search" className="sr-only">
            {t("placeholder")}
          </label>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              id="zeldai-search"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("placeholder")}
              disabled={loading}
              maxLength={500}
              className={`flex-1 rounded-lg border bg-white/[0.03] px-4 py-3 text-base text-dark-100 placeholder:text-dark-500 focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20"
                  : "border-gold-400/20 focus:border-gold-400/60 focus:ring-gold-400/20"
              }`}
              aria-describedby={error ? "zeldai-error" : "zeldai-help"}
              aria-invalid={!!error}
            />
            <Button
              type="submit"
              className="sm:w-auto w-full"
              variant="secondary"
              disabled={loading || !question.trim()}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                t("submit")
              )}
            </Button>
          </form>
          {error ? (
            <p id="zeldai-error" className="mt-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : (
            <p id="zeldai-help" className="mt-3 text-sm text-dark-500">
              {t("helperText")}
            </p>
          )}
        </div>

        {/* Answer display */}
        {answer && (
          <div ref={answerRef} className="max-w-[720px]">
            <div className="p-4 bg-white/[0.03] border border-gold-400/20 rounded-lg">
              {/* AI badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-400/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5 text-gold-400"
                  >
                    <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.184.551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1 0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1 .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1-.633-.632l-.183-.551Z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gold-400/80 uppercase tracking-wider">
                  {t("aiResponse")}
                </span>
              </div>

              {/* Answer text - markdown rendered */}
              <div className="prose prose-invert prose-sm max-w-none text-dark-200 prose-headings:text-dark-100 prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-gold-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-dark-100 prose-code:text-gold-400 prose-code:bg-dark-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-dark-800 prose-pre:border prose-pre:border-dark-700 prose-ul:text-dark-200 prose-ol:text-dark-200 prose-li:marker:text-gold-400/60">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

