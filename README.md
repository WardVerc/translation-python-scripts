# 🌍 Translation Scripts

A small toolkit to manage JSON translation files using Excel. Designed to export, review, auto-translate, validate and import translation strings in multiple languages (EN, FR, NL) with support for DeepL API.

---

## ✨ Features

- ✅ Auto-translate missing FR/NL keys using DeepL API
- ✅ Export all translations (flattened JSON) to Excel
- ✅ Detect missing keys and prevent invalid export
- ✅ Import reviewed Excel back to JSON files
- ✅ Track only new keys in Excel output
- ✅ Protect placeholders like `{{amount}}` and `<0>...</0>` during translation
- ✅ Auto-generate export filenames with timestamps
- ✅ Friendly CLI with setup wizard for python

---

## 🧱 Project Structure

```bash
translation-scripts/
├── .env
├── en.json
├── excel-to-json.py
├── export-translations-to-excel.js
├── flatten-json.py
├── fr.json
├── import-excel-to-jsons.js
├── json-to-excel.py
├── nl.json
├── README.md
├── requirements.txt
├── start
├── translate.js
├── translate.py
└── translations.xlsx
```

---

## 🚀 Quick Start

## Preparation

Create a `.env` file with your DeepL API key:

```bash
DEEPL_FREE_SECRET=your_api_key_here
```

Make sure you have these files:

- en.json
- nl.json
- fr.json

## Node.js

Make sure you have Node.js and npm installed.

```bash
https://nodejs.org/en/download
```

Install dependencies

```bash
npm install fs/promises
npm install dotenv
npm install axios
npm install path
npm install readline
npm install exceljs
```

Make sure to locate the .env file with credentials, en.json, nl.json and fr.json files.

Run the translation script:

```bash
node translate.js
```

To export translations to an Excel:

```bash
node export-translations-to-excel.js
```

To import translations from an Excel:

```bash
node import-excel-to-jsons.js
```

---

### Python: Run the CLI

```bash
./start
```

Follow the prompts to:

- Choose the script
- Confirm source files (Excel & JSONs)
- Auto-translate or export/import

---

## 🧪 Scripts Summary

| Script             | Description                               |
| ------------------ | ----------------------------------------- |
| `json-to-excel.py` | Export translation JSONs to Excel         |
| `excel-to-json.py` | Import reviewed Excel and update JSONs    |
| `flatten-json.py`  | (Optional) Flatten nested JSONs if needed |
| `./start`          | CLI to easily run the above scripts       |

---

## 🤝 Contributing

Feel free to fork this repo and customize the path mappings or features. Contributions welcome!

---

## 🧠 Author

[WardVerc](https://github.com/WardVerc)

---

## 🛟 Support

If something doesn't work or you're not sure how to extend it, just reach out!
