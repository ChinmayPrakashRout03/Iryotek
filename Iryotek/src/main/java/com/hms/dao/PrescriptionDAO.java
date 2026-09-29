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

    private Connection conn;

    public PrescriptionDAO(Connection conn) {
        super();
        this.conn = conn;
    }

    public int createPrescription(Prescription rx, List<PrescriptionMedicine> items) {
        int prescriptionId = -1;
        try {
            String sql = "INSERT INTO prescription(appointment_id, user_id, doctor_id, remarks) VALUES(?,?,?,?)";
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, rx.getAppointmentId());
            ps.setInt(2, rx.getUserId());
            ps.setInt(3, rx.getDoctorId());
            ps.setString(4, rx.getRemarks());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                ResultSet rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    prescriptionId = rs.getInt(1);
                }
            }

            if (prescriptionId > 0 && items != null && !items.isEmpty()) {
                String itemSql = "INSERT INTO prescription_medicine(prescription_id, medicine_id, dosage_instructions, quantity) VALUES(?,?,?,?)";
                PreparedStatement itemPs = conn.prepareStatement(itemSql);
                for (PrescriptionMedicine item : items) {
                    itemPs.setInt(1, prescriptionId);
                    itemPs.setInt(2, item.getMedicineId());
                    itemPs.setString(3, item.getDosageInstructions() != null ? item.getDosageInstructions() : "As directed");
                    itemPs.setInt(4, item.getQuantity() > 0 ? item.getQuantity() : 1);
                    itemPs.addBatch();
                }
                itemPs.executeBatch();
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
        return new Prescription(
            rs.getInt("id"),
            rs.getInt("appointment_id"),
            rs.getInt("user_id"),
            rs.getInt("doctor_id"),
            rs.getString("created_at"),
            rs.getString("remarks")
        );
    }
}
