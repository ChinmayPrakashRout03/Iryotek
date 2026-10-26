package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.hms.entity.PatientVital;

public class PatientVitalsDAO {
    private Connection conn;

    public PatientVitalsDAO(Connection conn) {
        this.conn = conn;
        createTableIfNotExists();
    }

    private void createTableIfNotExists() {
        try {
            Statement stmt = conn.createStatement();
            String sql = "CREATE TABLE IF NOT EXISTS patient_vitals ("
                    + "id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "user_id INT NOT NULL, "
                    + "recorded_date VARCHAR(50) NOT NULL, "
                    + "heart_rate INT, "
                    + "blood_pressure_systolic INT, "
                    + "blood_pressure_diastolic INT, "
                    + "weight DOUBLE, "
                    + "blood_glucose INT, "
                    + "oxygen_saturation INT, "
                    + "temperature DOUBLE, "
                    + "notes VARCHAR(500), "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "INDEX idx_vital_user (user_id)"
                    + ")";
            stmt.execute(sql);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<PatientVital> getVitalsByUserId(int userId) {
        List<PatientVital> list = new ArrayList<>();
        try {
            String sql = "SELECT * FROM patient_vitals WHERE user_id = ? ORDER BY recorded_date ASC, id ASC";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToVital(rs));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<PatientVital> getVitalsByUserIdDesc(int userId) {
        List<PatientVital> list = new ArrayList<>();
        try {
            String sql = "SELECT * FROM patient_vitals WHERE user_id = ? ORDER BY recorded_date DESC, id DESC";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToVital(rs));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public PatientVital getLatestVitalByUserId(int userId) {
        PatientVital vital = null;
        try {
            String sql = "SELECT * FROM patient_vitals WHERE user_id = ? ORDER BY recorded_date DESC, id DESC LIMIT 1";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                vital = mapResultSetToVital(rs);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return vital;
    }

    public boolean addVital(PatientVital vital) {
        boolean success = false;
        try {
            String sql = "INSERT INTO patient_vitals (user_id, recorded_date, heart_rate, "
                    + "blood_pressure_systolic, blood_pressure_diastolic, weight, blood_glucose, "
                    + "oxygen_saturation, temperature, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, vital.getUserId());
            pstmt.setString(2, vital.getRecordedDate());
            pstmt.setInt(3, vital.getHeartRate());
            pstmt.setInt(4, vital.getBloodPressureSystolic());
            pstmt.setInt(5, vital.getBloodPressureDiastolic());
            pstmt.setDouble(6, vital.getWeight());
            pstmt.setInt(7, vital.getBloodGlucose());
            pstmt.setInt(8, vital.getOxygenSaturation());
            pstmt.setDouble(9, vital.getTemperature());
            pstmt.setString(10, vital.getNotes());

            int i = pstmt.executeUpdate();
            if (i > 0) {
                success = true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return success;
    }

    public boolean deleteVital(int id, int userId) {
        boolean success = false;
        try {
            String sql = "DELETE FROM patient_vitals WHERE id = ? AND user_id = ?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, id);
            pstmt.setInt(2, userId);
            int i = pstmt.executeUpdate();
            if (i > 0) {
                success = true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return success;
    }

    public void seedSampleVitalsIfEmpty(int userId) {
        try {
            String checkSql = "SELECT COUNT(*) FROM patient_vitals WHERE user_id = ?";
            PreparedStatement checkStmt = conn.prepareStatement(checkSql);
            checkStmt.setInt(1, userId);
            ResultSet rs = checkStmt.executeQuery();
            if (rs.next() && rs.getInt(1) > 0) {
                return; // already has data
            }

            // Seed historical vitals across recent weeks to provide rich charts
            String[][] sampleData = {
                {"2026-08-10", "72", "118", "76", "72.4", "94", "99", "98.4", "Regular morning vitals check"},
                {"2026-08-18", "75", "120", "78", "72.2", "98", "98", "98.6", "Post light cardio baseline"},
                {"2026-08-25", "70", "116", "74", "71.9", "92", "99", "98.4", "Resting vitals, optimal hydration"},
                {"2026-09-02", "78", "124", "82", "72.1", "104", "98", "98.7", "Routine follow-up check"},
                {"2026-09-10", "74", "119", "77", "71.8", "96", "99", "98.5", "Morning fasting vitals"},
                {"2026-09-18", "76", "122", "80", "71.6", "101", "98", "98.6", "Pre-consultation review"},
                {"2026-09-26", "71", "117", "75", "71.4", "95", "99", "98.4", "Healthy baseline recorded"},
                {"2026-10-02", "73", "118", "76", "71.2", "97", "99", "98.5", "Latest patient recorded checkup"}
            };

            String insertSql = "INSERT INTO patient_vitals (user_id, recorded_date, heart_rate, "
                    + "blood_pressure_systolic, blood_pressure_diastolic, weight, blood_glucose, "
                    + "oxygen_saturation, temperature, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement pstmt = conn.prepareStatement(insertSql);

            for (String[] row : sampleData) {
                pstmt.setInt(1, userId);
                pstmt.setString(2, row[0]);
                pstmt.setInt(3, Integer.parseInt(row[1]));
                pstmt.setInt(4, Integer.parseInt(row[2]));
                pstmt.setInt(5, Integer.parseInt(row[3]));
                pstmt.setDouble(6, Double.parseDouble(row[4]));
                pstmt.setInt(7, Integer.parseInt(row[5]));
                pstmt.setInt(8, Integer.parseInt(row[6]));
                pstmt.setDouble(9, Double.parseDouble(row[7]));
                pstmt.setString(10, row[8]);
                pstmt.addBatch();
            }
            pstmt.executeBatch();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private PatientVital mapResultSetToVital(ResultSet rs) throws Exception {
        PatientVital vital = new PatientVital();
        vital.setId(rs.getInt("id"));
        vital.setUserId(rs.getInt("user_id"));
        vital.setRecordedDate(rs.getString("recorded_date"));
        vital.setHeartRate(rs.getInt("heart_rate"));
        vital.setBloodPressureSystolic(rs.getInt("blood_pressure_systolic"));
        vital.setBloodPressureDiastolic(rs.getInt("blood_pressure_diastolic"));
        vital.setWeight(rs.getDouble("weight"));
        vital.setBloodGlucose(rs.getInt("blood_glucose"));
        vital.setOxygenSaturation(rs.getInt("oxygen_saturation"));
        vital.setTemperature(rs.getDouble("temperature"));
        vital.setNotes(rs.getString("notes"));
        vital.setCreatedAt(rs.getTimestamp("created_at"));
        return vital;
    }
}
