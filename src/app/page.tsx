import {redirect} from 'next/navigation';
import {headers, cookies} from 'next/headers';
import {locales, defaultLocale, type Locale} from '@/lib/i18n/routing';

// Match browser locale (e.g., fr-FR) to our supported locales (e.g., fr)
function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  // Parse Accept-Language header (e.g., "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7")
  const browserLocales = acceptLanguage
    .split(',')
    .map(part => {
      const [locale, q] = part.trim().split(';q=');
      return {locale: locale.trim(), quality: q ? parseFloat(q) : 1};
    })
    .sort((a, b) => b.quality - a.quality)
    .map(item => item.locale);

  for (const browserLocale of browserLocales) {
    // Exact match (e.g., zh-CN)
    if (locales.includes(browserLocale as Locale)) {
      return browserLocale as Locale;
    }
    // Base language match (e.g., fr-FR -> fr)
    const baseLang = browserLocale.split('-')[0];
    if (locales.includes(baseLang as Locale)) {
      return baseLang as Locale;
    }
  }

  return defaultLocale;
}

export default async function RootPage() {
  const headersList = await headers();
  const cookieStore = await cookies();
  
  // Check for existing locale cookie
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    redirect(`/${cookieLocale}`);
  }
  
  // Detect from browser Accept-Language header
  const acceptLanguage = headersList.get('accept-language');
  const detectedLocale = matchLocale(acceptLanguage);
  
  redirect(`/${detectedLocale}`);
}


