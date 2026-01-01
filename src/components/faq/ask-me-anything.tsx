"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";

export function AskMeAnything() {
  const t = useTranslations("faq.ama");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const answerRef = useRef<HTMLDivElement>(null);

  // Scroll to answer when it appears
  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [answer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-[900px] mx-auto mb-8">
      {/* Decorative header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
          <span className="inline-block w-2 h-2 rounded-full bg-gold-400/60 animate-pulse" style={{ animationDelay: "0.2s" }} />
          <span className="inline-block w-2 h-2 rounded-full bg-gold-400/30 animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
        <span className="text-sm font-medium text-gold-400 uppercase tracking-wider">
          {t("aiPowered")}
        </span>
      </div>

      {/* Main input container */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-400/20 via-gold-400/10 to-gold-400/20 rounded-xl blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex items-center gap-3 p-2 bg-dark-900/80 border border-gold-400/20 rounded-xl backdrop-blur-sm group-hover:border-gold-400/40 group-focus-within:border-gold-400/40 transition-colors">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            disabled={loading}
            maxLength={500}
            className="flex-1 bg-transparent px-4 py-3 text-dark-100 placeholder:text-dark-500 focus:outline-none text-[15px]"
            aria-label={t("placeholder")}
          />
          
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-gold text-dark-950 font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg shadow-gold-400/20"
            aria-label={t("submit")}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Helper text */}
      <p className="mt-2 text-xs text-dark-500 px-2">
        {t("helperText")}
      </p>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 flex-shrink-0 mt-0.5"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Answer display */}
      {answer && (
        <div
          ref={answerRef}
          className="mt-4 relative overflow-hidden"
        >
          {/* Decorative gradient border */}
          <div className="absolute inset-0 bg-gradient-to-br from-gold-400/10 via-transparent to-gold-400/5 rounded-xl" />
          
          <div className="relative p-6 bg-dark-900/60 border border-gold-400/20 rounded-xl backdrop-blur-sm">
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
  );
}

