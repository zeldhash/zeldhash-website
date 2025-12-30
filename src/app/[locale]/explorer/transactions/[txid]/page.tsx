import {Section, SectionTitle} from "@/components/ui";
import {ExplorerHeader} from "@/components/explorer/explorer-header";
import {fetchRewardsByTxid, fetchBatchUtxos, type RewardEntry, type UtxoBalance} from "@/lib/zeldhash-api-client";
import {fetchTransaction} from "@/lib/electrs-client";
import {locales, type Locale} from "@/lib/i18n/routing";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";

export const revalidate = 60;

type Props = {
  params: Promise<{locale: string; txid: string}>;
};

// Validate txid format (64 hex characters)
function isValidTxid(txid: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(txid);
}

export async function generateMetadata({params}: Props) {
  const {locale: rawLocale, txid} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({locale, namespace: "common"});

  const alternateLanguages = Object.fromEntries(
    locales.map(loc => [loc, `/${loc}/explorer/transactions/${txid}`])
  );

  const shortTxid = `${txid.slice(0, 12)}...`;

  return {
    title: t("explorer.transactionMetaTitle", {txid: shortTxid}),
    description: t("explorer.transactionMetaDescription", {txid}),
    alternates: {
      languages: alternateLanguages,
    },
  };
}

const ZELD_DECIMALS = 1e8;

function formatBalance(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  }).format(value);
}

