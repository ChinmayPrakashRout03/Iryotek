package com.hms.user.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.CartDAO;
import com.hms.dao.MedicineOrderDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Cart;
import com.hms.entity.CartItem;
import com.hms.entity.MedicineOrder;
import com.hms.entity.User;

@WebServlet("/placeOrder")
public class CheckoutServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession();
        User user = (User) session.getAttribute("userObj");

        if (user == null) {
            session.setAttribute("errorMsg", "Please login to place your order.");
            resp.sendRedirect("user_login.jsp");
            return;
        }

        try {
            int addressId = Integer.parseInt(req.getParameter("addressId"));
            String paymentMethod = req.getParameter("paymentMethod");

            if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
                session.setAttribute("errorMsg", "Please select a payment method.");
                resp.sendRedirect("checkout.jsp");
                return;
            }

            CartDAO cartDAO = new CartDAO(DBConnection.getConn());
            Cart cart = cartDAO.getCartWithItems(user.getId());

            if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
                session.setAttribute("errorMsg", "Your cart is empty.");
                resp.sendRedirect("cart.jsp");
                return;
            }

            // Verify stock availability
            for (CartItem ci : cart.getItems()) {
                if (ci.getMedicine() == null || ci.getQuantity() > ci.getMedicine().getStock()) {
                    session.setAttribute("errorMsg", "Medicine '" + (ci.getMedicine() != null ? ci.getMedicine().getName() : "Item") + "' has insufficient stock available (" + (ci.getMedicine() != null ? ci.getMedicine().getStock() : 0) + " remaining).");
                    resp.sendRedirect("cart.jsp");
                    return;
                }
            }

            // Check if cart contains any prescription reference
            Integer rxId = null;
            Integer apptId = null;
            for (CartItem ci : cart.getItems()) {
                if ("PRESCRIPTION".equalsIgnoreCase(ci.getSource())) {
                    rxId = ci.getPrescriptionId();
                    apptId = ci.getAppointmentId();
                    break;
                }
            }

            MedicineOrder order = new MedicineOrder();
            order.setUserId(user.getId());
            order.setAddressId(addressId);
            order.setTotalAmount(cart.getTotalAmount());
            order.setPaymentMethod(paymentMethod);
            order.setPrescriptionId(rxId);
            order.setAppointmentId(apptId);

            MedicineOrderDAO orderDAO = new MedicineOrderDAO(DBConnection.getConn());
            int orderId = orderDAO.placeOrder(order, cart.getItems());

            if (orderId > 0) {
                session.setAttribute("successMsg", "Medicine Order placed successfully! Order Number: " + order.getOrderNumber());
                resp.sendRedirect("view_medicine_orders.jsp");
            } else {
                session.setAttribute("errorMsg", "Failed to place order. Please try again.");
                resp.sendRedirect("checkout.jsp");
            }

        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorMsg", "Error placing order: " + e.getMessage());
            resp.sendRedirect("checkout.jsp");
        }
    }
}
