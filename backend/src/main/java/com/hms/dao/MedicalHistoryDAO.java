package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import com.hms.entity.MedicalHistoryItem;

public class MedicalHistoryDAO {
    private Connection conn;

    public MedicalHistoryDAO(Connection conn) {
        this.conn = conn;
    }

    public List<MedicalHistoryItem> getHistoryByUserId(int userId) {
        List<MedicalHistoryItem> list = new ArrayList<>();
        try {
            String sql = "SELECT * FROM patient_medical_history WHERE user_id = ? ORDER BY created_at DESC";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                MedicalHistoryItem item = new MedicalHistoryItem();
                item.setId(rs.getInt("id"));
                item.setUserId(rs.getInt("user_id"));
                item.setCategory(rs.getString("category"));
                item.setTitle(rs.getString("title"));
                item.setDiagnosedYearOrDate(rs.getString("diagnosed_year_or_date"));
                item.setSeverity(rs.getString("severity"));
                item.setNotes(rs.getString("notes"));
                item.setCreatedAt(rs.getTimestamp("created_at"));
                list.add(item);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<MedicalHistoryItem> getHistoryByUserIdAndCategory(int userId, String category) {
        List<MedicalHistoryItem> list = new ArrayList<>();
        try {
            String sql = "SELECT * FROM patient_medical_history WHERE user_id = ? AND category = ? ORDER BY created_at DESC";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, userId);
            pstmt.setString(2, category);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                MedicalHistoryItem item = new MedicalHistoryItem();
                item.setId(rs.getInt("id"));
                item.setUserId(rs.getInt("user_id"));
                item.setCategory(rs.getString("category"));
                item.setTitle(rs.getString("title"));
                item.setDiagnosedYearOrDate(rs.getString("diagnosed_year_or_date"));
                item.setSeverity(rs.getString("severity"));
                item.setNotes(rs.getString("notes"));
                item.setCreatedAt(rs.getTimestamp("created_at"));
                list.add(item);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean addHistoryItem(MedicalHistoryItem item) {
        boolean success = false;
        try {
            String sql = "INSERT INTO patient_medical_history (user_id, category, title, diagnosed_year_or_date, severity, notes) "
                    + "VALUES (?, ?, ?, ?, ?, ?)";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, item.getUserId());
            pstmt.setString(2, item.getCategory());
            pstmt.setString(3, item.getTitle());
            pstmt.setString(4, item.getDiagnosedYearOrDate());
            pstmt.setString(5, item.getSeverity());
            pstmt.setString(6, item.getNotes());

            int count = pstmt.executeUpdate();
            if (count > 0) {
                success = true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return success;
    }

    public boolean deleteHistoryItem(int id, int userId) {
        boolean success = false;
        try {
            String sql = "DELETE FROM patient_medical_history WHERE id = ? AND user_id = ?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, id);
            pstmt.setInt(2, userId);
            int count = pstmt.executeUpdate();
            if (count > 0) {
                success = true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return success;
    }
}
