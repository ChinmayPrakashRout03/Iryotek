package com.hms.user.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.hms.dao.HospitalDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Hospital;

@WebServlet("/getHospitalsByCity")
public class HospitalFilterServlet extends HttpServlet {

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		resp.setContentType("application/json");
		resp.setCharacterEncoding("UTF-8");
		PrintWriter out = resp.getWriter();

		try {
			String city = req.getParameter("city");

			HospitalDAO hospitalDAO = new HospitalDAO(DBConnection.getConn());
			List<Hospital> hospitalList = hospitalDAO.getHospitalsByCity(city);

			// Build JSON manually
			StringBuilder json = new StringBuilder("[");
			for (int i = 0; i < hospitalList.size(); i++) {
				Hospital h = hospitalList.get(i);
				if (i > 0) json.append(",");
				json.append("{");
				json.append("\"id\":").append(h.getId()).append(",");
				json.append("\"name\":\"").append(escapeJson(h.getName())).append("\",");
				json.append("\"address\":\"").append(escapeJson(h.getAddress())).append("\",");
				json.append("\"city\":\"").append(escapeJson(h.getCity())).append("\",");
				json.append("\"state\":\"").append(escapeJson(h.getState())).append("\",");
				json.append("\"phone\":\"").append(escapeJson(h.getPhone())).append("\"");
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
