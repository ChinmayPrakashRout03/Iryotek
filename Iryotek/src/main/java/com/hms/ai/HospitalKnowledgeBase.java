package com.hms.ai;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.hms.dao.DoctorDAO;
import com.hms.dao.SpecialistDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Doctor;
import com.hms.entity.Specialist;

public class HospitalKnowledgeBase {

    public static class DoctorInfo {
        private final int id;
        private final String name;
        private final String qualification;
        private final String specialist;
        private final String timing;

        public DoctorInfo(int id, String name, String qualification, String specialist, String timing) {
            this.id = id;
            this.name = name;
            this.qualification = qualification;
            this.specialist = specialist;
            this.timing = timing;
        }

        public int getId() { return id; }
        public String getName() { return name; }
        public String getQualification() { return qualification; }
        public String getSpecialist() { return specialist; }
        public String getTiming() { return timing; }
    }

    public static List<String> getAllDepartments() {
        List<String> list = new ArrayList<>();
        try {
            Connection conn = DBConnection.getConn();
            if (conn != null) {
                SpecialistDAO dao = new SpecialistDAO(conn);
                List<Specialist> specs = dao.getAllSpecialist();
                if (specs != null) {
                    for (Specialist s : specs) {
                        if (!list.contains(s.getSpecialistName())) {
                            list.add(s.getSpecialistName());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching departments: " + e.getMessage());
        }

        if (list.isEmpty()) {
            Collections.addAll(list,
                "Cardiology", "Orthopedics", "Dermatology", "Neurology",
                "ENT", "Ophthalmology", "Gastroenterology", "Pulmonology",
                "Pediatrics", "Urology", "Oncology", "General Medicine",
                "Psychiatry", "Gynecology"
            );
        }
        return list;
    }

    public static List<DoctorInfo> getDoctorsByDepartment(String specialty, int maxCount) {
        List<DoctorInfo> matched = new ArrayList<>();
        if (specialty == null || specialty.trim().isEmpty()) {
            specialty = "General Medicine";
        }

        try {
            Connection conn = DBConnection.getConn();
            if (conn != null) {
                DoctorDAO dao = new DoctorDAO(conn);
                List<Doctor> allDocs = dao.getAllDoctor();
                if (allDocs != null) {
                    for (Doctor d : allDocs) {
                        if (d.getSpecialist() != null && d.getSpecialist().equalsIgnoreCase(specialty)) {
                            matched.add(new DoctorInfo(
                                d.getId(),
                                d.getFullName(),
                                (d.getQualification() != null ? d.getQualification() : "Specialist"),
                                d.getSpecialist(),
                                (d.getTiming() != null ? d.getTiming() : "09:00 AM - 01:00 PM")
                            ));
                            if (matched.size() >= maxCount) {
                                break;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching doctors for " + specialty + ": " + e.getMessage());
        }

        return matched;
    }

    public static String buildRAGContext(String detectedSpecialty) {
        StringBuilder sb = new StringBuilder();
        sb.append("=== IRYOTEK HOSPITAL KNOWLEDGE BASE ===\n");
        sb.append("• Hospital Name: Iryotek Healthcare Center & Multi-Specialty Hospital\n");
        sb.append("• Emergency & Trauma Desk: Open 24 Hours / 7 Days a week (Ground Floor, Room 101)\n");
        sb.append("• Emergency Contact Number: +202-555-0191\n");
        sb.append("• General OPD Consultation Hours: Monday to Saturday, 8:00 AM - 8:00 PM\n");
        sb.append("• Inpatient Visiting Hours: 4:00 PM - 7:00 PM daily (max 2 visitors per patient)\n");
        sb.append("• Diagnostic Facilities: 24/7 Advanced Pathology Lab, 3T MRI, 128-Slice CT, Digital X-Ray, 24/7 Pharmacy\n");
        sb.append("• Insurance & Billing: Cashless admission desk available for all major health insurance policies & TPAs\n");
        sb.append("• Online Appointment Booking: Available on our website under 'Book Appointment' (requires user login)\n\n");

        sb.append("ACTIVE SPECIALTY DEPARTMENTS:\n");
        List<String> depts = getAllDepartments();
        sb.append(String.join(", ", depts)).append("\n\n");

        if (detectedSpecialty != null && !detectedSpecialty.trim().isEmpty()) {
            List<DoctorInfo> docs = getDoctorsByDepartment(detectedSpecialty, 3);
            if (!docs.isEmpty()) {
                sb.append("FEATURED SPECIALISTS FOR ").append(detectedSpecialty.toUpperCase()).append(":\n");
                for (DoctorInfo doc : docs) {
                    sb.append("• ").append(doc.getName())
                      .append(" (").append(doc.getQualification()).append(")")
                      .append(" - Available OPD Hours: ").append(doc.getTiming()).append("\n");
                }
                sb.append("\n");
            }
        }

        return sb.toString();
    }
}
