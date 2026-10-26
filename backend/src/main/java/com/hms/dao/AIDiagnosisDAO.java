package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import com.hms.entity.AIDiagnosis;

public class AIDiagnosisDAO {
    private Connection conn;

    public AIDiagnosisDAO(Connection conn) {
        this.conn = conn;
    }

    public boolean saveDiagnosis(AIDiagnosis diag) {
        boolean success = false;
        try {
            String sql = "INSERT INTO ai_differential_diagnosis (user_id, appointment_id, symptoms, urgency_level, diagnoses_json, clinical_notes, disclaimer) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            if (diag.getUserId() != null && diag.getUserId() > 0) {
                pstmt.setInt(1, diag.getUserId());
            } else {
                pstmt.setNull(1, Types.INTEGER);
            }

            if (diag.getAppointmentId() != null && diag.getAppointmentId() > 0) {
                pstmt.setInt(2, diag.getAppointmentId());
            } else {
                pstmt.setNull(2, Types.INTEGER);
            }

            pstmt.setString(3, diag.getSymptoms());
            pstmt.setString(4, diag.getUrgencyLevel());
            pstmt.setString(5, diag.getDiagnosesJson());
            pstmt.setString(6, diag.getClinicalNotes());
            pstmt.setString(7, diag.getDisclaimer());

            int count = pstmt.executeUpdate();
            if (count > 0) {
                success = true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return success;
    }

    public List<AIDiagnosis> getDiagnosesByUserId(int userId) {
        List<AIDiagnosis> list = new ArrayList<>();
        try {
            String sql = "SELECT * FROM ai_differential_diagnosis WHERE user_id = ? ORDER BY created_at DESC";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                AIDiagnosis d = mapResultSet(rs);
                list.add(d);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public AIDiagnosis getLatestDiagnosisByUserId(int userId) {
        AIDiagnosis diag = null;
        try {
            String sql = "SELECT * FROM ai_differential_diagnosis WHERE user_id = ? ORDER BY created_at DESC LIMIT 1";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                diag = mapResultSet(rs);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return diag;
    }

    public AIDiagnosis getDiagnosisByAppointmentId(int appointmentId) {
        AIDiagnosis diag = null;
        try {
            String sql = "SELECT * FROM ai_differential_diagnosis WHERE appointment_id = ? ORDER BY created_at DESC LIMIT 1";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, appointmentId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                diag = mapResultSet(rs);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return diag;
    }

    public AIDiagnosis getDiagnosisById(int id) {
        AIDiagnosis diag = null;
        try {
            String sql = "SELECT * FROM ai_differential_diagnosis WHERE id = ?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                diag = mapResultSet(rs);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return diag;
    }

    private AIDiagnosis mapResultSet(ResultSet rs) throws Exception {
        AIDiagnosis d = new AIDiagnosis();
        d.setId(rs.getInt("id"));
        int uid = rs.getInt("user_id");
        if (!rs.wasNull()) {
            d.setUserId(uid);
        }
        int aid = rs.getInt("appointment_id");
        if (!rs.wasNull()) {
            d.setAppointmentId(aid);
        }
        d.setSymptoms(rs.getString("symptoms"));
        d.setUrgencyLevel(rs.getString("urgency_level"));
        d.setDiagnosesJson(rs.getString("diagnoses_json"));
        d.setClinicalNotes(rs.getString("clinical_notes"));
        d.setDisclaimer(rs.getString("disclaimer"));
        d.setCreatedAt(rs.getTimestamp("created_at"));
        return d;
    }
}
