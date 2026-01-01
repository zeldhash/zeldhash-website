import {Section} from '@/components/ui';
import {ZeldWalletWrapper, AskZeldAIBlock} from '@/components/wallet';
import {getTranslations} from 'next-intl/server';
import {locales, type Locale} from '@/lib/i18n/routing';
import {notFound} from 'next/navigation';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props) {
  const {locale: rawLocale} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({locale, namespace: 'common'});

  const alternateLanguages = Object.fromEntries(
    locales.map(loc => [loc, `/${loc}/wallet`])
  );

  return {
    title: `${t('nav.wallet')} - ${t('siteTitle')}`,
    description: t('wallet.description'),
    alternates: {
      languages: alternateLanguages
    }
  };
}

export default async function WalletPage({params}: Props) {
  const {locale: rawLocale} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({locale, namespace: 'common'});

  return (
    <div className="w-full">
      <section className="w-full px-6 md:px-12 pt-6 pb-6 border-b border-gold-400/10 bg-black/30">
        <div className="max-w-[900px] mx-auto">
          <h1 className="text-[clamp(40px,7vw,64px)] font-light leading-[1.1] tracking-[-1.5px] mb-4 font-serif">
            <span className="text-gradient-gold">{t('wallet.titlePrefix')}</span>{t('wallet.titleSuffix')}
          </h1>
          <p className="text-lg text-dark-300 leading-[1.7] max-w-[760px]">
            {t('wallet.subtitle')}
          </p>
        </div>
      </section>

      <Section className="pt-12 pb-12">
        {/* Wallet Card */}
        <div className="max-w-[720px] mx-auto">
          <ZeldWalletWrapper key={locale} locale={locale} />
          
          {/* Ask ZeldAI Block */}
          <AskZeldAIBlock />
        </div>
      </Section>
    </div>
  );
}
