package com.hms.user.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.hms.dao.SpecialistDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Specialist;

@WebServlet("/getAllSpecialties")
public class GetSpecialtiesServlet extends HttpServlet {

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		resp.setContentType("application/json");
		resp.setCharacterEncoding("UTF-8");
		PrintWriter out = resp.getWriter();

		try {
			SpecialistDAO dao = new SpecialistDAO(DBConnection.getConn());
			List<Specialist> list = dao.getAllSpecialist();

			StringBuilder json = new StringBuilder("[");
			for (int i = 0; i < list.size(); i++) {
				if (i > 0) json.append(",");
				json.append("\"").append(escapeJson(list.get(i).getSpecialistName())).append("\"");
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
