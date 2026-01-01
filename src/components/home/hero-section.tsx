"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const [address, setAddress] = useState("");
  const t = useTranslations("home");
  const router = useRouter();
  const locale = useLocale();

  const handleCheckBalance = () => {
    const trimmed = address.trim();
    if (trimmed) {
      router.push(`/${locale}/explorer?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/${locale}/explorer`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCheckBalance();
    }
  };

  return (
    <section className="w-full px-6 md:px-12 pt-16 pb-20">
      <div className="w-full grid md:grid-cols-2 items-center gap-10 lg:gap-16">
        <div className="text-start">
          <h1 className="text-[clamp(48px,8vw,70px)] font-light leading-[1.1] tracking-[-2px] mb-6 font-serif">
            <span className="text-gradient-gold font-semibold">{t("hero.titleLine1")}</span>
            <br />
            {t("hero.titleLine2")}
          </h1>

          <p className="text-[22px] text-dark-300 mb-12 leading-[1.6] font-light">
            {t("hero.subtitleBeforeZeros")}{" "}
            <bdi className="text-gold-400 font-mono px-1.5">000000...</bdi>{" "}
            {t("hero.subtitleAfterZeros", { token: "ZELD" })}
          </p>
        </div>

        {/* CTA Box */}
        <div className="bg-gradient-to-br from-gold-400/15 to-gold-400/5 border border-gold-400/30 rounded-2xl p-8 w-full max-w-xl mx-auto md:ms-auto">
          <p className="text-lg text-gold-400 mb-6 font-medium">
            {t("hero.ctaBox")}
          </p>
          <div className="flex flex-col md:flex-row flex-wrap gap-3 items-stretch md:items-center">
            <input
              type="text"
              placeholder={t("hero.addressPlaceholder")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full md:flex-1 px-5 py-4 text-[15px] font-mono bg-black/40 border border-gold-400/20 rounded-lg text-dark-100 focus:border-gold-400/50 transition-colors"
            />
            <Button type="button" onClick={handleCheckBalance} size="lg" className="w-full md:w-auto">
              {t("hero.checkBalance")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
