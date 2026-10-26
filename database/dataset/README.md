# Iryotek Dataset

This directory contains the medical database and prescription datasets for the Iryotek Hospital Management & Consultation System.

### Dataset Files
- `medicines.csv.gz`: The complete medicines database compressed (16MB). 
  - To extract the raw CSV:
    ```bash
    gunzip -k medicines.csv.gz
    ```
- `comprehensive_dataset.csv`: Cleaned and formatted dataset for medicine lookups and recommendations.
- `druglist_exported.csv`: Drug interaction and classification data.
- `import_dataset.sql`: SQL scripts for bulk database ingestion into MySQL.
- `generate_medicines_dataset.py`, `generate_comprehensive_csv.py`, `generate_import_sql.py`: Data processing scripts.
