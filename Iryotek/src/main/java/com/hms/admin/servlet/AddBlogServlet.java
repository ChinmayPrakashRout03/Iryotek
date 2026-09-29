package com.hms.admin.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.BlogDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Blog;

@WebServlet("/addBlog")
public class AddBlogServlet extends HttpServlet {

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		HttpSession session = req.getSession();
		try {
			String title = req.getParameter("title");
			String category = req.getParameter("category");
			String author = req.getParameter("author");
			String excerpt = req.getParameter("excerpt");
			String content = req.getParameter("content");
			String imagePath = req.getParameter("imagePath");

			if (imagePath == null || imagePath.trim().isEmpty()) {
				imagePath = "img/hospital1.jpg";
			}

			Blog blog = new Blog(title, excerpt, content, author, category, imagePath, 0);
			BlogDAO dao = new BlogDAO(DBConnection.getConn());

			boolean f = dao.addBlog(blog);
			if (f) {
				session.setAttribute("succMsg", "New Blog published successfully!");
			} else {
				session.setAttribute("errorMsg", "Failed to publish Blog on server.");
			}
		} catch (Exception e) {
			e.printStackTrace();
			session.setAttribute("errorMsg", "Error publishing Blog.");
		}
		resp.sendRedirect("admin/index.jsp");
	}
}
