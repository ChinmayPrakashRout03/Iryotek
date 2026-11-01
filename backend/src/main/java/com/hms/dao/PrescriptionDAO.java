package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.hms.entity.Medicine;
import com.hms.entity.Prescription;
import com.hms.entity.PrescriptionMedicine;

public class PrescriptionDAO {

    private final Connection conn;

    public PrescriptionDAO(Connection conn) {
        super();
        this.conn = conn;
    }

    public int createPrescription(Prescription rx, List<PrescriptionMedicine> items) {
        int prescriptionId = -1;
        try {
            String sql = "INSERT INTO prescription(appointment_id, user_id, doctor_id, remarks, status) VALUES(?,?,?,?,?)";
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, rx.getAppointmentId());
            ps.setInt(2, rx.getUserId());
            ps.setInt(3, rx.getDoctorId());
            ps.setString(4, rx.getRemarks());
            ps.setString(5, rx.getStatus() != null ? rx.getStatus() : "APPROVED");

            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        prescriptionId = rs.getInt(1);
                    }
                }
            }

            if (prescriptionId > 0 && items != null && !items.isEmpty()) {
                String itemSql = "INSERT INTO prescription_medicine(" +
                        "prescription_id, medicine_id, dosage_instructions, quantity, " +
                        "medicine_name, strength, dosage_form, units_per_dose, frequency, " +
                        "doses_per_day, duration_days, route, special_instructions, " +
                        "calculated_quantity, calculation_breakdown, needs_clarification, clarification_reason, status) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

                for (PrescriptionMedicine item : items) {
                    try (PreparedStatement itemPs = conn.prepareStatement(itemSql, Statement.RETURN_GENERATED_KEYS)) {
                        int calcQty = item.getCalculatedQuantity() > 0 ? item.getCalculatedQuantity() : item.getQuantity();

                        itemPs.setInt(1, prescriptionId);
                        itemPs.setInt(2, item.getMedicineId());
                        itemPs.setString(3, item.getDosageInstructions() != null ? item.getDosageInstructions() : "As directed");
                        itemPs.setInt(4, item.getQuantity() > 0 ? item.getQuantity() : calcQty);
                        itemPs.setString(5, item.getMedicineName() != null ? item.getMedicineName() : "");
                        itemPs.setString(6, item.getStrength() != null ? item.getStrength() : "");
                        itemPs.setString(7, item.getDosageForm() != null ? item.getDosageForm() : "Tablet");
                        itemPs.setDouble(8, item.getUnitsPerDose() > 0 ? item.getUnitsPerDose() : 1.0);
                        itemPs.setString(9, item.getFrequency() != null ? item.getFrequency() : "Once daily");
                        itemPs.setDouble(10, item.getDosesPerDay() > 0 ? item.getDosesPerDay() : 1.0);
                        itemPs.setInt(11, item.getDurationDays() > 0 ? item.getDurationDays() : 1);
                        itemPs.setString(12, item.getRoute() != null ? item.getRoute() : "Oral");
                        itemPs.setString(13, item.getSpecialInstructions() != null ? item.getSpecialInstructions() : "");
                        itemPs.setInt(14, calcQty);
                        itemPs.setString(15, item.getCalculationBreakdown() != null ? item.getCalculationBreakdown() : "");
                        itemPs.setInt(16, item.isNeedsClarification() ? 1 : 0);
                        itemPs.setString(17, item.getClarificationReason() != null ? item.getClarificationReason() : "");
                        itemPs.setString(18, item.getStatus() != null ? item.getStatus() : "PENDING");

                        itemPs.executeUpdate();
                        try (ResultSet itemRs = itemPs.getGeneratedKeys()) {
                            if (itemRs.next()) {
                                item.setId(itemRs.getInt(1));
                            }
                        }
                    }
                }

                // Automatically generate pharmacy dispensing request queue entries
                PharmacyDAO pharmacyDAO = new PharmacyDAO(conn);
                pharmacyDAO.createDispensingRequests(prescriptionId, rx.getUserId(), rx.getDoctorId(), items);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return prescriptionId;
    }

    public Prescription getPrescriptionByAppointmentId(int appointmentId) {
        Prescription rx = null;
        try {
            String sql = "SELECT * FROM prescription WHERE appointment_id = ? ORDER BY id DESC LIMIT 1";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, appointmentId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                rx = mapResultSetToPrescription(rs);
                rx.setItems(getPrescriptionItems(rx.getId()));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return rx;
    }

    public Prescription getPrescriptionById(int prescriptionId) {
        Prescription rx = null;
        try {
            String sql = "SELECT * FROM prescription WHERE id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, prescriptionId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                rx = mapResultSetToPrescription(rs);
                rx.setItems(getPrescriptionItems(rx.getId()));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return rx;
    }

    public List<Prescription> getPrescriptionsByUserId(int userId) {
        List<Prescription> list = new ArrayList<>();
        try {
            String sql = "SELECT * FROM prescription WHERE user_id = ? ORDER BY id DESC";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Prescription rx = mapResultSetToPrescription(rs);
                rx.setItems(getPrescriptionItems(rx.getId()));
                list.add(rx);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<PrescriptionMedicine> getPrescriptionItems(int prescriptionId) {
        List<PrescriptionMedicine> list = new ArrayList<>();
        try {
            String sql = "SELECT pm.*, m.name, m.category, m.price, m.stock, m.dosage_form, m.image_url " +
                         "FROM prescription_medicine pm " +
                         "JOIN medicine m ON pm.medicine_id = m.id " +
                         "WHERE pm.prescription_id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, prescriptionId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                PrescriptionMedicine item = new PrescriptionMedicine(
                    rs.getInt("id"),
                    rs.getInt("prescription_id"),
                    rs.getInt("medicine_id"),
                    rs.getString("dosage_instructions"),
                    rs.getInt("quantity")
                );

                // Populate clinical structured fields
                try {
                    item.setMedicineName(rs.getString("medicine_name"));
                    item.setStrength(rs.getString("strength"));
                    item.setDosageForm(rs.getString("dosage_form"));
                    item.setUnitsPerDose(rs.getDouble("units_per_dose"));
                    item.setFrequency(rs.getString("frequency"));
                    item.setDosesPerDay(rs.getDouble("doses_per_day"));
                    item.setDurationDays(rs.getInt("duration_days"));
                    item.setRoute(rs.getString("route"));
                    item.setSpecialInstructions(rs.getString("special_instructions"));
                    item.setCalculatedQuantity(rs.getInt("calculated_quantity"));
                    item.setCalculationBreakdown(rs.getString("calculation_breakdown"));
                    item.setNeedsClarification(rs.getInt("needs_clarification") == 1);
                    item.setClarificationReason(rs.getString("clarification_reason"));
                    item.setStatus(rs.getString("status"));
                } catch (Exception ignored) {}

                Medicine med = new Medicine(
                    rs.getInt("medicine_id"),
                    rs.getString("name"),
                    rs.getString("category"),
                    "",
                    rs.getDouble("price"),
                    rs.getInt("stock"),
                    rs.getString("dosage_form"),
                    rs.getString("image_url")
                );
                item.setMedicine(med);
                list.add(item);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    private Prescription mapResultSetToPrescription(ResultSet rs) throws Exception {
        Prescription p = new Prescription(
            rs.getInt("id"),
            rs.getInt("appointment_id"),
            rs.getInt("user_id"),
            rs.getInt("doctor_id"),
            rs.getString("created_at"),
            rs.getString("remarks")
        );
        try {
            p.setStatus(rs.getString("status"));
            p.setApprovedAt(rs.getString("approved_at"));
        } catch (Exception ignored) {}
        return p;
    }
}
