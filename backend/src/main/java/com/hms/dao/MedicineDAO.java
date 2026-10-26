package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import com.hms.entity.Medicine;

public class MedicineDAO {

    private Connection conn;

    public MedicineDAO(Connection conn) {
        super();
        this.conn = conn;
    }

    public List<String> getAllCategories() {
        List<String> list = new ArrayList<>();
        try {
            String sql = "SELECT DISTINCT category FROM medicine ORDER BY category ASC";
            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                String cat = rs.getString("category");
                if (cat != null && !cat.trim().isEmpty()) {
                    list.add(cat.trim());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public int getTotalMedicineCount(String query, String category) {
        return getTotalMedicineCount(query, category, null);
    }

    public int getTotalMedicineCount(String query, String category, Boolean hasImage) {
        int count = 0;
        try {
            StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM medicine WHERE 1=1 ");
            if (category != null && !category.trim().isEmpty() && !"All".equalsIgnoreCase(category)) {
                sql.append(" AND category = ? ");
            }
            if (query != null && !query.trim().isEmpty()) {
                sql.append(" AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?) ");
            }
            if (Boolean.TRUE.equals(hasImage)) {
                sql.append(" AND (image_url IS NOT NULL AND image_url LIKE 'http%') ");
            }

            PreparedStatement ps = conn.prepareStatement(sql.toString());
            int paramIndex = 1;
            if (category != null && !category.trim().isEmpty() && !"All".equalsIgnoreCase(category)) {
                ps.setString(paramIndex++, category);
            }
            if (query != null && !query.trim().isEmpty()) {
                String q = "%" + query.toLowerCase().trim() + "%";
                ps.setString(paramIndex++, q);
                ps.setString(paramIndex++, q);
                ps.setString(paramIndex++, q);
            }

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                count = rs.getInt(1);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return count;
    }

    public List<Medicine> searchMedicinesPaginated(String query, String category, int page, int pageSize) {
        return searchMedicinesPaginated(query, category, null, page, pageSize);
    }

    public List<Medicine> searchMedicinesPaginated(String query, String category, Boolean hasImage, int page, int pageSize) {
        List<Medicine> list = new ArrayList<>();
        try {
            StringBuilder sql = new StringBuilder("SELECT * FROM medicine WHERE 1=1 ");
            if (category != null && !category.trim().isEmpty() && !"All".equalsIgnoreCase(category)) {
                sql.append(" AND category = ? ");
            }
            if (query != null && !query.trim().isEmpty()) {
                sql.append(" AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?) ");
            }
            if (Boolean.TRUE.equals(hasImage)) {
                sql.append(" AND (image_url IS NOT NULL AND image_url LIKE 'http%') ");
            }
            sql.append(" ORDER BY (image_url IS NOT NULL AND image_url LIKE 'http%') DESC, id ASC LIMIT ? OFFSET ?");

            PreparedStatement ps = conn.prepareStatement(sql.toString());
            int paramIndex = 1;
            if (category != null && !category.trim().isEmpty() && !"All".equalsIgnoreCase(category)) {
                ps.setString(paramIndex++, category);
            }
            if (query != null && !query.trim().isEmpty()) {
                String q = "%" + query.toLowerCase().trim() + "%";
                ps.setString(paramIndex++, q);
                ps.setString(paramIndex++, q);
                ps.setString(paramIndex++, q);
            }

            int offset = (page - 1) * pageSize;
            if (offset < 0) offset = 0;
            ps.setInt(paramIndex++, pageSize);
            ps.setInt(paramIndex++, offset);

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToMedicine(rs));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Medicine> searchMedicines(String query, String category) {
        return searchMedicinesPaginated(query, category, 1, 24);
    }

    public List<Medicine> searchMedicinesLive(String query, int limit) {
        List<Medicine> list = new ArrayList<>();
        try {
            String sql = "SELECT * FROM medicine WHERE LOWER(name) LIKE ? OR LOWER(category) LIKE ? ORDER BY (image_url IS NOT NULL AND image_url LIKE 'http%') DESC, name ASC LIMIT ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            String q = "%" + query.toLowerCase().trim() + "%";
            ps.setString(1, q);
            ps.setString(2, q);
            ps.setInt(3, limit);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToMedicine(rs));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Medicine> getAllMedicines() {
        return searchMedicinesPaginated(null, null, 1, 100);
    }

    public List<Medicine> getMedicinesByCategory(String category) {
        return searchMedicinesPaginated(null, category, 1, 24);
    }

    public Medicine getMedicineById(int id) {
        Medicine m = null;
        try {
            String sql = "SELECT * FROM medicine WHERE id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                m = mapResultSetToMedicine(rs);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return m;
    }

    public Medicine getMedicineByName(String name) {
        Medicine m = null;
        try {
            String sql = "SELECT * FROM medicine WHERE LOWER(name) = LOWER(?) LIMIT 1";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, name.trim());
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                m = mapResultSetToMedicine(rs);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return m;
    }

    public boolean addMedicine(Medicine m) {
        boolean f = false;
        try {
            String sql = "INSERT INTO medicine(name, category, description, price, stock, dosage_form, image_url) VALUES(?,?,?,?,?,?,?)";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, m.getName());
            ps.setString(2, m.getCategory());
            ps.setString(3, m.getDescription());
            ps.setDouble(4, m.getPrice());
            ps.setInt(5, m.getStock());
            ps.setString(6, m.getDosageForm());
            ps.setString(7, m.getImageUrl());
            int i = ps.executeUpdate();
            if (i > 0) f = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return f;
    }

    public boolean updateMedicine(Medicine m) {
        boolean f = false;
        try {
            String sql = "UPDATE medicine SET name=?, category=?, description=?, price=?, stock=?, dosage_form=?, image_url=? WHERE id=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, m.getName());
            ps.setString(2, m.getCategory());
            ps.setString(3, m.getDescription());
            ps.setDouble(4, m.getPrice());
            ps.setInt(5, m.getStock());
            ps.setString(6, m.getDosageForm());
            ps.setString(7, m.getImageUrl());
            ps.setInt(8, m.getId());
            int i = ps.executeUpdate();
            if (i > 0) f = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return f;
    }

    public boolean deductStock(int medicineId, int quantity) {
        boolean f = false;
        try {
            String sql = "UPDATE medicine SET stock = stock - ? WHERE id = ? AND stock >= ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, quantity);
            ps.setInt(2, medicineId);
            ps.setInt(3, quantity);
            int i = ps.executeUpdate();
            if (i > 0) f = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return f;
    }

    public boolean deleteMedicine(int id) {
        boolean f = false;
        try {
            String sql = "DELETE FROM medicine WHERE id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, id);
            int i = ps.executeUpdate();
            if (i > 0) f = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return f;
    }

    private Medicine mapResultSetToMedicine(ResultSet rs) throws Exception {
        return new Medicine(
            rs.getInt("id"),
            rs.getString("name"),
            rs.getString("category"),
            rs.getString("description"),
            rs.getDouble("price"),
            rs.getInt("stock"),
            rs.getString("dosage_form"),
            rs.getString("image_url")
        );
    }
}
