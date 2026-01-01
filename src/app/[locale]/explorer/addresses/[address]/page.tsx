import {Suspense} from "react";
import {Section, SectionTitle} from "@/components/ui";
import {ExplorerHeader} from "@/components/explorer/explorer-header";
import {fetchAddressUtxos, type AddressUtxo} from "@/lib/zeldhash-api-client";
import {locales, type Locale} from "@/lib/i18n/routing";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";

export const revalidate = 60;

type Props = {
  params: Promise<{locale: string; address: string}>;
};

export async function generateMetadata({params}: Props) {
  const {locale: rawLocale, address} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({locale, namespace: "common"});

  const alternateLanguages = Object.fromEntries(
    locales.map(loc => [loc, `/${loc}/explorer/addresses/${address}`])
  );

  return {
    title: t("explorer.addressMetaTitle", {address: `${address.slice(0, 12)}...`}),
    description: t("explorer.addressMetaDescription", {address}),
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
      rest: `${txid.slice(leadingZeros, 20)}...`,
    };
  }
  return {
    zerosPart: "",
    rest: `${txid.slice(0, 20)}...`,
  };
}

function UtxosList({utxos, t, locale}: {utxos: AddressUtxo[]; t: ReturnType<typeof getTranslations> extends Promise<infer T> ? T : never; locale: string}) {
  if (!utxos.length) {
    return (
      <div className="p-6 rounded-lg border border-gold-400/15 bg-white/[0.02] text-dark-300">
        {t("explorer.noUtxos")}
      </div>
    );
  }

  const sortedUtxos = [...utxos].sort((a, b) => b.balance - a.balance);

  return (
    <div className="flex flex-col gap-3">
      {sortedUtxos.map((utxo) => {
        const {zerosPart, rest} = formatTxid(utxo.txid);
        const hasLeadingZeros = zerosPart.length >= 6;

        return (
          <a
            key={`${utxo.txid}:${utxo.vout}`}
            href={`https://mempool.space/tx/${utxo.txid}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5 px-6 rounded-lg
              transition-all hover:scale-[1.01]
              ${hasLeadingZeros
                ? "bg-gradient-to-br from-gold-400/15 to-gold-400/5 border border-gold-400/40"
                : "bg-white/[0.02] border border-white/5 hover:border-gold-400/20"
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  text-xs font-medium
                  ${hasLeadingZeros
                    ? "bg-gradient-gold text-dark-950"
                    : "bg-gold-400/20 text-gold-400"
                  }
                `}
              >
                {hasLeadingZeros ? t("explorer.leadingZeros", {count: zerosPart.length}) : t("explorer.utxo")}
              </div>
              <div>
                <div className="font-mono text-sm mb-1 break-all">
                  {zerosPart && (
                    <span
                      className={`text-gold-400 ${hasLeadingZeros ? "drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" : ""}`}
                    >
                      {zerosPart}
                    </span>
                  )}
                  <span className="text-white">{rest}</span>
                </div>
                <div className="text-xs text-white">
                  {t("explorer.vout")} {utxo.vout}
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
          </a>
        );
      })}
    </div>
  );
}

export default async function AddressPage({params}: Props) {
  const {locale: rawLocale, address} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({locale, namespace: "common"});

  let utxos: AddressUtxo[] = [];
  let fetchError: string | null = null;

  try {
    utxos = await fetchAddressUtxos(address);
  } catch (error) {
    console.error(error);
    // Map specific API errors to translated messages
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("max 500") || errorMessage.includes("Too many UTXOs")) {
      fetchError = t("explorer.tooManyUtxos");
    } else {
      fetchError = t("explorer.loadError");
    }
  }

  const totalBalance = utxos.reduce((sum, utxo) => sum + utxo.balance, 0);

  return (
    <div className="w-full">
      <Suspense fallback={null}>
        <ExplorerHeader />
      </Suspense>

      <Section className="pt-12 pb-12">
        <div className="mb-10">
          <h2 className="font-mono text-lg md:text-xl text-dark-100 break-all">
            {address}
          </h2>
        </div>

        <div className="mb-10 p-6 rounded-xl bg-gradient-to-br from-gold-400/10 to-gold-400/5 border border-gold-400/30">
          <div className="text-sm text-dark-400 uppercase tracking-wider mb-2">{t("explorer.totalBalance")}</div>
          <div className="text-3xl md:text-4xl font-light font-mono text-gold-400">
            {formatBalance(totalBalance / ZELD_DECIMALS, locale)}
            <span className="text-base ml-2 text-gold-400/70">{t("explorer.tokenLabel")}</span>
          </div>
          <div className="text-sm text-dark-400 mt-2">
            {t("explorer.utxoCount", {count: utxos.length})}
          </div>
        </div>

        {fetchError ? (
          <div className="p-6 rounded-lg border border-red-400/20 bg-red-500/5 text-red-200">
            {fetchError}
          </div>
        ) : (
          <>
            <SectionTitle title={t("explorer.utxos")} className="mb-6" />
            <UtxosList utxos={utxos} t={t} locale={locale} />
          </>
        )}
      </Section>
    </div>
  );
}

