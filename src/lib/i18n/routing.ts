import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const locales = [
  'en',     // English
  'zh-CN',  // Chinese (Simplified)
  'zh-TW',  // Chinese (Traditional)
  'es',     // Spanish
  'hi',     // Hindi
  'pt',     // Portuguese
  'vi',     // Vietnamese
  'id',     // Indonesian
  'ar',     // Arabic
  'tr',     // Turkish
  'ru',     // Russian
  'ko',     // Korean
  'ja',     // Japanese
  'th',     // Thai
  'tl',     // Filipino
  'uk',     // Ukrainian
  'de',     // German
  'fr',     // French
  'pl',     // Polish
  'ur',     // Urdu
  'fa',     // Persian
  'bn',     // Bengali
  'nl',     // Dutch
  'it',     // Italian
  'ms',     // Malay
  'sw',     // Swahili
  'ro',     // Romanian
  'cs',     // Czech
  'el',     // Greek
  'he',     // Hebrew
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';
export const localePrefix = 'always' as const;

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
  // Enable browser language detection from Accept-Language header
  localeDetection: true
});

export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);


