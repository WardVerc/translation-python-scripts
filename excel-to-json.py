import json
from openpyxl import load_workbook

def update_json_from_excel(input_excel, json_files):
    """
    Update existing JSON files with values from the Excel file and track updates.
    """
    # Load the Excel file
    wb = load_workbook(input_excel)
    ws = wb.active

    # Load existing JSON files
    existing_data = {}
    for lang, file_path in json_files.items():
        with open(file_path, 'r', encoding='utf-8') as f:
            existing_data[lang] = json.load(f)

    # Counters for updates
    update_counters = {lang: 0 for lang in json_files.keys()}

    # Read Excel and update values
    for row in ws.iter_rows(min_row=2, values_only=True):  # Skip the header
        key = row[0]
        en_value = row[1] or None
        fr_value = row[2] or None
        nl_value = row[3] or None

        if key:
            # Update only if the value in Excel is not empty and different
            if en_value is not None and update_nested_key(existing_data["EN"], key, en_value):
                print(f"Updated Key: {key} | Language: EN")
                update_counters["EN"] += 1
            if fr_value is not None and update_nested_key(existing_data["FR"], key, fr_value):
                print(f"Updated Key: {key} | Language: FR")
                update_counters["FR"] += 1
            if nl_value is not None and update_nested_key(existing_data["NL"], key, nl_value):
                print(f"Updated Key: {key} | Language: NL")
                update_counters["NL"] += 1

    # Save the updated JSON files
    for lang, data in existing_data.items():
        with open(json_files[lang], 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print(f"{lang} JSON file updated: {json_files[lang]}")

    # Print update summary
    print("\nUpdate Summary:")
    for lang, count in update_counters.items():
        print(f"{lang}: {count} values updated")

def update_nested_key(data, key, value):
    """
    Update a nested key in a dictionary based on dotted notation.
    Returns True if the value was updated, False otherwise.
    """
    keys = key.split('.')
    for k in keys[:-1]:
        data = data.setdefault(k, {})
    if data.get(keys[-1]) != value:  # Update only if the value is different
        data[keys[-1]] = value
        return True
    return False

def main():
    json_files = {
        "EN": "/Users/wardvercruyssen/repos/react_dashboard/src/i18n/en.json",
        "FR": "/Users/wardvercruyssen/repos/react_dashboard/src/i18n/fr.json",
        "NL": "/Users/wardvercruyssen/repos/react_dashboard/src/i18n/nl.json"
    }

    try:
        update_json_from_excel("/Users/wardvercruyssen/Downloads/translations_dashboard_portal.xlsx", json_files)
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
