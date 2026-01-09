// This script translates the new keys in en.json to nl.json and fr.json using DeepL API.
// en.json is source of truth.

import fs from "fs/promises";
import dotenv from "dotenv";
import axios from "axios";
import readline from "readline";

dotenv.config();

const TRANSLATION_SETS = {
  1: {
    label: "Translation",
    paths: {
      EN: "./en.json",
      FR: "./fr.json",
      NL: "./nl.json",
    },
  },
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

async function getUsage() {
  const url = new URL("https://api-free.deepl.com/v2/usage");
  url.searchParams.set("auth_key", process.env.DEEPL_FREE_SECRET);

  try {
    const response = await axios.get(url.href);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching usage from DeepL:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function loadJSON(filepath) {
  try {
    const content = await fs.readFile(filepath, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    return {};
  }
}

async function saveJSON(filepath, data) {
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  console.log(`📄 SAVED: ${filepath}`);
}

function extractPlaceholders(text) {
  const regex = /{{.*?}}|<.*?>.*?<\/.*?>/g;
  const replacements = {};
  let match;
  let i = 0;
  while ((match = regex.exec(text))) {
    const token = `@@${i++}@@`;
    replacements[token] = match[0];
    text = text.replace(match[0], token);
  }
  return { safe: text, replacements };
}

function restorePlaceholders(text, replacements) {
  for (const [token, original] of Object.entries(replacements)) {
    text = text.replace(token, original);
  }
  return text;
}

async function translateText(text, targetLang) {
  const { safe, replacements } = extractPlaceholders(text);
  try {
    const res = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      null,
      {
        params: {
          auth_key: process.env.DEEPL_FREE_SECRET,
          text: safe,
          target_lang: targetLang,
        },
      }
    );
    const translated = res.data.translations[0].text;
    return restorePlaceholders(translated, replacements);
  } catch (err) {
    console.error(
      `❌ Failed to translate "${text}": ${
        err.response?.data?.message || err.message
      }`
    );
    return "";
  }
}

async function main() {
  console.log("📦 DeepL Translation Script (Node.js version)\n");

  if (!process.env.DEEPL_FREE_SECRET) {
    console.error("❌ Missing .env or DEEPL_FREE_SECRET");
    process.exit(1);
  }

  const usage = await getUsage();
  if (usage) {
    console.log(
      `📊 DeepL Usage: ${usage.character_count} / ${usage.character_limit} characters used\n`
    );
  } else {
    console.warn("⚠️ Could not retrieve usage info.\n");
  }

  const set = TRANSLATION_SETS[1];
  if (!set) {
    console.log("❌ Invalid selection.");
    process.exit(1);
  }

  const files = set.paths;
  const jsons = {};

  for (const lang of ["EN", "FR", "NL"]) {
    jsons[lang] = await loadJSON(files[lang]);
  }

  const allKeys = new Set(
    Object.keys(jsons.EN).concat(Object.keys(jsons.FR), Object.keys(jsons.NL))
  );

  const missing = [];
  for (const key of allKeys) {
    for (const lang of ["EN", "FR", "NL"]) {
      if (!(key in jsons[lang])) {
        missing.push({ key, lang });
      }
    }
  }

  if (missing.length === 0) {
    console.log("✅ All keys present in all languages. Nothing to do.");
    rl.close();
    return;
  }

  console.log("🚧 Missing keys:");
  missing.forEach(({ key, lang }) => {
    console.log(` - "${key}" missing in ${lang}`);
  });

  const confirm = await ask("\n💬 Translate missing keys using DeepL? (y/n): ");
  if (confirm.toLowerCase() !== "y") {
    console.log("❌ Translation cancelled.");
    rl.close();
    return;
  }

  console.log(`🌎 Translating...`);

  for (const { key, lang } of missing) {
    if (lang === "EN") continue; // Don't auto-create EN keys
    const source = jsons.EN[key];
    if (!source) continue;
    const translated = await translateText(source, lang);
    if (translated) {
      jsons[lang][key] = translated;
      console.log(`✅ Translated: [${lang}] "${key}" → "${translated}"`);
    }
  }

  for (const lang of ["FR", "NL"]) {
    await saveJSON(files[lang], jsons[lang]);
  }

  console.log("\n🎉 Done! Translations updated.");
  rl.close();
}

await main();
