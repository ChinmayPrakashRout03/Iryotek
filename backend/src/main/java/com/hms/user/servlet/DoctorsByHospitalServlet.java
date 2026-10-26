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
			String disease = req.getParameter("disease");
			String dateStr = req.getParameter("date");

			DoctorDAO doctorDAO = new DoctorDAO(DBConnection.getConn());
			List<Doctor> doctorList;
			if (disease != null && !disease.trim().isEmpty()) {
				doctorList = doctorDAO.getDoctorsByHospitalAndDisease(hospitalId, disease);
			} else {
				doctorList = doctorDAO.getDoctorsByHospitalId(hospitalId);
			}

			java.time.ZoneId istZone = java.time.ZoneId.of("Asia/Kolkata");
			java.time.LocalDate today = java.time.LocalDate.now(istZone);
			java.time.LocalDate selectedDate = null;
			if (dateStr != null && !dateStr.trim().isEmpty()) {
				try {
					selectedDate = java.time.LocalDate.parse(dateStr);
				} catch(Exception e){}
			}

			java.time.LocalTime nowTime = java.time.LocalTime.now(istZone);
			java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a", java.util.Locale.US);
			boolean isToday = (selectedDate != null && selectedDate.equals(today));

			// Build JSON manually (no external library needed)
			StringBuilder json = new StringBuilder("[");
			boolean first = true;
			for (Doctor d : doctorList) {
				if (isToday) {
					// Check if shift is over
					String timing = d.getTiming(); // e.g. "10:00 AM - 02:00 PM"
					if (timing != null && timing.contains("-")) {
						try {
							String[] parts = timing.split("-");
							if (parts.length == 2) {
								String endStr = parts[1].trim(); // "02:00 PM"
								java.time.LocalTime shiftEnd = java.time.LocalTime.parse(endStr, timeFormatter);
								if (nowTime.isAfter(shiftEnd) || nowTime.equals(shiftEnd)) {
									// Shift is over today, skip this doctor!
									continue;
								}
							}
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				}

				if (!first) json.append(",");
				json.append("{");
				json.append("\"id\":").append(d.getId()).append(",");
				json.append("\"fullName\":\"").append(escapeJson(d.getFullName())).append("\",");
				json.append("\"specialist\":\"").append(escapeJson(d.getSpecialist())).append("\"");
				json.append("}");
				first = false;
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
