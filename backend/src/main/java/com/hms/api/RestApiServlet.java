package com.hms.api;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.hms.ai.EmergencyDetector;
import com.hms.ai.EmergencyDetector.DetectionResult;
import com.hms.dao.AppointmentDAO;
import com.hms.dao.DoctorDAO;
import com.hms.dao.HospitalDAO;
import com.hms.dao.MedicineDAO;
import com.hms.dao.SpecialistDAO;
import com.hms.dao.UserDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.Hospital;
import com.hms.entity.Medicine;
import com.hms.entity.Specialist;
import com.hms.entity.User;
import org.mindrot.jbcrypt.BCrypt;

@WebServlet(urlPatterns = {"/api/*"})
public class RestApiServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/") || pathInfo.isEmpty()) {
            sendJson(resp, Map.of("service", "Iryotek REST API Gateway", "version", "1.0", "status", "online"));
            return;
        }

        try {
            if (pathInfo.startsWith("/stats")) {
                handleStats(req, resp);
            } else if (pathInfo.startsWith("/hospitals")) {
                handleHospitals(req, resp);
            } else if (pathInfo.startsWith("/doctors")) {
                handleDoctors(req, resp);
            } else if (pathInfo.startsWith("/medicines/categories")) {
                handleMedicineCategories(req, resp);
            } else if (pathInfo.startsWith("/medicines")) {
                handleMedicines(req, resp);
            } else if (pathInfo.startsWith("/appointments")) {
                handleGetAppointments(req, resp);
            } else if (pathInfo.startsWith("/specialties")) {
                handleSpecialties(req, resp);
            } else if (pathInfo.startsWith("/cities")) {
                handleCities(req, resp);
            } else if (pathInfo.startsWith("/states")) {
                handleStates(req, resp);
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                sendJson(resp, Map.of("error", "Endpoint not found: " + pathInfo));
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            sendJson(resp, Map.of("error", e.getMessage() != null ? e.getMessage() : "Internal server error"));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String pathInfo = req.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        try {
            if (pathInfo.startsWith("/triage")) {
                handleTriage(req, resp);
            } else if (pathInfo.startsWith("/appointments/status")) {
                handleUpdateAppointmentStatus(req, resp);
            } else if (pathInfo.startsWith("/appointments")) {
                handleCreateAppointment(req, resp);
            } else if (pathInfo.startsWith("/auth/login")) {
                handleLogin(req, resp);
            } else if (pathInfo.startsWith("/auth/register")) {
                handleRegister(req, resp);
            } else if (pathInfo.startsWith("/doctors")) {
                handleRegisterDoctor(req, resp);
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                sendJson(resp, Map.of("error", "Endpoint not found: " + pathInfo));
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            sendJson(resp, Map.of("error", e.getMessage() != null ? e.getMessage() : "Internal server error"));
        }
    }

    // --- Handlers ---

    private void handleStats(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        Connection conn = DBConnection.getConn();
        long doctorCount = 0;
        long hospitalCount = 0;
        long medicineCount = 0;
        long appointmentCount = 0;

        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM doctor");
            if (rs.next()) doctorCount = rs.getLong(1);

            rs = stmt.executeQuery("SELECT COUNT(*) FROM hospital");
            if (rs.next()) hospitalCount = rs.getLong(1);

            rs = stmt.executeQuery("SELECT COUNT(*) FROM medicine");
            if (rs.next()) medicineCount = rs.getLong(1);

            rs = stmt.executeQuery("SELECT COUNT(*) FROM appointment");
            if (rs.next()) appointmentCount = rs.getLong(1);
        }

        JsonObject obj = new JsonObject();
        obj.addProperty("status", "success");
        obj.addProperty("doctorsCount", doctorCount);
        obj.addProperty("hospitalsCount", hospitalCount);
        obj.addProperty("medicinesCount", medicineCount);
        obj.addProperty("appointmentsCount", appointmentCount);
        obj.addProperty("satisfactionRate", 98.6);
        sendJson(resp, obj);
    }

    private void handleHospitals(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        String city = req.getParameter("city");
        String state = req.getParameter("state");
        String search = req.getParameter("search");
        String idParam = req.getParameter("id");
        int limit = getIntParam(req, "limit", 50);
        int page = getIntParam(req, "page", 1);
        int offset = req.getParameter("offset") != null ? getIntParam(req, "offset", 0) : (Math.max(1, page) - 1) * limit;

        Connection conn = DBConnection.getConn();
        List<Map<String, Object>> list = new ArrayList<>();

        if (idParam != null && !idParam.trim().isEmpty()) {
            HospitalDAO dao = new HospitalDAO(conn);
            Hospital h = dao.getHospitalById(Integer.parseInt(idParam));
            if (h != null) {
                Map<String, Object> map = hospitalToMap(h);
                sendJson(resp, map);
                return;
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                sendJson(resp, Map.of("error", "Hospital not found"));
                return;
            }
        }

        StringBuilder sql = new StringBuilder("SELECT * FROM hospital WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (city != null && !city.trim().isEmpty() && !"All cities".equalsIgnoreCase(city)) {
            sql.append(" AND LOWER(city) = ? ");
            params.add(city.toLowerCase().trim());
        }
        if (state != null && !state.trim().isEmpty() && !"All states".equalsIgnoreCase(state)) {
            sql.append(" AND LOWER(state) = ? ");
            params.add(state.toLowerCase().trim());
        }
        if (search != null && !search.trim().isEmpty()) {
            sql.append(" AND (LOWER(name) LIKE ? OR LOWER(city) LIKE ? OR LOWER(address) LIKE ?) ");
            String q = "%" + search.toLowerCase().trim() + "%";
            params.add(q);
            params.add(q);
            params.add(q);
        }

        sql.append(" ORDER BY id ASC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        try (PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                Object p = params.get(i);
                if (p instanceof Integer) ps.setInt(i + 1, (Integer) p);
                else ps.setString(i + 1, (String) p);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", rs.getInt("id"));
                    map.put("name", rs.getString("name"));
                    map.put("address", rs.getString("address"));
                    map.put("city", rs.getString("city"));
                    map.put("state", rs.getString("state"));
                    map.put("phone", rs.getString("phone"));
                    map.put("rating", "4.8");
                    map.put("beds", 150 + (rs.getInt("id") % 200));
                    map.put("emergency", rs.getInt("id") % 2 == 0);
                    map.put("established", 2005 + (rs.getInt("id") % 18));
                    list.add(map);
                }
            }
        }

        sendJson(resp, list);
    }

    private void handleDoctors(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        String city = req.getParameter("city");
        String state = req.getParameter("state");
        String specialty = req.getParameter("specialty");
        String search = req.getParameter("search");
        String hospitalId = req.getParameter("hospitalId");
        String idParam = req.getParameter("id");
        int limit = getIntParam(req, "limit", 30);
        int page = getIntParam(req, "page", 1);
        int offset = req.getParameter("offset") != null ? getIntParam(req, "offset", 0) : (Math.max(1, page) - 1) * limit;

        Connection conn = DBConnection.getConn();

        if (idParam != null && !idParam.trim().isEmpty()) {
            DoctorDAO dao = new DoctorDAO(conn);
            Doctor doc = dao.getDoctorById(Integer.parseInt(idParam));
            if (doc != null) {
                HospitalDAO hdao = new HospitalDAO(conn);
                Hospital h = hdao.getHospitalById(doc.getHospitalId());
                Map<String, Object> map = doctorToMap(doc, h);
                sendJson(resp, map);
                return;
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                sendJson(resp, Map.of("error", "Doctor not found"));
                return;
            }
        }

        List<Map<String, Object>> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
            "SELECT d.id, d.fullName, d.qualification, d.specialist, d.diseases, d.email, d.phone, d.hospitalId, d.timing, " +
            "h.name as hospitalName, h.address as hospitalAddress, h.city, h.state " +
            "FROM doctor d LEFT JOIN hospital h ON d.hospitalId = h.id WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (specialty != null && !specialty.trim().isEmpty() && !"All specialties".equalsIgnoreCase(specialty)) {
            sql.append(" AND LOWER(d.specialist) = ? ");
            params.add(specialty.toLowerCase().trim());
        }
        if (city != null && !city.trim().isEmpty() && !"All cities".equalsIgnoreCase(city)) {
            sql.append(" AND LOWER(h.city) = ? ");
            params.add(city.toLowerCase().trim());
        }
        if (state != null && !state.trim().isEmpty() && !"All states".equalsIgnoreCase(state)) {
            sql.append(" AND LOWER(h.state) = ? ");
            params.add(state.toLowerCase().trim());
        }
        if (hospitalId != null && !hospitalId.trim().isEmpty()) {
            sql.append(" AND d.hospitalId = ? ");
            params.add(Integer.parseInt(hospitalId));
        }
        if (search != null && !search.trim().isEmpty()) {
            sql.append(" AND (LOWER(d.fullName) LIKE ? OR LOWER(d.specialist) LIKE ? OR LOWER(h.name) LIKE ? OR LOWER(h.city) LIKE ?) ");
            String q = "%" + search.toLowerCase().trim() + "%";
            params.add(q);
            params.add(q);
            params.add(q);
            params.add(q);
        }

        sql.append(" ORDER BY d.id DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        try (PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                Object p = params.get(i);
                if (p instanceof Integer) ps.setInt(i + 1, (Integer) p);
                else ps.setString(i + 1, (String) p);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> map = new HashMap<>();
                    int docId = rs.getInt("id");
                    map.put("id", docId);
                    map.put("doctorId", docId);
                    map.put("name", "Dr. " + rs.getString("fullName").replaceFirst("(?i)^dr\\.?\\s*", ""));
                    map.put("fullName", rs.getString("fullName"));
                    map.put("qualification", rs.getString("qualification"));
                    map.put("specialist", rs.getString("specialist"));
                    map.put("specialty", rs.getString("specialist"));
                    map.put("email", rs.getString("email"));
                    map.put("phone", rs.getString("phone"));
                    map.put("hospitalId", rs.getInt("hospitalId"));
                    map.put("hospital", rs.getString("hospitalName") != null ? rs.getString("hospitalName") : "Iryotek Network Hospital");
                    map.put("hospitalName", rs.getString("hospitalName") != null ? rs.getString("hospitalName") : "Iryotek Network Hospital");
                    map.put("address", rs.getString("hospitalAddress") != null ? rs.getString("hospitalAddress") : "");
                    map.put("city", rs.getString("city") != null ? rs.getString("city") : "New Delhi");
                    map.put("state", rs.getString("state") != null ? rs.getString("state") : "Delhi");
                    map.put("timing", rs.getString("timing") != null ? rs.getString("timing") : "09:00 - 13:00");
                    map.put("rating", (docId % 3 == 0) ? "4.9" : "4.8");
                    map.put("price", 500 + ((docId % 10) * 100));
                    map.put("experience", 8 + (docId % 15));
                    map.put("image", (docId % 2 == 0) ? "doctor" : "doctor2");
                    list.add(map);
                }
            }
        }

        sendJson(resp, list);
    }

    private void handleMedicines(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        String idStr = req.getParameter("id");
        Connection conn = DBConnection.getConn();
        MedicineDAO dao = new MedicineDAO(conn);

        if (idStr != null && !idStr.trim().isEmpty()) {
            try {
                int id = Integer.parseInt(idStr.trim());
                Medicine m = dao.getMedicineById(id);
                if (m != null) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", m.getId());
                    map.put("name", m.getName());
                    map.put("category", m.getCategory() != null ? m.getCategory() : "General");
                    map.put("description", m.getDescription() != null ? m.getDescription() : "Essential healthcare formulation.");
                    map.put("price", m.getPrice());
                    map.put("stock", m.getStock());
                    map.put("dose", m.getDosageForm() != null ? m.getDosageForm() : "Standard dosage");
                    map.put("brand", "Iryotek Care");
                    map.put("quantity", 1);
                    map.put("prescription", "Prescription".equalsIgnoreCase(m.getCategory()));
                    map.put("image", m.getImageUrl() != null ? m.getImageUrl() : "");
                    map.put("imageUrl", m.getImageUrl() != null ? m.getImageUrl() : "");
                    sendJson(resp, map);
                    return;
                } else {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    sendJson(resp, Map.of("error", "Medicine not found with id: " + id));
                    return;
                }
            } catch (NumberFormatException e) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                sendJson(resp, Map.of("error", "Invalid medicine id: " + idStr));
                return;
            }
        }

        String search = req.getParameter("search");
        String category = req.getParameter("category");
        int page = getIntParam(req, "page", 1);
        int limit = getIntParam(req, "limit", 24);
        String hasImageParam = req.getParameter("hasImage");
        Boolean hasImage = (hasImageParam != null && !hasImageParam.isEmpty()) ? Boolean.parseBoolean(hasImageParam) : null;

        int totalCount = dao.getTotalMedicineCount(search, category, hasImage);
        List<Medicine> medList = dao.searchMedicinesPaginated(search, category, hasImage, page, limit);

        List<Map<String, Object>> items = new ArrayList<>();
        for (Medicine m : medList) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("name", m.getName());
            map.put("category", m.getCategory() != null ? m.getCategory() : "General");
            map.put("description", m.getDescription() != null ? m.getDescription() : "Essential healthcare formulation.");
            map.put("price", m.getPrice());
            map.put("stock", m.getStock());
            map.put("dose", m.getDosageForm() != null ? m.getDosageForm() : "Standard dosage");
            map.put("brand", "Iryotek Care");
            map.put("quantity", 1);
            map.put("prescription", "Prescription".equalsIgnoreCase(m.getCategory()));
            map.put("image", m.getImageUrl() != null ? m.getImageUrl() : "");
            map.put("imageUrl", m.getImageUrl() != null ? m.getImageUrl() : "");
            items.add(map);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("total", totalCount);
        result.put("page", page);
        result.put("limit", limit);
        result.put("totalPages", (int) Math.ceil((double) totalCount / limit));
        result.put("medicines", items);

        sendJson(resp, result);
    }

    private void handleMedicineCategories(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        Connection conn = DBConnection.getConn();
        MedicineDAO dao = new MedicineDAO(conn);
        List<String> categories = dao.getAllCategories();
        sendJson(resp, categories);
    }

    private void handleSpecialties(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        Connection conn = DBConnection.getConn();
        SpecialistDAO dao = new SpecialistDAO(conn);
        List<Specialist> list = dao.getAllSpecialist();
        List<String> names = new ArrayList<>();
        for (Specialist s : list) {
            names.add(s.getSpecialistName());
        }
        sendJson(resp, names);
    }

    private void handleCities(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        String state = req.getParameter("state");
        Connection conn = DBConnection.getConn();
        List<String> cities = new ArrayList<>();
        if (state != null && !state.trim().isEmpty() && !"All states".equalsIgnoreCase(state)) {
            String sql = "SELECT DISTINCT city FROM hospital WHERE LOWER(state) = ? AND city IS NOT NULL AND city != '' ORDER BY city ASC";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, state.toLowerCase().trim());
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        cities.add(rs.getString("city").trim());
                    }
                }
            }
        } else {
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT DISTINCT city FROM hospital WHERE city IS NOT NULL AND city != '' ORDER BY city ASC")) {
                while (rs.next()) {
                    cities.add(rs.getString("city").trim());
                }
            }
        }
        sendJson(resp, cities);
    }

    private void handleStates(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        Connection conn = DBConnection.getConn();
        List<String> states = new ArrayList<>();
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT DISTINCT state FROM hospital WHERE state IS NOT NULL AND state != '' ORDER BY state ASC")) {
            while (rs.next()) {
                states.add(rs.getString("state").trim());
            }
        }
        sendJson(resp, states);
    }

    private void handleGetAppointments(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        String userIdStr = req.getParameter("userId");
        String doctorIdStr = req.getParameter("doctorId");
        Connection conn = DBConnection.getConn();
        AppointmentDAO dao = new AppointmentDAO(conn);

        List<Appointment> list;
        if (doctorIdStr != null && !doctorIdStr.trim().isEmpty()) {
            list = dao.getAllAppointmentByLoginDoctor(Integer.parseInt(doctorIdStr.trim()));
        } else if (userIdStr != null && !userIdStr.trim().isEmpty()) {
            list = dao.getAllAppointmentByLoginUser(Integer.parseInt(userIdStr.trim()));
        } else {
            list = dao.getAllAppointment();
        }

        List<Map<String, Object>> result = new ArrayList<>();
        DoctorDAO docDao = new DoctorDAO(conn);
        for (Appointment a : list) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", String.valueOf(a.getId()));
            m.put("tokenNo", a.getTokenNo());
            m.put("userId", a.getUserId());
            m.put("fullName", a.getFullName());
            m.put("patientName", a.getFullName());
            m.put("gender", a.getGender());
            m.put("age", a.getAge());
            m.put("appointmentDate", a.getAppointmentDate());
            m.put("appointmentTime", a.getAppointmentTime());
            m.put("email", a.getEmail());
            m.put("phone", a.getPhone());
            m.put("diseases", a.getDiseases());
            m.put("concern", a.getDiseases());
            m.put("doctorId", a.getDoctorId());
            m.put("status", a.getStatus());

            Doctor d = docDao.getDoctorById(a.getDoctorId());
            m.put("doctor", d != null ? "Dr. " + d.getFullName().replaceFirst("(?i)^dr\\.?\\s*", "") : "Doctor #" + a.getDoctorId());
            m.put("specialty", d != null ? d.getSpecialist() : "General physician");
            m.put("date", a.getAppointmentDate());
            m.put("time", a.getAppointmentTime());
            result.add(m);
        }

        sendJson(resp, result);
    }

    private void handleUpdateAppointmentStatus(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        JsonObject body = parseJsonBody(req);
        if (body == null || !body.has("appointmentId") || !body.has("status")) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            sendJson(resp, Map.of("error", "Missing appointmentId or status"));
            return;
        }

        String apptIdStr = body.get("appointmentId").getAsString().replaceAll("[^0-9]", "");
        int apptId = 0;
        try {
            if (!apptIdStr.isEmpty()) apptId = Integer.parseInt(apptIdStr);
        } catch (Exception e) {}

        String status = body.get("status").getAsString().trim();
        int doctorId = body.has("doctorId") ? body.get("doctorId").getAsInt() : 0;

        Connection conn = DBConnection.getConn();
        String sql = doctorId > 0 ? "UPDATE appointment SET status=? WHERE id=? AND doctorId=?" : "UPDATE appointment SET status=? WHERE id=?";
        PreparedStatement pstmt = conn.prepareStatement(sql);
        pstmt.setString(1, status);
        pstmt.setInt(2, apptId);
        if (doctorId > 0) {
            pstmt.setInt(3, doctorId);
        }
        int rows = pstmt.executeUpdate();
        pstmt.close();

        JsonObject res = new JsonObject();
        res.addProperty("status", "success");
        res.addProperty("rowsUpdated", rows);
        res.addProperty("message", "Appointment status updated to " + status);
        sendJson(resp, res);
    }

    private void handleCreateAppointment(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        JsonObject body = parseJsonBody(req);
        if (body == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            sendJson(resp, Map.of("error", "Invalid JSON payload"));
            return;
        }

        int userId = body.has("userId") ? body.get("userId").getAsInt() : 1;
        String fullName = body.has("fullName") ? body.get("fullName").getAsString() : (body.has("patientName") ? body.get("patientName").getAsString() : "Registered Patient");
        String gender = body.has("gender") ? body.get("gender").getAsString() : "Not specified";
        String age = body.has("age") ? body.get("age").getAsString() : "30";
        String appointmentDate = body.has("appointmentDate") ? body.get("appointmentDate").getAsString() : (body.has("date") ? body.get("date").getAsString() : java.time.LocalDate.now().toString());
        String email = body.has("email") ? body.get("email").getAsString() : "patient@iryotek.in";
        String phone = body.has("phone") ? body.get("phone").getAsString() : "";
        String diseases = body.has("diseases") ? body.get("diseases").getAsString() : (body.has("symptoms") ? body.get("symptoms").getAsString() : "General Consultation");
        int doctorId = body.has("doctorId") ? body.get("doctorId").getAsInt() : 1;
        String address = body.has("address") ? body.get("address").getAsString() : "India";

        try {
            java.time.LocalDate apptLocalDate = java.time.LocalDate.parse(appointmentDate);
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate maxDate = today.plusDays(7);
            if (apptLocalDate.isBefore(today)) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                sendJson(resp, Map.of("error", "Appointment date cannot be in the past. Please select today or an upcoming date within 7 days."));
                return;
            }
            if (apptLocalDate.isAfter(maxDate)) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                sendJson(resp, Map.of("error", "Appointments can only be booked up to 7 days in advance."));
                return;
            }
        } catch (Exception ignored) {}

        Connection conn = DBConnection.getConn();
        AppointmentDAO dao = new AppointmentDAO(conn);

        Appointment appt = new Appointment(userId, fullName, gender, age, appointmentDate, email, phone, diseases, doctorId, address, "Pending");
        if (body.has("appointmentTime")) {
            appt.setAppointmentTime(body.get("appointmentTime").getAsString());
        } else if (body.has("time")) {
            appt.setAppointmentTime(body.get("time").getAsString());
        }
        boolean ok = dao.addAppointment(appt);

        if (ok) {
            DoctorDAO docDao = new DoctorDAO(conn);
            Doctor doc = docDao.getDoctorById(doctorId);
            String docName = doc != null ? "Dr. " + doc.getFullName().replaceFirst("(?i)^dr\\.?\\s*", "") : "Doctor";

            int generatedOrTokenId = appt.getId() > 0 ? appt.getId() : appt.getTokenNo();
            JsonObject res = new JsonObject();
            res.addProperty("status", "success");
            res.addProperty("message", "Appointment booked successfully");
            res.addProperty("appointmentId", generatedOrTokenId);
            res.addProperty("tokenNo", appt.getTokenNo());
            res.addProperty("appointmentTime", appt.getAppointmentTime());
            res.addProperty("doctorId", doctorId);
            res.addProperty("doctor", docName);
            res.addProperty("date", appointmentDate);
            res.addProperty("id", String.valueOf(generatedOrTokenId));
            sendJson(resp, res);
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            sendJson(resp, Map.of("error", "Failed to book appointment in database"));
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        JsonObject body = parseJsonBody(req);
        if (body == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            sendJson(resp, Map.of("error", "Invalid JSON payload"));
            return;
        }

        String email = body.has("email") ? body.get("email").getAsString().trim() : "";
        String password = body.has("password") ? body.get("password").getAsString().trim() : "";
        String role = body.has("role") ? body.get("role").getAsString().trim() : "patient";

        Connection conn = DBConnection.getConn();

        if ("admin".equalsIgnoreCase(role)) {
            if ("admin@gmail.com".equalsIgnoreCase(email) && "admin".equals(password)) {
                JsonObject u = new JsonObject();
                u.addProperty("id", 1);
                u.addProperty("fullName", "System Administrator");
                u.addProperty("email", email);
                u.addProperty("role", "admin");
                sendJson(resp, Map.of("status", "success", "user", u));
                return;
            } else {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                sendJson(resp, Map.of("error", "Invalid admin credentials"));
                return;
            }
        }

        if ("doctor".equalsIgnoreCase(role)) {
            DoctorDAO docDao = new DoctorDAO(conn);
            Doctor d = docDao.loginDoctor(email, password);
            if (d != null) {
                JsonObject u = new JsonObject();
                u.addProperty("id", d.getId());
                u.addProperty("fullName", d.getFullName());
                u.addProperty("email", d.getEmail());
                u.addProperty("specialty", d.getSpecialist());
                u.addProperty("role", "doctor");
                sendJson(resp, Map.of("status", "success", "user", u));
                return;
            } else {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                sendJson(resp, Map.of("error", "Invalid doctor email or password"));
                return;
            }
        }

        // Default: Patient / User
        UserDAO userDao = new UserDAO(conn);
        User u = userDao.loginUser(email, password);
        if (u != null) {
            JsonObject userObj = new JsonObject();
            userObj.addProperty("id", u.getId());
            userObj.addProperty("fullName", u.getFullName());
            userObj.addProperty("email", u.getEmail());
            userObj.addProperty("role", "patient");
            sendJson(resp, Map.of("status", "success", "user", userObj));
        } else {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            sendJson(resp, Map.of("error", "Invalid patient credentials"));
        }
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        JsonObject body = parseJsonBody(req);
        if (body == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            sendJson(resp, Map.of("error", "Invalid JSON payload"));
            return;
        }

        String fullName = body.has("fullName") ? body.get("fullName").getAsString() : "";
        String email = body.has("email") ? body.get("email").getAsString() : "";
        String password = body.has("password") ? body.get("password").getAsString() : "";

        if (fullName.isEmpty() || email.isEmpty() || password.isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            sendJson(resp, Map.of("error", "Name, email, and password are required"));
            return;
        }

        Connection conn = DBConnection.getConn();
        UserDAO dao = new UserDAO(conn);
        User user = new User(fullName, email, password);
        boolean ok = dao.userRegister(user);

        if (ok) {
            sendJson(resp, Map.of("status", "success", "message", "User registered successfully"));
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            sendJson(resp, Map.of("error", "Registration failed. Email might already exist."));
        }
    }

    private void handleRegisterDoctor(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        JsonObject body = parseJsonBody(req);
        if (body == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            sendJson(resp, Map.of("error", "Invalid JSON payload"));
            return;
        }

        String fullName = body.has("fullName") ? body.get("fullName").getAsString().trim() : "";
        if (fullName.isEmpty() && body.has("name")) {
            fullName = body.get("name").getAsString().trim();
        }
        if (fullName.isEmpty() && body.has("firstName")) {
            String fn = body.get("firstName").getAsString().trim();
            String mn = body.has("middleName") ? body.get("middleName").getAsString().trim() : "";
            String ln = body.has("lastName") ? body.get("lastName").getAsString().trim() : "";
            fullName = "Dr. " + fn + (mn.isEmpty() ? "" : " " + mn) + (ln.isEmpty() ? "" : " " + ln);
        }
        if (!fullName.isEmpty() && !fullName.startsWith("Dr.")) {
            fullName = "Dr. " + fullName;
        }

        String email = body.has("email") ? body.get("email").getAsString().trim() : "";
        String password = body.has("password") ? body.get("password").getAsString().trim() : "doctor123";
        String specialty = body.has("specialist") ? body.get("specialist").getAsString().trim() :
                           (body.has("specialty") ? body.get("specialty").getAsString().trim() : "General physician");
        String qualification = body.has("qualification") ? body.get("qualification").getAsString().trim() : ("MBBS, MD (" + specialty + ")");
        String phone = body.has("phone") ? body.get("phone").getAsString().trim() : "9876543210";
        String timing = body.has("timing") ? body.get("timing").getAsString().trim() : "09:00 AM - 01:00 PM";
        String dob = body.has("dateOfBirth") ? body.get("dateOfBirth").getAsString().trim() :
                     (body.has("age") ? ("Age " + body.get("age").getAsString()) : "1985-01-01");
        String hospitalInput = body.has("hospital") ? body.get("hospital").getAsString().trim() :
                               (body.has("hospitalName") ? body.get("hospitalName").getAsString().trim() : "");
        int hospitalId = body.has("hospitalId") ? body.get("hospitalId").getAsInt() : 1;
        int experience = body.has("experience") ? body.get("experience").getAsInt() : 8;

        if (fullName.isEmpty() || email.isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            sendJson(resp, Map.of("error", "Doctor name and email are required"));
            return;
        }

        Connection conn = DBConnection.getConn();

        // If hospital name is provided, try to find matching hospital id
        if (!hospitalInput.isEmpty()) {
            try (PreparedStatement psH = conn.prepareStatement("SELECT id FROM hospital WHERE LOWER(name) LIKE ? LIMIT 1")) {
                psH.setString(1, "%" + hospitalInput.toLowerCase() + "%");
                try (ResultSet rsH = psH.executeQuery()) {
                    if (rsH.next()) {
                        hospitalId = rsH.getInt("id");
                    }
                }
            } catch (Exception ignored) {}
        }

        // Check if doctor with this email already exists
        int existingId = 0;
        try (PreparedStatement psCheck = conn.prepareStatement("SELECT id FROM doctor WHERE LOWER(email) = LOWER(?)")) {
            psCheck.setString(1, email);
            try (ResultSet rsCheck = psCheck.executeQuery()) {
                if (rsCheck.next()) {
                    existingId = rsCheck.getInt("id");
                }
            }
        }

        int docId = existingId;
        String hashed = BCrypt.hashpw(password, BCrypt.gensalt());

        if (existingId > 0) {
            String updateSql = "UPDATE doctor SET fullName=?, qualification=?, specialist=?, phone=?, hospitalId=?, timing=? WHERE id=?";
            try (PreparedStatement psUp = conn.prepareStatement(updateSql)) {
                psUp.setString(1, fullName);
                psUp.setString(2, qualification);
                psUp.setString(3, specialty);
                psUp.setString(4, phone);
                psUp.setInt(5, hospitalId);
                psUp.setString(6, timing);
                psUp.setInt(7, existingId);
                psUp.executeUpdate();
            }
        } else {
            String insertSql = "INSERT INTO doctor(fullName, dateOfBirth, qualification, specialist, diseases, email, phone, password, hospitalId, timing) VALUES(?,?,?,?,?,?,?,?,?,?)";
            try (PreparedStatement psIns = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                psIns.setString(1, fullName);
                psIns.setString(2, dob);
                psIns.setString(3, qualification);
                psIns.setString(4, specialty);
                psIns.setString(5, specialty);
                psIns.setString(6, email);
                psIns.setString(7, phone);
                psIns.setString(8, hashed);
                psIns.setInt(9, hospitalId);
                psIns.setString(10, timing);
                psIns.executeUpdate();

                try (ResultSet rsGen = psIns.getGeneratedKeys()) {
                    if (rsGen.next()) {
                        docId = rsGen.getInt(1);
                    }
                }
            }
        }

        // Fetch hospital details for response
        HospitalDAO hdao = new HospitalDAO(conn);
        Hospital h = hdao.getHospitalById(hospitalId);

        Map<String, Object> docMap = new HashMap<>();
        docMap.put("id", docId);
        docMap.put("doctorId", docId);
        docMap.put("name", fullName);
        docMap.put("fullName", fullName);
        docMap.put("qualification", qualification);
        docMap.put("specialist", specialty);
        docMap.put("specialty", specialty);
        docMap.put("email", email);
        docMap.put("phone", phone);
        docMap.put("hospitalId", hospitalId);
        docMap.put("hospital", h != null ? h.getName() : (hospitalInput.isEmpty() ? "Care Medical Center" : hospitalInput));
        docMap.put("hospitalName", h != null ? h.getName() : (hospitalInput.isEmpty() ? "Care Medical Center" : hospitalInput));
        docMap.put("city", h != null ? h.getCity() : "New Delhi");
        docMap.put("state", h != null ? h.getState() : "National");
        docMap.put("address", h != null ? h.getAddress() : "Hospital Campus");
        docMap.put("price", 600);
        docMap.put("rating", "4.9");
        docMap.put("timing", timing);
        docMap.put("experience", experience);

        sendJson(resp, Map.of(
            "status", "success",
            "message", "Doctor registered and added to hospital directory successfully",
            "doctor", docMap
        ));
    }

    private void handleTriage(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        JsonObject body = parseJsonBody(req);
        String message = "";
        if (body != null) {
            if (body.has("message")) {
                message = body.get("message").getAsString().trim();
            } else if (body.has("symptoms")) {
                message = body.get("symptoms").getAsString().trim();
            }
        }
        if (message.isEmpty()) {
            message = req.getParameter("message");
            if (message == null || message.trim().isEmpty()) {
                message = req.getParameter("symptoms");
            }
            if (message != null) message = message.trim();
        }

        if (message == null || message.trim().isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            sendJson(resp, Map.of("error", "Symptom message is required"));
            return;
        }

        // Emergency detection check
        DetectionResult emergencyResult = EmergencyDetector.checkEmergency(message);
        boolean isEmergency = emergencyResult.isEmergency();

        String triageLevel = isEmergency ? "EMERGENCY" : "ROUTINE";
        String triageBadge = isEmergency ? "🔴 Emergency - Seek Immediate Medical Care" : "🟡 Routine Clinical Evaluation";
        String recommendedSpecialty = "General physician";

        String lower = message.toLowerCase();
        if (lower.contains("rash") || lower.contains("skin") || lower.contains("itch") || lower.contains("acne")) {
            recommendedSpecialty = "Dermatologist";
        } else if (lower.contains("sinus") || lower.contains("throat") || lower.contains("ear") || lower.contains("nasal") || lower.contains("nose")) {
            recommendedSpecialty = "ENT specialist";
        } else if (lower.contains("heart") || lower.contains("palpitation") || lower.contains("blood pressure") || lower.contains("bp")) {
            recommendedSpecialty = "Cardiologist";
        } else if (lower.contains("headache") || lower.contains("migraine") || lower.contains("numbness") || lower.contains("dizziness")) {
            recommendedSpecialty = "Neurologist";
        } else if (lower.contains("bone") || lower.contains("joint") || lower.contains("knee") || lower.contains("fracture") || lower.contains("back pain")) {
            recommendedSpecialty = "Orthopedist";
        } else if (lower.contains("child") || lower.contains("baby") || lower.contains("infant") || lower.contains("kid")) {
            recommendedSpecialty = "Pediatrician";
        }

        JsonArray differentials = new JsonArray();
        if (isEmergency) {
            JsonObject d1 = new JsonObject();
            d1.addProperty("condition", "Acute Coronary Syndrome / Cardiovascular Event");
            d1.addProperty("probability", "Critical Urgency");
            d1.addProperty("reasoning", "Chest pain or acute respiratory distress indicates potential myocardial compromise requiring emergent evaluation.");
            differentials.add(d1);
        } else if ("Dermatologist".equals(recommendedSpecialty)) {
            JsonObject d1 = new JsonObject();
            d1.addProperty("condition", "Contact Dermatitis / Acute Urticaria");
            d1.addProperty("probability", "75% Confidence");
            d1.addProperty("reasoning", "Cutaneous erythema and pruritus consistent with allergic hypersensitivity reaction.");
            differentials.add(d1);
            JsonObject d2 = new JsonObject();
            d2.addProperty("condition", "Atopic Eczema Flaring");
            d2.addProperty("probability", "45% Confidence");
            d2.addProperty("reasoning", "Potential chronic inflammatory barrier disruption.");
            differentials.add(d2);
        } else if ("ENT specialist".equals(recommendedSpecialty)) {
            JsonObject d1 = new JsonObject();
            d1.addProperty("condition", "Acute Rhinosinusitis");
            d1.addProperty("probability", "80% Confidence");
            d1.addProperty("reasoning", "Facial pressure and sinus congestion indicating mucosal edema.");
            differentials.add(d1);
            JsonObject d2 = new JsonObject();
            d2.addProperty("condition", "Tension-Type Cephalea");
            d2.addProperty("probability", "50% Confidence");
            d2.addProperty("reasoning", "Secondary myofascial discomfort accompanying congestion.");
            differentials.add(d2);
        } else {
            JsonObject d1 = new JsonObject();
            d1.addProperty("condition", "Viral Prodrome / General Fatigue");
            d1.addProperty("probability", "65% Confidence");
            d1.addProperty("reasoning", "Non-specific systemic symptoms suggestive of subacute fatigue or viral phase.");
            differentials.add(d1);
        }

        JsonObject reply = new JsonObject();
        reply.addProperty("status", "success");
        reply.addProperty("isEmergency", isEmergency);
        reply.addProperty("triageLevel", triageLevel);
        reply.addProperty("triageBadge", triageBadge);
        reply.addProperty("recommendedSpecialty", recommendedSpecialty);
        reply.add("differentialDiagnoses", differentials);
        reply.addProperty("disclaimer", "FOR CLINICAL PREPARATION ONLY: This Iryo AI evaluation is provided to prepare you and your consulting physician. It does NOT constitute a confirmed medical diagnosis.");
        reply.addProperty("analysis", isEmergency ? emergencyResult.getGuidance() : "Based on your clinical symptoms, an evaluation with a " + recommendedSpecialty + " is recommended.");

        sendJson(resp, reply);
    }

    // --- Helper Methods ---

    private void setCorsHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
        resp.setHeader("Access-Control-Max-Age", "3600");
    }

    private void sendJson(HttpServletResponse resp, Object obj) throws IOException {
        PrintWriter out = resp.getWriter();
        if (obj instanceof JsonElement) {
            out.print(gson.toJson((JsonElement) obj));
        } else {
            out.print(gson.toJson(obj));
        }
        out.flush();
    }

    private JsonObject parseJsonBody(HttpServletRequest req) {
        try {
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = req.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            if (sb.length() == 0) return null;
            return JsonParser.parseString(sb.toString()).getAsJsonObject();
        } catch (Exception e) {
            return null;
        }
    }

    private int getIntParam(HttpServletRequest req, String name, int defaultValue) {
        String val = req.getParameter(name);
        if (val == null || val.trim().isEmpty()) return defaultValue;
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private Map<String, Object> hospitalToMap(Hospital h) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", h.getId());
        m.put("name", h.getName());
        m.put("address", h.getAddress());
        m.put("city", h.getCity());
        m.put("state", h.getState());
        m.put("phone", h.getPhone());
        m.put("rating", "4.8");
        m.put("beds", 180);
        m.put("emergency", true);
        m.put("established", 2010);
        return m;
    }

    private Map<String, Object> doctorToMap(Doctor d, Hospital h) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", d.getId());
        m.put("doctorId", d.getId());
        m.put("name", "Dr. " + d.getFullName().replaceFirst("(?i)^dr\\.?\\s*", ""));
        m.put("fullName", d.getFullName());
        m.put("qualification", d.getQualification());
        m.put("specialist", d.getSpecialist());
        m.put("specialty", d.getSpecialist());
        m.put("email", d.getEmail());
        m.put("phone", d.getPhone());
        m.put("hospitalId", d.getHospitalId());
        m.put("hospital", h != null ? h.getName() : "Iryotek Hospital");
        m.put("hospitalName", h != null ? h.getName() : "Iryotek Hospital");
        m.put("city", h != null ? h.getCity() : "New Delhi");
        m.put("state", h != null ? h.getState() : "Delhi");
        m.put("rating", "4.9");
        m.put("price", 600);
        m.put("experience", 12);
        m.put("image", "doctor");
        return m;
    }
}
