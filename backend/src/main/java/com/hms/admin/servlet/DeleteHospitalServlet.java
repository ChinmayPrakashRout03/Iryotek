package com.hms.admin.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.HospitalDAO;
import com.hms.db.DBConnection;

@WebServlet("/deleteHospital")
public class DeleteHospitalServlet extends HttpServlet {

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		try {
			int id = Integer.parseInt(req.getParameter("id"));

			HospitalDAO hospitalDAO = new HospitalDAO(DBConnection.getConn());
			boolean f = hospitalDAO.deleteHospitalById(id);

			HttpSession session = req.getSession();

			if (f) {
				session.setAttribute("successMsg", "Hospital Deleted Successfully");
				resp.sendRedirect("admin/view_hospital.jsp");
			} else {
				session.setAttribute("errorMsg", "Something went wrong on server!");
				resp.sendRedirect("admin/view_hospital.jsp");
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
