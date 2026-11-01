package com.hms.admin.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.hms.dao.PharmacyDAO;
import com.hms.dao.PharmacyDAO.DispenseResult;
import com.hms.db.DBConnection;

@WebServlet("/pharmacyDispense")
public class PharmacyDispenseServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        processRequest(req, resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        processRequest(req, resp);
    }

    private void processRequest(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession();
        if (session.getAttribute("adminObj") == null) {
            String isAjax = req.getHeader("X-Requested-With");
            if ("XMLHttpRequest".equalsIgnoreCase(isAjax) || "json".equalsIgnoreCase(req.getParameter("format"))) {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.setContentType("application/json");
                JsonObject json = new JsonObject();
                json.addProperty("success", false);
                json.addProperty("message", "Unauthorized. Pharmacist/Admin access required.");
                resp.getWriter().print(gson.toJson(json));
                return;
            }
            session.setAttribute("errorMsg", "Pharmacist/Admin access required.");
            resp.sendRedirect("admin_login.jsp");
            return;
        }

        String action = req.getParameter("action");
        String format = req.getParameter("format");
        PharmacyDAO pharmacyDAO = new PharmacyDAO(DBConnection.getConn());

        try {
            if ("dispense".equalsIgnoreCase(action)) {
                int requestId = Integer.parseInt(req.getParameter("requestId"));
                int pharmacistId = 1; // Default Admin/Pharmacist ID from session
                String qtyStr = req.getParameter("quantity");
                int qtyToDispense = (qtyStr != null && !qtyStr.trim().isEmpty()) ? Integer.parseInt(qtyStr.trim()) : 0;
                String idempotencyKey = req.getParameter("idempotencyKey");
                if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) {
                    idempotencyKey = "TX-" + UUID.randomUUID().toString();
                }

                DispenseResult result = pharmacyDAO.dispenseMedicineItem(requestId, pharmacistId, qtyToDispense, idempotencyKey);

                if ("json".equalsIgnoreCase(format)) {
                    resp.setContentType("application/json");
                    PrintWriter out = resp.getWriter();
                    JsonObject json = new JsonObject();
                    json.addProperty("success", result.success);
                    json.addProperty("insufficientStock", result.insufficientStock);
                    json.addProperty("duplicateRequest", result.duplicateRequest);
                    json.addProperty("message", result.message);
                    json.addProperty("medicineName", result.medicineName);
                    json.addProperty("requiredQuantity", result.requiredQuantity);
                    json.addProperty("availableStock", result.availableStock);
                    json.addProperty("shortage", result.shortage);
                    json.addProperty("quantityDispensed", result.quantityDispensed);
                    json.addProperty("status", result.status);
                    out.print(gson.toJson(json));
                    out.flush();
                    return;
                }

                if (result.success) {
                    session.setAttribute("successMsg", result.message);
                } else if (result.insufficientStock) {
                    session.setAttribute("errorMsg", result.message);
                } else if (result.duplicateRequest) {
                    session.setAttribute("warningMsg", result.message);
                } else {
                    session.setAttribute("errorMsg", result.message);
                }

                resp.sendRedirect("admin/manage_prescriptions.jsp");

            } else {
                resp.sendRedirect("admin/manage_prescriptions.jsp");
            }

        } catch (Exception e) {
            e.printStackTrace();
            if ("json".equalsIgnoreCase(format)) {
                resp.setContentType("application/json");
                JsonObject json = new JsonObject();
                json.addProperty("success", false);
                json.addProperty("message", "Dispensing exception: " + e.getMessage());
                resp.getWriter().print(gson.toJson(json));
                return;
            }
            session.setAttribute("errorMsg", "Dispensing error: " + e.getMessage());
            resp.sendRedirect("admin/manage_prescriptions.jsp");
        }
    }
}
