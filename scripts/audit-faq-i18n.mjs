import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const messagesDir = path.join(root, "messages");

function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function collectStringPaths(value, prefix = "") {
  const out = [];

  if (typeof value === "string") {
    out.push(prefix);
    return out;
  }

  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      const nextPrefix = prefix ? `${prefix}[${i}]` : `[${i}]`;
      out.push(...collectStringPaths(item, nextPrefix));
    });
    return out;
  }

  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      out.push(...collectStringPaths(value[key], nextPrefix));
    }
    return out;
  }

  return out;
}

function getAtPath(obj, p) {
  // supports dot paths (no arrays needed here)
  return p.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

function hasAsciiWords(s) {
  // quick heuristic: contains at least a few latin letters in a row
  return /[A-Za-z]{3,}/.test(s);
}

function looksLikeEnglishSentence(s) {
  // heuristic: English stopwords + ascii
  if (!hasAsciiWords(s)) return false;
  const hits = [
    /\bthe\b/i,
    /\band\b/i,
    /\byou\b/i,
    /\byour\b/i,
    /\bplease\b/i,
    /\berror\b/i,
    /\bconnection\b/i,
    /\btransactions?\b/i,
    /\bfees?\b/i,
    /\bwhat\b/i,
    /\bhow\b/i,
  ].reduce((n, re) => n + (re.test(s) ? 1 : 0), 0);
  return hits >= 2;
}

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const locales = (await readdir(messagesDir, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  if (!locales.includes("en")) {
    console.error("Missing 'messages/en' (English required).");
    process.exit(1);
  }

  const base = await readJson(path.join(messagesDir, "en", "faq.json"));
  const paths = collectStringPaths(base).sort();

  let totalSuspicious = 0;

  for (const locale of locales) {
    if (locale === "en") continue;

    const current = await readJson(path.join(messagesDir, locale, "faq.json"));
    const identical = [];
    const englishy = [];

    for (const p of paths) {
      const baseVal = getAtPath(base, p);
      const curVal = getAtPath(current, p);
      if (typeof baseVal !== "string" || typeof curVal !== "string") continue;

      if (curVal === baseVal && curVal.trim().length >= 12 && hasAsciiWords(curVal)) {
        identical.push(p);
        continue;
      }

      if (looksLikeEnglishSentence(curVal) && curVal.trim().length >= 12) {
        englishy.push(p);
      }
    }

    if (identical.length || englishy.length) {
      totalSuspicious += identical.length + englishy.length;
      console.log(`\nLocale '${locale}':`);
      if (identical.length) {
        console.log(`  Identical to en (${identical.length}):`);
        for (const p of identical.slice(0, 50)) console.log(`    - ${p}`);
        if (identical.length > 50) console.log(`    ... +${identical.length - 50} more`);
      }
      if (englishy.length) {
        console.log(`  Looks English-ish (${englishy.length}):`);
        for (const p of englishy.slice(0, 50)) console.log(`    - ${p}`);
        if (englishy.length > 50) console.log(`    ... +${englishy.length - 50} more`);
      }
    }
  }

  if (!totalSuspicious) {
    console.log("OK: no suspicious FAQ strings detected.");
  } else {
    console.log(`\nTotal suspicious strings: ${totalSuspicious}`);
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


