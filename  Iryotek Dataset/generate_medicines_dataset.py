#!/usr/bin/env python3
"""
generate_medicines_dataset.py

Merges and formats medicine datasets from:
1. druglist.numbers / druglist_exported.csv (23,398 medicines)
2. medicines.csv (23,939 medicines from Netmeds)

Places ALL medicines WITH photos at the very top of the database (IDs 1 through ~2,185)
so that user sees real product images first across the first 91+ pages.
"""

import csv
import os
import random
import re
import shutil
import subprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))

MEDICINES_CSV = os.path.join(BASE_DIR, "medicines.csv")
DRUGLIST_NUMBERS = os.path.join(BASE_DIR, "druglist.numbers")
DRUGLIST_CSV = os.path.join(BASE_DIR, "druglist_exported.csv")

TARGET_SQL_IRYOTEK = os.path.join(PROJECT_ROOT, "Iryotek", "import_dataset_medicines.sql")
INIT_SCRIPTS_DIR = os.path.join(PROJECT_ROOT, "init-scripts")
INIT_SCHEMA_PHARMACY = os.path.join(INIT_SCRIPTS_DIR, "3_schema_pharmacy.sql")
INIT_IMPORT_MEDICINES = os.path.join(INIT_SCRIPTS_DIR, "4_import_medicines.sql")
SCHEMA_PHARMACY_SOURCE = os.path.join(PROJECT_ROOT, "Iryotek", "schema_pharmacy.sql")

def ensure_druglist_csv():
    """Ensure druglist_exported.csv is present or export it via osascript from druglist.numbers."""
    if os.path.exists(DRUGLIST_CSV) and os.path.getsize(DRUGLIST_CSV) > 1000:
        print(f"Found existing {DRUGLIST_CSV}")
        return True

    if os.path.exists(DRUGLIST_NUMBERS):
        print(f"Exporting {DRUGLIST_NUMBERS} to CSV via Numbers AppleScript...")
        apple_script = f'''
        tell application "Numbers"
            open POSIX file "{DRUGLIST_NUMBERS}"
            set doc to front document
            export doc to POSIX file "{DRUGLIST_CSV}" as CSV
            close doc saving no
        end tell
        '''
        res = subprocess.run(["osascript", "-e", apple_script], capture_output=True, text=True)
        if res.returncode == 0 and os.path.exists(DRUGLIST_CSV):
            print("Successfully exported druglist.numbers to CSV.")
            return True
        else:
            print("Error exporting Numbers file:", res.stderr)
    return False

def clean_sql_str(val):
    if not val:
        return ""
    # Escape backslashes, then single quotes, remove null bytes and control chars
    val = val.replace("\\", "\\\\").replace("'", "\\'").replace("\x00", "").replace("\r", " ").replace("\n", " ")
    return val.strip()

def clean_title(s):
    if not s:
        return ""
    words = s.split()
    return " ".join(w.capitalize() if not (w.isupper() and len(w) <= 4) else w for w in words)

def format_category(cat):
    if not cat or not cat.strip():
        return "General Medicine"
    cat = cat.replace(".", " - ").strip()
    cat = " ".join(word.capitalize() for word in cat.split())
    # Clean common medical abbreviations
    cat = re.sub(r"\bNsaid\b", "NSAID", cat, flags=re.IGNORECASE)
    cat = re.sub(r"\bAdhd\b", "ADHD", cat, flags=re.IGNORECASE)
    cat = re.sub(r"\bEnt\b", "ENT", cat, flags=re.IGNORECASE)
    cat = re.sub(r"\bCns\b", "CNS", cat, flags=re.IGNORECASE)
    cat = re.sub(r"\bGi\b", "GI", cat, flags=re.IGNORECASE)
    cat = re.sub(r"\bIv\b", "IV", cat, flags=re.IGNORECASE)
    return cat[:100]

