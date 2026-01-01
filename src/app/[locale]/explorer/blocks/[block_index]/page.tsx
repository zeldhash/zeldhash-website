import {Suspense} from "react";
import {Section, SectionTitle} from "@/components/ui";
import {ExplorerHeader} from "@/components/explorer/explorer-header";
import {fetchBlockDetails, type BlockDetails, type BlockReward} from "@/lib/zeldhash-api-client";
import {locales, type Locale} from "@/lib/i18n/routing";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";

export const revalidate = 300;

type Props = {
  params: Promise<{locale: string; block_index: string}>;
};

export async function generateMetadata({params}: Props) {
  const {locale: rawLocale, block_index} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({locale, namespace: "common"});

  const alternateLanguages = Object.fromEntries(
    locales.map(loc => [loc, `/${loc}/explorer/blocks/${block_index}`])
  );

  return {
    title: t("explorer.blockMetaTitle", {blockIndex: block_index}),
    description: t("explorer.blockMetaDescription", {blockIndex: block_index}),
    alternates: {
      languages: alternateLanguages,
    },
  };
}

const ZELD_DECIMALS = 1e8;

function formatReward(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  }).format(value);
}

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

function formatTxid(txid: string, zeroCount: number) {
  const zerosPart = txid.slice(0, zeroCount);
  const rest = `${txid.slice(zeroCount, 20)}...`;
  return {zerosPart, rest};
}

