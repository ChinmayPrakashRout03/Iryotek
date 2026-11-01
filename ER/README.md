# IRYOTEK: Entity-Relationship (ER) Architecture & Relational Schema Specification

**System Database:** `hospital` (MySQL 8.0 Community Server / InnoDB Engine)  
**Schema Architecture:** Third Normal Form (3NF) Relational Topology  
**Referential Integrity:** Enforced via Foreign Keys with `ON DELETE CASCADE` / `RESTRICT`  
**Generated Visual Artifacts:**
- **High-Resolution PNG (8955 × 5986 px, 300 DPI):** [`Iryotek_ER_Diagram.png`](./Iryotek_ER_Diagram.png)
- **Vector PDF (Resolution-Independent Print Format):** [`Iryotek_ER_Diagram.pdf`](./Iryotek_ER_Diagram.pdf)

---

## 1. Relational Entity Taxonomy & Functional Modules

The database schema is organized into five tightly cohesive, loosely coupled functional modules:

```
+---------------------------------------------------------------------------------------------------------+
|                                  IRYOTEK RELATIONAL SCHEMA DOMAINS                                      |
+--------------------------+------------------------------+-----------------------------------------------+
| Domain                   | Key Tables                   | Clinical & Business Purpose                   |
+--------------------------+------------------------------+-----------------------------------------------+
| 1. Core Clinical & OPD   | user_details, doctor,        | Doctor directory, specialist classification,  |
|                          | hospital, specialist,        | hospital affiliations, 15-min queue tokens.   |
|                          | appointment                  |                                               |
+--------------------------+------------------------------+-----------------------------------------------+
| 2. Smart Prescription &  | prescription,                | Clinical prescription headers, parsed lines,  |
|    Pharmacy Dispensing   | prescription_medicine,       | dispensing verification queue, and immutable  |
|                          | pharmacy_dispensing_request, | audit log.                                    |
|                          | pharmacy_audit_log, medicine |                                               |
+--------------------------+------------------------------+-----------------------------------------------+
| 3. Pharmacy E-Commerce   | cart, cart_item,             | Patient shopping cart, delivery addresses,    |
|    & Logistics           | user_address,                | medicine order headers, line items, and       |
|                          | medicine_order,              | payment tracking.                             |
|                          | medicine_order_item          |                                               |
+--------------------------+------------------------------+-----------------------------------------------+
| 4. EHR, Diagnostics &    | patient_profile,             | Patient demographics, emergency contacts,     |
|    AI Triage             | patient_vitals,              | time-series biometric vitals, medical history,|
|                          | patient_medical_history,     | lab documents, and AI triage findings.        |
|                          | patient_document,            |                                               |
|                          | ai_differential_diagnosis    |                                               |
+--------------------------+------------------------------+-----------------------------------------------+
| 5. Health Insurance &    | patient_insurance,           | Cashless policy cards, network coverage,      |
|    Claims Settlement     | insurance_claim              | in-app claim submission, and adjudication.    |
+--------------------------+------------------------------+-----------------------------------------------+
```

---

## 2. Comprehensive Entity Data Dictionary

### 2.1 Core Clinical & Outpatient Consultation Module
* **`user_details`**: Patient account credentials.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `full_name` (VARCHAR(100)): Patient full name
  - `email` (VARCHAR(100), UNIQUE): Login credential
  - `password` (VARCHAR(100)): Salted BCrypt password hash
* **`hospital`**: Network hospital directory.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `name` (VARCHAR(200)): Healthcare facility name
  - `address` (VARCHAR(500)), `city` (VARCHAR(100)), `state` (VARCHAR(100))
  - `phone` (VARCHAR(20)): Emergency / reception contact
