"use client";

import { useState, useRef, useEffect } from "react";
import { Logo, PdfIcon, GithubIcon, WalletIcon, ExplorerIcon, ZeldAIIcon } from "@/components/ui";
import { Link, locales, usePathname, useRouter, type Locale } from "@/lib/i18n/routing";
import { languages, getLanguageInfo } from "@/lib/i18n/languages";
import { useTranslations, useLocale } from "next-intl";

type NavLink = {
  href: string;
  labelKey: string;
  icon: "wallet" | "explorer" | "zeldai";
};

const NAV_LINKS: NavLink[] = [
  { href: "/wallet", labelKey: "nav.wallet", icon: "wallet" },
  { href: "/explorer", labelKey: "nav.explorer", icon: "explorer" },
  { href: "/faq", labelKey: "nav.zeldai", icon: "zeldai" },
] as const;

const NavIcon = ({ icon, className = "w-4 h-4" }: { icon: NavLink["icon"]; className?: string }) => {
  switch (icon) {
    case "wallet":
      return <WalletIcon className={className} />;
    case "explorer":
      return <ExplorerIcon className={className} />;
    case "zeldai":
      return <ZeldAIIcon className={className} />;
  }
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(nextLocale: (typeof locales)[number]) {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const href = `${pathname}${search}${hash}`;
    router.replace(href, { locale: nextLocale });
  }

  return (
    <header className="relative px-6 md:px-12 py-6 flex justify-between items-center border-b border-gold-400/10">
      <div className="flex items-center gap-3">
        <Logo />
        <span className="text-gold-400 text-2xl md:text-[28px] font-display tracking-tight">
          {t("tagline")}
        </span>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <nav className="flex gap-8 text-sm uppercase tracking-[1px] items-center">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-dark-200 hover:text-gold-400 transition-colors flex items-center gap-1.5">
              <NavIcon icon={link.icon} />
              {t(link.labelKey)}
            </Link>
          ))}
          <a
            href={`/whitepaper/zeldhash-whitepaper-${locale}.pdf`}
            className="group relative text-dark-200 hover:text-gold-400 transition-colors"
            title={t("nav.whitepaper")}
          >
            <PdfIcon className="w-6 h-6" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-dark-800 text-gold-400 border border-gold-400/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {t("nav.whitepaper")}
            </span>
          </a>
          <a
            href="https://github.com/ouziel-slama/zeldhash/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative text-dark-200 hover:text-gold-400 transition-colors"
            title={t("nav.github")}
          >
            <GithubIcon className="w-6 h-6" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-dark-800 text-gold-400 border border-gold-400/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {t("nav.github")}
            </span>
          </a>
        </nav>

        <div className="relative" ref={langDropdownRef}>
          <button
            type="button"
            onClick={() => setIsLangOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gold-400/15 text-dark-200 hover:text-gold-400 hover:border-gold-400/30 transition-colors"
            aria-expanded={isLangOpen}
            aria-haspopup="listbox"
          >
            <span className="text-[13px]">{getLanguageInfo(locale as Locale).native}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${isLangOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isLangOpen && (
            <div className="absolute end-0 top-full mt-2 w-52 max-h-80 rounded-lg border border-gold-400/15 bg-dark-900/95 backdrop-blur shadow-lg overflow-hidden z-30">
              <ul role="listbox" className="py-1 overflow-y-auto max-h-[calc(20rem-8px)]">
                {languages.map((lang) => {
                  const isActive = lang.code === locale;
                  return (
                    <li key={lang.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          switchLocale(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-start px-4 py-2 text-[13px] transition-colors ${
                          isActive
                            ? "bg-gold-400/15 text-gold-400"
                            : "text-dark-200 hover:text-gold-400 hover:bg-gold-400/10"
                        }`}
                        dir={lang.dir}
                      >
                        {lang.native}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label={t("nav.toggleMenu")}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-gold-400/20 text-dark-200 hover:border-gold-400/40 hover:text-gold-400 transition-colors"
      >
        <span className="sr-only">{t("nav.openNav")}</span>
        <div className="space-y-1.5">
          <span className="block h-0.5 w-6 bg-current" />
          <span className="block h-0.5 w-6 bg-current" />
          <span className="block h-0.5 w-6 bg-current" />
        </div>
      </button>

      {isMenuOpen ? (
        <div className="absolute end-6 top-[72px] z-20 w-56 rounded-lg border border-gold-400/15 bg-dark-900/95 backdrop-blur shadow-lg md:hidden">
          <nav className="flex flex-col divide-y divide-gold-400/10 text-sm uppercase tracking-[1px]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 text-dark-200 hover:text-gold-400 transition-colors flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <NavIcon icon={link.icon} className="w-5 h-5" />
                {t(link.labelKey)}
              </Link>
            ))}
            <a
              href={`/whitepaper/zeldhash-whitepaper-${locale}.pdf`}
              className="px-4 py-3 text-dark-200 hover:text-gold-400 transition-colors flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <PdfIcon className="w-5 h-5" />
              {t("nav.whitepaper")}
            </a>
            <a
              href="https://github.com/ouziel-slama/zeldhash/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 text-dark-200 hover:text-gold-400 transition-colors flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <GithubIcon className="w-5 h-5" />
              {t("nav.github")}
            </a>
            <div className="px-4 py-3">
              <div className="text-[11px] uppercase tracking-[1px] text-dark-600 mb-2">{t("language.label")}</div>
              <div className="flex flex-col rounded-md border border-gold-400/15 overflow-hidden max-h-48 overflow-y-auto">
                {languages.map((lang) => {
                  const isActive = lang.code === locale;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        switchLocale(lang.code);
                        setIsMenuOpen(false);
                      }}
                      aria-current={isActive ? "true" : undefined}
                      className={`w-full text-start px-3 py-2 text-[13px] transition-colors border-b border-gold-400/10 last:border-b-0 ${
                        isActive
                          ? "bg-gold-400/15 text-gold-400"
                          : "text-dark-200 hover:text-gold-400 hover:bg-gold-400/10"
                      }`}
                      dir={lang.dir}
                    >
                      {lang.native}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

