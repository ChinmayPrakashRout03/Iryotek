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
import com.hms.entity.DoctorHospitalDTO;

@WebServlet("/searchDoctors")
public class SearchDoctorsServlet extends HttpServlet {

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		resp.setContentType("application/json");
		resp.setCharacterEncoding("UTF-8");
		PrintWriter out = resp.getWriter();

		String state = req.getParameter("state");
		String city = req.getParameter("city");
		String specialty = req.getParameter("specialty");

		try {
			DoctorDAO dao = new DoctorDAO(DBConnection.getConn());
			List<DoctorHospitalDTO> list = dao.searchDoctorsByLocationAndSpecialty(state, city, specialty);

			StringBuilder json = new StringBuilder("[");
			for (int i = 0; i < list.size(); i++) {
				DoctorHospitalDTO dto = list.get(i);
				if (i > 0) json.append(",");
				json.append("{");
				json.append("\"doctorId\":").append(dto.getDoctorId()).append(",");
				json.append("\"fullName\":\"").append(escapeJson(dto.getFullName())).append("\",");
				json.append("\"qualification\":\"").append(escapeJson(dto.getQualification())).append("\",");
				json.append("\"specialist\":\"").append(escapeJson(dto.getSpecialist())).append("\",");
				json.append("\"email\":\"").append(escapeJson(dto.getEmail())).append("\",");
				json.append("\"phone\":\"").append(escapeJson(dto.getPhone())).append("\",");
				json.append("\"hospitalId\":").append(dto.getHospitalId()).append(",");
				json.append("\"hospitalName\":\"").append(escapeJson(dto.getHospitalName())).append("\",");
				json.append("\"hospitalAddress\":\"").append(escapeJson(dto.getHospitalAddress())).append("\",");
				json.append("\"city\":\"").append(escapeJson(dto.getCity())).append("\",");
				json.append("\"state\":\"").append(escapeJson(dto.getState())).append("\"");
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
