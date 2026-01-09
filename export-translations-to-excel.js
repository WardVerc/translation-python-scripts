// This script exports translations from en, nl, fr.json files to 2 Excel files:
// 1. New keys only (not in the existing Excel file) -> to give to translator for review
// 2. All keys merged (including existing and new keys)
// Make sure to swap the original Excel file "translations.xlsx" with the new all keys merged file.
// Name the excel "translations.xlsx"

import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import readline from "readline";
import ExcelJS from "exceljs";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

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

const EXCEL_PATH = "./translations.xlsx";
const exportDir = "./";

function timestamp() {
  return new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
}

async function loadJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeExcel(data, filename, sheetName) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  ws.addRow(["Key", "EN", "FR", "NL"]);
  Object.keys(data)
    .sort()
    .forEach((key) => {
      ws.addRow([key, data[key].EN, data[key].FR, data[key].NL]);
    });
  const fullPath = path.join(exportDir, filename);
  await wb.xlsx.writeFile(fullPath);
  console.log(`✅ Wrote: ${fullPath} (${Object.keys(data).length} keys)`);
}

async function loadExcelTranslations(path) {
  const workbook = new ExcelJS.Workbook();
  return workbook.xlsx.readFile(path).then(() => {
    const worksheet = workbook.worksheets[0];
    const header = worksheet.getRow(1).values;
    const keyIndex = header.indexOf("Key");
    const keys = new Set();

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const key = row.getCell(keyIndex).value?.trim();
      if (key) keys.add(key);
    });

    return keys;
  });
}

async function main() {
  const set = TRANSLATION_SETS[1];
  if (!set) {
    console.log("❌ Invalid file path selection.");
    rl.close();
    return;
  }

  const paths = set.paths;
  const jsons = {};
  for (const lang of ["EN", "FR", "NL"]) {
    jsons[lang] = await loadJSON(paths[lang]);
  }

  const allKeys = new Set(Object.keys(jsons.EN));
  const missingEnKeys = [...allKeys].filter(
    (k) => !jsons.EN[k] && (jsons.FR[k] || jsons.NL[k])
  );
  if (missingEnKeys.length) {
    console.log("❌ ERROR: Missing EN keys:");
    missingEnKeys.forEach((k) => console.log(` - ${k}`));
    rl.close();
    return;
  }

  const missing = [];
  for (const key of allKeys) {
    const langsMissing = ["EN", "FR", "NL"].filter((l) => !(key in jsons[l]));
    if (langsMissing.length) missing.push([key, langsMissing]);
  }

  if (missing.length) {
    console.log("🚨 Missing keys:");
    missing.forEach(([key, langs]) =>
      console.log(` - ${key}: ${langs.join(", ")}`)
    );
    console.log(
      '⚠️ Please make sure all keys are present in FR and NL. Use the "translate" command to fill in missing translations.'
    );
    rl.close();
    return;
  }

  const allTranslationData = {};
  for (const key of allKeys) {
    allTranslationData[key] = {
      EN: jsons.EN[key] || "",
      FR: jsons.FR[key] || "",
      NL: jsons.NL[key] || "",
    };
  }

  let oldKeys = new Set();
  try {
    oldKeys = await loadExcelTranslations(EXCEL_PATH);
  } catch (e) {
    const ok = await ask(
      `⚠️ Excel not found at ${EXCEL_PATH}. Continue assuming all keys are new? (y/n): `
    );
    if (ok.toLowerCase() !== "y") return;
  }

  // 🧹 Audit: detect deleted keys in Excel not present in current EN.json
  const missingFromJson = [...oldKeys].filter((key) => !allKeys.has(key));
  if (missingFromJson.length > 0) {
    console.log(
      `\n🧹 ${missingFromJson.length} keys exist in Excel but were removed from en.json:`
    );
    missingFromJson.forEach((k) => console.log(` - ${k}`));
    console.log(
      "These keys will not be included in the new Excel files, they were removed from en.json."
    );
  }

  // ✅ Compare only Excel keys that are still relevant
  const filteredOldKeys = [...oldKeys].filter((key) => allKeys.has(key));
  const newKeysOnly = [...allKeys].filter(
    (key) => !filteredOldKeys.includes(key)
  );

  console.log(`\n📊 Total JSON keys (EN): ${allKeys.size}`);
  console.log(`📈 New keys detected: ${newKeysOnly.length}\n`);

  const newTranslationData = {};
  newKeysOnly.forEach((key) => {
    newTranslationData[key] = allTranslationData[key];
  });

  const ts = timestamp();
  await writeExcel(
    newTranslationData,
    `new-keys-ONLY-${ts}.xlsx`,
    "New Keys Only"
  );
  await writeExcel(
    allTranslationData,
    `all-keys-MERGED-${ts}.xlsx`,
    "All Keys Merged"
  );

  console.log("\n🎉 Done!");
  rl.close();
}

await main();
