package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import com.hms.entity.DispensingAuditLog;
import com.hms.entity.DispensingRequest;
import com.hms.entity.PrescriptionMedicine;

public class PharmacyDAO {

    private final Connection conn;

    public PharmacyDAO(Connection conn) {
        this.conn = conn;
    }

    public static class DispenseResult {
        public boolean success;
        public boolean insufficientStock;
        public boolean duplicateRequest;
        public String medicineName;
        public int requiredQuantity;
        public int availableStock;
        public int shortage;
        public int quantityDispensed;
        public String message;
        public String status;

        public static DispenseResult success(String medicineName, int qty, String status) {
            DispenseResult r = new DispenseResult();
            r.success = true;
            r.insufficientStock = false;
            r.duplicateRequest = false;
            r.medicineName = medicineName;
            r.quantityDispensed = qty;
            r.status = status;
            r.message = "Successfully dispensed " + qty + " units of " + medicineName + ".";
            return r;
        }

        public static DispenseResult insufficientStock(String medicineName, int required, int available) {
            DispenseResult r = new DispenseResult();
            r.success = false;
            r.insufficientStock = true;
            r.duplicateRequest = false;
            r.medicineName = medicineName;
            r.requiredQuantity = required;
            r.availableStock = available;
            r.shortage = Math.max(0, required - available);
            r.status = "SHORTAGE_REVIEW";
            r.message = String.format("Insufficient Stock: Medicine: %s | Required: %d | Available: %d | Shortage: %d | Status: Requires pharmacist review",
                    medicineName, required, available, r.shortage);
            return r;
        }

        public static DispenseResult duplicate(String message) {
            DispenseResult r = new DispenseResult();
            r.success = false;
            r.insufficientStock = false;
            r.duplicateRequest = true;
            r.message = message;
            return r;
        }

        public static DispenseResult error(String error) {
            DispenseResult r = new DispenseResult();
            r.success = false;
            r.insufficientStock = false;
            r.duplicateRequest = false;
            r.message = error;
            return r;
        }
    }

