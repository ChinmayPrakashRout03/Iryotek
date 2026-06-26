package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import com.hms.entity.Hospital;

public class HospitalDAO {

	private Connection conn;

	public HospitalDAO(Connection conn) {
		super();
		this.conn = conn;
	}

	// add hospital
	public boolean addHospital(Hospital hospital) {

		boolean f = false;

		try {

			String sql = "insert into hospital(name, address, city, state, phone) values(?,?,?,?,?)";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setString(1, hospital.getName());
			pstmt.setString(2, hospital.getAddress());
			pstmt.setString(3, hospital.getCity());
			pstmt.setString(4, hospital.getState());
			pstmt.setString(5, hospital.getPhone());

			pstmt.executeUpdate();
			f = true;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return f;
	}

	// get all hospitals
	public List<Hospital> getAllHospital() {

		List<Hospital> hospitalList = new ArrayList<Hospital>();
		Hospital hospital = null;

		try {

			String sql = "select * from hospital order by state, city, name";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			ResultSet resultSet = pstmt.executeQuery();

			while (resultSet.next()) {
				hospital = new Hospital();
				hospital.setId(resultSet.getInt("id"));
				hospital.setName(resultSet.getString("name"));
				hospital.setAddress(resultSet.getString("address"));
				hospital.setCity(resultSet.getString("city"));
				hospital.setState(resultSet.getString("state"));
				hospital.setPhone(resultSet.getString("phone"));
				hospitalList.add(hospital);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return hospitalList;
	}

	// get hospital by id
	public Hospital getHospitalById(int id) {

		Hospital hospital = null;

		try {

			String sql = "select * from hospital where id=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setInt(1, id);

			ResultSet resultSet = pstmt.executeQuery();

			while (resultSet.next()) {
				hospital = new Hospital();
				hospital.setId(resultSet.getInt("id"));
				hospital.setName(resultSet.getString("name"));
				hospital.setAddress(resultSet.getString("address"));
				hospital.setCity(resultSet.getString("city"));
				hospital.setState(resultSet.getString("state"));
				hospital.setPhone(resultSet.getString("phone"));
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return hospital;
	}

	// get hospitals by city
	public List<Hospital> getHospitalsByCity(String city) {

		List<Hospital> hospitalList = new ArrayList<Hospital>();
		Hospital hospital = null;

		try {

			String sql = "select * from hospital where city=? order by name";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setString(1, city);

			ResultSet resultSet = pstmt.executeQuery();

			while (resultSet.next()) {
				hospital = new Hospital();
				hospital.setId(resultSet.getInt("id"));
				hospital.setName(resultSet.getString("name"));
				hospital.setAddress(resultSet.getString("address"));
				hospital.setCity(resultSet.getString("city"));
				hospital.setState(resultSet.getString("state"));
				hospital.setPhone(resultSet.getString("phone"));
				hospitalList.add(hospital);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return hospitalList;
	}

	// get all distinct states
	public List<String> getAllStates() {

		List<String> stateList = new ArrayList<String>();

		try {

			String sql = "select distinct state from hospital order by state";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			ResultSet resultSet = pstmt.executeQuery();

			while (resultSet.next()) {
				stateList.add(resultSet.getString("state"));
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return stateList;
	}

	// get cities by state
	public List<String> getCitiesByState(String state) {

		List<String> cityList = new ArrayList<String>();

		try {

			String sql = "select distinct city from hospital where state=? order by city";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setString(1, state);

			ResultSet resultSet = pstmt.executeQuery();

			while (resultSet.next()) {
				cityList.add(resultSet.getString("city"));
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return cityList;
	}

	// delete hospital by id
	public boolean deleteHospitalById(int id) {

		boolean f = false;

		try {

			String sql = "delete from hospital where id=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setInt(1, id);

			pstmt.executeUpdate();
			f = true;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return f;
	}

	// count total hospitals
	public int countTotalHospital() {

		int i = 0;

		try {

			String sql = "select count(*) from hospital";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			ResultSet resultSet = pstmt.executeQuery();

			if (resultSet.next()) {
				i = resultSet.getInt(1);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return i;
	}

}
