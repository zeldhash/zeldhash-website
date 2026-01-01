import { Section, SectionTitle } from "@/components/ui";
import { getTranslations, getLocale } from "next-intl/server";
import { fetchLatestRewards, type RewardEntry } from "@/lib/zeldhash-api-client";

const ZELD_DECIMALS = 1e8;

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

function formatTxid(txid: string, zeroCount: number) {
  const zerosPart = txid.slice(0, zeroCount);
  const rest = txid.slice(zeroCount, 20) + "...";
  return { zerosPart, rest };
}

function RewardsList({
  rewards,
  t,
  locale,
}: {
  rewards: RewardEntry[];
  t: (key: string, values?: Record<string, number>) => string;
  locale: string;
}) {
  if (!rewards.length) {
    return null;
  }

  const maxZeroCount = Math.max(...rewards.map((r) => r.zero_count));

  return (
    <div className="flex flex-col gap-3">
      {rewards.map((reward) => {
        const { zerosPart, rest } = formatTxid(reward.txid, reward.zero_count);
        const isRecord = reward.zero_count === maxZeroCount;

        return (
          <a
            key={`${reward.txid}:${reward.vout}`}
            href={`https://mempool.space/tx/${reward.txid}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center justify-between py-5 px-6 rounded-lg
              transition-all hover:scale-[1.01]
              ${
                isRecord
                  ? "bg-gradient-to-br from-gold-400/15 to-gold-400/5 border border-gold-400/40"
                  : "bg-white/[0.02] border border-white/5 hover:border-gold-400/20"
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  text-sm font-semibold
                  ${
                    isRecord
                      ? "bg-gradient-gold text-dark-950"
                      : "bg-gold-400/20 text-gold-400"
                  }
                `}
              >
                {isRecord ? "👑" : reward.zero_count}
              </div>
              <div>
                <div className="font-mono text-sm mb-1">
                  <span
                    className={`text-gold-400 ${isRecord ? "drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" : ""}`}
                  >
                    {zerosPart}
                  </span>
                  <span className="text-dark-600">{rest}</span>
                </div>
                <div className="text-xs text-dark-600">
                  {t("hallOfFame.leadingZeros", { count: reward.zero_count })}{" "}
                  {isRecord ? t("hallOfFame.recordSuffix") : null}
                </div>
              </div>
            </div>
            <div className="text-end">
              <div className="text-base font-medium text-gold-400 font-mono">
                {formatNumber(reward.reward / ZELD_DECIMALS, locale)}
              </div>
              <div className="text-[11px] text-dark-600 uppercase tracking-wider">
                {t("hallOfFame.tokenLabel")}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

export async function HallOfFameSection() {
  const t = await getTranslations("home");
  const locale = await getLocale();

  let rewards: RewardEntry[] = [];
  let fetchError = false;

  try {
    rewards = await fetchLatestRewards(10, 0, "zero_count");
  } catch (error) {
    console.error("Failed to fetch rarest rewards:", error);
    fetchError = true;
  }

  if (fetchError || rewards.length === 0) {
    return null;
  }

  return (
    <Section className="bg-black/25">
      <SectionTitle label={t("hallOfFame.label")} title={t("hallOfFame.title")} />
      <RewardsList rewards={rewards} t={t} locale={locale} />
    </Section>
  );
}
