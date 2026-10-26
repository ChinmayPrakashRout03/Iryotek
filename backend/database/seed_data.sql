-- ============================================
-- Iryotek Portal — Database Seed Script
-- ============================================
-- Run this script after creating the 'hospital' database
-- Usage: mysql -u root -p hospital < seed_data.sql
-- ============================================

USE hospital;

-- 1. Create hospital table
CREATE TABLE IF NOT EXISTS hospital (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    phone VARCHAR(20)
);

-- 2. Add hospitalId column to doctor table (if not exists)
-- First check and add column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'hospital' AND TABLE_NAME = 'doctor' AND COLUMN_NAME = 'hospitalId');

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE doctor ADD COLUMN hospitalId INT DEFAULT NULL', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Insert Specialists
INSERT IGNORE INTO specialist (specialist_name) VALUES 
('General Medicine'),
('Cardiology'),
('Dermatology'),
('Orthopedics'),
('Neurology'),
('Pediatrics'),
('ENT'),
('Ophthalmology'),
('Gynecology'),
('Psychiatry');

-- 4. Insert Hospitals (10 hospitals across Indian states/cities)
INSERT INTO hospital (name, address, city, state, phone) VALUES
('AIIMS Bhubaneswar', 'Sijua, Patrapada, Bhubaneswar', 'Bhubaneswar', 'Odisha', '0674-2476001'),
('KIMS Hospital', 'Plot No-1, Near Laxmi Narayan Temple, Bhubaneswar', 'Bhubaneswar', 'Odisha', '0674-2725555'),
('SCB Medical College', 'Mangalabag, Cuttack', 'Cuttack', 'Odisha', '0671-2414080'),
('AIIMS New Delhi', 'Sri Aurobindo Marg, Ansari Nagar, New Delhi', 'New Delhi', 'Delhi', '011-26588500'),
('Safdarjung Hospital', 'Ring Road, Safdarjung, New Delhi', 'New Delhi', 'Delhi', '011-26707437'),
('Lilavati Hospital', 'A-791, Bandra Reclamation, Bandra West, Mumbai', 'Mumbai', 'Maharashtra', '022-26751000'),
('KEM Hospital', 'Acharya Donde Marg, Parel, Mumbai', 'Mumbai', 'Maharashtra', '022-24107000'),
('Narayana Health', 'No. 258/A, Bommasandra, Hosur Road, Bangalore', 'Bangalore', 'Karnataka', '080-71222222'),
('Apollo Hospital Chennai', 'No. 21, Greams Lane, Off Greams Road, Chennai', 'Chennai', 'Tamil Nadu', '044-28293333'),
('Sassoon Hospital', 'Near Pune Railway Station, Pune', 'Pune', 'Maharashtra', '020-26128000');

-- 5. Insert Doctors (20 doctors linked to hospitals)
INSERT INTO doctor (fullName, dateOfBirth, qualification, specialist, email, phone, password, hospitalId) VALUES
-- Bhubaneswar - AIIMS
('Dr. Rajesh Kumar Panda', '1975-03-15', 'MD, DM (Cardiology)', 'Cardiology', 'rajesh.panda@aiims.edu', '9437012345', 'doctor123', 1),
('Dr. Priya Mohanty', '1982-07-22', 'MS (Orthopedics)', 'Orthopedics', 'priya.mohanty@aiims.edu', '9437023456', 'doctor123', 1),
-- Bhubaneswar - KIMS
('Dr. Sanjay Mishra', '1978-11-10', 'MD (General Medicine)', 'General Medicine', 'sanjay.mishra@kims.com', '9437034567', 'doctor123', 2),
('Dr. Anita Das', '1985-05-18', 'MD (Dermatology)', 'Dermatology', 'anita.das@kims.com', '9437045678', 'doctor123', 2),
-- Cuttack - SCB
('Dr. Biswajit Sahoo', '1970-09-05', 'MD, DM (Neurology)', 'Neurology', 'biswajit.sahoo@scb.edu', '9437056789', 'doctor123', 3),
('Dr. Smita Rath', '1980-01-25', 'MD (Pediatrics)', 'Pediatrics', 'smita.rath@scb.edu', '9437067890', 'doctor123', 3),
-- New Delhi - AIIMS
('Dr. Vikram Singh', '1968-12-03', 'MS, MCh (Neurosurgery)', 'Neurology', 'vikram.singh@aiims.in', '9811012345', 'doctor123', 4),
('Dr. Neha Sharma', '1983-06-14', 'MD (Ophthalmology)', 'Ophthalmology', 'neha.sharma@aiims.in', '9811023456', 'doctor123', 4),
-- New Delhi - Safdarjung
('Dr. Amit Gupta', '1976-04-20', 'MS (ENT)', 'ENT', 'amit.gupta@safdarjung.in', '9811034567', 'doctor123', 5),
('Dr. Pooja Verma', '1984-08-08', 'MD (Gynecology)', 'Gynecology', 'pooja.verma@safdarjung.in', '9811045678', 'doctor123', 5),
-- Mumbai - Lilavati
('Dr. Suresh Joshi', '1972-02-28', 'DM (Cardiology)', 'Cardiology', 'suresh.joshi@lilavati.com', '9820012345', 'doctor123', 6),
('Dr. Meera Nair', '1981-10-12', 'MD (Psychiatry)', 'Psychiatry', 'meera.nair@lilavati.com', '9820023456', 'doctor123', 6),
-- Mumbai - KEM
('Dr. Rahul Patil', '1979-05-30', 'MS (General Surgery)', 'General Medicine', 'rahul.patil@kem.edu', '9820034567', 'doctor123', 7),
('Dr. Sneha Deshmukh', '1986-03-17', 'MD (Dermatology)', 'Dermatology', 'sneha.deshmukh@kem.edu', '9820045678', 'doctor123', 7),
-- Bangalore - Narayana Health
('Dr. Karthik Reddy', '1974-07-09', 'MCh (Cardiothoracic)', 'Cardiology', 'karthik.reddy@narayana.com', '9845012345', 'doctor123', 8),
('Dr. Lakshmi Iyer', '1983-12-01', 'MD (Pediatrics)', 'Pediatrics', 'lakshmi.iyer@narayana.com', '9845023456', 'doctor123', 8),
-- Chennai - Apollo
('Dr. Ramesh Krishnan', '1971-08-25', 'MS (Orthopedics)', 'Orthopedics', 'ramesh.k@apollo.com', '9840012345', 'doctor123', 9),
('Dr. Divya Sundar', '1987-04-11', 'MD (General Medicine)', 'General Medicine', 'divya.sundar@apollo.com', '9840023456', 'doctor123', 9),
('Dr. Manoj Kulkarni', '1977-06-19', 'MS (ENT)', 'ENT', 'manoj.kulkarni@sassoon.edu', '9822012345', 'doctor123', 10),
('Dr. Asha Bhosle', '1984-11-22', 'MD (Ophthalmology)', 'Ophthalmology', 'asha.bhosle@sassoon.edu', '9822023456', 'doctor123', 10);

