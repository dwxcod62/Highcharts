import argparse
import json

key = ["scenario", "year", "demand_type", "entity", "origin", "quantity_shipped"]


def main(name_file):
    with open("data/Supply/data.json", "r") as file:
        json_data = json.load(file)

    long_format_data = []

    keys = key
    num_entries = len(json_data[keys[0]])

    for i in range(num_entries):
        entry = {f"{key}": json_data[key][i] for key in keys}
        long_format_data.append(entry)

    with open(f"{name_file}.json", "w") as file:
        json.dump(long_format_data, file, indent=4)

    print("Conversion complete...")


if __name__ == "__main__":
    main("done")