def map_dosage_form(raw_form, route=""):
    f = (raw_form or "").lower().strip()
    r = (route or "").lower().strip()

    # Check injection / vial / ampoule first
    if re.search(r"\b(injection|inj|vial|ampoule|amp|syringe|infusion|iv|i\.v\.|i\.m\.)\b", f) or "injection" in r:
        return "Injection"
    # Drops
    if re.search(r"\b(eye\s*drops?|ear\s*drops?|oral\s*drops?|drops?|nasal\s*drops?)\b", f):
        return "Drops"
    # Inhaler / Spray
    if re.search(r"\b(spray|inhaler|inhalation|nasal\s*spray|respules?|aerosol)\b", f) or "inhalation" in r:
        return "Inhaler"
    # Capsule
    if re.search(r"\b(capsules?|caps?|softgels?)\b", f):
        return "Capsule"
    # Syrup / Liquid / Suspension
    if re.search(r"\b(syrups?|syr|suspension|susp|solution|sol|liquid|elixir|mouthwash|emulsion|rinse|lotion)\b", f) or "liquid" in r:
        return "Syrup"
    # Ointment / Cream / Gel
    if re.search(r"\b(cream|creams|gels?|ointments?|oint|balm|paste|topical|shampoo|soap|face\s*wash|wash)\b", f) or "topical" in r:
        return "Ointment"
    # Powder / Sachet
    if re.search(r"\b(powders?|sachets?|granules?|effervescent|eff)\b", f) or "eff" in r:
        return "Powder"
    # Tablet / Tab
    if re.search(r"\b(tablets?|tabs?|pills?|lozenges?|pellets?)\b", f) or "solid" in r:
        return "Tablet"

    return "Tablet"

def get_default_image_url(dosage_form):
    form_key = (dosage_form or "default").lower()
    valid_forms = ["tablet", "capsule", "syrup", "ointment", "injection", "drops", "inhaler", "powder"]
    if form_key not in valid_forms:
        form_key = "default"
    return f"img/medicines/{form_key}.svg"

