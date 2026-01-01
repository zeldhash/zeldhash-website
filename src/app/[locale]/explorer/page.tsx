import {Suspense} from "react";
import {Section, SectionTitle} from "@/components/ui";
import {ExplorerHeader} from "@/components/explorer/explorer-header";
import {fetchLatestRewards, type RewardEntry} from "@/lib/zeldhash-api-client";
import {Link, locales, type Locale} from "@/lib/i18n/routing";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";

export const revalidate = 300;

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{page?: string | string[]}>;
};

export async function generateMetadata({params}: Props) {
  const {locale: rawLocale} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({locale, namespace: "common"});

  const alternateLanguages = Object.fromEntries(
    locales.map(loc => [loc, `/${loc}/explorer`])
  );

  return {
    title: t("explorer.metaTitle"),
    description: t("explorer.metaDescription"),
    alternates: {
      languages: alternateLanguages,
    },
  };
}

function formatTxid(txid: string, zeroCount: number) {
  const zerosPart = txid.slice(0, zeroCount);
  const rest = `${txid.slice(zeroCount, 20)}...`;
  return {zerosPart, rest};
}

const ZELD_DECIMALS = 1e8;
const PAGE_SIZE = 10;

function formatReward(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  }).format(value);
}

function RewardsList({rewards, t, locale}: {rewards: RewardEntry[]; t: (key: string) => string; locale: string}) {
  if (!rewards.length) {
    return (
      <div className="p-6 rounded-lg border border-gold-400/15 bg-white/[0.02] text-dark-300">
        {t("explorer.noRewards")}
      </div>
    );
  }

  const maxZeroCount = Math.max(...rewards.map(reward => reward.zero_count));

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
                  {t("explorer.block")} #{reward.block_index} • {t("explorer.vout")} {reward.vout}
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

function Pagination({page, hasNext, locale, t}: {page: number; hasNext: boolean; locale: Locale; t: (key: string) => string}) {
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = hasNext ? page + 1 : null;

  const baseClass =
    "px-4 py-2 rounded-md border transition-colors text-sm font-medium";

  const activeClass = "border-gold-400/30 text-gold-200 hover:border-gold-400/60";
  const disabledClass = "border-white/5 text-dark-600 cursor-not-allowed";

  const buildHref = (targetPage: number) => `/explorer?page=${targetPage}`;

  return (
    <div className="mt-10 flex items-center justify-between">
      <div className="text-sm text-dark-500">{t("explorer.page")} {page}</div>
      <div className="flex gap-3">
        {prevPage ? (
          <Link href={buildHref(prevPage)} className={`${baseClass} ${activeClass}`}>
            {t("explorer.previous")}
          </Link>
        ) : (
          <span className={`${baseClass} ${disabledClass}`} aria-disabled>
            {t("explorer.previous")}
          </span>
        )}
        {nextPage ? (
          <Link href={buildHref(nextPage)} className={`${baseClass} ${activeClass}`}>
            {t("explorer.next")}
          </Link>
        ) : (
          <span className={`${baseClass} ${disabledClass}`} aria-disabled>
            {t("explorer.next")}
          </span>
        )}
      </div>
    </div>
  );
}

export default async function ExplorerPage({params, searchParams}: Props) {
  const {locale: rawLocale} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({locale, namespace: "common"});

  const resolvedSearchParams = await searchParams;
  const rawPage = Array.isArray(resolvedSearchParams?.page) ? resolvedSearchParams?.page[0] : resolvedSearchParams?.page;
  const parsedPage = Number(rawPage);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;

  const offset = (page - 1) * PAGE_SIZE;

  let rewards: RewardEntry[] = [];
  let fetchError = false;

  try {
    rewards = await fetchLatestRewards(PAGE_SIZE, offset);
  } catch (error) {
    console.error(error);
    fetchError = true;
  }

  const hasNextPage = rewards.length === PAGE_SIZE;

  return (
    <div className="w-full">
      <Suspense fallback={null}>
        <ExplorerHeader />
      </Suspense>

      <Section className="pt-12 pb-12">
        <SectionTitle title={t("explorer.latestRewards")} className="mb-10" />

        {fetchError ? (
          <div className="p-6 rounded-lg border border-red-400/20 bg-red-500/5 text-red-200">
            {t("explorer.loadError")}
          </div>
        ) : (
          <>
            <RewardsList rewards={rewards} t={t} locale={locale} />
            <Pagination page={page} hasNext={hasNextPage} locale={locale} t={t} />
          </>
        )}
      </Section>
    </div>
  );
}