* **`specialist`**: Clinical departments.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `specialist_name` (VARCHAR(100)): Medical specialty (Cardiology, Neurology, Pediatrics, etc.)
* **`doctor`**: Clinicians and specialists.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `fullName` (VARCHAR(100)), `qualification` (VARCHAR(100)), `specialist` (VARCHAR(100))
  - `email` (VARCHAR(100), UNIQUE), `phone` (VARCHAR(20)), `password` (VARCHAR(100))
  - `hospitalId` (INT, FK $\rightarrow$ `hospital.id`)
  - `timing` (VARCHAR(100)), `diseases` (VARCHAR(255))
* **`appointment`**: Outpatient consultation bookings & queue tickets.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `userId` (INT, FK $\rightarrow$ `user_details.id`)
  - `doctorId` (INT, FK $\rightarrow$ `doctor.id`)
  - `tokenNo` (INT): Real-time queue token number
  - `appointmentDate` (VARCHAR(50)), `appointmentTime` (VARCHAR(50))
  - `status` (VARCHAR(50)): `PENDING`, `CONFIRMED`, `IN_CONSULTATION`, `COMPLETED`, `CANCELLED`
  - `diseases` (VARCHAR(255)), `fullName` (VARCHAR(100)), `phone` (VARCHAR(20)), `age` (VARCHAR(10))

---

### 2.2 Smart Prescription & Pharmacy Dispensing Module
* **`medicine`**: Central pharmaceutical formulary and catalog.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `name` (VARCHAR(200)), `category` (VARCHAR(100)), `dosage_form` (VARCHAR(100))
  - `price` (DOUBLE), `stock` (INT), `description` (TEXT), `image_url` (VARCHAR(500))
* **`prescription`**: Doctor clinical prescription header.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `appointment_id` (INT, FK $\rightarrow$ `appointment.id`)
  - `user_id` (INT, FK $\rightarrow$ `user_details.id`)
  - `doctor_id` (INT, FK $\rightarrow$ `doctor.id`)
  - `created_at` (TIMESTAMP), `remarks` (TEXT), `status` (VARCHAR(50))
* **`prescription_medicine`**: Individual parsed prescription lines.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `prescription_id` (INT, FK $\rightarrow$ `prescription.id`)
  - `medicine_id` (INT, FK $\rightarrow$ `medicine.id`)
  - `medicine_name` (VARCHAR(200)), `strength` (VARCHAR(100)), `dosage_form` (VARCHAR(100))
  - `units_per_dose` (DOUBLE), `frequency` (VARCHAR(100)), `duration_days` (INT)
  - `calculated_quantity` (INT): Computed via $Units \times Doses \times Duration$
* **`pharmacy_dispensing_request`**: Active hospital dispensing fulfillment queue.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `prescription_id` (INT, FK $\rightarrow$ `prescription.id`)
  - `medicine_id` (INT, FK $\rightarrow$ `medicine.id`)
  - `patient_id` (INT, FK $\rightarrow$ `user_details.id`), `doctor_id` (INT, FK $\rightarrow$ `doctor.id`)
  - `calculated_quantity` (INT), `quantity_dispensed` (INT), `quantity_remaining` (INT)
  - `status` (VARCHAR(50)): `PENDING`, `PARTIALLY_DISPENSED`, `DISPENSED`, `SHORTAGE_REVIEW`
  - `idempotency_key` (VARCHAR(100), UNIQUE)
* **`pharmacy_audit_log`**: Tamper-evident dispensary stock ledger.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `dispensing_request_id` (INT, FK $\rightarrow$ `pharmacy_dispensing_request.id`)
  - `medicine_id` (INT, FK $\rightarrow$ `medicine.id`)
  - `pharmacist_id` (INT), `action` (VARCHAR(50))
  - `quantity_dispensed` (INT), `previous_stock` (INT), `new_stock` (INT)
  - `timestamp` (TIMESTAMP), `idempotency_key` (VARCHAR(100))

---

### 2.3 Pharmacy Orders & Logistics Module
* **`cart`**: Patient shared shopping cart header.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `user_id` (INT, UNIQUE, FK $\rightarrow$ `user_details.id`)
  - `updated_at` (TIMESTAMP)