def parse_druglist_csv():
    medicines = []
    if not os.path.exists(DRUGLIST_CSV):
        print(f"Warning: {DRUGLIST_CSV} not found.")
        return medicines

    print(f"Reading {DRUGLIST_CSV}...")
    with open(DRUGLIST_CSV, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.reader(f)
        for r in reader:
            if len(r) < 2 or not r[1].strip():
                continue

            name = clean_title(r[1].strip())
            cat_raw = r[7] if len(r) > 7 else ""
            cat = format_category(cat_raw)
            form_raw = f"{r[9] if len(r) > 9 else ''} {name}"
            route_raw = r[12] if len(r) > 12 else ""
            df = map_dosage_form(form_raw, route_raw)

            p_val = r[4].strip() if len(r) > 4 and r[4].strip() else (r[3].strip() if len(r) > 3 else "")
            try:
                price = float(p_val)
                if price <= 0 or price > 100000:
                    price = round(random.uniform(40.0, 350.0), 2)
            except:
                price = round(random.uniform(40.0, 350.0), 2)

            desc_parts = []
            if len(r) > 5 and r[5].strip():
                desc_parts.append(f"Active Ingredient: {r[5].strip()}")
            if len(r) > 8 and r[8].strip():
                desc_parts.append(f"Manufacturer: {r[8].strip().title()}")
            if len(r) > 12 and r[12].strip():
                desc_parts.append(f"Route: {r[12].strip()}")
            if len(r) > 13 and r[13].strip():
                desc_parts.append(r[13].strip()[:800])
            desc = ". ".join(desc_parts)

            img_raw = r[6].strip() if len(r) > 6 else ""
            if img_raw.startswith("http://") or img_raw.startswith("https://"):
                img = img_raw
            else:
                img = get_default_image_url(df)

            stock = random.randint(50, 150)

            medicines.append({
                "name": name[:200],
                "category": cat[:100],
                "description": desc[:2000],
                "price": round(price, 2),
                "stock": stock,
                "dosage_form": df[:100],
                "image_url": img[:500]
            })

    print(f"Loaded {len(medicines)} medicines from druglist.numbers / CSV")
    return medicines

def parse_medicines_csv():
    medicines = []
    if not os.path.exists(MEDICINES_CSV):
        print(f"Warning: {MEDICINES_CSV} not found.")
        return medicines

    print(f"Reading {MEDICINES_CSV}...")
    with open(MEDICINES_CSV, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        for r in reader:
            name = r.get("med_name", "").strip()
            if not name:
                continue

            disease = r.get("disease_name", "").strip()
            disease_clean = re.sub(r"\s*\(\d+\)$", "", disease).strip() or "General Healthcare"
            category = format_category(disease_clean)

            price_str = r.get("final_price", "").strip()
            price_match = re.search(r"[\d,]+(?:\.\d+)?", price_str.replace(",", ""))
            try:
                price = float(price_match.group(0)) if price_match else 50.0
                if price <= 0:
                    price = 50.0
            except:
                price = 50.0

            form_hint = f"{r.get('drug_varient', '')} {name}"
            dosage_form = map_dosage_form(form_hint, "")

            desc_parts = []
            gen = r.get("generic_name", "").strip()
            if gen:
                desc_parts.append(gen)
            content = r.get("drug_content", "").strip()
            if content:
                desc_parts.append(content[:400])
            mfg = r.get("drug_manufacturer", "").strip().lstrip("*").strip()
            if mfg:
                desc_parts.append(mfg)
            desc = ". ".join(desc_parts)

            img = get_default_image_url(dosage_form)
            stock = random.randint(60, 150)

            medicines.append({
                "name": name[:200],
                "category": category[:100],
                "description": desc[:2000],
                "price": round(price, 2),
                "stock": stock,
                "dosage_form": dosage_form[:100],
                "image_url": img[:500]
            })

    print(f"Loaded {len(medicines)} medicines from medicines.csv")
    return medicines

def write_sql_file(medicines, output_path, batch_size=1000):
    print(f"Writing {len(medicines)} medicines to {output_path} (batch size: {batch_size})...")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("-- ============================================\n")
        f.write("-- Complete Unified Medicine Inventory Dataset\n")
        f.write(f"-- Total Medicines: {len(medicines)}\n")
        f.write("-- ============================================\n\n")
        f.write("USE hospital;\n\n")
        f.write("SET FOREIGN_KEY_CHECKS = 0;\n")
        f.write("TRUNCATE TABLE cart_item;\n")
        f.write("TRUNCATE TABLE prescription_medicine;\n")
        f.write("TRUNCATE TABLE medicine_order_item;\n")
        f.write("TRUNCATE TABLE medicine;\n")
        f.write("SET FOREIGN_KEY_CHECKS = 1;\n\n")

        for i in range(0, len(medicines), batch_size):
            batch = medicines[i:i + batch_size]
            f.write("INSERT INTO medicine (name, category, description, price, stock, dosage_form, image_url) VALUES\n")
            value_lines = []
            for m in batch:
                name = clean_sql_str(m["name"])
                cat = clean_sql_str(m["category"])
                desc = clean_sql_str(m["description"])
                df = clean_sql_str(m["dosage_form"])
                img = clean_sql_str(m["image_url"])
                line = f"('{name}', '{cat}', '{desc}', {m['price']:.2f}, {m['stock']}, '{df}', '{img}')"
                value_lines.append(line)
            f.write(",\n".join(value_lines))
            f.write(";\n\n")

        f.write("SELECT CONCAT(COUNT(*), ' medicines loaded successfully') AS Inventory_Status FROM medicine;\n")

    print(f"Successfully generated {output_path} ({os.path.getsize(output_path) / (1024*1024):.2f} MB)")

def main():
    ensure_druglist_csv()
    druglist_meds = parse_druglist_csv()
    netmeds_meds = parse_medicines_csv()

    # Deduplicate by name if any
    seen_names = set()
    all_raw_meds = []

    for m in druglist_meds:
        key = m["name"].strip().lower()
        if key not in seen_names:
            seen_names.add(key)
            all_raw_meds.append(m)

    for m in netmeds_meds:
        key = m["name"].strip().lower()
        if key not in seen_names:
            seen_names.add(key)
            all_raw_meds.append(m)

    # Sort so that ALL medicines with real photo URLs appear FIRST!
    photo_meds = [m for m in all_raw_meds if m["image_url"].startswith("http://") or m["image_url"].startswith("https://")]
    svg_meds = [m for m in all_raw_meds if not (m["image_url"].startswith("http://") or m["image_url"].startswith("https://"))]

    unified_meds = photo_meds + svg_meds

    print(f"\n==========================================")
    print(f"Medicines WITH Photos (FIRST): {len(photo_meds)}")
    print(f"Medicines with SVG Icons (THEN): {len(svg_meds)}")
    print(f"Total Unified Medicines: {len(unified_meds)}")
    print(f"==========================================\n")

    # 1. Write to Iryotek/import_dataset_medicines.sql
    write_sql_file(unified_meds, TARGET_SQL_IRYOTEK)

    # 2. Ensure init-scripts has pharmacy schema and import script for Docker
    if os.path.exists(SCHEMA_PHARMACY_SOURCE):
        shutil.copy(SCHEMA_PHARMACY_SOURCE, INIT_SCHEMA_PHARMACY)
        print(f"Copied pharmacy schema to {INIT_SCHEMA_PHARMACY}")

    write_sql_file(unified_meds, INIT_IMPORT_MEDICINES)

    print("\nAll SQL files successfully created and updated!")

if __name__ == "__main__":
    main()
