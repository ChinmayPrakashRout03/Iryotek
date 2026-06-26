package com.hms.user.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.hms.dao.DoctorDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Doctor;

@WebServlet("/getDoctorsByHospital")
public class DoctorsByHospitalServlet extends HttpServlet {

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		resp.setContentType("application/json");
		resp.setCharacterEncoding("UTF-8");
		PrintWriter out = resp.getWriter();

		try {
			int hospitalId = Integer.parseInt(req.getParameter("hospitalId"));

			DoctorDAO doctorDAO = new DoctorDAO(DBConnection.getConn());
			List<Doctor> doctorList = doctorDAO.getDoctorsByHospitalId(hospitalId);

			// Build JSON manually (no external library needed)
			StringBuilder json = new StringBuilder("[");
			for (int i = 0; i < doctorList.size(); i++) {
				Doctor d = doctorList.get(i);
				if (i > 0) json.append(",");
				json.append("{");
				json.append("\"id\":").append(d.getId()).append(",");
				json.append("\"fullName\":\"").append(escapeJson(d.getFullName())).append("\",");
				json.append("\"specialist\":\"").append(escapeJson(d.getSpecialist())).append("\"");
				json.append("}");
			}
			json.append("]");

			out.print(json.toString());

		} catch (Exception e) {
			out.print("[]");
			e.printStackTrace();
		}

		out.flush();
	}

	private String escapeJson(String str) {
		if (str == null) return "";
		return str.replace("\\", "\\\\").replace("\"", "\\\"");
	}
}
