import json

def flatten_json(data, parent_key='', result={}):
    for key, value in data.items():
        full_key = f"{parent_key}.{key}" if parent_key else key
        if isinstance(value, dict):
            flatten_json(value, full_key, result)
        else:
            result[full_key] = value
    return result

def main():
    input_file = input("Enter the path to the input JSON file: ")
    output_file = input("Enter the path for the output flattened JSON file: ")

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    flat_data = flatten_json(data)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(flat_data, f, indent=4, ensure_ascii=False)

    print(f"Flattened JSON saved to {output_file}")

if __name__ == "__main__":
    main()
