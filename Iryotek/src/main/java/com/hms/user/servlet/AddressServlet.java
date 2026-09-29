package com.hms.user.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.UserAddressDAO;
import com.hms.db.DBConnection;
import com.hms.entity.User;
import com.hms.entity.UserAddress;

@WebServlet("/addressAction")
public class AddressServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession();
        User user = (User) session.getAttribute("userObj");

        if (user == null) {
            session.setAttribute("errorMsg", "Please login first to manage addresses.");
            resp.sendRedirect("user_login.jsp");
            return;
        }

        String action = req.getParameter("action");
        UserAddressDAO addressDAO = new UserAddressDAO(DBConnection.getConn());

        try {
            if ("add".equalsIgnoreCase(action)) {
                String fullName = req.getParameter("fullName");
                String phone = req.getParameter("phone");
                String streetAddress = req.getParameter("streetAddress");
                String city = req.getParameter("city");
                String state = req.getParameter("state");
                String pincode = req.getParameter("pincode");
                int isDefault = req.getParameter("isDefault") != null ? 1 : 0;

                UserAddress addr = new UserAddress(0, user.getId(), fullName, phone, streetAddress, city, state, pincode, isDefault);
                int addressId = addressDAO.addAddress(addr);

                if (addressId > 0) {
                    session.setAttribute("successMsg", "Delivery address added successfully!");
                } else {
                    session.setAttribute("errorMsg", "Failed to add delivery address.");
                }

                String redirectUrl = req.getParameter("redirectUrl");
                if (redirectUrl != null && !redirectUrl.trim().isEmpty()) {
                    resp.sendRedirect(redirectUrl);
                } else {
                    resp.sendRedirect("checkout.jsp");
                }

            } else if ("setDefault".equalsIgnoreCase(action)) {
                int addressId = Integer.parseInt(req.getParameter("addressId"));
                addressDAO.setDefaultAddress(user.getId(), addressId);
                session.setAttribute("successMsg", "Default address updated.");
                resp.sendRedirect("checkout.jsp");
            } else {
                resp.sendRedirect("checkout.jsp");
            }
        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorMsg", "Error: " + e.getMessage());
            resp.sendRedirect("checkout.jsp");
        }
    }
}
