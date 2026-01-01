"use client";

import {useState, useEffect, useRef, useCallback} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {Button} from "@/components/ui";

// Regex patterns for validation
const BLOCK_INDEX_REGEX = /^\d+$/;
const TXID_REGEX = /^[a-fA-F0-9]{64}$/;
// Bitcoin address patterns: Legacy (1...), P2SH (3...), Bech32 (bc1...)
const ADDRESS_REGEX = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{39,59})$/;

export function ExplorerHeader() {
  const t = useTranslations("common");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const hasProcessedInitialQuery = useRef(false);

  const handleSearch = useCallback((searchQuery?: string) => {
    const trimmed = (searchQuery ?? query).trim();
    if (!trimmed) return;

    setError(null);

    // Check if it's a block index (integer)
    if (BLOCK_INDEX_REGEX.test(trimmed)) {
      router.push(`/${locale}/explorer/blocks/${trimmed}`);
      return;
    }

    // Check if it's a transaction hash (64 hex characters)
    if (TXID_REGEX.test(trimmed)) {
      router.push(`/${locale}/explorer/transactions/${trimmed.toLowerCase()}`);
      return;
    }

    // Check if it's a Bitcoin address
    if (ADDRESS_REGEX.test(trimmed)) {
      router.push(`/${locale}/explorer/addresses/${trimmed}`);
      return;
    }

    // Invalid input - show error
    setError(t("explorer.searchError"));
  }, [query, router, locale, t]);

  // Handle initial query from URL parameter
  useEffect(() => {
    const initialQuery = searchParams.get("q");
    if (initialQuery && !hasProcessedInitialQuery.current) {
      hasProcessedInitialQuery.current = true;
      setQuery(initialQuery);
      // Use setTimeout to ensure the state is set before triggering search
      setTimeout(() => {
        handleSearch(initialQuery);
      }, 0);
    }
  }, [searchParams, handleSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleButtonClick = () => {
    handleSearch();
  };

  return (
    <section className="w-full px-6 md:px-12 pt-6 pb-10 border-b border-gold-400/10 bg-black/30">
      <div className="max-w-[900px] mx-auto space-y-6">
        <h1 className="text-[clamp(40px,7vw,64px)] font-light leading-[1.1] tracking-[-1.5px] font-serif">
          {t("explorer.title")}
        </h1>
        <div className="max-w-[720px]">
          <label htmlFor="explorer-search" className="sr-only">
            {t("explorer.searchLabel")}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="explorer-search"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("explorer.searchPlaceholder")}
              className={`flex-1 rounded-lg border bg-white/[0.03] px-4 py-3 text-base text-dark-100 placeholder:text-dark-500 focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20"
                  : "border-gold-400/20 focus:border-gold-400/60 focus:ring-gold-400/20"
              }`}
              aria-describedby={error ? "explorer-search-error" : "explorer-search-help"}
              aria-invalid={!!error}
            />
            <Button
              type="button"
              className="sm:w-auto w-full"
              variant="secondary"
              onClick={handleButtonClick}
            >
              {t("explorer.searchButton")}
            </Button>
          </div>
          {error ? (
            <p id="explorer-search-error" className="mt-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : (
            <p id="explorer-search-help" className="mt-3 text-sm text-dark-500">
              {t("explorer.searchHelp")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

