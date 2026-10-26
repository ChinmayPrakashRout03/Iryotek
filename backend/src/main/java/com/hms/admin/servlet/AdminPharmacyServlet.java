package com.hms.admin.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.MedicineDAO;
import com.hms.dao.MedicineOrderDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Medicine;

@WebServlet("/adminPharmacy")
public class AdminPharmacyServlet extends HttpServlet {

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
            session.setAttribute("errorMsg", "Admin access required.");
            resp.sendRedirect("admin_login.jsp");
            return;
        }

        String action = req.getParameter("action");
        MedicineDAO medicineDAO = new MedicineDAO(DBConnection.getConn());
        MedicineOrderDAO orderDAO = new MedicineOrderDAO(DBConnection.getConn());

        try {
            if ("addMedicine".equalsIgnoreCase(action)) {
                String name = req.getParameter("name");
                String category = req.getParameter("category");
                String description = req.getParameter("description");
                double price = Double.parseDouble(req.getParameter("price"));
                int stock = Integer.parseInt(req.getParameter("stock"));
                String dosageForm = req.getParameter("dosageForm");
                String imageUrl = req.getParameter("imageUrl");

                Medicine m = new Medicine(0, name, category, description, price, stock, dosageForm, imageUrl);
                boolean f = medicineDAO.addMedicine(m);
                if (f) {
                    session.setAttribute("successMsg", "Medicine added to inventory.");
                } else {
                    session.setAttribute("errorMsg", "Failed to add medicine.");
                }
                resp.sendRedirect("admin/manage_medicines.jsp");

            } else if ("editMedicine".equalsIgnoreCase(action)) {
                int id = Integer.parseInt(req.getParameter("id"));
                String name = req.getParameter("name");
                String category = req.getParameter("category");
                String description = req.getParameter("description");
                double price = Double.parseDouble(req.getParameter("price"));
                int stock = Integer.parseInt(req.getParameter("stock"));
                String dosageForm = req.getParameter("dosageForm");
                String imageUrl = req.getParameter("imageUrl");

                Medicine m = new Medicine(id, name, category, description, price, stock, dosageForm, imageUrl);
                boolean f = medicineDAO.updateMedicine(m);
                if (f) {
                    session.setAttribute("successMsg", "Medicine updated successfully.");
                } else {
                    session.setAttribute("errorMsg", "Failed to update medicine.");
                }
                resp.sendRedirect("admin/manage_medicines.jsp");

            } else if ("deleteMedicine".equalsIgnoreCase(action)) {
                int id = Integer.parseInt(req.getParameter("id"));
                boolean f = medicineDAO.deleteMedicine(id);
                if (f) {
                    session.setAttribute("successMsg", "Medicine removed.");
                } else {
                    session.setAttribute("errorMsg", "Failed to remove medicine.");
                }
                resp.sendRedirect("admin/manage_medicines.jsp");

            } else if ("updateOrderStatus".equalsIgnoreCase(action)) {
                int orderId = Integer.parseInt(req.getParameter("orderId"));
                String status = req.getParameter("orderStatus");
                boolean f = orderDAO.updateOrderStatus(orderId, status);
                if (f) {
                    session.setAttribute("successMsg", "Order #" + orderId + " status updated to " + status);
                } else {
                    session.setAttribute("errorMsg", "Failed to update order status.");
                }
                resp.sendRedirect("admin/manage_orders.jsp");

            } else {
                resp.sendRedirect("admin/manage_medicines.jsp");
            }
        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorMsg", "Error: " + e.getMessage());
            resp.sendRedirect("admin/manage_medicines.jsp");
        }
    }
}
