import csv
import random
import os

input_file = 'comprehensive_dataset.csv'
output_file = 'comprehensive_dataset_v2.csv'

# We'll extract unique treatments from the existing comprehensive dataset first
diseases_meta = []  # list of (field, disease, body_part)

print("Reading existing comprehensive dataset for treatments...")
if os.path.exists(input_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            field = row.get('Field / Specialty', '').strip()
            disease = row.get('Disease / Operation Treated', '').strip()
            body_part = row.get('Body Part Treated', '').strip()
            
            if field and disease and body_part:
                diseases_meta.append((field, disease, body_part))

diseases_meta = list(set(diseases_meta))

# Add minor diseases
diseases_meta.extend([
    ('General Medicine', 'Mild Fever', 'Whole Body'),
    ('General Medicine', 'Common Cold', 'Ear/Nose/Throat'),
    ('General Medicine', 'Cough', 'Ear/Nose/Throat'),
    ('General Medicine', 'Viral Fever', 'Whole Body')
])

# 100% Authentic Indian Names
indian_first_names = [
    "Rahul", "Amit", "Kavita", "Priya", "Sanjay", "Rakesh", "Neha", "Vikas", "Pooja", "Rajesh",
    "Anjali", "Suresh", "Meera", "Vikram", "Sneha", "Ramesh", "Deepa", "Sunil", "Anita", "Anand",
    "Swati", "Manoj", "Kiran", "Nitin", "Aarti", "Prakash", "Rekha", "Deepak", "Jyoti", "Pradeep",
    "Ritu", "Anil", "Meena", "Gaurav", "Sushma", "Arun", "Seema", "Vivek", "Nisha", "Ravi",
    "Shweta", "Tarun", "Komal", "Sandeep", "Preeti", "Gopal", "Divya", "Kamal", "Shikha", "Ashok",
    "Sonali", "Ajay", "Radha", "Vinay", "Sonal", "Mohit", "Richa", "Sumit", "Garima", "Prashant",
    "Smriti", "Vishal", "Pallavi", "Naveen", "Vandana", "Mahesh", "Bhavna", "Kishore", "Rachna", "Dinesh",
    "Sapna", "Mukesh", "Sarita", "Hemant", "Kirti", "Jitendra", "Shilpa", "Satish", "Archana", "Praveen",
    "Sangeeta", "Alok", "Mamta", "Navin", "Reena", "Manish", "Sunita", "Harish", "Asha", "Girish",
    "Geeta", "Yogesh", "Usha", "Parag", "Kusum", "Subhash", "Nandini", "Sameer", "Rupa", "Rajeev"
]

indian_last_names = [
    "Sharma", "Verma", "Gupta", "Patel", "Reddy", "Iyer", "Singh", "Kumar", "Das", "Bose",
    "Mukherjee", "Chatterjee", "Banerjee", "Sinha", "Mishra", "Jain", "Bhatia", "Mehta", "Chopra", "Kapur",
    "Desai", "Joshi", "Bhatt", "Pandey", "Tiwari", "Yadav", "Chauhan", "Rajput", "Rao", "Nair",
    "Pillai", "Menon", "Kurien", "Gowda", "Hegde", "Shenoy", "Kamath", "Prabhu", "Kulkarni", "Deshpande",
    "Jadhav", "Pawar", "Shinde", "Gaikwad", "Kadam", "Kale", "More", "Ahluwalia", "Gill", "Kaur",
    "Dhillon", "Sodhi", "Grewal", "Sandhu", "Brar", "Garg", "Agarwal", "Bansal", "Mittal", "Goyal",
    "Jindal", "Singhal", "Tayal", "Kansal", "Bindal", "Dixit", "Awasthi", "Tripathi", "Chaturvedi", "Shukla",
    "Upadhyay", "Pathak", "Dubey", "Goswami", "Saraswat", "Kashyap", "Bhardwaj", "Kaushik", "Vashisht", "Tyagi",
    "Nigam", "Mathur", "Saxena", "Srivastava", "Asthana", "Kulshrestha", "Bhatnagar", "Raj", "Babu", "Naidu",
    "Goud", "Chowdary", "Raju", "Varma", "Datta", "Nath", "Ghosh", "Sen", "Basu", "Ray"
]

middle_initials = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

def generate_unique_indian_names(count):
    names = []
    names_set = set()
    while len(names) < count:
        first = random.choice(indian_first_names)
        middle = random.choice(middle_initials)
        last = random.choice(indian_last_names)
        full_name = f"Dr. {first} {middle}. {last}"
        if full_name not in names_set:
            names_set.add(full_name)
            names.append(full_name)
    return names

exact_doctor_count = 100413
unique_names = generate_unique_indian_names(exact_doctor_count)
name_index = 0

# Hardcoded Indian states and cities to ensure 100% India coverage
indian_states_cities = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore'],
    'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Pasighat'],
    'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
    'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'],
    'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Mandi', 'Solan'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
    'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belagavi'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
    'Manipur': ['Imphal', 'Churachandpur'],
    'Meghalaya': ['Shillong', 'Tura'],
    'Mizoram': ['Aizawl', 'Lunglei'],
    'Nagaland': ['Kohima', 'Dimapur'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner'],
    'Sikkim': ['Gangtok', 'Namchi'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
    'Tripura': ['Agartala', 'Udaipur'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida', 'Prayagraj'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Rishikesh'],
    'West Bengal': ['Kolkata', 'Darjeeling', 'Siliguri', 'Asansol', 'Durgapur'],
    'Delhi': ['New Delhi', 'Delhi'],
    'Chandigarh': ['Chandigarh'],
    'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag']
}

hospital_names = ['Apollo Hospitals', 'Fortis Hospital', 'Max Super Speciality', 'Medanta', 'AIIMS', 'Care Hospitals', 'City Hospital', 'Global Hospital', 'Narayana Health', 'KIMS']
timings = ['09:00 AM - 01:00 PM', '10:00 AM - 02:00 PM', '02:00 PM - 06:00 PM', '04:00 PM - 08:00 PM', '06:00 PM - 10:00 PM']

# Generate comprehensive dataset
print(f"Generating new comprehensive dataset with {len(indian_states_cities)} states/UTs and {len(diseases_meta)} treatments...")
generated_rows = []

print(f"Generating base rows to select from...")
base_rows = []
for state, cities in indian_states_cities.items():
    for city in cities:
        for field, disease, body_part in diseases_meta:
            for hospital in hospital_names:
                for _ in range(5):
                    base_rows.append({
                        'Field / Specialty': field,
                        'Disease / Operation Treated': disease,
                        'Body Part Treated': body_part,
                        'Hospital Name': f"{hospital} {city}",
                        'City': city,
                        'State': state,
                        'Timing': random.choice(timings)
                    })

print(f"Total base rows generated: {len(base_rows)}")

# We strictly want exact_doctor_count rows
random.shuffle(base_rows)
final_rows = []

for i in range(exact_doctor_count):
    row = base_rows[i]
    row['Doctor Name'] = unique_names[i]
    final_rows.append(row)

print(f"Writing exactly {len(final_rows)} rows to {output_file}...")
with open(output_file, 'w', encoding='utf-8', newline='') as f:
    fieldnames = ['Doctor Name', 'Field / Specialty', 'Disease / Operation Treated', 'Body Part Treated', 'Hospital Name', 'City', 'State', 'Timing']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(final_rows)

# Rename to comprehensive_dataset.csv
os.replace(output_file, input_file)

print("Done! Comprehensive dataset generated successfully.")
