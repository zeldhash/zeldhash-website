import Link from 'next/link';
import {CTASection} from '@/components/home';
import {Section, SectionTitle} from '@/components/ui';
import type {ReactNode} from 'react';
import {getTranslations} from 'next-intl/server';
import {locales, type Locale} from '@/lib/i18n/routing';
import {notFound} from 'next/navigation';
import {ZeldAIHeader} from '@/components/faq/zeldai-header';
import {FAQTabs} from '@/components/faq/faq-tabs';

type FaqItem = {
  question: string;
  answer: ReactNode;
};

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props) {
  const {locale: rawLocale} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({locale, namespace: 'faq'});

  const alternateLanguages = Object.fromEntries(
    locales.map(loc => [loc, `/${loc}/faq`])
  );

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      languages: alternateLanguages
    }
  };
}

export default async function FAQPage({params}: Props) {
  const {locale: rawLocale} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({locale, namespace: 'faq'});

  const PROTOCOL_ITEMS: FaqItem[] = [
    {
      question: t('protocol.howToGetZeld.q'),
      answer: (
        <p>
          {t.rich('protocol.howToGetZeld.a', {
            site: (chunks) => (
              <Link
                href="https://zeldhash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 hover:text-gold-300"
              >
                {chunks}
              </Link>
            ),
            github: (chunks) => (
              <Link
                href="https://github.com/ouziel-slama/zeldhash-miner"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 hover:text-gold-300"
              >
                {chunks}
              </Link>
            )
          })}
        </p>
      )
    },
    {
      question: t('protocol.whatIsZeldHash.q'),
      answer: <p>{t('protocol.whatIsZeldHash.a')}</p>
    },
    {
      question: t('protocol.whyName.q'),
      answer: (
        <>
          <p>{t('protocol.whyName.a1')}</p>
          <p>{t('protocol.whyName.a2')}</p>
        </>
      )
    },
    {
      question: t('protocol.whatIsHash.q'),
      answer: (
        <>
          <p>{t('protocol.whatIsHash.a1')}</p>
          <p>
            {t.rich('protocol.whatIsHash.a2', {
              mempool: (chunks) => (
                <Link
                  href="https://mempool.space/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300"
                >
                  {chunks}
                </Link>
              )
            })}
          </p>
        </>
      )
    },
    {
      question: t('protocol.bitcoinRelation.q'),
      answer: <p>{t('protocol.bitcoinRelation.a')}</p>
    },
    {
      question: t('protocol.rareTxHash.q'),
      answer: <p>{t('protocol.rareTxHash.a')}</p>
    },
    {
      question: t('protocol.huntHow.q'),
      answer: <p>{t('protocol.huntHow.a')}</p>
    },
    {
      question: t('protocol.whatIsZeld.q'),
      answer: <p>{t('protocol.whatIsZeld.a')}</p>
    },
    {
      question: t('protocol.inCirculation.q'),
      answer: <p>{t('protocol.inCirculation.a')}</p>
    },
    {
      question: t('protocol.ownWithoutKnowing.q'),
      answer: <p>{t('protocol.ownWithoutKnowing.a')}</p>
    },
    {
      question: t('protocol.centralized.q'),
      answer: <p>{t('protocol.centralized.a')}</p>
    },
    {
      question: t('protocol.rewards.q'),
      answer: <p>{t('protocol.rewards.a')}</p>
    },
    {
      question: t('protocol.startHunting.q'),
      answer: (
        <p>
          {t.rich('protocol.startHunting.a', {
            site: (chunks) => (
              <Link
                href="https://zeldhash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 hover:text-gold-300"
              >
                {chunks}
              </Link>
            )
          })}
        </p>
      )
    }
  ];

  const WALLET_ITEMS: {title: string; items: FaqItem[]}[] = [
    {
      title: t('wallet.general.title'),
      items: [
        {
          question: t('wallet.general.security.q'),
          answer: <p>{t('wallet.general.security.a')}</p>
        },
        {
          question: t('wallet.general.addressDifference.q'),
          answer: <p>{t('wallet.general.addressDifference.a')}</p>
        },
        {
          question: t('wallet.general.twoAddresses.q'),
          answer: <p>{t('wallet.general.twoAddresses.a')}</p>
        },
        {
          question: t('wallet.general.mobile.q'),
          answer: <p>{t('wallet.general.mobile.a')}</p>
        }
      ]
    },
    {
      title: t('wallet.hunting.title'),
      items: [
        {
          question: t('wallet.hunting.gpuVsCpu.q'),
          answer: <p>{t('wallet.hunting.gpuVsCpu.a')}</p>
        },
        {
          question: t('wallet.hunting.miningTime.q'),
          answer: <p>{t('wallet.hunting.miningTime.a')}</p>
        },
        {
          question: t('wallet.hunting.keepRunning.q'),
          answer: <p>{t('wallet.hunting.keepRunning.a')}</p>
        }
      ]
    },
    {
      title: t('wallet.transactions.title'),
      items: [
        {
          question: t('wallet.transactions.feeSelection.q'),
          answer: (
            <>
              <p>{t('wallet.transactions.feeSelection.a1')}</p>
              <p>{t('wallet.transactions.feeSelection.a2')}</p>
              <p>{t('wallet.transactions.feeSelection.a3')}</p>
            </>
          )
        },
        {
          question: t('wallet.transactions.minimumBtc.q'),
          answer: (
            <>
              <p>{t('wallet.transactions.minimumBtc.a1')}</p>
              <p>{t('wallet.transactions.minimumBtc.a2')}</p>
              <p>{t('wallet.transactions.minimumBtc.a3')}</p>
            </>
          )
        },
        {
          question: t('wallet.transactions.sendZeld.q'),
          answer: <p>{t('wallet.transactions.sendZeld.a')}</p>
        },
        {
          question: t('wallet.transactions.balanceIncreased.q'),
          answer: <p>{t('wallet.transactions.balanceIncreased.a')}</p>
        },
        {
          question: t('wallet.transactions.closeBrowser.q'),
          answer: (
            <>
              <p>{t('wallet.transactions.closeBrowser.a1')}</p>
              <p>{t('wallet.transactions.closeBrowser.a2')}</p>
            </>
          )
        }
      ]
    },
    {
      title: t('wallet.security.title'),
      items: [
        {
          question: t('wallet.security.backupImportance.q'),
          answer: <p>{t('wallet.security.backupImportance.a')}</p>
        },
        {
          question: t('wallet.security.forgotPassword.q'),
          answer: <p>{t('wallet.security.forgotPassword.a')}</p>
        },
        {
          question: t('wallet.security.mnemonicPhrase.q'),
          answer: <p>{t('wallet.security.mnemonicPhrase.a')}</p>
        },
        {
          question: t('wallet.security.lostDevice.q'),
          answer: <p>{t('wallet.security.lostDevice.a')}</p>
        }
      ]
    },
    {
      title: t('wallet.external.title'),
      items: [
        {
          question: t('wallet.external.connectExternal.q'),
          answer: <p>{t('wallet.external.connectExternal.a')}</p>
        },
        {
          question: t('wallet.external.externalVsDirect.q'),
          answer: (
            <>
              <p>{t('wallet.external.externalVsDirect.a1')}</p>
              <p>{t('wallet.external.externalVsDirect.a2')}</p>
              <p>{t('wallet.external.externalVsDirect.a3')}</p>
              <p>{t('wallet.external.externalVsDirect.a4')}</p>
              <p>{t('wallet.external.externalVsDirect.a5')}</p>
              <p>{t('wallet.external.externalVsDirect.a6')}</p>
            </>
          )
        }
      ]
    }
  ];

  const categoryLabels = {
    protocol: t('categories.protocol'),
    wallet: t('categories.wallet')
  };

  return (
    <div className="w-full">
      <ZeldAIHeader />

      <Section className="pt-12 pb-12">
        <SectionTitle title={t('heading')} className="mb-10" />

        <FAQTabs 
          categoryLabels={categoryLabels}
          protocolItems={PROTOCOL_ITEMS}
          walletSections={WALLET_ITEMS}
        />
      </Section>

      <CTASection />
    </div>
  );
}
