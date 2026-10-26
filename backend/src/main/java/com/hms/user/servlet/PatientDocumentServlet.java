package com.hms.user.servlet;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Paths;
import java.sql.Connection;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;

import com.hms.dao.PatientDocumentDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Doctor;
import com.hms.entity.PatientDocument;
import com.hms.entity.User;

@WebServlet("/patientDocument")
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024 * 2, // 2MB
    maxFileSize = 1024 * 1024 * 15,      // 15MB
    maxRequestSize = 1024 * 1024 * 20    // 20MB
)
public class PatientDocumentServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String action = req.getParameter("action");
        if ("upload".equalsIgnoreCase(action)) {
            handleUpload(req, resp);
        } else {
            handleGetOrDelete(req, resp);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        handleGetOrDelete(req, resp);
    }

    private void handleUpload(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession();
        User user = (User) session.getAttribute("userObj");

        if (user == null) {
            session.setAttribute("errorMsg", "Please login to upload documents.");
            resp.sendRedirect("user_login.jsp");
            return;
        }

        try {
            String documentType = req.getParameter("documentType");
            String title = req.getParameter("title");
            String notes = req.getParameter("notes");
            Part filePart = req.getPart("documentFile");

            if (filePart == null || filePart.getSize() == 0) {
                session.setAttribute("errorMsg", "Please select a file to upload.");
                resp.sendRedirect("patient_profile.jsp?tab=documents");
                return;
            }

            if (title == null || title.trim().isEmpty()) {
                title = documentType != null ? documentType : "Medical Document";
            }

            String submittedFileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
            String cleanName = submittedFileName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String uniqueFileName = "doc_" + user.getId() + "_" + System.currentTimeMillis() + "_" + cleanName;

            // Directory for uploads
            String uploadPath = req.getServletContext().getRealPath("") + File.separator + "uploads" + File.separator + "documents";
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            String fullFilePath = uploadPath + File.separator + uniqueFileName;
            filePart.write(fullFilePath);

            // Compute readable file size
            long bytes = filePart.getSize();
            String readableSize;
            if (bytes >= 1024 * 1024) {
                readableSize = String.format("%.2f MB", (double) bytes / (1024 * 1024));
            } else {
                readableSize = String.format("%d KB", bytes / 1024);
            }

            String relativeDbPath = "uploads/documents/" + uniqueFileName;

            PatientDocument doc = new PatientDocument(
                user.getId(),
                documentType != null ? documentType.trim() : "Other",
                title.trim(),
                submittedFileName,
                relativeDbPath,
                readableSize,
                notes != null ? notes.trim() : ""
            );

            Connection conn = DBConnection.getConn();
            PatientDocumentDAO dao = new PatientDocumentDAO(conn);
            boolean saved = dao.addDocument(doc);

            if (saved) {
                session.setAttribute("succMsg", "Document '" + title + "' uploaded securely to your medical vault!");
            } else {
                session.setAttribute("errorMsg", "Failed to register document in database.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorMsg", "Upload failed: " + e.getMessage());
        }

        resp.sendRedirect("patient_profile.jsp?tab=documents");
    }

    private void handleGetOrDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession();
        User user = (User) session.getAttribute("userObj");
        Doctor doctor = (Doctor) session.getAttribute("doctorObj");
        Object admin = session.getAttribute("adminObj");

        String action = req.getParameter("action");
        String idStr = req.getParameter("id");

        if (idStr == null || idStr.trim().isEmpty()) {
            resp.sendRedirect("patient_profile.jsp");
            return;
        }

        int docId = Integer.parseInt(idStr.trim());
        Connection conn = DBConnection.getConn();
        PatientDocumentDAO dao = new PatientDocumentDAO(conn);
        PatientDocument doc = dao.getDocumentById(docId);

        if (doc == null) {
            session.setAttribute("errorMsg", "Document not found.");
            resp.sendRedirect("patient_profile.jsp?tab=documents");
            return;
        }

        if ("delete".equalsIgnoreCase(action)) {
            if (user == null || user.getId() != doc.getUserId()) {
                session.setAttribute("errorMsg", "Unauthorized to delete this document.");
                resp.sendRedirect("patient_profile.jsp?tab=documents");
                return;
            }

            boolean deleted = dao.deleteDocument(docId, user.getId());
            if (deleted) {
                // Remove file from disk
                try {
                    String fullPath = req.getServletContext().getRealPath("") + File.separator + doc.getFilePath().replace("/", File.separator);
                    File f = new File(fullPath);
                    if (f.exists()) {
                        f.delete();
                    }
                } catch (Exception ignored) {}
                session.setAttribute("succMsg", "Document removed from your vault.");
            } else {
                session.setAttribute("errorMsg", "Failed to delete document record.");
            }
            resp.sendRedirect("patient_profile.jsp?tab=documents");
            return;
        }

        if ("view".equalsIgnoreCase(action) || "download".equalsIgnoreCase(action)) {
            // Check authorization: must be the document owner, or an authorized doctor, or admin
            boolean authorized = (user != null && user.getId() == doc.getUserId())
                    || (doctor != null)
                    || (admin != null);

            if (!authorized) {
                resp.sendError(HttpServletResponse.SC_FORBIDDEN, "Access to this medical document is restricted.");
                return;
            }

            String fullPath = req.getServletContext().getRealPath("") + File.separator + doc.getFilePath().replace("/", File.separator);
            File file = new File(fullPath);
            if (!file.exists()) {
                resp.sendError(HttpServletResponse.SC_NOT_FOUND, "Document file not found on server.");
                return;
            }

            // Determine mime type
            String mimeType = req.getServletContext().getMimeType(file.getName());
            if (mimeType == null) {
                mimeType = "application/octet-stream";
            }

            resp.setContentType(mimeType);
            resp.setContentLengthLong(file.length());

            if ("download".equalsIgnoreCase(action)) {
                resp.setHeader("Content-Disposition", "attachment; filename=\"" + doc.getFileName() + "\"");
            } else {
                resp.setHeader("Content-Disposition", "inline; filename=\"" + doc.getFileName() + "\"");
            }

            try (FileInputStream in = new FileInputStream(file);
                 OutputStream out = resp.getOutputStream()) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
                out.flush();
            }
        }
    }
}