* **`cart_item`**: Line items within active cart.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `cart_id` (INT, FK $\rightarrow$ `cart.id`)
  - `medicine_id` (INT, FK $\rightarrow$ `medicine.id`)
  - `quantity` (INT), `dosage_instructions` (VARCHAR(255)), `source` (`PRESCRIPTION` / `MANUAL`)
* **`user_address`**: Patient shipping geolocations.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `user_id` (INT, FK $\rightarrow$ `user_details.id`)
  - `full_name` (VARCHAR(100)), `phone` (VARCHAR(20)), `street_address` (VARCHAR(500))
  - `city` (VARCHAR(100)), `state` (VARCHAR(100)), `pincode` (VARCHAR(20))
* **`medicine_order`**: Completed e-commerce purchases.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `order_number` (VARCHAR(100), UNIQUE)
  - `user_id` (INT, FK $\rightarrow$ `user_details.id`), `address_id` (INT, FK $\rightarrow$ `user_address.id`)
  - `total_amount` (DOUBLE), `payment_method` (VARCHAR(50)), `payment_status` (VARCHAR(50))
  - `order_status` (VARCHAR(50)): `Pending`, `Confirmed`, `Preparing`, `Out for Delivery`, `Delivered`
* **`medicine_order_item`**: Order lines ledger.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `order_id` (INT, FK $\rightarrow$ `medicine_order.id`), `medicine_id` (INT, FK $\rightarrow$ `medicine.id`)
  - `price` (DOUBLE), `quantity` (INT), `subtotal` (DOUBLE)

---

### 2.4 EHR, Diagnostics & Cognitive AI Module
* **`patient_profile`**: Extended demographic records.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `user_id` (INT, FK $\rightarrow$ `user_details.id`)
  - `date_of_birth` (VARCHAR(50)), `gender` (VARCHAR(20)), `blood_group` (VARCHAR(10))
  - `emergency_contact_name` (VARCHAR(100)), `emergency_contact_phone` (VARCHAR(20))
* **`patient_vitals`**: Time-series clinical physiological tracking.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `user_id` (INT, FK $\rightarrow$ `user_details.id`)
  - `recorded_date` (VARCHAR(50))
  - `heart_rate` (INT), `blood_pressure_systolic` (INT), `blood_pressure_diastolic` (INT)
  - `oxygen_saturation` (INT), `blood_glucose` (INT), `temperature` (DOUBLE)
* **`patient_medical_history`**: Allergies, surgeries, and chronic ailments.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `user_id` (INT, FK $\rightarrow$ `user_details.id`)
  - `category` (VARCHAR(50)): `ALLERGY`, `CHRONIC_CONDITION`, `SURGERY`
  - `title` (VARCHAR(200)), `diagnosed_year` (VARCHAR(50)), `description` (TEXT)
* **`patient_document`**: Medical scans, blood tests, and EHR uploads.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `user_id` (INT, FK $\rightarrow$ `user_details.id`)
  - `document_name` (VARCHAR(255)), `document_type` (VARCHAR(100)), `file_path` (VARCHAR(500))
* **`ai_differential_diagnosis`**: AI triage records and emergency categorization.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `user_id` (INT, FK $\rightarrow$ `user_details.id`), `appointment_id` (INT, FK $\rightarrow$ `appointment.id`)
  - `symptoms` (TEXT), `urgency_level` (VARCHAR(50)): `GREEN`, `YELLOW`, `RED`
  - `diagnoses_json` (TEXT / JSON), `clinical_notes` (TEXT)

---

### 2.5 Health Insurance & Claims Module
* **`patient_insurance`**: Cashless insurance policy registry.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `user_id` (INT, FK $\rightarrow$ `user_details.id`)
  - `provider_name` (VARCHAR(150)), `policy_number` (VARCHAR(100))
  - `sum_insured` (DOUBLE), `deductible_total` (DOUBLE), `status` (`ACTIVE`)
