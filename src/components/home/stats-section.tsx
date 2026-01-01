import { getTranslations, getLocale } from "next-intl/server";
import { fetchCumulStats } from "@/lib/zeldhash-api-client";

function formatCompact(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

// ZELD uses 8 decimal places (like satoshis), so we divide by 10^8
const ZELD_DECIMALS = 100_000_000;

export async function StatsSection() {
  const t = await getTranslations("home");
  const locale = await getLocale();
  
  const stats = await fetchCumulStats();
  const utxosTracked = stats.new_utxo_count - stats.utxo_spent_count;
  const zeldInCirculation = stats.total_reward / ZELD_DECIMALS;

  const STATS = [
    { value: formatNumber(stats.reward_count, locale), label: t("stats.rareHashesFound") },
    { value: formatCompact(zeldInCirculation, locale), label: t("stats.zeldInCirculation") },
    { value: String(stats.max_zero_count), label: t("stats.recordZeros") },
    { value: formatCompact(utxosTracked, locale), label: t("stats.utxosTracked") },
  ] as const;

  return (
    <section className="w-full px-6 md:px-12 py-12 border-y border-gold-400/10 bg-black/30">
      <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <div className="text-4xl font-semibold text-gold-400 font-mono mb-2">
              {stat.value}
            </div>
            <div className="text-[13px] text-dark-500 uppercase tracking-[1px]">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

