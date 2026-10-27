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

	public static String calculateNextAppointmentTime(String appointmentDate, String lastAllocatedTimeStr, String shiftStartStr, String shiftEndStr) {
		java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a", java.util.Locale.US);
		java.time.LocalTime shiftStart = java.time.LocalTime.of(9, 0);
		java.time.LocalTime shiftEnd = java.time.LocalTime.of(17, 0);
		try {
			shiftStart = java.time.LocalTime.parse(shiftStartStr, formatter);
			shiftEnd = java.time.LocalTime.parse(shiftEndStr, formatter);
		} catch(Exception e) {}

		java.time.LocalTime nextTime = shiftStart;

		if (lastAllocatedTimeStr != null && !lastAllocatedTimeStr.isEmpty()) {
			try {
				java.time.LocalTime lastTime = java.time.LocalTime.parse(lastAllocatedTimeStr, formatter);
				nextTime = lastTime.plusMinutes(15);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		// Check if the appointment date is today in IST
		java.time.ZoneId istZone = java.time.ZoneId.of("Asia/Kolkata");
		java.time.LocalDate today = java.time.LocalDate.now(istZone);
		java.time.LocalDate apptDate = null;
		try {
			apptDate = java.time.LocalDate.parse(appointmentDate);
		} catch (Exception e) {
			e.printStackTrace();
		}

		if (apptDate != null && apptDate.equals(today)) {
			java.time.LocalTime now = java.time.LocalTime.now(istZone);
			// Add a travel/preparation buffer of 45 minutes
			java.time.LocalTime bufferedNow = now.plusMinutes(45);
			// Round up to nearest 15 minutes
			int minute = bufferedNow.getMinute();
			int addMins = 15 - (minute % 15);
			if (addMins == 15) addMins = 0;
			java.time.LocalTime roundedNow = bufferedNow.plusMinutes(addMins).withSecond(0).withNano(0);

			if (roundedNow.isAfter(nextTime)) {
				nextTime = roundedNow;
			}
		}

		// Ensure nextTime is not before shiftStart (e.g. if last time somehow got messed up)
		if (nextTime.isBefore(shiftStart)) {
			nextTime = shiftStart;
		}

		// Check if nextTime is after shiftEnd
		if (nextTime.isAfter(shiftEnd) || nextTime.equals(shiftEnd)) {
			return "SHIFT_OVER"; // indicates no slots available
		}

		return nextTime.format(formatter);
	}

	public String addAppointmentV2(Appointment appointment) {
		String result = "ERROR";
		synchronized (AppointmentDAO.class) {
			try {
				// Fetch doctor's timing
				String docSql = "select timing from doctor where id=?";
				PreparedStatement docPstmt = this.conn.prepareStatement(docSql);
				docPstmt.setInt(1, appointment.getDoctorId());
				ResultSet docRs = docPstmt.executeQuery();
				String shiftStartStr = "09:00 AM";
				String shiftEndStr = "05:00 PM";
				if (docRs.next()) {
					String timing = docRs.getString("timing");
					if (timing != null && timing.contains(" - ")) {
						String[] parts = timing.split(" - ");
						shiftStartStr = parts[0].trim();
						shiftEndStr = parts[1].trim();
					}
				}
				docRs.close();
				docPstmt.close();

				// Get next token number and last appointment time
				String tokenSql = "select tokenNo, appointmentTime from appointment where doctorId=? and appointmentDate=? order by tokenNo desc limit 1";
				PreparedStatement tokenPstmt = this.conn.prepareStatement(tokenSql);
				tokenPstmt.setInt(1, appointment.getDoctorId());
				tokenPstmt.setString(2, appointment.getAppointmentDate());
				ResultSet rs = tokenPstmt.executeQuery();
				int nextToken = 1;
				String lastTime = null;
				if (rs.next()) {
					nextToken = rs.getInt("tokenNo") + 1;
					lastTime = rs.getString("appointmentTime");
				}
				rs.close();
				tokenPstmt.close();

				appointment.setTokenNo(nextToken);
				String computedTime = calculateNextAppointmentTime(appointment.getAppointmentDate(), lastTime, shiftStartStr, shiftEndStr);
				
				if ("SHIFT_OVER".equals(computedTime)) {
					return "SHIFT_OVER";
				}
				
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
				result = "SUCCESS";

			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return result;
	}

	public boolean addAppointment(Appointment appointment) {
		boolean f = false;
		synchronized (AppointmentDAO.class) {
			try {
				// Get next token number and last appointment time
				String tokenSql = "select tokenNo, appointmentTime from appointment where doctorId=? and appointmentDate=? order by tokenNo desc limit 1";
				PreparedStatement tokenPstmt = this.conn.prepareStatement(tokenSql);
				tokenPstmt.setInt(1, appointment.getDoctorId());
				tokenPstmt.setString(2, appointment.getAppointmentDate());
				ResultSet rs = tokenPstmt.executeQuery();
				int nextToken = 1;
				String lastTime = null;
				if (rs.next()) {
					nextToken = rs.getInt("tokenNo") + 1;
					lastTime = rs.getString("appointmentTime");
				}
				rs.close();
				tokenPstmt.close();

				appointment.setTokenNo(nextToken);
				if (appointment.getAppointmentTime() == null || appointment.getAppointmentTime().trim().isEmpty() || "null".equalsIgnoreCase(appointment.getAppointmentTime()) || "SHIFT_OVER".equalsIgnoreCase(appointment.getAppointmentTime())) {
					String computedTime = calculateNextAppointmentTime(appointment.getAppointmentDate(), lastTime, "09:00 AM", "09:00 PM");
					if (!"SHIFT_OVER".equals(computedTime)) {
						appointment.setAppointmentTime(computedTime);
					} else {
						appointment.setAppointmentTime("10:00 AM");
					}
				}

				String sql = "insert into appointment(userId, fullName, gender, age, appointmentDate, email, phone, diseases, doctorId, address, status, tokenNo, appointmentTime) values(?,?,?,?,?,?,?,?,?,?,?,?,?)";
				PreparedStatement pstmt = this.conn.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS);

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
				ResultSet generatedKeys = pstmt.getGeneratedKeys();
				if (generatedKeys.next()) {
					appointment.setId(generatedKeys.getInt(1));
				}
				generatedKeys.close();
				pstmt.close();
				f = true;

			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return f;
	}

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

	public boolean hasPendingAppointment(int userId) {
		boolean exists = false;
		try {
			String sql = "select count(*) from appointment where userId=? and status='Pending'";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setInt(1, userId);
			ResultSet resultSet = pstmt.executeQuery();
			if (resultSet.next()) {
				exists = resultSet.getInt(1) > 0;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return exists;
	}

}
