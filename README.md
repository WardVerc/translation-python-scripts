# 🌍 Translator

A small toolkit to manage JSON translation files. Designed to auto-translate, export, validate and import translations in multiple languages (EN -> FR, NL) with DeepL API.

---

## 🚀 Quick Start

## Preparation

Create a `.env` file with your DeepL API key:

```bash
DEEPL_FREE_SECRET=your_api_key_here
```

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
