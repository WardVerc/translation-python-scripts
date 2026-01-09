# 🌍 Translator

A small toolkit to manage JSON translation files. Designed to auto-translate, export, validate and import translations in multiple languages (EN -> FR, NL) with DeepL API.

## 🚀 Quick Start

Create a `.env` file with your DeepL API key:

```bash
DEEPL_FREE_SECRET=your_api_key_here
```

---

### Node.js

Make sure you have Node.js and npm installed.

```bash
https://nodejs.org/en/download
```

Install dependencies

```bash
npm install
```

Add a word or sentence in the en.json you want to translate (I've added an example already).

Run the translation script:

```bash
npm run translate
```

To export translations to an Excel:

```bash
npm run export
```

To import translations from an Excel:

```bash
npn run import
```

---

### Python: Run the CLI

```bash
./start
```
