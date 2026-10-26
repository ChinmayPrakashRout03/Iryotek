package com.hms.user.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.CartDAO;
import com.hms.db.DBConnection;
import com.hms.entity.User;

@WebServlet("/cartAction")
public class CartServlet extends HttpServlet {

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
        User user = (User) session.getAttribute("userObj");

        if (user == null) {
            session.setAttribute("errorMsg", "Please login first to manage your medicine cart.");
            resp.sendRedirect("user_login.jsp");
            return;
        }

        String action = req.getParameter("action");
        CartDAO cartDAO = new CartDAO(DBConnection.getConn());

        try {
            if ("add".equalsIgnoreCase(action)) {
                int medicineId = Integer.parseInt(req.getParameter("medicineId"));
                int quantity = 1;
                if (req.getParameter("quantity") != null && !req.getParameter("quantity").trim().isEmpty()) {
                    quantity = Integer.parseInt(req.getParameter("quantity"));
                }
                String dosage = req.getParameter("dosage") != null ? req.getParameter("dosage") : "As needed";
                String source = req.getParameter("source") != null ? req.getParameter("source") : "MANUAL";

                Integer rxId = (req.getParameter("prescriptionId") != null && !req.getParameter("prescriptionId").isEmpty()) ? Integer.parseInt(req.getParameter("prescriptionId")) : null;
                Integer apptId = (req.getParameter("appointmentId") != null && !req.getParameter("appointmentId").isEmpty()) ? Integer.parseInt(req.getParameter("appointmentId")) : null;
                Integer docId = (req.getParameter("doctorId") != null && !req.getParameter("doctorId").isEmpty()) ? Integer.parseInt(req.getParameter("doctorId")) : null;

                boolean success = cartDAO.addOrUpdateCartItem(user.getId(), medicineId, quantity, dosage, source, rxId, apptId, docId);
                if (success) {
                    session.setAttribute("successMsg", "Medicine added to your cart!");
                } else {
                    session.setAttribute("errorMsg", "Failed to add medicine to cart.");
                }

                String redirectUrl = req.getParameter("redirectUrl");
                if (redirectUrl != null && !redirectUrl.trim().isEmpty()) {
                    resp.sendRedirect(redirectUrl);
                } else {
                    resp.sendRedirect("cart.jsp");
                }

            } else if ("update".equalsIgnoreCase(action)) {
                int cartItemId = Integer.parseInt(req.getParameter("cartItemId"));
                int quantity = Integer.parseInt(req.getParameter("quantity"));

                boolean success = cartDAO.updateCartItemQuantity(cartItemId, quantity);
                if (success) {
                    session.setAttribute("successMsg", "Cart quantity updated.");
                } else {
                    session.setAttribute("errorMsg", "Failed to update cart item.");
                }
                resp.sendRedirect("cart.jsp");

            } else if ("remove".equalsIgnoreCase(action)) {
                int cartItemId = Integer.parseInt(req.getParameter("cartItemId"));
                boolean success = cartDAO.removeCartItem(cartItemId);
                if (success) {
                    session.setAttribute("successMsg", "Medicine removed from cart.");
                } else {
                    session.setAttribute("errorMsg", "Failed to remove item.");
                }
                resp.sendRedirect("cart.jsp");

            } else if ("clear".equalsIgnoreCase(action)) {
                boolean success = cartDAO.clearCart(user.getId());
                if (success) {
                    session.setAttribute("successMsg", "Cart cleared. Your doctor prescriptions remain saved in your medical record.");
                } else {
                    session.setAttribute("errorMsg", "Failed to clear cart.");
                }
                resp.sendRedirect("cart.jsp");

            } else {
                resp.sendRedirect("cart.jsp");
            }
        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorMsg", "An error occurred: " + e.getMessage());
            resp.sendRedirect("cart.jsp");
        }
    }
}
