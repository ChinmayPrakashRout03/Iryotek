package com.hms.admin.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.DoctorDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Doctor;
import com.hms.util.EmailUtil;

@WebServlet("/addDoctor")
public class DoctorServlet extends HttpServlet{

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		
		try {
			
			//get all data which is coming from doctor.jsp doctor details
			String fullName = req.getParameter("fullName");
			String dateOfBirth = req.getParameter("dateOfBirth");
			String qualification = req.getParameter("qualification");
			String specialist = req.getParameter("specialist");
			String email = req.getParameter("email");
			String phone = req.getParameter("phone");
			String password = req.getParameter("password");
			int hospitalId = Integer.parseInt(req.getParameter("hospitalId"));
			
			
			Doctor doctor = new Doctor(fullName, dateOfBirth, qualification, specialist, "", email, phone, password, hospitalId, "09:00 AM - 05:00 PM");
			
			DoctorDAO docDAO = new DoctorDAO(DBConnection.getConn());
			
			boolean f = docDAO.registerDoctor(doctor);

			HttpSession session = req.getSession();
			
			if(f==true) {
				String emailSubject = "Your Doctor Portal Credentials - Iryotek Hospital";
				String emailBody = "<h3>Dear Dr. " + fullName + ",</h3>"
						+ "<p>You have been registered as a Doctor in the Iryotek Hospital Management System.</p>"
						+ "<p>Here are your login credentials to access the Doctor Portal:</p>"
						+ "<ul>"
						+ "<li><strong>Login URL:</strong> <a href=\"http://localhost:8081/Iryotek/doctor_login.jsp\">Doctor Login Page</a></li>"
						+ "<li><strong>Email:</strong> " + email + "</li>"
						+ "<li><strong>Temporary Password:</strong> " + password + "</li>"
						+ "</ul>"
						+ "<p>Please log in and update your password from your profile section as soon as possible.</p>"
						+ "<br><p>Best regards,<br>Iryotek Hospital Administration</p>";
				EmailUtil.sendEmail(email, emailSubject, emailBody);

				session.setAttribute("successMsg", "Doctor added Successfully");
				resp.sendRedirect("admin/doctor.jsp");
				
			}
			else {
				session.setAttribute("errorMsg", "Something went wrong on server!");
				resp.sendRedirect("admin/doctor.jsp");
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}

	
}
