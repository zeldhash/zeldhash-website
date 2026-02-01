import {Section, GithubIcon} from '@/components/ui';
import {getTranslations} from 'next-intl/server';
import {locales, type Locale} from '@/lib/i18n/routing';
import {notFound} from 'next/navigation';
import Image from 'next/image';

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
      <section className="w-full px-6 md:px-12 pt-6 pb-3 border-b border-gold-400/10 bg-black/30">
        <div className="max-w-[900px] mx-auto">
          <h1 className="text-[clamp(40px,7vw,64px)] font-light leading-[1.1] tracking-[-1.5px] mb-4 font-serif">
            <span className="text-gradient-gold">{t('wallet.titlePrefix')}</span>{t('wallet.titleSuffix')}
          </h1>
          <p className="text-lg text-dark-300 leading-[1.7] max-w-[760px]">
            {t('wallet.newSubtitle')}
          </p>
        </div>
      </section>

      <Section className="!pt-8 !pb-16">
        <div className="max-w-[900px] mx-auto grid gap-8 md:grid-cols-2">
          
          {/* Horizon Market Block */}
          <a 
            href="https://horizon.market/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl border border-[#F6A7A8]/30 bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] p-8 transition-all duration-300 hover:border-[#F6A7A8]/50 hover:shadow-[0_0_40px_rgba(250,204,206,0.15)] hover:-translate-y-1"
          >
            {/* Horizon gradient overlay inspired by their branding */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FACCCE]/5 via-transparent to-[#9398C9]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Logo */}
              <div className="mb-6">
                <Image
                  src="/Horizon-logofull-dawn.svg"
                  alt="Horizon Market"
                  width={180}
                  height={36}
                  className="h-9 w-auto"
                />
              </div>
              
              {/* Title */}
              <h2 className="text-2xl font-light mb-3 font-serif text-white">
                {t('wallet.horizon.title')}
              </h2>
              
              {/* Description */}
              <p className="text-dark-300 mb-6 leading-relaxed flex-1">
                {t('wallet.horizon.description')}
              </p>
              
              {/* CTA */}
              <div className="flex items-center gap-2 text-sm font-medium mb-6">
                <span className="bg-gradient-to-r from-[#FACCCE] via-[#F6A7A8] to-[#A3A7D3] bg-clip-text text-transparent">
                  {t('wallet.horizon.cta')}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-4 h-4 text-[#F6A7A8] transition-transform group-hover:translate-x-1"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              
              {/* Tech badges */}
              <div className="flex flex-wrap gap-2 pt-6 border-t border-[#F6A7A8]/10">
                <span className="px-2.5 py-1 text-xs font-medium text-[#F6A7A8]/80 bg-[#F6A7A8]/10 rounded-md">Counterparty</span>
                <span className="px-2.5 py-1 text-xs font-medium text-[#F6A7A8]/80 bg-[#F6A7A8]/10 rounded-md">Kontor</span>
                <span className="px-2.5 py-1 text-xs font-medium text-[#F6A7A8]/80 bg-[#F6A7A8]/10 rounded-md">ZELD</span>
                <span className="px-2.5 py-1 text-xs font-medium text-[#F6A7A8]/80 bg-[#F6A7A8]/10 rounded-md">DEX</span>
                <span className="px-2.5 py-1 text-xs font-medium text-[#F6A7A8]/80 bg-[#F6A7A8]/10 rounded-md">Wallet</span>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-[#FACCCE]/10 to-[#9398C9]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </a>
          
          {/* Build Your Miner Block */}
          <a 
            href="https://github.com/zeldhash/zeldhash-miner"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl border border-gold-400/20 bg-gradient-to-br from-dark-900 to-dark-800 p-8 transition-all duration-300 hover:border-gold-400/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] hover:-translate-y-1"
          >
            {/* Gold gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 via-transparent to-gold-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Title with GitHub icon */}
              <div className="mb-6 flex items-center gap-3">
                <GithubIcon className="w-9 h-9 text-gold-400" />
                <span className="text-2xl font-light font-mono text-white">
                  zeldhash-miner
                </span>
              </div>
              
              {/* Subtitle */}
              <h2 className="text-2xl font-light mb-3 font-serif text-white">
                {t('wallet.buildMiner.title')}
              </h2>
              
              {/* Description */}
              <p className="text-dark-300 mb-6 leading-relaxed flex-1">
                {t('wallet.buildMiner.description')}
              </p>
              
              {/* CTA */}
              <div className="flex items-center gap-2 text-sm font-medium mb-6">
                <span className="text-gradient-gold">
                  {t('wallet.buildMiner.cta')}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-4 h-4 text-gold-400 transition-transform group-hover:translate-x-1"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              
              {/* Tech badges */}
              <div className="flex flex-wrap gap-2 pt-6 border-t border-gold-400/10">
                <span className="px-2.5 py-1 text-xs font-medium text-gold-400/80 bg-gold-400/10 rounded-md">Rust</span>
                <span className="px-2.5 py-1 text-xs font-medium text-gold-400/80 bg-gold-400/10 rounded-md">TypeScript</span>
                <span className="px-2.5 py-1 text-xs font-medium text-gold-400/80 bg-gold-400/10 rounded-md">Python</span>
                <span className="px-2.5 py-1 text-xs font-medium text-gold-400/80 bg-gold-400/10 rounded-md">WebGPU</span>
                <span className="px-2.5 py-1 text-xs font-medium text-gold-400/80 bg-gold-400/10 rounded-md">WASM</span>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gold-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </a>
        </div>
        
      </Section>
    </div>
  );
}