-- 6. Insert Seed Medicines across 11 categories
CREATE TABLE IF NOT EXISTS medicine (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    price DOUBLE NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    dosage_form VARCHAR(100) DEFAULT 'Tablet',
    image_url VARCHAR(500)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO medicine (id, name, category, description, price, stock, dosage_form, image_url) VALUES
(1, 'Paracetamol 650mg', 'Pain Relief', 'Effective relief from fever, body pain, and headache.', 30.00, 150, 'Tablet', 'img/med_paracetamol.png'),
(2, 'Ibuprofen 400mg', 'Pain Relief', 'Anti-inflammatory pain reliever for muscle pain, joints, and fever.', 45.00, 100, 'Tablet', 'img/med_ibuprofen.png'),
(3, 'Azithromycin 500mg', 'Antibiotics', 'Broad-spectrum antibiotic for respiratory and bacterial infections.', 120.00, 80, 'Tablet', 'img/med_azithromycin.png'),
(4, 'Amoxicillin 500mg', 'Antibiotics', 'Penicillin antibiotic used to treat bacterial throat and chest infections.', 85.00, 60, 'Capsule', 'img/med_amoxicillin.png'),
(5, 'Vitamin D3 60K IU', 'Vitamins & Supplements', 'High-potency Vitamin D3 chewable/capsules for bone strength and immunity.', 150.00, 200, 'Capsule', 'img/med_vitamind3.png'),
(6, 'Vitamin C 500mg (Zinc)', 'Vitamins & Supplements', 'Chewable antioxidant supplement to boost immune function.', 65.00, 120, 'Tablet', 'img/med_vitaminc.png'),
(7, 'Benadryl Cough Syrup 100ml', 'Cold & Cough', 'Relieves dry cough, chest congestion, and throat irritation.', 110.00, 75, 'Syrup', 'img/med_coughsyrup.png'),
(8, 'Cetirizine 10mg', 'Allergy', '24-hour relief from runny nose, sneezing, and seasonal allergies.', 25.00, 140, 'Tablet', 'img/med_cetirizine.png'),
(9, 'Metformin 500mg', 'Diabetes', 'First-line medication for type-2 diabetes blood sugar management.', 40.00, 90, 'Tablet', 'img/med_metformin.png'),
(10, 'Amlodipine 5mg', 'Heart & Blood Pressure', 'Antihypertensive medicine to lower high blood pressure.', 55.00, 85, 'Tablet', 'img/med_amlodipine.png'),
(11, 'Pantoprazole 40mg', 'Digestive Health', 'Proton pump inhibitor for acidity, GERD, and stomach ulcers.', 70.00, 110, 'Tablet', 'img/med_pantoprazole.png'),
(12, 'Digene Antacid Gel 200ml', 'Digestive Health', 'Fast relief from acidity, heartburn, and gas discomfort.', 130.00, 50, 'Syrup', 'img/med_digene.png'),
(13, 'Aloe Vera Skin Gel 100g', 'Skin Care', 'Soothing topical gel for dry skin, sunburns, and minor rashes.', 95.00, 45, 'Ointment', 'img/med_skingel.png'),
(14, 'Antiseptic Bandage Kit (50 pcs)', 'First Aid', 'Sterile adhesive bandages and antiseptic wipe kit.', 180.00, 30, 'Kit', 'img/med_firstaid.png'),
(15, 'Thermometer Digital', 'Other Medicines', 'Fast and accurate digital fever thermometer for clinical and home use.', 250.00, 25, 'Device', 'img/med_thermometer.png');

SELECT 'Seed data inserted successfully!' AS Status;
SELECT CONCAT(COUNT(*), ' hospitals inserted') AS Hospitals FROM hospital;
SELECT CONCAT(COUNT(*), ' doctors inserted') AS Doctors FROM doctor;
SELECT CONCAT(COUNT(*), ' specialists inserted') AS Specialists FROM specialist;
SELECT CONCAT(COUNT(*), ' medicines inserted') AS Medicines FROM medicine;

