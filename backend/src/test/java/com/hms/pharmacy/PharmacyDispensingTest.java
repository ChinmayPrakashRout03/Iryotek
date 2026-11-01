package com.hms.pharmacy;

import static org.junit.Assert.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.junit.Before;
import org.junit.Test;

import com.hms.dao.PharmacyDAO;
import com.hms.dao.PharmacyDAO.DispenseResult;
import com.hms.db.DBConnection;
import com.hms.entity.PrescriptionMedicine;

public class PharmacyDispensingTest {

    private Connection conn;
    private PharmacyDAO pharmacyDAO;

    @Before
    public void setUp() {
        try {
            conn = DBConnection.getConn();
            if (conn != null) {
                pharmacyDAO = new PharmacyDAO(conn);
            }
        } catch (Exception e) {
            conn = null;
        }
    }

    // -------------------------------------------------------------------------
    // 1. Result Contract & Message Format Tests
    // -------------------------------------------------------------------------

    @Test
    public void testInsufficientStockResultFormatting() {
        // Must format: "Insufficient Stock: Medicine: Example Medicine 500 mg | Required: 15 | Available: 10 | Shortage: 5 | Status: Requires pharmacist review"
        DispenseResult res = DispenseResult.insufficientStock("Example Medicine 500 mg", 15, 10);

        assertFalse("Dispensing must not succeed when stock is insufficient", res.success);
        assertTrue("Insufficient stock flag must be set", res.insufficientStock);
        assertEquals("SHORTAGE_REVIEW", res.status);
        assertEquals(5, res.shortage);
        assertEquals(15, res.requiredQuantity);
        assertEquals(10, res.availableStock);
        assertTrue(res.message.contains("Insufficient Stock"));
        assertTrue(res.message.contains("Medicine: Example Medicine 500 mg"));
        assertTrue(res.message.contains("Required: 15"));
        assertTrue(res.message.contains("Available: 10"));
        assertTrue(res.message.contains("Shortage: 5"));
        assertTrue(res.message.contains("Status: Requires pharmacist review"));
    }

    @Test
    public void testDuplicateResultFormatting() {
        DispenseResult res = DispenseResult.duplicate("Transaction already processed with key: TX-TEST");
        assertFalse(res.success);
        assertTrue(res.duplicateRequest);
        assertTrue(res.message.contains("Transaction already processed"));
    }

    // -------------------------------------------------------------------------
    // 2. Integration / Transactional Tests with Live Database
    // -------------------------------------------------------------------------

    @Test
    public void testTransactionalDispenseAndDuplicatePrevention() {
        if (conn == null || pharmacyDAO == null) {
            System.out.println("Database not connected in test environment, skipping live DB test.");
            return;
        }

        int testMedId = 0;
        int testRxId = 0;
        int testReqId = 0;
        try {
            // 1. Create a parent prescription to satisfy foreign key constraint
            String insertRx = "INSERT INTO prescription(appointment_id, user_id, doctor_id, remarks, status) " +
                    "VALUES (1, 1, 1, 'Unit Test Rx', 'APPROVED')";
            try (PreparedStatement ps = conn.prepareStatement(insertRx, Statement.RETURN_GENERATED_KEYS)) {
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) testRxId = rs.getInt(1);
                }
            }
            assertTrue("Test prescription created", testRxId > 0);

