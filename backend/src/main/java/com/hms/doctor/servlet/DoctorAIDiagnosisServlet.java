package com.hms.doctor.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.hms.dao.AIDiagnosisDAO;
import com.hms.dao.AppointmentDAO;
import com.hms.dao.MedicalHistoryDAO;
import com.hms.dao.PatientDocumentDAO;
import com.hms.dao.PatientProfileDAO;
import com.hms.db.DBConnection;
import com.hms.entity.AIDiagnosis;
import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.MedicalHistoryItem;
import com.hms.entity.PatientDocument;
import com.hms.entity.PatientProfile;
import com.hms.entity.User;

@WebServlet("/doctorAIDiagnosis")
public class DoctorAIDiagnosisServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession();
        Doctor doctor = (Doctor) session.getAttribute("doctorObj");
        User user = (User) session.getAttribute("userObj");
        Object admin = session.getAttribute("adminObj");

        if (doctor == null && user == null && admin == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"error\":\"Authentication required to access clinical diagnosis review.\"}");
            out.flush();
            return;
        }

        Connection conn = DBConnection.getConn();
        AIDiagnosisDAO diagDao = new AIDiagnosisDAO(conn);
        PatientProfileDAO profileDao = new PatientProfileDAO(conn);
        MedicalHistoryDAO historyDao = new MedicalHistoryDAO(conn);
        PatientDocumentDAO docDao = new PatientDocumentDAO(conn);
        AppointmentDAO apptDao = new AppointmentDAO(conn);

        int resolvedUserId = 0;
        int appointmentId = 0;

        String apptParam = req.getParameter("appointmentId");
        if (apptParam != null && !apptParam.trim().isEmpty()) {
            try {
                appointmentId = Integer.parseInt(apptParam.trim());
                Appointment appt = apptDao.getAppointmentById(appointmentId);
                if (appt != null) {
                    resolvedUserId = appt.getUserId();
                }
            } catch (Exception ignored) {}
        }

        String userParam = req.getParameter("userId");
        if (userParam != null && !userParam.trim().isEmpty()) {
            try {
                resolvedUserId = Integer.parseInt(userParam.trim());
            } catch (Exception ignored) {}
        }

        // If logged in as patient and no param, use own id
        if (resolvedUserId == 0 && user != null) {
            resolvedUserId = user.getId();
        }

        // 1. Fetch AI Differential Diagnosis
        AIDiagnosis aiDiag = null;
        if (appointmentId > 0) {
            aiDiag = diagDao.getDiagnosisByAppointmentId(appointmentId);
        }
        if (aiDiag == null && resolvedUserId > 0) {
            aiDiag = diagDao.getLatestDiagnosisByUserId(resolvedUserId);
        }

        JsonObject responseObj = new JsonObject();
        responseObj.addProperty("status", "success");
        responseObj.addProperty("userId", resolvedUserId);
        responseObj.addProperty("appointmentId", appointmentId);
        responseObj.addProperty("disclaimer",
            "FOR INFORMATIONAL AND PREPARATORY PURPOSES ONLY. This AI-assisted differential diagnosis list is generated "
            + "from patient-reported symptoms for pre-consultation triage. It is NOT a confirmed diagnosis and requires "
            + "independent clinical assessment and validation by a licensed medical practitioner.");

        // AI Diagnosis Object
        if (aiDiag != null) {
            JsonObject diagObj = new JsonObject();
            diagObj.addProperty("id", aiDiag.getId());
            diagObj.addProperty("symptoms", aiDiag.getSymptoms());
            diagObj.addProperty("urgencyLevel", aiDiag.getUrgencyLevel());
            diagObj.addProperty("clinicalNotes", aiDiag.getClinicalNotes());
            diagObj.addProperty("createdAt", aiDiag.getCreatedAt() != null ? aiDiag.getCreatedAt().toString() : "");

            try {
                JsonElement elem = JsonParser.parseString(aiDiag.getDiagnosesJson());
                diagObj.add("differentialList", elem);
            } catch (Exception e) {
                diagObj.add("differentialList", new JsonArray());
            }
            responseObj.add("aiDiagnosis", diagObj);
        } else {
            responseObj.add("aiDiagnosis", null);
        }

        // 2. Fetch Patient Profile & Emergency Contact
        if (resolvedUserId > 0) {
            PatientProfile profile = profileDao.getProfileByUserId(resolvedUserId);
            if (profile != null) {
                JsonObject profObj = new JsonObject();
                profObj.addProperty("phone", profile.getPhone());
                profObj.addProperty("dateOfBirth", profile.getDateOfBirth());
                profObj.addProperty("gender", profile.getGender());
                profObj.addProperty("bloodGroup", profile.getBloodGroup());
                profObj.addProperty("address", profile.getAddress());
                profObj.addProperty("city", profile.getCity());
                profObj.addProperty("state", profile.getState());
                profObj.addProperty("pincode", profile.getPincode());
                profObj.addProperty("emergencyContactName", profile.getEmergencyContactName());
                profObj.addProperty("emergencyContactRelation", profile.getEmergencyContactRelation());
                profObj.addProperty("emergencyContactPhone", profile.getEmergencyContactPhone());
                responseObj.add("patientProfile", profObj);
            } else {
                responseObj.add("patientProfile", null);
            }

            // 3. Fetch Medical History Items
            List<MedicalHistoryItem> historyList = historyDao.getHistoryByUserId(resolvedUserId);
            JsonArray chronicArr = new JsonArray();
            JsonArray allergyArr = new JsonArray();
            JsonArray surgeryArr = new JsonArray();

            for (MedicalHistoryItem item : historyList) {
                JsonObject hObj = new JsonObject();
                hObj.addProperty("id", item.getId());
                hObj.addProperty("title", item.getTitle());
                hObj.addProperty("date", item.getDiagnosedYearOrDate());
                hObj.addProperty("severity", item.getSeverity());
                hObj.addProperty("notes", item.getNotes());

                if ("CHRONIC_CONDITION".equalsIgnoreCase(item.getCategory())) {
                    chronicArr.add(hObj);
                } else if ("ALLERGY".equalsIgnoreCase(item.getCategory())) {
                    allergyArr.add(hObj);
                } else if ("SURGERY".equalsIgnoreCase(item.getCategory())) {
                    surgeryArr.add(hObj);
                }
            }

            JsonObject histObj = new JsonObject();
            histObj.add("chronicConditions", chronicArr);
            histObj.add("allergies", allergyArr);
            histObj.add("surgeries", surgeryArr);
            responseObj.add("medicalHistory", histObj);

            // 4. Fetch Patient Documents
            List<PatientDocument> docList = docDao.getDocumentsByUserId(resolvedUserId);
            JsonArray docArr = new JsonArray();
            for (PatientDocument doc : docList) {
                JsonObject dObj = new JsonObject();
                dObj.addProperty("id", doc.getId());
                dObj.addProperty("documentType", doc.getDocumentType());
                dObj.addProperty("title", doc.getTitle());
                dObj.addProperty("fileName", doc.getFileName());
                dObj.addProperty("fileSize", doc.getFileSize());
                dObj.addProperty("uploadedAt", doc.getUploadedAt() != null ? doc.getUploadedAt().toString() : "");
                dObj.addProperty("notes", doc.getNotes());
                dObj.addProperty("viewUrl", "patientDocument?action=view&id=" + doc.getId());
                dObj.addProperty("downloadUrl", "patientDocument?action=download&id=" + doc.getId());
                docArr.add(dObj);
            }
            responseObj.add("documents", docArr);
        }

        out.print(gson.toJson(responseObj));
        out.flush();
    }
}
