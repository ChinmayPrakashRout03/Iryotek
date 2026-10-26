package com.hms.user.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.UserDAO;
import com.hms.db.DBConnection;
import com.hms.entity.User;
import com.hms.util.EmailUtil;

@WebServlet("/user_register")
public class UserRegisterServlet extends HttpServlet {

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		try {

			// PrintWriter out = resp.getWriter();

			String fullName = req.getParameter("fullName");
			String email = req.getParameter("email");
			String password = req.getParameter("password");

			User user = new User(fullName, email, password);
			UserDAO userDAO = new UserDAO(DBConnection.getConn());
			HttpSession session = req.getSession();

			boolean f = userDAO.userRegister(user);

			if (f == true) {

				String base64Github = "";
				try {
					byte[] githubBytes = java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(req.getServletContext().getRealPath("/img/github.png")));
					base64Github = java.util.Base64.getEncoder().encodeToString(githubBytes);
				} catch (Exception e) {
					e.printStackTrace();
				}

				String emailSubject = "Welcome to Iryotek";
				String emailBody = "<div style=\"background-color: #f4f6f8; padding: 40px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;\">"
						+ "  <div style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e1e8ed;\">"
						+ "    <!-- Green Accent Top Bar -->"
						+ "    <div style=\"background-color: #5B7E3C; height: 6px;\"></div>"
						+ "    "
						+ "    <!-- Header Section -->"
						+ "    <div style=\"padding: 30px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;\">"
						+ "      <h2 style=\"margin: 0; color: #5B7E3C; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; line-height: 1;\">Iryotek</h2>"
						+ "      <p style=\"margin: 8px 0 0 0; color: #718096; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;\">Digital Healthcare Portal</p>"
						+ "    </div>"
						+ "    "
						+ "    <!-- Body Content -->"
						+ "    <div style=\"padding: 40px 40px 30px 40px;\">"
						+ "      <h1 style=\"color: #2d3748; font-size: 22px; font-weight: 600; margin-top: 0; margin-bottom: 20px;\">Dear " + fullName + ",</h1>"
						+ "      "
						+ "      <p style=\"color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;\">"
						+ "        Welcome to <strong>Iryotek</strong>. Thank you for registering with us. Your account has been created successfully."
						+ "      </p>"
						+ "      "
						+ "      <p style=\"color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;\">"
						+ "        Iryotek is your trusted digital healthcare platform, designed to make clinic and hospital visits easier, faster, and more organized. "
						+ "        You can now securely book appointments, browse hospitals and doctors, receive queue tokens with scheduled time slots, and manage your appointments, all in one place."
						+ "      </p>"
						+ "      "
						+ "      <!-- Key features box -->"
						+ "      <div style=\"background-color: #f7fafc; border-radius: 8px; border: 1px solid #edf2f7; padding: 25px; margin-bottom: 30px;\">"
						+ "        <h3 style=\"color: #5B7E3C; font-size: 16px; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;\">What you can do now:</h3>"
						+ "        "
						+ "        <table style=\"width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;\">"
						+ "          <tr>"
						+ "            <td style=\"vertical-align: top; width: 25px; padding-bottom: 15px; color: #5B7E3C; font-size: 18px; line-height: 1;\">✦</td>"
						+ "            <td style=\"vertical-align: top; padding-bottom: 15px; color: #4a5568; font-size: 15px; line-height: 1.5;\">"
						+ "              <strong>Secure Booking:</strong> Browse affiliated hospitals and find the right doctors."
						+ "            </td>"
						+ "          </tr>"
						+ "          <tr>"
						+ "            <td style=\"vertical-align: top; width: 25px; padding-bottom: 15px; color: #5B7E3C; font-size: 18px; line-height: 1;\">✦</td>"
						+ "            <td style=\"vertical-align: top; padding-bottom: 15px; color: #4a5568; font-size: 15px; line-height: 1.5;\">"
						+ "              <strong>Conflict-Free Slots:</strong> Receive automatic queue token numbers and precise 15-minute time slots."
						+ "            </td>"
						+ "          </tr>"
						+ "          <tr>"
						+ "            <td style=\"vertical-align: top; width: 25px; color: #5B7E3C; font-size: 18px; line-height: 1;\">✦</td>"
						+ "            <td style=\"vertical-align: top; color: #4a5568; font-size: 15px; line-height: 1.5;\">"
						+ "              <strong>Unified Portal:</strong> Track all your appointments and prescriptions in a single dashboard."
						+ "            </td>"
						+ "          </tr>"
						+ "        </table>"
						+ "      </div>"
						+ "      "
						+ "      <!-- CTA Button -->"
						+ "      <div style=\"text-align: center; margin-bottom: 35px;\">"
						+ "        <a href=\"http://localhost:8081/Iryotek/user_login.jsp\" style=\"background-color: #5B7E3C; color: #ffffff; padding: 14px 30px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 10px rgba(91,126,60,0.25);\">"
						+ "          Go to Dashboard"
						+ "        </a>"
						+ "      </div>"
						+ "      "
						+ "      <p style=\"color: #4a5568; font-size: 15px; line-height: 1.6; margin-bottom: 0;\">"
						+ "        We are committed to providing a smooth, secure, and hassle-free healthcare experience for every patient."
						+ "      </p>"
						+ "    </div>"
						+ "    "
						+ "    <!-- Signature Section -->"
						+ "    <div style=\"padding: 0 40px 40px 40px;\">"
						+ "      <p style=\"color: #718096; font-size: 14px; line-height: 1.5; margin: 0;\">"
						+ "        Wishing you good health,<br>"
						+ "        <strong style=\"color: #2d3748;\">Team Iryotek</strong><br>"
						+ "        <span style=\"color: #5B7E3C; font-size: 12px;\">Connecting Patients. Empowering Healthcare.</span>"
						+ "      </p>"
						+ "    </div>"
						+ "    "
						+ "    <!-- Footer Section -->"
						+ "    <div style=\"background-color: #f7fafc; padding: 25px 40px; text-align: center; border-top: 1px solid #edf2f7;\">"
						+ "      <div style=\"margin-bottom: 15px;\">"
						+ "        <a href=\"https://github.com/ChinmayPrakashRout03\" target=\"_blank\" style=\"text-decoration: none; display: inline-block;\">"
						+ "          <img src=\"data:image/png;base64," + base64Github + "\" width=\"24\" height=\"24\" style=\"display: block; opacity: 0.6; border: none;\" alt=\"GitHub\" />"
						+ "        </a>"
						+ "      </div>"
						+ "      <p style=\"margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.5;\">"
						+ "        This is an automated email. Please do not reply to this message."
						+ "      </p>"
						+ "      <p style=\"margin: 8px 0 0 0; color: #a0aec0; font-size: 11px;\">"
						+ "        &copy; 2026 Iryotek. All rights reserved."
						+ "      </p>"
						+ "    </div>"
						+ "  </div>"
						+ "</div>";
				EmailUtil.sendEmail(email, emailSubject, emailBody);

				User loggedInUser = userDAO.loginUser(email, password);
				if(loggedInUser != null) {
					session.setAttribute("userObj", loggedInUser);
					session.setAttribute("successMsg", "Register Successfully");
					resp.sendRedirect("index.jsp");
				} else {
					session.setAttribute("successMsg", "Register Successfully");
					resp.sendRedirect("signup.jsp");
				}
				//System.out.println("register successfull");
				// out.println("success");

			} else {
				
				session.setAttribute("errorMsg", "Something went wrong!");
				resp.sendRedirect("signup.jsp");//which page you want to show this msg
				
				//System.out.println("Error! Something went wrong");
				// out.println("error");
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

}
