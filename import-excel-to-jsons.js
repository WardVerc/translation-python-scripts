// This script imports reviewed translations (Excel) back into EN/FR/NL JSON files,
// only applying the changed values. Then exports an All Keys Merged Excel.
// Swap the original "translations.xlsx" with the new All keys merged excel.

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
const ask = (q) => new Promise((res) => rl.question(q, res));

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

// 👉 Put your reviewed Excel path here (or prompt below)
const REVIEWED_EXCEL_PATH = "./translations-reviewed.xlsx";
const EXPORT_DIR = "./";

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

async function saveJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  console.log(`💾 Saved: ${filePath}`);
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
  const fullPath = path.join(EXPORT_DIR, filename);
  await wb.xlsx.writeFile(fullPath);
  console.log(`✅ Wrote: ${fullPath} (${Object.keys(data).length} keys)`);
}

async function readReviewedExcel(filePath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];

  // Basic header mapping by column name
  const headerRow = ws.getRow(1);
  const toIndex = {};
  headerRow.eachCell((cell, col) => {
    toIndex[cell.value] = col;
  });

  const required = ["Key", "EN", "FR", "NL"];
  const missingHeaders = required.filter((h) => !(h in toIndex));
  if (missingHeaders.length) {
    throw new Error(`Missing column(s) in Excel: ${missingHeaders.join(", ")}`);
  }

  const data = {};
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return; // skip header
    const key = row.getCell(toIndex["Key"]).value?.toString().trim();
    if (!key) return;

    // Read raw values; keep empty cells as '' so we can skip them on update
    const EN = (row.getCell(toIndex["EN"]).value ?? "").toString();
    const FR = (row.getCell(toIndex["FR"]).value ?? "").toString();
    const NL = (row.getCell(toIndex["NL"]).value ?? "").toString();

    data[key] = { EN, FR, NL };
  });

  return data;
}

async function main() {
  console.log("📥 Import Reviewed Translations (Excel → JSON)");

  // Choose translation set (if you add more later)
  const set = TRANSLATION_SETS[1];
  if (!set) {
    console.log("❌ Invalid translation set.");
    rl.close();
    return;
  }
  const paths = set.paths;

  // Confirm or change reviewed Excel path
  let reviewedPath = REVIEWED_EXCEL_PATH;
  if (!(await fileExists(reviewedPath))) {
    console.log(
      `⚠️ Reviewed file not found at default path:\n${REVIEWED_EXCEL_PATH}`
    );
    const answer = await ask(
      "Enter full path to reviewed Excel (or leave empty to abort): "
    );
    if (!answer.trim()) {
      console.log("❌ Aborted.");
      rl.close();
      return;
    }
    reviewedPath = answer.trim();
  }

  // Load JSONs
  const jsons = {
    EN: await loadJSON(paths.EN),
    FR: await loadJSON(paths.FR),
    NL: await loadJSON(paths.NL),
  };

  const enKeys = new Set(Object.keys(jsons.EN)); // EN = source of truth

  // Read reviewed Excel
  let reviewed;
  try {
    reviewed = await readReviewedExcel(reviewedPath);
  } catch (err) {
    console.error(`❌ Failed to read reviewed Excel: ${err.message}`);
    rl.close();
    return;
  }

  // Stage changes: only apply non-empty cells that differ from current JSON
  const changes = { EN: {}, FR: {}, NL: {} };
  const skippedMissingInEN = [];

  for (const [key, vals] of Object.entries(reviewed)) {
    if (!enKeys.has(key)) {
      // Key not in EN — skip & record (safety)
      skippedMissingInEN.push(key);
      continue;
    }
    for (const lang of ["EN", "FR", "NL"]) {
      const newVal = (vals[lang] ?? "").toString();
      if (!newVal) continue; // don't apply empty cells
      const oldVal = jsons[lang][key] ?? "";
      if (newVal !== oldVal) {
        changes[lang][key] = newVal;
      }
    }
  }

  // Report summary
  console.log("\n🔎 Summary of pending updates:");
  let totalUpdates = 0;
  for (const lang of ["EN", "FR", "NL"]) {
    const count = Object.keys(changes[lang]).length;
    totalUpdates += count;
    console.log(` - ${lang}: ${count} change(s)`);
  }
  if (skippedMissingInEN.length) {
    console.log(
      `\n⚠️ ${skippedMissingInEN.length} key(s) were present in the Excel but missing in EN.json (skipped):`
    );
    skippedMissingInEN.slice(0, 10).forEach((k) => console.log(`   - ${k}`));
    if (skippedMissingInEN.length > 10) console.log("   ...");
  }

  if (totalUpdates === 0) {
    console.log("\n✅ No changes detected. Nothing to apply.");
    rl.close();
    return;
  }

  // Optional: preview a few changes
  const showPreview = await ask(
    "\n👀 Show a preview of the first ~10 changes? (y/n): "
  );
  if (showPreview.trim().toLowerCase() === "y") {
    for (const lang of ["EN", "FR", "NL"]) {
      const entries = Object.entries(changes[lang]).slice(0, 10);
      if (entries.length === 0) continue;
      console.log(`\n[${lang}]`);
      for (const [key, val] of entries) {
        const oldVal = jsons[lang][key] ?? "";
        console.log(` • ${key}\n   from: "${oldVal}"\n   to:   "${val}"`);
      }
      if (Object.keys(changes[lang]).length > 10) console.log("   ...");
    }
  }

  const confirm = await ask(
    "\n💾 Apply these changes to the JSON files? (y/n): "
  );
  if (confirm.trim().toLowerCase() !== "y") {
    console.log("❌ Cancelled, no files were changed.");
    rl.close();
    return;
  }

  // Apply changes and save JSONs
  for (const lang of ["EN", "FR", "NL"]) {
    Object.assign(jsons[lang], changes[lang]);
    await saveJSON(paths[lang], jsons[lang]);
  }

  // Export full merged Excel (snapshot after import)
  const allKeys = [...enKeys].sort();
  const merged = {};
  for (const key of allKeys) {
    merged[key] = {
      EN: jsons.EN[key] ?? "",
      FR: jsons.FR[key] ?? "",
      NL: jsons.NL[key] ?? "",
    };
  }
  const ts = timestamp();
  await writeExcel(merged, `all-keys-MERGED-${ts}.xlsx`, "All Keys Merged");

  console.log("\n🎉 Import completed and snapshot exported!");
  rl.close();
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

await main();
