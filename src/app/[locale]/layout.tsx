import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';
import {Footer, Header, Background} from '@/components/layout';
import {locales, type Locale} from '@/lib/i18n/routing';
import {getLanguageInfo} from '@/lib/i18n/languages';
import {fontVariables} from '../layout';

type Props = {
  children: ReactNode;
  params: Promise<{locale: string}>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: Props) {
  const {locale: rawLocale} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  const t = await getTranslations({locale, namespace: 'common'});

  return {
    title: {
      default: t('siteTitle'),
      template: `%s | ${t('siteTitle')}`
    },
    description: t('siteDescription'),
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico'
    }
  };
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale: rawLocale} = await params;
  const locale = rawLocale as Locale;
  if (!locales.includes(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages({locale});
  const langInfo = getLanguageInfo(locale);

  return (
    <html lang={locale} dir={langInfo.dir} className={fontVariables}>
      <body className="min-h-screen overflow-x-hidden font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Background />
          <div className="relative z-10">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


