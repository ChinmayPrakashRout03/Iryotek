package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.hms.entity.UserAddress;

public class UserAddressDAO {

    private Connection conn;

    public UserAddressDAO(Connection conn) {
        super();
        this.conn = conn;
    }

    public int addAddress(UserAddress addr) {
        int addressId = -1;
        try {
            if (addr.getIsDefault() == 1) {
                resetDefaultAddresses(addr.getUserId());
            }

            String sql = "INSERT INTO user_address(user_id, full_name, phone, street_address, city, state, pincode, is_default) VALUES(?,?,?,?,?,?,?,?)";
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, addr.getUserId());
            ps.setString(2, addr.getFullName());
            ps.setString(3, addr.getPhone());
            ps.setString(4, addr.getStreetAddress());
            ps.setString(5, addr.getCity());
            ps.setString(6, addr.getState());
            ps.setString(7, addr.getPincode());
            ps.setInt(8, addr.getIsDefault());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                ResultSet rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    addressId = rs.getInt(1);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return addressId;
    }

    public List<UserAddress> getUserAddresses(int userId) {
        List<UserAddress> list = new ArrayList<>();
        try {
            String sql = "SELECT * FROM user_address WHERE user_id = ? ORDER BY is_default DESC, id DESC";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToAddress(rs));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public UserAddress getAddressById(int id) {
        UserAddress addr = null;
        try {
            String sql = "SELECT * FROM user_address WHERE id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                addr = mapResultSetToAddress(rs);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return addr;
    }

    public boolean setDefaultAddress(int userId, int addressId) {
        boolean f = false;
        try {
            resetDefaultAddresses(userId);
            String sql = "UPDATE user_address SET is_default = 1 WHERE id = ? AND user_id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, addressId);
            ps.setInt(2, userId);
            int i = ps.executeUpdate();
            if (i > 0) f = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return f;
    }

    private void resetDefaultAddresses(int userId) throws Exception {
        String resetSql = "UPDATE user_address SET is_default = 0 WHERE user_id = ?";
        PreparedStatement ps = conn.prepareStatement(resetSql);
        ps.setInt(1, userId);
        ps.executeUpdate();
    }

    private UserAddress mapResultSetToAddress(ResultSet rs) throws Exception {
        return new UserAddress(
            rs.getInt("id"),
            rs.getInt("user_id"),
            rs.getString("full_name"),
            rs.getString("phone"),
            rs.getString("street_address"),
            rs.getString("city"),
            rs.getString("state"),
            rs.getString("pincode"),
            rs.getInt("is_default")
        );
    }
}
