package com.hms.user.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.AppointmentDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Appointment;

@WebServlet("/addAppointment")
public class AppointmentServlet extends HttpServlet{

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		HttpSession session = req.getSession();
		try {
			String userIdStr = req.getParameter("userId");
			String docParam = req.getParameter("doctorNameSelect");

			if (userIdStr == null || userIdStr.trim().isEmpty() || docParam == null || docParam.trim().isEmpty() || "---Select Doctor---".equals(docParam)) {
				session.setAttribute("errorMsg", "Please select a valid doctor and complete all required fields.");
				resp.sendRedirect("user_appointment.jsp");
				return;
			}

			int userId = Integer.parseInt(userIdStr);
			int doctorId = Integer.parseInt(docParam);
			String fullName = req.getParameter("fullName");
			String gender = req.getParameter("gender");
			String age = req.getParameter("age");
			String appointmentDate = req.getParameter("appointmentDate");
			String email = req.getParameter("email");
			String phone = req.getParameter("phone");
			String diseases = req.getParameter("diseases");
			String address = req.getParameter("address");

			AppointmentDAO appointmentDAO = new AppointmentDAO(DBConnection.getConn());

			// Enforce single active booking limit
			if (appointmentDAO.hasPendingAppointment(userId)) {
				session.setAttribute("errorMsg", "You already have a pending appointment. You cannot book another one until it is completed.");
				resp.sendRedirect("user_appointment.jsp");
				return;
			}

			Appointment appointment = new Appointment(userId, fullName, gender, age, appointmentDate, email, phone, diseases, doctorId, address, "Pending");
			boolean f = appointmentDAO.addAppointment(appointment);

			if (f == true) {
				try {
					com.hms.dao.DoctorDAO docDAO = new com.hms.dao.DoctorDAO(DBConnection.getConn());
					com.hms.entity.Doctor doctor = docDAO.getDoctorById(doctorId);
					String docName = doctor != null ? doctor.getFullName() : "Doctor";
					String emailBody = "<div style='font-family: Arial, sans-serif; padding: 20px; color: #1e293b;'>"
					                 + "<h2 style='color: #0077b6;'>Iryotek Appointment Confirmation</h2>"
					                 + "<p>Dear <strong>" + fullName + "</strong>,</p>"
					                 + "<p>Your appointment has been successfully booked and confirmed.</p>"
					                 + "<div style='background: #f8fafc; border-left: 4px solid #ff4d6d; padding: 15px; margin: 15px 0;'>"
					                 + "<p style='margin: 5px 0;'><strong>Doctor:</strong> Dr. " + docName + "</p>"
					                 + "<p style='margin: 5px 0;'><strong>Date:</strong> " + appointmentDate + "</p>"
					                 + "<p style='margin: 5px 0;'><strong>Token Number:</strong> #" + appointment.getTokenNo() + "</p>"
					                 + "<p style='margin: 5px 0;'><strong>Allocated Time Slot:</strong> " + appointment.getAppointmentTime() + "</p>"
					                 + "</div>"
					                 + "<p>Please arrive 10 minutes prior to your allocated time slot.</p>"
					                 + "<p>Best regards,<br><strong>Iryotek Healthcare Team</strong></p>"
					                 + "</div>";
					com.hms.util.EmailUtil.sendEmail(email, "Iryotek Appointment Confirmed - Token #" + appointment.getTokenNo(), emailBody);
				} catch (Exception e) {
					e.printStackTrace();
				}

				session.setAttribute("successMsg", "Appointment is recorded Successfully.");
				session.setAttribute("lastTokenNo", appointment.getTokenNo());
				session.setAttribute("lastAppointmentTime", appointment.getAppointmentTime());
				resp.sendRedirect("user_appointment.jsp");
			} else {
				session.setAttribute("errorMsg", "Something went wrong on server!");
				resp.sendRedirect("user_appointment.jsp");
			}
		} catch (Exception e) {
			e.printStackTrace();
			session.setAttribute("errorMsg", "Invalid appointment parameters. Please check your selections.");
			resp.sendRedirect("user_appointment.jsp");
		}
	}


	
}
