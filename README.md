# 🌍 Translation Python Scripts

A small toolkit to manage JSON translation files using Excel. Designed to export, review, auto-translate, validate and import translation strings in multiple languages (EN, FR, NL) with support for DeepL API.

---

## ✨ Features

- ✅ Export all translations (flattened JSON) to Excel
- ✅ Auto-translate missing FR/NL keys using DeepL API
- ✅ Detect missing keys and prevent invalid export
- ✅ Import reviewed Excel back to JSON files
- ✅ Track only new keys in Excel output
- ✅ Protect placeholders like `{{amount}}` and `<0>...</0>` during translation
- ✅ Auto-generate export filenames with timestamps
- ✅ Friendly CLI with setup wizard

---

## 🧱 Project Structure

```bash
translation-python-scripts/
├── excel-to-json.py
├── json-to-excel.py
├── flatten-json.py
├── requirements.txt
├── start-script-menu
├── README.md              # You're here
└── .env
```

---

## 🚀 Quick Start

### 1. Prepare `.env`

Create a `.env` file with your DeepL API key:

```bash
DEEPL_FREE_SECRET=your_api_key_here
```

⚠️ Required for auto-translating missing values!

---

### 2. Run the CLI

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
