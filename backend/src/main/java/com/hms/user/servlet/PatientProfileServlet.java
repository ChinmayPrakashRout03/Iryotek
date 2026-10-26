package com.hms.user.servlet;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.PatientProfileDAO;
import com.hms.db.DBConnection;
import com.hms.entity.PatientProfile;
import com.hms.entity.User;

@WebServlet("/updatePatientProfile")
public class PatientProfileServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession();
        User user = (User) session.getAttribute("userObj");

        if (user == null) {
            session.setAttribute("errorMsg", "Please login to access your patient profile.");
            resp.sendRedirect("user_login.jsp");
            return;
        }

        try {
            int userId = user.getId();
            String fullName = req.getParameter("fullName");
            String phone = req.getParameter("phone");
            String dateOfBirth = req.getParameter("dateOfBirth");
            String gender = req.getParameter("gender");
            String bloodGroup = req.getParameter("bloodGroup");
            String address = req.getParameter("address");
            String city = req.getParameter("city");
            String state = req.getParameter("state");
            String pincode = req.getParameter("pincode");
            String emergencyContactName = req.getParameter("emergencyContactName");
            String emergencyContactRelation = req.getParameter("emergencyContactRelation");
            String emergencyContactPhone = req.getParameter("emergencyContactPhone");

            Connection conn = DBConnection.getConn();

            // Update user full name in user_details if modified
            if (fullName != null && !fullName.trim().isEmpty() && !fullName.equals(user.getFullName())) {
                try {
                    String updateSql = "UPDATE user_details SET full_name = ? WHERE id = ?";
                    PreparedStatement pstmt = conn.prepareStatement(updateSql);
                    pstmt.setString(1, fullName.trim());
                    pstmt.setInt(2, userId);
                    pstmt.executeUpdate();
                    user.setFullName(fullName.trim());
                    session.setAttribute("userObj", user);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            PatientProfile profile = new PatientProfile();
            profile.setUserId(userId);
            profile.setPhone(phone != null ? phone.trim() : "");
            profile.setDateOfBirth(dateOfBirth != null ? dateOfBirth.trim() : "");
            profile.setGender(gender != null ? gender.trim() : "");
            profile.setBloodGroup(bloodGroup != null ? bloodGroup.trim() : "");
            profile.setAddress(address != null ? address.trim() : "");
            profile.setCity(city != null ? city.trim() : "");
            profile.setState(state != null ? state.trim() : "");
            profile.setPincode(pincode != null ? pincode.trim() : "");
            profile.setEmergencyContactName(emergencyContactName != null ? emergencyContactName.trim() : "");
            profile.setEmergencyContactRelation(emergencyContactRelation != null ? emergencyContactRelation.trim() : "");
            profile.setEmergencyContactPhone(emergencyContactPhone != null ? emergencyContactPhone.trim() : "");

            PatientProfileDAO dao = new PatientProfileDAO(conn);
            boolean success = dao.saveOrUpdateProfile(profile);

            if (success) {
                session.setAttribute("succMsg", "Personal details and emergency contact saved successfully!");
            } else {
                session.setAttribute("errorMsg", "Failed to update profile. Please try again.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorMsg", "An unexpected error occurred: " + e.getMessage());
        }

        resp.sendRedirect("patient_profile.jsp?tab=personal");
    }
}
