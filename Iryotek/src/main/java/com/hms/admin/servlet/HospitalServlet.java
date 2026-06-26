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
import com.hms.entity.Hospital;

@WebServlet("/addHospital")
public class HospitalServlet extends HttpServlet {

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		try {
			String name = req.getParameter("name");
			String address = req.getParameter("address");
			String city = req.getParameter("city");
			String state = req.getParameter("state");
			String phone = req.getParameter("phone");

			Hospital hospital = new Hospital(name, address, city, state, phone);

			HospitalDAO hospitalDAO = new HospitalDAO(DBConnection.getConn());
			boolean f = hospitalDAO.addHospital(hospital);

			HttpSession session = req.getSession();

			if (f) {
				session.setAttribute("successMsg", "Hospital Added Successfully");
				resp.sendRedirect("admin/hospital.jsp");
			} else {
				session.setAttribute("errorMsg", "Something went wrong on server!");
				resp.sendRedirect("admin/hospital.jsp");
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