function formatTxid(txid: string) {
  const leadingZeros = txid.match(/^0+/)?.[0]?.length ?? 0;
  if (leadingZeros > 0) {
    return {
      zerosPart: txid.slice(0, leadingZeros),
      rest: txid.slice(leadingZeros),
    };
  }
  return {
    zerosPart: "",
    rest: txid,
  };
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

function RewardsList({rewards, t, locale}: {rewards: RewardEntry[]; t: (key: string) => string; locale: string}) {
  return (
    <div className="flex flex-col gap-3">
      {rewards.map((reward) => {
        const {zerosPart, rest} = formatTxid(reward.txid);
        const leadingZeros = zerosPart.length;

        return (
          <div
            key={`${reward.txid}:${reward.vout}`}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5 px-6 rounded-lg bg-gradient-to-br from-gold-400/15 to-gold-400/5 border border-gold-400/40"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold bg-gradient-gold text-dark-950">
                {reward.zero_count}
              </div>
              <div>
                <div className="text-xs text-white mb-1">
                  {t("explorer.vout")} {reward.vout}
                </div>
                <div className="text-xs text-dark-400">
                  {t("explorer.block")} #{reward.block_index}
                </div>
              </div>
            </div>
            <div className="text-end">
              <div className="text-base font-medium text-gold-400 font-mono">
                {formatBalance(reward.reward / ZELD_DECIMALS, locale)}
              </div>
              <div className="text-[11px] text-white uppercase tracking-wider">
                {t("explorer.tokenLabel")}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UtxosList({utxos, t, locale}: {utxos: UtxoBalance[]; t: (key: string) => string; locale: string}) {
  if (!utxos.length) {
    return (
      <div className="p-6 rounded-lg border border-gold-400/15 bg-white/[0.02] text-dark-300">
        {t("explorer.noUtxosInTx")}
      </div>
    );
  }

  const sortedUtxos = [...utxos].sort((a, b) => a.vout - b.vout);

  return (
    <div className="flex flex-col gap-3">
      {sortedUtxos.map((utxo) => (
        <div
          key={`${utxo.txid}:${utxo.vout}`}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5 px-6 rounded-lg bg-white/[0.02] border border-white/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-medium bg-gold-400/20 text-gold-400">
              {t("explorer.voutShort")} {utxo.vout}
            </div>
            <div>
              <div className="text-sm text-white">
                {t("explorer.output")} #{utxo.vout}
              </div>
            </div>
          </div>
          <div className="text-end">
            <div className="text-base font-medium text-gold-400 font-mono">
              {formatBalance(utxo.balance / ZELD_DECIMALS, locale)}
            </div>
            <div className="text-[11px] text-white uppercase tracking-wider">
              {t("explorer.tokenLabel")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function TransactionPage({params}: Props) {
  const {locale: rawLocale, txid} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({locale, namespace: "common"});

  // Validate txid format
  if (!isValidTxid(txid)) {
    notFound();
  }

  let rewards: RewardEntry[] | null = null;
  let utxos: UtxoBalance[] = [];
  let fetchError: string | null = null;
  let isRewardTx = false;

  try {
    // First, check if this transaction has rewards
    rewards = await fetchRewardsByTxid(txid);
    
    if (rewards && rewards.length > 0) {
      isRewardTx = true;
    } else {
      // No rewards found, fetch transaction from Electrs to get vout count
      try {
        const tx = await fetchTransaction(txid);
        const voutCount = tx.vout.length;
        
        if (voutCount > 0) {
          // Build outpoints for all vouts
          const outpoints = Array.from({length: voutCount}, (_, i) => `${txid}:${i}`);
          
          // Fetch balances for all UTXOs (batch of max 100)
          if (outpoints.length <= 100) {
            utxos = await fetchBatchUtxos(outpoints);
          } else {
            // Split into batches of 100
            const batches: string[][] = [];
            for (let i = 0; i < outpoints.length; i += 100) {
              batches.push(outpoints.slice(i, i + 100));
            }
            
            const results = await Promise.all(batches.map(batch => fetchBatchUtxos(batch)));
            utxos = results.flat();
          }
        }
      } catch (electrsError) {
        console.error("Electrs error:", electrsError);
        const electrsErrorMessage = electrsError instanceof Error ? electrsError.message : "";
        if (electrsErrorMessage.includes("not found")) {
          notFound();
        }
        fetchError = t("explorer.txLoadError");
      }
    }
  } catch (error) {
    console.error("ZeldHash API error:", error);
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("Malformed")) {
      notFound();
    }
    fetchError = t("explorer.loadError");
  }

  const {zerosPart, rest} = formatTxid(txid);
  const leadingZeros = zerosPart.length;
  const totalBalance = utxos.reduce((sum, utxo) => sum + utxo.balance, 0);
  const totalReward = rewards?.reduce((sum, r) => sum + r.reward, 0) ?? 0;

  return (
    <div className="w-full">
      <ExplorerHeader />

      <Section className="pt-12 pb-12">
        {/* Transaction Header */}
        <div className="mb-10">
          <div className="text-sm text-dark-400 uppercase tracking-wider mb-2">{t("explorer.transaction")}</div>
          <a
            href={`https://mempool.space/tx/${txid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-mono text-sm md:text-base break-all hover:text-gold-400 transition-colors"
          >
            {leadingZeros > 0 && (
              <span className="text-gold-400 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]">{zerosPart}</span>
            )}
            <span className="text-white">{rest}</span>
          </a>
          {leadingZeros >= 6 && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/20 text-gold-400 text-xs">
              ✨ {t("explorer.rewardEligible", {count: leadingZeros})}
            </div>
          )}
        </div>

        {fetchError ? (
          <div className="p-6 rounded-lg border border-red-400/20 bg-red-500/5 text-red-200">
            {fetchError}
          </div>
        ) : isRewardTx && rewards ? (
          <>
            {/* Reward Summary */}
            <div className="mb-10 p-6 rounded-xl bg-gradient-to-br from-gold-400/10 to-gold-400/5 border border-gold-400/30">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🏆</span>
                <div className="text-lg font-medium text-gold-400">{t("explorer.rewardTransaction")}</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard 
                  label={t("explorer.totalReward")} 
                  value={formatBalance(totalReward / ZELD_DECIMALS, locale)}
                  highlight
                />
                <StatCard 
                  label={t("explorer.rewardCount")} 
                  value={rewards.length}
                />
                <StatCard 
                  label={t("explorer.leadingZerosCount")} 
                  value={leadingZeros}
                  highlight
                />
              </div>
            </div>

            {/* Rewards List */}
            <SectionTitle title={t("explorer.rewardsReceived")} className="mb-6" />
            <RewardsList rewards={rewards} t={t} locale={locale} />
          </>
        ) : (
          <>
            {/* UTXO Summary */}
            <div className="mb-10 p-6 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="text-sm text-dark-400 uppercase tracking-wider mb-2">{t("explorer.totalUtxoBalance")}</div>
              <div className="text-3xl md:text-4xl font-light font-mono text-gold-400">
                {formatBalance(totalBalance / ZELD_DECIMALS, locale)}
                <span className="text-base ml-2 text-gold-400/70">{t("explorer.tokenLabel")}</span>
              </div>
              <div className="text-sm text-dark-400 mt-2">
                {t("explorer.utxoCount", {count: utxos.length})}
              </div>
            </div>

            {/* UTXOs List */}
            <SectionTitle title={t("explorer.transactionOutputs")} className="mb-6" />
            <UtxosList utxos={utxos} t={t} locale={locale} />
          </>
        )}

        {/* Link to mempool.space */}
        <div className="mt-10 text-center">
          <a
            href={`https://mempool.space/tx/${txid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gold-400/30 text-gold-400 hover:bg-gold-400/10 transition-colors text-sm"
          >
            {t("explorer.viewOnMempool")} →
          </a>
        </div>
      </Section>
    </div>
  );
}

