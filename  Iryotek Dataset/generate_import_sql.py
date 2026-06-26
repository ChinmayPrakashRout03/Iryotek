import csv
import random
import re
import os

csv_file = "/Users/chinmayprakashrout/Doctor-Patient-Portal-AdvanceJavaWebProject/Doctor-Patient-Portal-AdvanceJavaWebProject/indian_doctors_dataset.csv"
sql_file = "/Users/chinmayprakashrout/Doctor-Patient-Portal-AdvanceJavaWebProject/Doctor-Patient-Portal-AdvanceJavaWebProject/import_dataset.sql"

def clean_value(val):
    if not val:
        return ""
    return val.strip().replace("'", "\\'")

def get_qualification(field):
    field_lower = field.lower()
    if "cardiology" in field_lower:
        return "MD, DM (Cardiology)"
    elif "dermatology" in field_lower:
        return "MD (Dermatology)"
    elif "orthopedics" in field_lower:
        return "MS (Orthopedics)"
    elif "neurology" in field_lower:
        return "MD, DM (Neurology)"
    elif "pediatrics" in field_lower:
        return "MD (Pediatrics)"
    elif "ent" in field_lower:
        return "MS (ENT)"
    elif "ophthalmology" in field_lower:
        return "MS (Ophthalmology)"
    elif "gynecology" in field_lower:
        return "MS (Gynecology)"
    elif "psychiatry" in field_lower:
        return "MD (Psychiatry)"
    elif "pulmonology" in field_lower:
        return "MD (Pulmonology)"
    elif "oncology" in field_lower:
        return "MD, DM (Oncology)"
    elif "radiology" in field_lower:
        return "MD (Radiology)"
    elif "rheumatology" in field_lower:
        return "MD (Rheumatology)"
    elif "nephrology" in field_lower:
        return "MD, DM (Nephrology)"
    elif "urology" in field_lower:
        return "MS, MCh (Urology)"
    elif "anesthesiology" in field_lower:
        return "MD (Anesthesiology)"
    elif "surgery" in field_lower:
        return "MS (General Surgery)"
    elif "medicine" in field_lower:
        return "MD (General Medicine)"
    else:
        return "MBBS, MD"

def generate_sql():
    if not os.path.exists(csv_file):
        print(f"Error: CSV file not found at {csv_file}")
        return

    # To track and generate unique specialists and hospitals
    specialists = set()
    hospitals = {}  # key: (name, city, state) -> id
    hospital_list = []  # list of tuples: (id, name, city, state, address, phone)
    doctors = []
    
    used_emails = set()
    phone_counter = 9000000001
    hospital_counter = 1

    with open(csv_file, mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        # Skip header
        header = next(reader)
        
        for row in reader:
            if not row or len(row) < 5:
                continue
                
            doc_name = row[0].strip()
            hosp_name = row[1].strip()
            field = row[2].strip()
            state = row[3].strip()
            city = row[4].strip()
            
            if not doc_name or not hosp_name or not field:
                continue
                
            # Add to specialists set
            specialists.add(field)
            
            # Map hospital
            hosp_key = (hosp_name, city, state)
            if hosp_key not in hospitals:
                hosp_id = hospital_counter
                hospitals[hosp_key] = hosp_id
                
                # Mock address & phone
                address = f"{hosp_name}, {city}, {state}"
                phone = f"0{random.randint(10, 99)}-{random.randint(1000000, 9999999)}"
                
                hospital_list.append((hosp_id, hosp_name, address, city, state, phone))
                hospital_counter += 1
            else:
                hosp_id = hospitals[hosp_key]
                
            # Clean doctor name for email
            clean_name = re.sub(r'^(Dr\.\s*|Dr\s+)', '', doc_name, flags=re.IGNORECASE)
            email_base = clean_name.lower().replace(' ', '.').replace('..', '.')
            # Keep alphanumeric and dot
            email_base = re.sub(r'[^a-z0-9\.]', '', email_base)
            
            email = f"{email_base}@hospital.com"
            dup_suffix = 1
            while email in used_emails:
                email = f"{email_base}{dup_suffix}@hospital.com"
                dup_suffix += 1
            used_emails.add(email)
            
            # Mock DOB
            year = random.randint(1970, 1992)
            month = random.randint(1, 12)
            day = random.randint(1, 28)
            dob = f"{year}-{month:02d}-{day:02d}"
            
            # Mock phone
            doc_phone = str(phone_counter)
            phone_counter += 1
            
            qualification = get_qualification(field)
            
            doctors.append({
                'fullName': doc_name,
                'dateOfBirth': dob,
                'qualification': qualification,
                'specialist': field,
                'email': email,
                'phone': doc_phone,
                'password': 'doctor123',
                'hospitalId': hosp_id
            })

    # Output SQL statements
    with open(sql_file, mode='w', encoding='utf-8') as f:
        f.write("-- ============================================\n")
        f.write("-- Seeding large Indian Doctors & Hospitals dataset\n")
        f.write("-- ============================================\n\n")
        f.write("USE hospital;\n\n")
        f.write("SET FOREIGN_KEY_CHECKS = 0;\n")
        f.write("TRUNCATE TABLE appointment;\n")
        f.write("TRUNCATE TABLE doctor;\n")
        f.write("TRUNCATE TABLE hospital;\n")
        f.write("TRUNCATE TABLE specialist;\n")
        f.write("SET FOREIGN_KEY_CHECKS = 1;\n\n")
        
        # Insert specialists
        f.write("-- Insert Specialists\n")
        for sp in sorted(list(specialists)):
            f.write(f"INSERT INTO specialist (specialist_name) VALUES ('{clean_value(sp)}');\n")
        f.write("\n")
        
        # Insert hospitals
        f.write("-- Insert Hospitals\n")
        for h in hospital_list:
            f.write(f"INSERT INTO hospital (id, name, address, city, state, phone) VALUES ({h[0]}, '{clean_value(h[1])}', '{clean_value(h[2])}', '{clean_value(h[3])}', '{clean_value(h[4])}', '{clean_value(h[5])}');\n")
        f.write("\n")
        
        # Insert doctors
        f.write("-- Insert Doctors\n")
        for d in doctors:
            f.write(f"INSERT INTO doctor (fullName, dateOfBirth, qualification, specialist, email, phone, password, hospitalId) VALUES ('{clean_value(d['fullName'])}', '{d['dateOfBirth']}', '{clean_value(d['qualification'])}', '{clean_value(d['specialist'])}', '{clean_value(d['email'])}', '{d['phone']}', '{d['password']}', {d['hospitalId']});\n")
        f.write("\n")
        
        f.write("SELECT 'Seed completed successfully!' AS Status;\n")
        f.write(f"SELECT CONCAT(COUNT(*), ' specialists inserted') AS Specialists FROM specialist;\n")
        f.write(f"SELECT CONCAT(COUNT(*), ' hospitals inserted') AS Hospitals FROM hospital;\n")
        f.write(f"SELECT CONCAT(COUNT(*), ' doctors inserted') AS Doctors FROM doctor;\n")

    print(f"Generated SQL file with {len(specialists)} specialists, {len(hospital_list)} hospitals, and {len(doctors)} doctors.")

if __name__ == "__main__":
    generate_sql()
