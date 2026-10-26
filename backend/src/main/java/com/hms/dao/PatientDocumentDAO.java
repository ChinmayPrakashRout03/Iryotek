package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import com.hms.entity.PatientDocument;

public class PatientDocumentDAO {
    private Connection conn;

    public PatientDocumentDAO(Connection conn) {
        this.conn = conn;
    }

    public List<PatientDocument> getDocumentsByUserId(int userId) {
        List<PatientDocument> list = new ArrayList<>();
        try {
            String sql = "SELECT * FROM patient_document WHERE user_id = ? ORDER BY uploaded_at DESC";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                PatientDocument doc = new PatientDocument();
                doc.setId(rs.getInt("id"));
                doc.setUserId(rs.getInt("user_id"));
                doc.setDocumentType(rs.getString("document_type"));
                doc.setTitle(rs.getString("title"));
                doc.setFileName(rs.getString("file_name"));
                doc.setFilePath(rs.getString("file_path"));
                doc.setFileSize(rs.getString("file_size"));
                doc.setUploadedAt(rs.getTimestamp("uploaded_at"));
                doc.setNotes(rs.getString("notes"));
                list.add(doc);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public PatientDocument getDocumentById(int id) {
        PatientDocument doc = null;
        try {
            String sql = "SELECT * FROM patient_document WHERE id = ?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                doc = new PatientDocument();
                doc.setId(rs.getInt("id"));
                doc.setUserId(rs.getInt("user_id"));
                doc.setDocumentType(rs.getString("document_type"));
                doc.setTitle(rs.getString("title"));
                doc.setFileName(rs.getString("file_name"));
                doc.setFilePath(rs.getString("file_path"));
                doc.setFileSize(rs.getString("file_size"));
                doc.setUploadedAt(rs.getTimestamp("uploaded_at"));
                doc.setNotes(rs.getString("notes"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return doc;
    }

    public boolean addDocument(PatientDocument doc) {
        boolean success = false;
        try {
            String sql = "INSERT INTO patient_document (user_id, document_type, title, file_name, file_path, file_size, notes) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, doc.getUserId());
            pstmt.setString(2, doc.getDocumentType());
            pstmt.setString(3, doc.getTitle());
            pstmt.setString(4, doc.getFileName());
            pstmt.setString(5, doc.getFilePath());
            pstmt.setString(6, doc.getFileSize());
            pstmt.setString(7, doc.getNotes());

            int count = pstmt.executeUpdate();
            if (count > 0) {
                success = true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return success;
    }

    public boolean deleteDocument(int id, int userId) {
        boolean success = false;
        try {
            String sql = "DELETE FROM patient_document WHERE id = ? AND user_id = ?";
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