* **`insurance_claim`**: Insurance claim adjudication and settlement.
  - `id` (INT, PK, AUTO_INCREMENT)
  - `claim_number` (VARCHAR(50), UNIQUE)
  - `user_id` (INT, FK $\rightarrow$ `user_details.id`), `insurance_id` (INT, FK $\rightarrow$ `patient_insurance.id`)
  - `total_billed_amount` (DOUBLE), `insurance_covered_amount` (DOUBLE)
  - `claim_status` (VARCHAR(50)): `PENDING_REVIEW`, `APPROVED`, `SETTLED`, `REJECTED`

---

## 3. Referential Integrity & Relationship Constraints

| Source Entity | Foreign Key Column | Target Entity | Cardinality | Business Constraint / Rule |
|---|---|---|---|---|
| `doctor` | `hospitalId` | `hospital(id)` | $N : 1$ | A doctor belongs to exactly one primary hospital. |
| `appointment` | `userId` | `user_details(id)` | $N : 1$ | A patient can book multiple appointments over time. |
| `appointment` | `doctorId` | `doctor(id)` | $N : 1$ | Multiple appointments are scheduled with a specialist doctor. |
| `prescription` | `appointment_id` | `appointment(id)` | $1 : 1$ | Each appointment generates at most one official clinical prescription. |
| `prescription_medicine` | `prescription_id` | `prescription(id)` | $N : 1$ | A prescription contains multiple prescribed medicine dosage lines. |
| `prescription_medicine` | `medicine_id` | `medicine(id)` | $N : 1$ | Each prescribed item references a certified catalog medicine. |
| `pharmacy_dispensing_request` | `prescription_id`| `prescription(id)` | $N : 1$ | Pharmacy dispensing orders are created from validated prescriptions. |
| `pharmacy_audit_log` | `dispensing_request_id`| `pharmacy_dispensing_request(id)`| $N : 1$ | Every physical medication disbursement creates an immutable audit row. |
| `cart` | `user_id` | `user_details(id)` | $1 : 1$ | Each registered patient maintains one active persistent cart. |
| `cart_item` | `cart_id` | `cart(id)` | $N : 1$ | A cart holds multiple prescribed or over-the-counter medicine items. |
| `medicine_order` | `user_id` | `user_details(id)` | $N : 1$ | A patient can place multiple medicine delivery orders. |
| `medicine_order_item` | `order_id` | `medicine_order(id)` | $N : 1$ | Order items represent the line-item inventory purchase breakdown. |
| `patient_vitals` | `user_id` | `user_details(id)` | $N : 1$ | Chronological biometric time-series recordings linked to the patient. |
| `patient_insurance` | `user_id` | `user_details(id)` | $1 : 1$ | Primary active policy profile linked to the patient. |
| `insurance_claim` | `insurance_id` | `patient_insurance(id)` | $N : 1$ | Multiple clinical claims can be filed against one insurance policy. |

---

## 4. Normalization & Indexing Strategy

1. **Third Normal Form (3NF) Compliance:**
   - Every non-key attribute depends strictly on the primary key, the whole primary key, and nothing but the primary key ($X \rightarrow Y$ holds without transitive dependencies).
   - Doctor hospital affiliations and appointment prescriptions are cleanly segregated from patient tables to prevent update and deletion anomalies.
2. **Indexing & Query Performance:**
   - B-Tree indexes on `appointment(userId)`, `appointment(doctorId)`, `appointment(appointmentDate)` for fast queue calculations.
   - B-Tree index on `patient_vitals(user_id)` for high-speed chronological charting.
   - Unique constraints on `user_details(email)`, `medicine_order(order_number)`, `insurance_claim(claim_number)`, and `pharmacy_dispensing_request(idempotency_key)` to guarantee idempotency and avoid duplicate disbursements.