function StatCard({label, value, highlight = false}: {label: string; value: string | number; highlight?: boolean}) {
  return (
    <div className={`
      p-4 rounded-lg border
      ${highlight 
        ? "bg-gradient-to-br from-gold-400/15 to-gold-400/5 border-gold-400/30" 
        : "bg-white/[0.02] border-white/5"
      }
    `}>
      <div className="text-xs text-dark-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-mono ${highlight ? "text-gold-400" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function RewardsList({rewards, t, locale}: {rewards: BlockReward[]; t: (key: string) => string; locale: string}) {
  if (!rewards.length) {
    return (
      <div className="p-6 rounded-lg border border-gold-400/15 bg-white/[0.02] text-dark-300">
        {t("explorer.noBlockRewards")}
      </div>
    );
  }

  const maxZeroCount = Math.max(...rewards.map(r => r.zero_count));

  return (
    <div className="flex flex-col gap-3">
      {rewards.map((reward) => {
        const {zerosPart, rest} = formatTxid(reward.txid, reward.zero_count);
        const isRecord = reward.zero_count === maxZeroCount;

        return (
          <a
            key={`${reward.txid}:${reward.vout}`}
            href={`https://mempool.space/tx/${reward.txid}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5 px-6 rounded-lg
              transition-all hover:scale-[1.01]
              ${isRecord
                ? "bg-gradient-to-br from-gold-400/15 to-gold-400/5 border border-gold-400/40"
                : "bg-white/[0.02] border border-white/5 hover:border-gold-400/20"
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  text-sm font-semibold
                  ${isRecord
                    ? "bg-gradient-gold text-dark-950"
                    : "bg-gold-400/20 text-gold-400"
                  }
                `}
              >
                {reward.zero_count}
              </div>
              <div>
                <div className="font-mono text-sm mb-1 break-all">
                  <span
                    className={`text-gold-400 ${isRecord ? "drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" : ""}`}
                  >
                    {zerosPart}
                  </span>
                  <span className="text-white">{rest}</span>
                </div>
                <div className="text-xs text-white">
                  {t("explorer.vout")} {reward.vout}
                </div>
              </div>
            </div>
            <div className="text-end">
              <div className="text-base font-medium text-gold-400 font-mono">
                {formatReward(reward.reward / ZELD_DECIMALS, locale)}
              </div>
              <div className="text-[11px] text-white uppercase tracking-wider">
                {t("explorer.tokenLabel")}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

export default async function BlockPage({params}: Props) {
  const {locale: rawLocale, block_index: blockIndexParam} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({locale, namespace: "common"});

  const blockIndex = parseInt(blockIndexParam, 10);
  if (!Number.isFinite(blockIndex) || blockIndex < 0) {
    notFound();
  }

  let blockDetails: BlockDetails | null = null;
  let fetchError: string | null = null;

  try {
    blockDetails = await fetchBlockDetails(blockIndex);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("not found")) {
      notFound();
    } else if (errorMessage.includes("Invalid")) {
      notFound();
    } else {
      fetchError = t("explorer.loadError");
    }
  }

  if (!blockDetails) {
    return (
      <div className="w-full">
        <Suspense fallback={null}>
          <ExplorerHeader />
        </Suspense>
        <Section className="pt-12 pb-12">
          <div className="p-6 rounded-lg border border-red-400/20 bg-red-500/5 text-red-200">
            {fetchError || t("explorer.loadError")}
          </div>
        </Section>
      </div>
    );
  }

  const {block_stats, cumul_stats, rewards} = blockDetails;

  return (
    <div className="w-full">
      <Suspense fallback={null}>
        <ExplorerHeader />
      </Suspense>

      <Section className="pt-12 pb-12">
        <div className="mb-10">
          <div className="text-sm text-dark-400 uppercase tracking-wider mb-2">{t("explorer.block")}</div>
          <h2 className="font-mono text-3xl md:text-4xl text-gold-400">
            #{formatNumber(blockIndex, locale)}
          </h2>
        </div>

        {/* Block Stats */}
        <div className="mb-10">
          <SectionTitle title={t("explorer.blockStats")} className="mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label={t("explorer.rewardCount")} 
              value={formatNumber(block_stats.reward_count, locale)}
              highlight={block_stats.reward_count > 0}
            />
            <StatCard 
              label={t("explorer.totalReward")} 
              value={`${formatReward(block_stats.total_reward / ZELD_DECIMALS, locale)}`}
              highlight={block_stats.total_reward > 0}
            />
            <StatCard 
              label={t("explorer.maxZeroCount")} 
              value={block_stats.max_zero_count}
              highlight={block_stats.max_zero_count > 0}
            />
            <StatCard 
              label={t("explorer.newUtxoCount")} 
              value={formatNumber(block_stats.new_utxo_count, locale)}
            />
            <StatCard 
              label={t("explorer.utxoSpentCount")} 
              value={formatNumber(block_stats.utxo_spent_count, locale)}
            />
          </div>
        </div>

        {/* Nicest TXID */}
        {block_stats.max_zero_count > 0 && (
          <div className="mb-10">
            <SectionTitle title={t("explorer.nicestTxid")} className="mb-6" />
            <a
              href={`https://mempool.space/tx/${block_stats.nicest_txid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 rounded-lg bg-gradient-to-br from-gold-400/15 to-gold-400/5 border border-gold-400/30 hover:border-gold-400/50 transition-all"
            >
              <div className="font-mono text-sm break-all">
                {(() => {
                  const {zerosPart, rest} = formatTxid(block_stats.nicest_txid, block_stats.max_zero_count);
                  return (
                    <>
                      <span className="text-gold-400 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]">{zerosPart}</span>
                      <span className="text-white">{rest.replace("...", "")}</span>
                      <span className="text-dark-400">...</span>
                    </>
                  );
                })()}
              </div>
              <div className="mt-2 text-xs text-dark-400">
                {t("explorer.leadingZerosLabel", {count: block_stats.max_zero_count})}
              </div>
            </a>
          </div>
        )}

        {/* Block Rewards */}
        <div className="mb-10">
          <SectionTitle title={t("explorer.blockRewards")} className="mb-6" />
          <RewardsList rewards={rewards} t={t} locale={locale} />
        </div>

        {/* Cumulative Stats */}
        <div>
          <SectionTitle title={t("explorer.cumulativeStats")} className="mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard 
              label={t("explorer.totalBlocks")} 
              value={formatNumber(cumul_stats.block_count, locale)}
            />
            <StatCard 
              label={t("explorer.totalRewards")} 
              value={formatNumber(cumul_stats.reward_count, locale)}
            />
            <StatCard 
              label={t("explorer.totalRewardAmount")} 
              value={`${formatReward(cumul_stats.total_reward / ZELD_DECIMALS, locale)}`}
            />
            <StatCard 
              label={t("explorer.globalMaxZeros")} 
              value={cumul_stats.max_zero_count}
              highlight
            />
            <StatCard 
              label={t("explorer.totalNewUtxos")} 
              value={formatNumber(cumul_stats.new_utxo_count, locale)}
            />
            <StatCard 
              label={t("explorer.totalUtxosSpent")} 
              value={formatNumber(cumul_stats.utxo_spent_count, locale)}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

