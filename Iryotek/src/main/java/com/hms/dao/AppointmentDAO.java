package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import com.hms.entity.Appointment;

public class AppointmentDAO {

	private Connection conn;

	public AppointmentDAO(Connection conn) {
		super();
		this.conn = conn;
	}

	private Appointment mapRow(ResultSet resultSet) throws Exception {
		Appointment appointment = new Appointment();
		appointment.setId(resultSet.getInt("id"));
		appointment.setUserId(resultSet.getInt("userId"));
		appointment.setFullName(resultSet.getString("fullName"));
		appointment.setGender(resultSet.getString("gender"));
		appointment.setAge(resultSet.getString("age"));
		appointment.setAppointmentDate(resultSet.getString("appointmentDate"));
		appointment.setEmail(resultSet.getString("email"));
		appointment.setPhone(resultSet.getString("phone"));
		appointment.setDiseases(resultSet.getString("diseases"));
		appointment.setDoctorId(resultSet.getInt("doctorId"));
		appointment.setAddress(resultSet.getString("address"));
		appointment.setStatus(resultSet.getString("status"));
		appointment.setTokenNo(resultSet.getInt("tokenNo"));
		appointment.setAppointmentTime(resultSet.getString("appointmentTime"));
		return appointment;
	}

	public static String calculateTimeForToken(int tokenNo) {
		int startHour = 9;
		int totalMinutes = (tokenNo - 1) * 15;
		int targetHour = startHour + totalMinutes / 60;
		int targetMinute = totalMinutes % 60;
		String period = "AM";
		if (targetHour >= 12) {
			if (targetHour > 12) {
				targetHour -= 12;
			}
			period = "PM";
		}
		return String.format("%02d:%02d %s", targetHour, targetMinute, period);
	}

	//for create appointment
	public boolean addAppointment(Appointment appointment) {
		boolean f = false;
		synchronized (AppointmentDAO.class) {
			try {
				// Get next token number
				String tokenSql = "select coalesce(max(tokenNo), 0) from appointment where doctorId=? and appointmentDate=?";
				PreparedStatement tokenPstmt = this.conn.prepareStatement(tokenSql);
				tokenPstmt.setInt(1, appointment.getDoctorId());
				tokenPstmt.setString(2, appointment.getAppointmentDate());
				ResultSet rs = tokenPstmt.executeQuery();
				int nextToken = 1;
				if (rs.next()) {
					nextToken = rs.getInt(1) + 1;
				}
				rs.close();
				tokenPstmt.close();

				appointment.setTokenNo(nextToken);
				String computedTime = calculateTimeForToken(nextToken);
				appointment.setAppointmentTime(computedTime);

				String sql = "insert into appointment(userId, fullName, gender, age, appointmentDate, email, phone, diseases, doctorId, address, status, tokenNo, appointmentTime) values(?,?,?,?,?,?,?,?,?,?,?,?,?)";
				PreparedStatement pstmt = this.conn.prepareStatement(sql);

				pstmt.setInt(1, appointment.getUserId());
				pstmt.setString(2, appointment.getFullName());
				pstmt.setString(3, appointment.getGender());
				pstmt.setString(4, appointment.getAge());
				pstmt.setString(5, appointment.getAppointmentDate());
				pstmt.setString(6, appointment.getEmail());
				pstmt.setString(7, appointment.getPhone());
				pstmt.setString(8, appointment.getDiseases());
				pstmt.setInt(9, appointment.getDoctorId());
				pstmt.setString(10, appointment.getAddress());
				pstmt.setString(11, appointment.getStatus());
				pstmt.setInt(12, appointment.getTokenNo());
				pstmt.setString(13, appointment.getAppointmentTime());

				pstmt.executeUpdate();
				pstmt.close();
				f = true;

			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return f;
	}

	// get list of appointment for logged in specific user 
	//show appointment list for specific user panel
	public List<Appointment> getAllAppointmentByLoginUser(int userId) {
		List<Appointment> appList = new ArrayList<Appointment>();
		try {
			String sql = "select * from appointment where userId=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setInt(1, userId);
			ResultSet resultSet = pstmt.executeQuery();
			while (resultSet.next()) {
				Appointment appointment = mapRow(resultSet);
				appList.add(appointment);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return appList;
	}

	// get appointment list of patient for specific doctor
	//show list of appointment in specific doctor panel 
	public List<Appointment> getAllAppointmentByLoginDoctor(int doctorId) {
		List<Appointment> appList = new ArrayList<Appointment>();
		try {
			String sql = "select * from appointment where doctorId=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setInt(1, doctorId);
			ResultSet resultSet = pstmt.executeQuery();
			while (resultSet.next()) {
				Appointment appointment = mapRow(resultSet);
				appList.add(appointment);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return appList;
	}

	// for doctor comment need specific appointment id
	public Appointment getAppointmentById(int id) {
		Appointment appointment = null;
		try {
			String sql = "select * from appointment where id=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setInt(1, id);
			ResultSet resultSet = pstmt.executeQuery();
			if (resultSet.next()) {
				appointment = mapRow(resultSet);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return appointment;
	}

	// for update comment status
	public boolean updateDrAppointmentCommentStatus(int apptId, int docId, String comment) {

		boolean f = false;

		try {

			String sql = "update appointment set status=? where id=? and doctorId=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setString(1, comment);
			pstmt.setInt(2, apptId);
			pstmt.setInt(3, docId);

			pstmt.executeUpdate();

			f = true;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return f;
	}

	// get all appointment in admin panel
	public List<Appointment> getAllAppointment() {
		List<Appointment> appList = new ArrayList<Appointment>();
		try {
			String sql = "select * from appointment order by id desc";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			ResultSet resultSet = pstmt.executeQuery();
			while (resultSet.next()) {
				Appointment appointment = mapRow(resultSet);
				appList.add(appointment);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return appList;
	}

}
