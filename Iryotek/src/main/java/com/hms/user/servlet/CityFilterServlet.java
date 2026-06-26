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

@WebServlet("/getCitiesByState")
public class CityFilterServlet extends HttpServlet {

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		resp.setContentType("application/json");
		resp.setCharacterEncoding("UTF-8");
		PrintWriter out = resp.getWriter();

		try {
			String state = req.getParameter("state");

			HospitalDAO hospitalDAO = new HospitalDAO(DBConnection.getConn());
			List<String> cityList = hospitalDAO.getCitiesByState(state);

			// Build JSON array of strings
			StringBuilder json = new StringBuilder("[");
			for (int i = 0; i < cityList.size(); i++) {
				if (i > 0) json.append(",");
				json.append("\"").append(escapeJson(cityList.get(i))).append("\"");
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
