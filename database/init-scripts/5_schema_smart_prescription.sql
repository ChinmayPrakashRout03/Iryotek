-- ====================================================================
-- Iryotek Smart Prescription Intelligence & Pharmacy Dispensing Schema
-- ====================================================================

USE hospital;

-- Stored procedure to safely add columns if they do not exist
DROP PROCEDURE IF EXISTS AddColumnSafely;
DELIMITER $$
CREATE PROCEDURE AddColumnSafely(
    IN tblName VARCHAR(64),
    IN colName VARCHAR(64),
    IN colDefinition TEXT
)
BEGIN
    DECLARE colExists INT;
    SELECT COUNT(*) INTO colExists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = tblName
      AND COLUMN_NAME = colName;

    IF colExists = 0 THEN
        SET @sqlStatement = CONCAT('ALTER TABLE `', tblName, '` ADD COLUMN `', colName, '` ', colDefinition);
        PREPARE stmt FROM @sqlStatement;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- 1. Enhance prescription table
CALL AddColumnSafely('prescription', 'status', 'VARCHAR(50) NOT NULL DEFAULT \'APPROVED\'');
CALL AddColumnSafely('prescription', 'approved_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

-- 2. Enhance prescription_medicine table
CALL AddColumnSafely('prescription_medicine', 'medicine_name', 'VARCHAR(200) DEFAULT \'\'');
CALL AddColumnSafely('prescription_medicine', 'strength', 'VARCHAR(100) DEFAULT \'\'');
CALL AddColumnSafely('prescription_medicine', 'dosage_form', 'VARCHAR(100) DEFAULT \'Tablet\'');
CALL AddColumnSafely('prescription_medicine', 'units_per_dose', 'DOUBLE DEFAULT 1.0');
CALL AddColumnSafely('prescription_medicine', 'frequency', 'VARCHAR(100) DEFAULT \'Once daily\'');
CALL AddColumnSafely('prescription_medicine', 'doses_per_day', 'DOUBLE DEFAULT 1.0');
CALL AddColumnSafely('prescription_medicine', 'duration_days', 'INT DEFAULT 1');
CALL AddColumnSafely('prescription_medicine', 'route', 'VARCHAR(100) DEFAULT \'Oral\'');
CALL AddColumnSafely('prescription_medicine', 'special_instructions', 'VARCHAR(255) DEFAULT \'\'');
CALL AddColumnSafely('prescription_medicine', 'calculated_quantity', 'INT DEFAULT 1');
CALL AddColumnSafely('prescription_medicine', 'calculation_breakdown', 'VARCHAR(255) DEFAULT \'\'');
CALL AddColumnSafely('prescription_medicine', 'needs_clarification', 'INT DEFAULT 0');
CALL AddColumnSafely('prescription_medicine', 'clarification_reason', 'VARCHAR(255) DEFAULT \'\'');
CALL AddColumnSafely('prescription_medicine', 'status', 'VARCHAR(50) DEFAULT \'PENDING\'');

DROP PROCEDURE IF EXISTS AddColumnSafely;

-- 3. Pharmacy Dispensing Request Table
CREATE TABLE IF NOT EXISTS pharmacy_dispensing_request (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prescription_id INT NOT NULL,
    prescription_medicine_id INT NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    medicine_id INT NOT NULL,
    medicine_name VARCHAR(200) NOT NULL,
    strength VARCHAR(100) DEFAULT '',
    dosage_form VARCHAR(100) DEFAULT 'Tablet',
    dosage_instructions VARCHAR(255) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration_days INT NOT NULL,
    calculated_quantity INT NOT NULL,
    quantity_dispensed INT NOT NULL DEFAULT 0,
    quantity_remaining INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dispensed_at TIMESTAMP NULL DEFAULT NULL,
    dispensing_pharmacist_id INT DEFAULT NULL,
    idempotency_key VARCHAR(100) UNIQUE NULL,
    notes TEXT,
    FOREIGN KEY (prescription_id) REFERENCES prescription(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicine(id),
    FOREIGN KEY (patient_id) REFERENCES user_details(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Auditable Pharmacy Dispensing Transaction Log
CREATE TABLE IF NOT EXISTS pharmacy_audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dispensing_request_id INT NOT NULL,
    medicine_id INT NOT NULL,
    pharmacist_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    quantity_dispensed INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    idempotency_key VARCHAR(100) NOT NULL,
    remarks VARCHAR(500) DEFAULT '',
    FOREIGN KEY (dispensing_request_id) REFERENCES pharmacy_dispensing_request(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicine(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