    /**
     * Creates dispensing requests for all prescribed items in an approved prescription.
     */
    public boolean createDispensingRequests(int prescriptionId, int patientId, int doctorId, List<PrescriptionMedicine> items) {
        if (items == null || items.isEmpty()) return false;
        String sql = "INSERT INTO pharmacy_dispensing_request(" +
                "prescription_id, prescription_medicine_id, patient_id, doctor_id, medicine_id, " +
                "medicine_name, strength, dosage_form, dosage_instructions, frequency, duration_days, " +
                "calculated_quantity, quantity_dispensed, quantity_remaining, status, notes) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'PENDING', ?)";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (PrescriptionMedicine pm : items) {
                int calcQty = pm.getCalculatedQuantity() > 0 ? pm.getCalculatedQuantity() : pm.getQuantity();
                String medName = (pm.getMedicineName() != null && !pm.getMedicineName().isEmpty())
                        ? pm.getMedicineName()
                        : (pm.getMedicine() != null ? pm.getMedicine().getName() : "Medicine #" + pm.getMedicineId());
                String strength = pm.getStrength() != null ? pm.getStrength() : "";
                String form = (pm.getDosageForm() != null && !pm.getDosageForm().isEmpty())
                        ? pm.getDosageForm()
                        : (pm.getMedicine() != null ? pm.getMedicine().getDosageForm() : "Tablet");

                ps.setInt(1, prescriptionId);
                ps.setInt(2, pm.getId());
                ps.setInt(3, patientId);
                ps.setInt(4, doctorId);
                ps.setInt(5, pm.getMedicineId());
                ps.setString(6, medName);
                ps.setString(7, strength);
                ps.setString(8, form);
                ps.setString(9, pm.getDosageInstructions() != null ? pm.getDosageInstructions() : "As directed");
                ps.setString(10, pm.getFrequency() != null ? pm.getFrequency() : "Once daily");
                ps.setInt(11, pm.getDurationDays() > 0 ? pm.getDurationDays() : 1);
                ps.setInt(12, calcQty);
                ps.setInt(13, calcQty); // quantity_remaining initial = calculated_quantity
                ps.setString(14, pm.getCalculationBreakdown() != null ? pm.getCalculationBreakdown() : "");
                ps.addBatch();
            }
            ps.executeBatch();
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Dispenses a prescribed item transactionally and idempotently.
     * Prevents negative inventory, race conditions, and duplicate deductions.
     */
    public DispenseResult dispenseMedicineItem(int requestId, int pharmacistId, int quantityToDispense, String idempotencyKey) {
        boolean originalAutoCommit = true;
        try {
            originalAutoCommit = conn.getAutoCommit();
            conn.setAutoCommit(false);

            // 1. Idempotency Check: verify if this exact transaction key was already committed
            if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
                String idempSql = "SELECT id, quantity_dispensed, action FROM pharmacy_audit_log WHERE idempotency_key = ?";
                try (PreparedStatement idempPs = conn.prepareStatement(idempSql)) {
                    idempPs.setString(1, idempotencyKey.trim());
                    try (ResultSet idempRs = idempPs.executeQuery()) {
                        if (idempRs.next()) {
                            conn.rollback();
                            return DispenseResult.duplicate("Transaction already processed with key: " + idempotencyKey);
                        }
                    }
                }
            }

            // 2. Fetch Dispensing Request
            String reqSql = "SELECT * FROM pharmacy_dispensing_request WHERE id = ? FOR UPDATE";
            DispensingRequest req = null;
            try (PreparedStatement reqPs = conn.prepareStatement(reqSql)) {
                reqPs.setInt(1, requestId);
                try (ResultSet rs = reqPs.executeQuery()) {
                    if (rs.next()) {
                        req = mapResultSetToDispensingRequest(rs);
                    }
                }
            }

            if (req == null) {
                conn.rollback();
                return DispenseResult.error("Dispensing request #" + requestId + " not found.");
            }

            if ("DISPENSED".equalsIgnoreCase(req.getStatus()) || req.getQuantityRemaining() <= 0) {
                conn.rollback();
                return DispenseResult.duplicate("Prescription item is already fully dispensed.");
            }

            if (quantityToDispense <= 0) {
                quantityToDispense = req.getQuantityRemaining();
            }

            // Cannot dispense more than the authorized remaining quantity
            if (quantityToDispense > req.getQuantityRemaining()) {
                quantityToDispense = req.getQuantityRemaining();
            }

            // 3. Lock medicine record and check stock
            String stockSql = "SELECT id, name, stock FROM medicine WHERE id = ? FOR UPDATE";
            int currentStock = 0;
            String medName = req.getMedicineName();
            try (PreparedStatement stockPs = conn.prepareStatement(stockSql)) {
                stockPs.setInt(1, req.getMedicineId());
                try (ResultSet stockRs = stockPs.executeQuery()) {
                    if (stockRs.next()) {
                        currentStock = stockRs.getInt("stock");
                        medName = stockRs.getString("name");
                    } else {
                        conn.rollback();
                        return DispenseResult.error("Medicine #" + req.getMedicineId() + " not found in inventory.");
                    }
                }
            }

            // 4. Insufficient Stock Safeguard
            if (currentStock < quantityToDispense) {
                // Mark request as SHORTAGE_REVIEW and record event
                String flagSql = "UPDATE pharmacy_dispensing_request SET status = 'SHORTAGE_REVIEW' WHERE id = ?";
                try (PreparedStatement flagPs = conn.prepareStatement(flagSql)) {
                    flagPs.setInt(1, requestId);
                    flagPs.executeUpdate();
                }

                conn.commit(); // commit the status flag change
                return DispenseResult.insufficientStock(medName, quantityToDispense, currentStock);
            }

            // 5. Deduct inventory safely (Stock >= quantityToDispense enforced at DB level)
            int newStock = currentStock - quantityToDispense;
            String deductSql = "UPDATE medicine SET stock = stock - ? WHERE id = ? AND stock >= ?";
            try (PreparedStatement deductPs = conn.prepareStatement(deductSql)) {
                deductPs.setInt(1, quantityToDispense);
                deductPs.setInt(2, req.getMedicineId());
                deductPs.setInt(3, quantityToDispense);
                int rows = deductPs.executeUpdate();
                if (rows == 0) {
                    conn.rollback();
                    return DispenseResult.insufficientStock(medName, quantityToDispense, currentStock);
                }
            }

            // 6. Update Dispensing Request record
            int newDispensedTotal = req.getQuantityDispensed() + quantityToDispense;
            int newRemaining = req.getCalculatedQuantity() - newDispensedTotal;
            if (newRemaining < 0) newRemaining = 0;
            String newStatus = (newRemaining == 0) ? "DISPENSED" : "PARTIALLY_DISPENSED";

            String updateReqSql = "UPDATE pharmacy_dispensing_request SET " +
                    "quantity_dispensed = ?, quantity_remaining = ?, status = ?, " +
                    "dispensed_at = CURRENT_TIMESTAMP, dispensing_pharmacist_id = ?, idempotency_key = ? " +
                    "WHERE id = ?";
            try (PreparedStatement updatePs = conn.prepareStatement(updateReqSql)) {
                updatePs.setInt(1, newDispensedTotal);
                updatePs.setInt(2, newRemaining);
                updatePs.setString(3, newStatus);
                updatePs.setInt(4, pharmacistId);
                updatePs.setString(5, idempotencyKey);
                updatePs.setInt(6, requestId);
                updatePs.executeUpdate();
            }

            // 7. Write Audit Trail
            String auditSql = "INSERT INTO pharmacy_audit_log(" +
                    "dispensing_request_id, medicine_id, pharmacist_id, action, " +
                    "quantity_dispensed, previous_stock, new_stock, idempotency_key, remarks) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement auditPs = conn.prepareStatement(auditSql)) {
                auditPs.setInt(1, requestId);
                auditPs.setInt(2, req.getMedicineId());
                auditPs.setInt(3, pharmacistId);
                auditPs.setString(4, (newRemaining == 0) ? "DISPENSE" : "PARTIAL_DISPENSE");
                auditPs.setInt(5, quantityToDispense);
                auditPs.setInt(6, currentStock);
                auditPs.setInt(7, newStock);
                auditPs.setString(8, idempotencyKey != null ? idempotencyKey : ("TX-" + System.currentTimeMillis()));
                auditPs.setString(9, "Dispensed " + quantityToDispense + " units. Remaining: " + newRemaining);
                auditPs.executeUpdate();
            }

            conn.commit();
            return DispenseResult.success(medName, quantityToDispense, newStatus);

        } catch (Exception e) {
            try {
                conn.rollback();
            } catch (SQLException ignored) {}
            e.printStackTrace();
            return DispenseResult.error("Dispensing failed: " + e.getMessage());
        } finally {
            try {
                conn.setAutoCommit(originalAutoCommit);
            } catch (SQLException ignored) {}
        }
    }

    public List<DispensingRequest> getAllDispensingRequests(String statusFilter) {
        List<DispensingRequest> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
                "SELECT pdr.*, u.fullName AS patientName, d.fullName AS doctorName, m.stock AS currentStock, m.price AS unitPrice " +
                "FROM pharmacy_dispensing_request pdr " +
                "JOIN user_details u ON pdr.patient_id = u.id " +
                "JOIN doctor d ON pdr.doctor_id = d.id " +
                "JOIN medicine m ON pdr.medicine_id = m.id "
        );

        if (statusFilter != null && !statusFilter.trim().isEmpty() && !"ALL".equalsIgnoreCase(statusFilter)) {
            sql.append(" WHERE pdr.status = ? ");
        }
        sql.append(" ORDER BY pdr.id DESC");

        try (PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            if (statusFilter != null && !statusFilter.trim().isEmpty() && !"ALL".equalsIgnoreCase(statusFilter)) {
                ps.setString(1, statusFilter.trim());
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToDispensingRequestWithDetails(rs));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public DispensingRequest getDispensingRequestById(int id) {
        String sql = "SELECT pdr.*, u.fullName AS patientName, d.fullName AS doctorName, m.stock AS currentStock, m.price AS unitPrice " +
                "FROM pharmacy_dispensing_request pdr " +
                "JOIN user_details u ON pdr.patient_id = u.id " +
                "JOIN doctor d ON pdr.doctor_id = d.id " +
                "JOIN medicine m ON pdr.medicine_id = m.id " +
                "WHERE pdr.id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToDispensingRequestWithDetails(rs);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<DispensingRequest> getDispensingRequestsByPrescriptionId(int prescriptionId) {
        List<DispensingRequest> list = new ArrayList<>();
        String sql = "SELECT pdr.*, u.fullName AS patientName, d.fullName AS doctorName, m.stock AS currentStock, m.price AS unitPrice " +
                "FROM pharmacy_dispensing_request pdr " +
                "JOIN user_details u ON pdr.patient_id = u.id " +
                "JOIN doctor d ON pdr.doctor_id = d.id " +
                "JOIN medicine m ON pdr.medicine_id = m.id " +
                "WHERE pdr.prescription_id = ? ORDER BY pdr.id ASC";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, prescriptionId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToDispensingRequestWithDetails(rs));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<DispensingAuditLog> getAuditLogs(int limit) {
        List<DispensingAuditLog> list = new ArrayList<>();
        String sql = "SELECT pal.*, m.name AS medicineName " +
                "FROM pharmacy_audit_log pal " +
                "JOIN medicine m ON pal.medicine_id = m.id " +
                "ORDER BY pal.id DESC LIMIT ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, limit > 0 ? limit : 50);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    DispensingAuditLog log = new DispensingAuditLog(
                            rs.getInt("id"),
                            rs.getInt("dispensing_request_id"),
                            rs.getInt("medicine_id"),
                            rs.getInt("pharmacist_id"),
                            rs.getString("action"),
                            rs.getInt("quantity_dispensed"),
                            rs.getInt("previous_stock"),
                            rs.getInt("new_stock"),
                            rs.getString("timestamp"),
                            rs.getString("idempotency_key"),
                            rs.getString("remarks")
                    );
                    log.setMedicineName(rs.getString("medicineName"));
                    list.add(log);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    private DispensingRequest mapResultSetToDispensingRequest(ResultSet rs) throws SQLException {
        DispensingRequest r = new DispensingRequest();
        r.setId(rs.getInt("id"));
        r.setPrescriptionId(rs.getInt("prescription_id"));
        r.setPrescriptionMedicineId(rs.getInt("prescription_medicine_id"));
        r.setPatientId(rs.getInt("patient_id"));
        r.setDoctorId(rs.getInt("doctor_id"));
        r.setMedicineId(rs.getInt("medicine_id"));
        r.setMedicineName(rs.getString("medicine_name"));
        r.setStrength(rs.getString("strength"));
        r.setDosageForm(rs.getString("dosage_form"));
        r.setDosageInstructions(rs.getString("dosage_instructions"));
        r.setFrequency(rs.getString("frequency"));
        r.setDurationDays(rs.getInt("duration_days"));
        r.setCalculatedQuantity(rs.getInt("calculated_quantity"));
        r.setQuantityDispensed(rs.getInt("quantity_dispensed"));
        r.setQuantityRemaining(rs.getInt("quantity_remaining"));
        r.setStatus(rs.getString("status"));
        r.setCreatedAt(rs.getString("created_at"));
        r.setDispensedAt(rs.getString("dispensed_at"));
        int pharmId = rs.getInt("dispensing_pharmacist_id");
        r.setDispensingPharmacistId(rs.wasNull() ? null : pharmId);
        r.setIdempotencyKey(rs.getString("idempotency_key"));
        r.setNotes(rs.getString("notes"));
        return r;
    }

    private DispensingRequest mapResultSetToDispensingRequestWithDetails(ResultSet rs) throws SQLException {
        DispensingRequest r = mapResultSetToDispensingRequest(rs);
        try {
            r.setPatientName(rs.getString("patientName"));
            r.setDoctorName(rs.getString("doctorName"));
            r.setCurrentStock(rs.getInt("currentStock"));
            r.setUnitPrice(rs.getDouble("unitPrice"));
        } catch (SQLException ignored) {}
        return r;
    }
}
