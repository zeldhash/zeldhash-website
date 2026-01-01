import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const messagesDir = path.join(root, 'messages');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY environment variable is required');
  process.exit(1);
}

const LANGUAGE_NAMES = {
  ar: 'Arabic',
  bn: 'Bengali',
  cs: 'Czech',
  de: 'German',
  el: 'Greek',
  es: 'Spanish',
  fa: 'Persian (Farsi)',
  he: 'Hebrew',
  hi: 'Hindi',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  ms: 'Malay',
  nl: 'Dutch',
  pl: 'Polish',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  sw: 'Swahili',
  th: 'Thai',
  tl: 'Tagalog (Filipino)',
  tr: 'Turkish',
  uk: 'Ukrainian',
  ur: 'Urdu',
  vi: 'Vietnamese',
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
};

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function translateWithGroq(text, targetLanguage) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following JSON content from English to ${targetLanguage}. 
IMPORTANT RULES:
- Keep ALL JSON keys exactly as they are (in English)
- Only translate the string VALUES
- Keep technical terms like "ZELD", "ZeldWallet", "Bitcoin", "BTC", "GPU", "CPU", "WebGPU", "IndexedDB", "AES-256-GCM", "PBKDF2", "Taproot", "UTXO", "BIP39", "BIP84", "BIP86", "Xverse", "Leather", "Sparrow", "Magic Eden", "mempool.space" in their original form
- Preserve all formatting and punctuation
- Return ONLY valid JSON, no markdown code blocks or explanation
- The translation should sound natural in ${targetLanguage}`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.2,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  let content = data.choices[0]?.message?.content || '';
  
  // Remove markdown code blocks if present
  content = content.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim();
  
  return content;
}

async function translateCategoriesLabel(targetLanguage) {
  const prompt = `Translate these two category labels from English to ${targetLanguage}. Return ONLY a JSON object with the same keys:
{"protocol": "Protocol", "wallet": "Wallet"}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate to ${targetLanguage}. Return ONLY valid JSON, no explanation.`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices[0]?.message?.content || '';
  content = content.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim();
  
  return JSON.parse(content);
}

async function main() {
  // Read English FAQ as the source
  const enFaq = await readJson(path.join(messagesDir, 'en', 'faq.json'));
  
  // Get all locales except en and fr (already done)
  const locales = (await readdir(messagesDir, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((l) => l !== 'en' && l !== 'fr')
    .sort();

  console.log(`Translating wallet FAQ to ${locales.length} languages...`);

  for (const locale of locales) {
    const langName = LANGUAGE_NAMES[locale] || locale;
    console.log(`\nProcessing ${locale} (${langName})...`);

    try {
      // Read current FAQ
      const faqPath = path.join(messagesDir, locale, 'faq.json');
      const currentFaq = await readJson(faqPath);

      // Move existing items to protocol section
      const protocolItems = currentFaq.items || {};
      
      // Translate categories label
      console.log(`  - Translating category labels...`);
      const categories = await translateCategoriesLabel(langName);
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));

      // Translate wallet section
      console.log(`  - Translating wallet FAQ...`);
      const walletJson = JSON.stringify(enFaq.wallet, null, 2);
      const translatedWalletStr = await translateWithGroq(walletJson, langName);
      
      let translatedWallet;
      try {
        translatedWallet = JSON.parse(translatedWalletStr);
      } catch (parseErr) {
        console.error(`  - ERROR: Failed to parse translated JSON for ${locale}`);
        console.error(`  - Raw response: ${translatedWalletStr.substring(0, 200)}...`);
        continue;
      }

      // Build new FAQ structure
      const newFaq = {
        meta: currentFaq.meta,
        badge: currentFaq.badge,
        heading: currentFaq.heading,
        intro: currentFaq.intro,
        huntIsOn: currentFaq.huntIsOn,
        categories: categories,
        protocol: protocolItems,
        wallet: translatedWallet,
        ama: currentFaq.ama,
      };

      // Write updated FAQ
      await writeJson(faqPath, newFaq);
      console.log(`  ✓ ${locale} completed`);

      // Delay between languages to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));

    } catch (err) {
      console.error(`  - ERROR for ${locale}:`, err.message);
    }
  }

  console.log('\n✓ Translation complete!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