            // 2. Create a temporary test medicine with known initial stock
            String insertMed = "INSERT INTO medicine(name, category, price, stock, dosage_form, description) " +
                    "VALUES ('Test Amoxicillin 500 mg', 'Antibiotic', 10.0, 50, 'Tablet', 'Test Medicine')";
            try (PreparedStatement ps = conn.prepareStatement(insertMed, Statement.RETURN_GENERATED_KEYS)) {
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) testMedId = rs.getInt(1);
                }
            }
            assertTrue("Test medicine created", testMedId > 0);

            // 3. Create a test dispensing request for 15 tablets
            String insertReq = "INSERT INTO pharmacy_dispensing_request(" +
                    "prescription_id, prescription_medicine_id, patient_id, doctor_id, medicine_id, " +
                    "medicine_name, strength, dosage_form, dosage_instructions, frequency, duration_days, " +
                    "calculated_quantity, quantity_dispensed, quantity_remaining, status) " +
                    "VALUES (?, 1, 1, 1, ?, 'Test Amoxicillin', '500 mg', 'Tablet', '1 tablet TID', 'Three times daily', 5, 15, 0, 15, 'PENDING')";
            try (PreparedStatement ps = conn.prepareStatement(insertReq, Statement.RETURN_GENERATED_KEYS)) {
                ps.setInt(1, testRxId);
                ps.setInt(2, testMedId);
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) testReqId = rs.getInt(1);
                }
            }
            assertTrue("Test dispensing request created", testReqId > 0);

            // 4. Dispense with a unique idempotency key
            String idempotencyKey = "TEST-IDEMP-" + UUID.randomUUID().toString();
            DispenseResult dispenseRes1 = pharmacyDAO.dispenseMedicineItem(testReqId, 1, 15, idempotencyKey);

            assertTrue("Dispense should succeed", dispenseRes1.success);
            assertEquals("DISPENSED", dispenseRes1.status);
            assertEquals(15, dispenseRes1.quantityDispensed);

            // Verify stock reduced from 50 to 35
            String checkStock = "SELECT stock FROM medicine WHERE id = ?";
            try (PreparedStatement ps = conn.prepareStatement(checkStock)) {
                ps.setInt(1, testMedId);
                try (ResultSet rs = ps.executeQuery()) {
                    assertTrue(rs.next());
                    assertEquals("Stock must be deducted transactionally (50 - 15 = 35)", 35, rs.getInt("stock"));
                }
            }

            // 5. Test Idempotency / Duplicate Prevention: Attempt to dispense AGAIN with same key
            DispenseResult duplicateRes = pharmacyDAO.dispenseMedicineItem(testReqId, 1, 15, idempotencyKey);
            assertFalse("Duplicate request must be rejected", duplicateRes.success);
            assertTrue("Duplicate flag must be set", duplicateRes.duplicateRequest);

            // Verify stock did NOT reduce again (still 35)
            try (PreparedStatement ps = conn.prepareStatement(checkStock)) {
                ps.setInt(1, testMedId);
                try (ResultSet rs = ps.executeQuery()) {
                    assertTrue(rs.next());
                    assertEquals("Stock must not be deducted twice on duplicate request", 35, rs.getInt("stock"));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            fail("Exception during transactional dispensing test: " + e.getMessage());
        } finally {
            // Cleanup test rows
            try {
                if (testReqId > 0) {
                    try (PreparedStatement ps = conn.prepareStatement("DELETE FROM pharmacy_audit_log WHERE dispensing_request_id = ?")) {
                        ps.setInt(1, testReqId);
                        ps.executeUpdate();
                    }
                    try (PreparedStatement ps = conn.prepareStatement("DELETE FROM pharmacy_dispensing_request WHERE id = ?")) {
                        ps.setInt(1, testReqId);
                        ps.executeUpdate();
                    }
                }
                if (testRxId > 0) {
                    try (PreparedStatement ps = conn.prepareStatement("DELETE FROM prescription WHERE id = ?")) {
                        ps.setInt(1, testRxId);
                        ps.executeUpdate();
                    }
                }
                if (testMedId > 0) {
                    try (PreparedStatement ps = conn.prepareStatement("DELETE FROM medicine WHERE id = ?")) {
                        ps.setInt(1, testMedId);
                        ps.executeUpdate();
                    }
                }
            } catch (Exception ignored) {}
        }
    }

    @Test
    public void testInsufficientStockHandlingAndShortageFlagging() {
        if (conn == null || pharmacyDAO == null) {
            return;
        }

        int testMedId = 0;
        int testRxId = 0;
        int testReqId = 0;
        try {
            // Create test parent prescription
            String insertRx = "INSERT INTO prescription(appointment_id, user_id, doctor_id, remarks, status) " +
                    "VALUES (1, 1, 1, 'Shortage Test Rx', 'APPROVED')";
            try (PreparedStatement ps = conn.prepareStatement(insertRx, Statement.RETURN_GENERATED_KEYS)) {
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) testRxId = rs.getInt(1);
                }
            }
            assertTrue("Test prescription created", testRxId > 0);

            // Create medicine with low stock (only 5 available)
            String insertMed = "INSERT INTO medicine(name, category, price, stock, dosage_form, description) " +
                    "VALUES ('Test Low Stock 250 mg', 'General', 15.0, 5, 'Tablet', 'Low stock')";
            try (PreparedStatement ps = conn.prepareStatement(insertMed, Statement.RETURN_GENERATED_KEYS)) {
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) testMedId = rs.getInt(1);
                }
            }

            // Create request requiring 15 tablets (short by 10)
            String insertReq = "INSERT INTO pharmacy_dispensing_request(" +
                    "prescription_id, prescription_medicine_id, patient_id, doctor_id, medicine_id, " +
                    "medicine_name, strength, dosage_form, dosage_instructions, frequency, duration_days, " +
                    "calculated_quantity, quantity_dispensed, quantity_remaining, status) " +
                    "VALUES (?, 2, 1, 1, ?, 'Test Low Stock', '250 mg', 'Tablet', '1 TID', 'Three times daily', 5, 15, 0, 15, 'PENDING')";
            try (PreparedStatement ps = conn.prepareStatement(insertReq, Statement.RETURN_GENERATED_KEYS)) {
                ps.setInt(1, testRxId);
                ps.setInt(2, testMedId);
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) testReqId = rs.getInt(1);
                }
            }

            // Attempt to dispense full 15 units
            DispenseResult res = pharmacyDAO.dispenseMedicineItem(testReqId, 1, 15, "IDEMP-SHORT-" + System.currentTimeMillis());

            assertFalse("Dispensing must fail when inventory is insufficient", res.success);
            assertTrue("Must report insufficient stock", res.insufficientStock);
            assertEquals("SHORTAGE_REVIEW", res.status);
            assertEquals("Shortage must be 10", 10, res.shortage);

            // Verify status in DB updated to SHORTAGE_REVIEW
            String checkReq = "SELECT status FROM pharmacy_dispensing_request WHERE id = ?";
            try (PreparedStatement ps = conn.prepareStatement(checkReq)) {
                ps.setInt(1, testReqId);
                try (ResultSet rs = ps.executeQuery()) {
                    assertTrue(rs.next());
                    assertEquals("SHORTAGE_REVIEW", rs.getString("status"));
                }
            }

            // Verify stock was NOT deducted (still 5)
            String checkStock = "SELECT stock FROM medicine WHERE id = ?";
            try (PreparedStatement ps = conn.prepareStatement(checkStock)) {
                ps.setInt(1, testMedId);
                try (ResultSet rs = ps.executeQuery()) {
                    assertTrue(rs.next());
                    assertEquals(5, rs.getInt("stock"));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            fail("Exception during insufficient stock test: " + e.getMessage());
        } finally {
            try {
                if (testReqId > 0) {
                    try (PreparedStatement ps = conn.prepareStatement("DELETE FROM pharmacy_dispensing_request WHERE id = ?")) {
                        ps.setInt(1, testReqId);
                        ps.executeUpdate();
                    }
                }
                if (testRxId > 0) {
                    try (PreparedStatement ps = conn.prepareStatement("DELETE FROM prescription WHERE id = ?")) {
                        ps.setInt(1, testRxId);
                        ps.executeUpdate();
                    }
                }
                if (testMedId > 0) {
                    try (PreparedStatement ps = conn.prepareStatement("DELETE FROM medicine WHERE id = ?")) {
                        ps.setInt(1, testMedId);
                        ps.executeUpdate();
                    }
                }
            } catch (Exception ignored) {}
        }
    }
}
