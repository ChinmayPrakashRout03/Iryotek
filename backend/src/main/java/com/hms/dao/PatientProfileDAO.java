package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import com.hms.entity.PatientProfile;

public class PatientProfileDAO {
    private Connection conn;

    public PatientProfileDAO(Connection conn) {
        this.conn = conn;
    }

    public PatientProfile getProfileByUserId(int userId) {
        PatientProfile profile = null;
        try {
            String sql = "SELECT * FROM patient_profile WHERE user_id = ?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                profile = new PatientProfile();
                profile.setId(rs.getInt("id"));
                profile.setUserId(rs.getInt("user_id"));
                profile.setPhone(rs.getString("phone"));
                profile.setDateOfBirth(rs.getString("date_of_birth"));
                profile.setGender(rs.getString("gender"));
                profile.setBloodGroup(rs.getString("blood_group"));
                profile.setAddress(rs.getString("address"));
                profile.setCity(rs.getString("city"));
                profile.setState(rs.getString("state"));
                profile.setPincode(rs.getString("pincode"));
                profile.setEmergencyContactName(rs.getString("emergency_contact_name"));
                profile.setEmergencyContactRelation(rs.getString("emergency_contact_relation"));
                profile.setEmergencyContactPhone(rs.getString("emergency_contact_phone"));
                profile.setUpdatedAt(rs.getTimestamp("updated_at"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return profile;
    }

    public boolean saveOrUpdateProfile(PatientProfile profile) {
        boolean success = false;
        try {
            String sql = "INSERT INTO patient_profile "
                    + "(user_id, phone, date_of_birth, gender, blood_group, address, city, state, pincode, "
                    + "emergency_contact_name, emergency_contact_relation, emergency_contact_phone) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) "
                    + "ON DUPLICATE KEY UPDATE "
                    + "phone = VALUES(phone), "
                    + "date_of_birth = VALUES(date_of_birth), "
                    + "gender = VALUES(gender), "
                    + "blood_group = VALUES(blood_group), "
                    + "address = VALUES(address), "
                    + "city = VALUES(city), "
                    + "state = VALUES(state), "
                    + "pincode = VALUES(pincode), "
                    + "emergency_contact_name = VALUES(emergency_contact_name), "
                    + "emergency_contact_relation = VALUES(emergency_contact_relation), "
                    + "emergency_contact_phone = VALUES(emergency_contact_phone), "
                    + "updated_at = CURRENT_TIMESTAMP";

            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, profile.getUserId());
            pstmt.setString(2, profile.getPhone());
            pstmt.setString(3, profile.getDateOfBirth());
            pstmt.setString(4, profile.getGender());
            pstmt.setString(5, profile.getBloodGroup());
            pstmt.setString(6, profile.getAddress());
            pstmt.setString(7, profile.getCity());
            pstmt.setString(8, profile.getState());
            pstmt.setString(9, profile.getPincode());
            pstmt.setString(10, profile.getEmergencyContactName());
            pstmt.setString(11, profile.getEmergencyContactRelation());
            pstmt.setString(12, profile.getEmergencyContactPhone());

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
