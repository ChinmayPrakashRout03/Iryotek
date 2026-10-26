package com.hms.user.servlet;

import java.io.IOException;
import java.sql.Connection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.MedicalHistoryDAO;
import com.hms.db.DBConnection;
import com.hms.entity.MedicalHistoryItem;
import com.hms.entity.User;

@WebServlet("/medicalHistory")
public class MedicalHistoryServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        handleRequest(req, resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        handleRequest(req, resp);
    }

    private void handleRequest(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession();
        User user = (User) session.getAttribute("userObj");

        if (user == null) {
            session.setAttribute("errorMsg", "Please login to manage your medical history.");
            resp.sendRedirect("user_login.jsp");
            return;
        }

        String action = req.getParameter("action");
        Connection conn = DBConnection.getConn();
        MedicalHistoryDAO dao = new MedicalHistoryDAO(conn);

        try {
            if ("add".equalsIgnoreCase(action)) {
                String category = req.getParameter("category"); // 'CHRONIC_CONDITION', 'ALLERGY', 'SURGERY'
                String title = req.getParameter("title");
                String diagnosedYearOrDate = req.getParameter("diagnosedYearOrDate");
                String severity = req.getParameter("severity");
                String notes = req.getParameter("notes");

                if (title == null || title.trim().isEmpty() || category == null || category.trim().isEmpty()) {
                    session.setAttribute("errorMsg", "Please provide a valid title and category for the medical entry.");
                } else {
                    MedicalHistoryItem item = new MedicalHistoryItem();
                    item.setUserId(user.getId());
                    item.setCategory(category.trim().toUpperCase());
                    item.setTitle(title.trim());
                    item.setDiagnosedYearOrDate(diagnosedYearOrDate != null ? diagnosedYearOrDate.trim() : "");
                    item.setSeverity(severity != null ? severity.trim() : "Mild");
                    item.setNotes(notes != null ? notes.trim() : "");

                    boolean added = dao.addHistoryItem(item);
                    if (added) {
                        String readableCat = category.replace("_", " ");
                        session.setAttribute("succMsg", "Added new record to " + readableCat + " history successfully!");
                    } else {
                        session.setAttribute("errorMsg", "Failed to save medical history record.");
                    }
                }
            } else if ("delete".equalsIgnoreCase(action)) {
                String idStr = req.getParameter("id");
                if (idStr != null && !idStr.trim().isEmpty()) {
                    int id = Integer.parseInt(idStr.trim());
                    boolean deleted = dao.deleteHistoryItem(id, user.getId());
                    if (deleted) {
                        session.setAttribute("succMsg", "Medical record removed successfully.");
                    } else {
                        session.setAttribute("errorMsg", "Failed to delete medical record.");
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorMsg", "Error processing request: " + e.getMessage());
        }

        resp.sendRedirect("patient_profile.jsp?tab=history");
    }
}
