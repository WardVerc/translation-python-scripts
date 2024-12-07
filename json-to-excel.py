import json
from openpyxl import Workbook

def extract_keys_and_values(data, parent_key=''):
    """
    Recursively extract keys and values from the JSON data.
    """
    items = {}
    for key, value in data.items():
        full_key = f"{parent_key}.{key}" if parent_key else key
        if isinstance(value, dict):
            items.update(extract_keys_and_values(value, full_key))
        else:
            items[full_key] = value

    return items

def write_translations_to_excel(keys, translations, output_file):
    """
    Write the keys and translations to an Excel file.
    """
    wb = Workbook()
    ws = wb.active
    ws.title = "Translations dashboard portal"
    
    # Add headers
    ws.append(["Key", "EN", "FR", "NL"])
    
    # Write keys and their corresponding translations
    for key in keys:
        en_value = translations.get("EN", {}).get(key, "")
        fr_value = translations.get("FR", {}).get(key, "")
        nl_value = translations.get("NL", {}).get(key, "")
        ws.append([key, en_value, fr_value, nl_value])
    
    wb.save(output_file)
    print(f"Translation file created: {output_file}")

def main():
    json_files = {
        "EN": "/Users/wardvercruyssen/repos/react_dashboard/src/i18n/en.json",
        "FR": "/Users/wardvercruyssen/repos/react_dashboard/src/i18n/fr.json",
        "NL": "/Users/wardvercruyssen/repos/react_dashboard/src/i18n/nl.json"
    }
    
    translations = {}
    all_keys = set()

    try:
        # Load each JSON file and extract keys and values
        for lang, file_path in json_files.items():
            with open(file_path, 'r') as f:
                data = json.load(f)
                translations[lang] = extract_keys_and_values(data)
                all_keys.update(translations[lang].keys())
        
        # Write all keys and translations to Excel
        write_translations_to_excel(sorted(all_keys), translations, "/Users/wardvercruyssen/Downloads/translations_dashboard_portal.xlsx")
        print(f"Extraction complete: {len(all_keys)} keys extracted.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
