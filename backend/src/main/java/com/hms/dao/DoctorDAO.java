package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

//import javax.security.auth.message.callback.PrivateKeyCallback.Request;
import javax.servlet.http.HttpSession;

import com.hms.entity.Doctor;
import com.hms.entity.DoctorHospitalDTO;
import org.mindrot.jbcrypt.BCrypt;

public class DoctorDAO {

	private Connection conn;

	public DoctorDAO(Connection conn) {
		super();
		this.conn = conn;
	}

	public boolean registerDoctor(Doctor doctor) {

		boolean f = false;

		try {

			String sql = "insert into doctor(fullName,dateOfBirth,qualification,specialist,diseases,email,phone,password,hospitalId,timing) values(?,?,?,?,?,?,?,?,?,?)";

			String hashed = BCrypt.hashpw(doctor.getPassword(), BCrypt.gensalt());

			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setString(1, doctor.getFullName());
			pstmt.setString(2, doctor.getDateOfBirth());
			pstmt.setString(3, doctor.getQualification());
			pstmt.setString(4, doctor.getSpecialist());
			pstmt.setString(5, doctor.getDiseases());
			pstmt.setString(6, doctor.getEmail());
			pstmt.setString(7, doctor.getPhone());
			pstmt.setString(8, hashed);
			pstmt.setInt(9, doctor.getHospitalId());
			pstmt.setString(10, doctor.getTiming());

			pstmt.executeUpdate();
			f = true;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return f;
	}

	public List<Doctor> getAllDoctor() {

		Doctor doctor = null;
		List<Doctor> docList = new ArrayList<Doctor>();

		try {

			String sql = "select * from doctor order by id desc";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);

			ResultSet resultSet = pstmt.executeQuery();

			while (resultSet.next()) {
				doctor = new Doctor();

				doctor.setId(resultSet.getInt("id"));
				doctor.setFullName(resultSet.getString("fullName"));
				doctor.setDateOfBirth(resultSet.getString("dateOfBirth"));
				doctor.setQualification(resultSet.getString("qualification"));
				doctor.setSpecialist(resultSet.getString("specialist"));
				doctor.setDiseases(resultSet.getString("diseases"));
				doctor.setEmail(resultSet.getString("email"));
				doctor.setPhone(resultSet.getString("phone"));
				doctor.setPassword(resultSet.getString("password"));
				doctor.setHospitalId(resultSet.getInt("hospitalId"));
				doctor.setTiming(resultSet.getString("timing"));
				docList.add(doctor);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return docList;
	}

	public Doctor getDoctorById(int id) {

		Doctor doctor = null;

		try {

			String sql = "select * from doctor where id=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setInt(1, id);

			ResultSet resultSet = pstmt.executeQuery();

			while (resultSet.next()) {
				doctor = new Doctor();

				doctor.setId(resultSet.getInt("id"));
				doctor.setFullName(resultSet.getString("fullName"));
				doctor.setDateOfBirth(resultSet.getString("dateOfBirth"));
				doctor.setQualification(resultSet.getString("qualification"));
				doctor.setSpecialist(resultSet.getString("specialist"));
				doctor.setEmail(resultSet.getString("email"));
				doctor.setPhone(resultSet.getString("phone"));
				doctor.setPassword(resultSet.getString("password"));
				doctor.setHospitalId(resultSet.getInt("hospitalId"));
				doctor.setTiming(resultSet.getString("timing"));

			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return doctor;
	}

	public boolean updateDoctor(Doctor doctor) {

		boolean f = false;

		try {

			String sql = "update doctor set fullName=?,dateOfBirth=?,qualification=?,specialist=?,diseases=?,email=?,phone=?,password=?,hospitalId=?,timing=? where id=?";

			String pass = doctor.getPassword();
			if (!(pass.startsWith("$2a$") || pass.startsWith("$2b$") || pass.startsWith("$2y$"))) {
				pass = BCrypt.hashpw(pass, BCrypt.gensalt());
			}

			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setString(1, doctor.getFullName());
			pstmt.setString(2, doctor.getDateOfBirth());
			pstmt.setString(3, doctor.getQualification());
			pstmt.setString(4, doctor.getSpecialist());
			pstmt.setString(5, doctor.getDiseases());
			pstmt.setString(6, doctor.getEmail());
			pstmt.setString(7, doctor.getPhone());
			pstmt.setString(8, pass);
			pstmt.setInt(9, doctor.getHospitalId());
			pstmt.setString(10, doctor.getTiming());
			pstmt.setInt(11, doctor.getId());

			pstmt.executeUpdate();
			f = true;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return f;
	}

	public boolean deleteDoctorById(int id) {

		boolean f = false;

		try {

			String sql = "delete from doctor where id=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setInt(1, id);

			pstmt.executeUpdate();

			f = true;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return f;
	}

	public Doctor loginDoctor(String email, String password) {

		Doctor doctor = null;

		try {

			String sql = "select * from doctor where email=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);

			pstmt.setString(1, email);

			ResultSet resultSet = pstmt.executeQuery();

			if (resultSet.next()) {
				String dbPassword = resultSet.getString("password");
				boolean passwordMatches = false;
				boolean needsMigration = false;

				if (dbPassword.startsWith("$2a$") || dbPassword.startsWith("$2b$") || dbPassword.startsWith("$2y$")) {
					try {
						passwordMatches = BCrypt.checkpw(password, dbPassword);
					} catch (IllegalArgumentException e) {
						passwordMatches = password.equals(dbPassword);
						needsMigration = passwordMatches;
					}
				} else {
					passwordMatches = password.equals(dbPassword);
					needsMigration = passwordMatches;
				}

				if (passwordMatches) {
					doctor = new Doctor();
					doctor.setId(resultSet.getInt("id"));
					doctor.setFullName(resultSet.getString("fullName"));
					doctor.setDateOfBirth(resultSet.getString("dateOfBirth"));
					doctor.setQualification(resultSet.getString("qualification"));
					doctor.setSpecialist(resultSet.getString("specialist"));
					doctor.setDiseases(resultSet.getString("diseases"));
					doctor.setEmail(resultSet.getString("email"));
					doctor.setPhone(resultSet.getString("phone"));
					doctor.setPassword(dbPassword);
					doctor.setHospitalId(resultSet.getInt("hospitalId"));
					doctor.setTiming(resultSet.getString("timing"));

					if (needsMigration) {
						String hashed = BCrypt.hashpw(password, BCrypt.gensalt());
						String updateSql = "update doctor set password=? where id=?";
						PreparedStatement updatePstmt = this.conn.prepareStatement(updateSql);
						updatePstmt.setString(1, hashed);
						updatePstmt.setInt(2, doctor.getId());
						updatePstmt.executeUpdate();
						doctor.setPassword(hashed);
					}
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return doctor;

	}

	public int countTotalDoctor() {

		int i = 0;

		try {

			String sql = "select * from doctor";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);

			ResultSet resultSet = pstmt.executeQuery();
			while (resultSet.next()) {

				i++;
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return i;
	}

	public int countTotalAppointment() {

		int i = 0;

		try {

			String sql = "select * from appointment";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);

			ResultSet resultSet = pstmt.executeQuery();
			while (resultSet.next()) {

				i++;
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return i;
	}

	public int countTotalAppointmentByDoctorId(int doctorId) {

		int i = 0;

		try {

			String sql = "select * from appointment where doctorId=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setInt(1, doctorId);

			ResultSet resultSet = pstmt.executeQuery();
			while (resultSet.next()) {

				i++;
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return i;
	}

	public int countTotalUser() {

		int i = 0;

		try {

			String sql = "select * from user_details";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);

			ResultSet resultSet = pstmt.executeQuery();
			while (resultSet.next()) {

				i++;
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return i;
	}

	public int countTotalSpecialist() {

		int i = 0;

		try {

			String sql = "select * from specialist";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);

			ResultSet resultSet = pstmt.executeQuery();
			while (resultSet.next()) {

				i++;
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return i;
	}

	public boolean checkOldPassword(int doctorId, String oldPassword) {

		boolean f = false;

		try {

			String sql = "select * from doctor where id=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setInt(1, doctorId);

			ResultSet resultSet = pstmt.executeQuery();

			if (resultSet.next()) {
				String dbPassword = resultSet.getString("password");
				boolean passwordMatches = false;
				boolean needsMigration = false;

				if (dbPassword.startsWith("$2a$") || dbPassword.startsWith("$2b$") || dbPassword.startsWith("$2y$")) {
					try {
						passwordMatches = BCrypt.checkpw(oldPassword, dbPassword);
					} catch (IllegalArgumentException e) {
						passwordMatches = oldPassword.equals(dbPassword);
						needsMigration = passwordMatches;
					}
				} else {
					passwordMatches = oldPassword.equals(dbPassword);
					needsMigration = passwordMatches;
				}

				if (passwordMatches) {
					f = true;
					if (needsMigration) {
						String hashed = BCrypt.hashpw(oldPassword, BCrypt.gensalt());
						String updateSql = "update doctor set password=? where id=?";
						PreparedStatement updatePstmt = this.conn.prepareStatement(updateSql);
						updatePstmt.setString(1, hashed);
						updatePstmt.setInt(2, doctorId);
						updatePstmt.executeUpdate();
					}
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return f;
	}

	public boolean changePassword(int doctorId, String newPassword) {

		boolean f = false;

		try {

			String hashed = BCrypt.hashpw(newPassword, BCrypt.gensalt());
			String sql = "update doctor set password=? where id=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setString(1, hashed);
			pstmt.setInt(2, doctorId);

			pstmt.executeUpdate();

			f = true;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return f;
	}

	public boolean editDoctorProfile(Doctor doctor) {

		boolean f = false;

		try {

			//String sql = "update doctor set fullName=?,dateOfBirth=?,qualification=?,specialist=?,email=?,phone=?,password=? where id=?";
			String sql = "update doctor set fullName=?,dateOfBirth=?,qualification=?,specialist=?,diseases=?,email=?,phone=? where id=?";

			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setString(1, doctor.getFullName());
			pstmt.setString(2, doctor.getDateOfBirth());
			pstmt.setString(3, doctor.getQualification());
			pstmt.setString(4, doctor.getSpecialist());
			pstmt.setString(5, doctor.getDiseases());
			pstmt.setString(6, doctor.getEmail());
			pstmt.setString(7, doctor.getPhone());
			pstmt.setInt(8, doctor.getId());

			pstmt.executeUpdate();
			f = true;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return f;
	}

	public List<Doctor> getDoctorsByHospitalId(int hospitalId) {

		Doctor doctor = null;
		List<Doctor> docList = new ArrayList<Doctor>();

		try {

			String sql = "select * from doctor where hospitalId=? order by fullName";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setInt(1, hospitalId);

			ResultSet resultSet = pstmt.executeQuery();

			while (resultSet.next()) {
				doctor = new Doctor();

				doctor.setId(resultSet.getInt("id"));
				doctor.setFullName(resultSet.getString("fullName"));
				doctor.setDateOfBirth(resultSet.getString("dateOfBirth"));
				doctor.setQualification(resultSet.getString("qualification"));
				doctor.setSpecialist(resultSet.getString("specialist"));
				doctor.setDiseases(resultSet.getString("diseases"));
				doctor.setEmail(resultSet.getString("email"));
				doctor.setPhone(resultSet.getString("phone"));
				doctor.setPassword(resultSet.getString("password"));
				doctor.setHospitalId(resultSet.getInt("hospitalId"));
				docList.add(doctor);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return docList;
	}

	public List<String> getAllDiseases() {
		List<String> list = new ArrayList<String>();
		try {
			String sql = "select distinct diseases from doctor where diseases is not null and diseases != '' order by diseases asc";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			ResultSet resultSet = pstmt.executeQuery();
			while (resultSet.next()) {
				list.add(resultSet.getString("diseases"));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return list;
	}

	public List<Doctor> getDoctorsByHospitalAndDisease(int hospitalId, String disease) {
		Doctor doctor = null;
		List<Doctor> docList = new ArrayList<Doctor>();
		try {
			String sql = "select * from doctor where hospitalId=? and diseases=? order by fullName";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setInt(1, hospitalId);
			pstmt.setString(2, disease);
			ResultSet resultSet = pstmt.executeQuery();
			while (resultSet.next()) {
				doctor = new Doctor();
				doctor.setId(resultSet.getInt("id"));
				doctor.setFullName(resultSet.getString("fullName"));
				doctor.setDateOfBirth(resultSet.getString("dateOfBirth"));
				doctor.setQualification(resultSet.getString("qualification"));
				doctor.setSpecialist(resultSet.getString("specialist"));
				doctor.setDiseases(resultSet.getString("diseases"));
				doctor.setEmail(resultSet.getString("email"));
				doctor.setPhone(resultSet.getString("phone"));
				doctor.setPassword(resultSet.getString("password"));
				doctor.setHospitalId(resultSet.getInt("hospitalId"));
				docList.add(doctor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return docList;
	}

	public List<DoctorHospitalDTO> searchDoctorsByLocationAndSpecialty(String state, String city, String specialty) {
		List<DoctorHospitalDTO> list = new ArrayList<DoctorHospitalDTO>();
		try {
			boolean searchAll = (specialty == null || specialty.equals("ALL") || specialty.trim().isEmpty());
			String sql = "SELECT d.id, d.fullName, d.qualification, d.specialist, d.email, d.phone, " +
					"h.id as hospitalId, h.name as hospitalName, h.address as hospitalAddress, h.city, h.state " +
					"FROM doctor d INNER JOIN hospital h ON d.hospitalId = h.id " +
					"WHERE h.state = ? AND h.city = ? " +
					(searchAll ? "" : "AND d.specialist = ?");
			
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, state);
			ps.setString(2, city);
			if (!searchAll) {
				ps.setString(3, specialty);
			}
			
			ResultSet rs = ps.executeQuery();
			
			while(rs.next()) {
				DoctorHospitalDTO dto = new DoctorHospitalDTO();
				dto.setDoctorId(rs.getInt("id"));
				dto.setFullName(rs.getString("fullName"));
				dto.setQualification(rs.getString("qualification"));
				dto.setSpecialist(rs.getString("specialist"));
				dto.setEmail(rs.getString("email"));
				dto.setPhone(rs.getString("phone"));
				dto.setHospitalId(rs.getInt("hospitalId"));
				dto.setHospitalName(rs.getString("hospitalName"));
				dto.setHospitalAddress(rs.getString("hospitalAddress"));
				dto.setCity(rs.getString("city"));
				dto.setState(rs.getString("state"));
				list.add(dto);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return list;
	}

}
