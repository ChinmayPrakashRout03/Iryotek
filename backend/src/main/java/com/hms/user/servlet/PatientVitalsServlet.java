package com.hms.user.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.PatientVitalsDAO;
import com.hms.db.DBConnection;
import com.hms.entity.PatientVital;
import com.hms.entity.User;

@WebServlet("/patientVitals")
public class PatientVitalsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession();
        User user = (User) session.getAttribute("userObj");

        if (user == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\":\"Unauthorized\"}");
            return;
        }

        Connection conn = DBConnection.getConn();
        PatientVitalsDAO dao = new PatientVitalsDAO(conn);

        String action = req.getParameter("action");
        if ("delete".equalsIgnoreCase(action)) {
            String idStr = req.getParameter("id");
            if (idStr != null) {
                try {
                    int id = Integer.parseInt(idStr);
                    dao.deleteVital(id, user.getId());
                    session.setAttribute("succMsg", "Vital reading deleted successfully.");
                } catch (Exception e) {
                    session.setAttribute("errorMsg", "Failed to delete vital reading.");
                }
            }
            resp.sendRedirect("patient_profile.jsp?tab=vitals");
            return;
        }

        // Return JSON format for Recharts client-side queries if requested
        String format = req.getParameter("format");
        if ("json".equalsIgnoreCase(format)) {
            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            dao.seedSampleVitalsIfEmpty(user.getId());
            List<PatientVital> list = dao.getVitalsByUserId(user.getId());
            
            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                PatientVital v = list.get(i);
                json.append("{")
                    .append("\"id\":").append(v.getId()).append(",")
                    .append("\"date\":\"").append(v.getRecordedDate() != null ? v.getRecordedDate() : "").append("\",")
                    .append("\"heartRate\":").append(v.getHeartRate()).append(",")
                    .append("\"systolic\":").append(v.getBloodPressureSystolic()).append(",")
                    .append("\"diastolic\":").append(v.getBloodPressureDiastolic()).append(",")
                    .append("\"weight\":").append(v.getWeight()).append(",")
                    .append("\"glucose\":").append(v.getBloodGlucose()).append(",")
                    .append("\"spo2\":").append(v.getOxygenSaturation()).append(",")
                    .append("\"temp\":").append(v.getTemperature()).append(",")
                    .append("\"notes\":\"").append(v.getNotes() != null ? v.getNotes().replace("\"", "\\\"") : "").append("\"")
                    .append("}");
                if (i < list.size() - 1) json.append(",");
            }
            json.append("]");
            PrintWriter out = resp.getWriter();
            out.print(json.toString());
            out.flush();
            return;
        }

        resp.sendRedirect("patient_profile.jsp?tab=vitals");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession();
        User user = (User) session.getAttribute("userObj");

        if (user == null) {
            session.setAttribute("errorMsg", "Please login to log your vital signs.");
            resp.sendRedirect("user_login.jsp");
            return;
        }

        try {
            String recordedDate = req.getParameter("recordedDate");
            String heartRateStr = req.getParameter("heartRate");
            String systolicStr = req.getParameter("bloodPressureSystolic");
            String diastolicStr = req.getParameter("bloodPressureDiastolic");
            String weightStr = req.getParameter("weight");
            String glucoseStr = req.getParameter("bloodGlucose");
            String spo2Str = req.getParameter("oxygenSaturation");
            String tempStr = req.getParameter("temperature");
            String notes = req.getParameter("notes");

            if (recordedDate == null || recordedDate.trim().isEmpty()) {
                recordedDate = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
            }

            PatientVital vital = new PatientVital();
            vital.setUserId(user.getId());
            vital.setRecordedDate(recordedDate.trim());

            if (heartRateStr != null && !heartRateStr.trim().isEmpty()) {
                vital.setHeartRate(Integer.parseInt(heartRateStr.trim()));
            }
            if (systolicStr != null && !systolicStr.trim().isEmpty()) {
                vital.setBloodPressureSystolic(Integer.parseInt(systolicStr.trim()));
            }
            if (diastolicStr != null && !diastolicStr.trim().isEmpty()) {
                vital.setBloodPressureDiastolic(Integer.parseInt(diastolicStr.trim()));
            }
            if (weightStr != null && !weightStr.trim().isEmpty()) {
                vital.setWeight(Double.parseDouble(weightStr.trim()));
            }
            if (glucoseStr != null && !glucoseStr.trim().isEmpty()) {
                vital.setBloodGlucose(Integer.parseInt(glucoseStr.trim()));
            }
            if (spo2Str != null && !spo2Str.trim().isEmpty()) {
                vital.setOxygenSaturation(Integer.parseInt(spo2Str.trim()));
            }
            if (tempStr != null && !tempStr.trim().isEmpty()) {
                vital.setTemperature(Double.parseDouble(tempStr.trim()));
            }
            vital.setNotes(notes != null ? notes.trim() : "");

            Connection conn = DBConnection.getConn();
            PatientVitalsDAO dao = new PatientVitalsDAO(conn);
            boolean ok = dao.addVital(vital);

            if (ok) {
                session.setAttribute("succMsg", "New vital signs recorded successfully! Dashboard updated.");
            } else {
                session.setAttribute("errorMsg", "Failed to record vital signs. Please try again.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorMsg", "Error logging vitals: " + e.getMessage());
        }

        resp.sendRedirect("patient_profile.jsp?tab=vitals");
    }
}
