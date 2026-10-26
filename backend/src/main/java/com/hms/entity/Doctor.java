package com.hms.entity;

public class Doctor {
	
	private int id;
	private String fullName;
	private String dateOfBirth;
	private String qualification;
	private String specialist;
	private String diseases;
	private String email;
	private String phone;
	private String password;
	private int hospitalId;
	private String timing;
	
	public Doctor() {
		super();
	}

	public Doctor(int id, String fullName, String dateOfBirth, String qualification, String specialist, String diseases,
			String email, String phone, String password, int hospitalId, String timing) {
		super();
		this.id = id;
		this.fullName = fullName;
		this.dateOfBirth = dateOfBirth;
		this.qualification = qualification;
		this.specialist = specialist;
		this.diseases = diseases;
		this.email = email;
		this.phone = phone;
		this.password = password;
		this.hospitalId = hospitalId;
		this.timing = timing;
	}

	public Doctor(String fullName, String dateOfBirth, String qualification, String specialist, String diseases, String email,
			String phone, String password, int hospitalId, String timing) {
		super();
		this.fullName = fullName;
		this.dateOfBirth = dateOfBirth;
		this.qualification = qualification;
		this.specialist = specialist;
		this.diseases = diseases;
		this.email = email;
		this.phone = phone;
		this.password = password;
		this.hospitalId = hospitalId;
		this.timing = timing;
	}

	public int getId() {
		return id;
	}


	public void setId(int id) {
		this.id = id;
	}


	public String getFullName() {
		return fullName;
	}


	public void setFullName(String fullName) {
		this.fullName = fullName;
	}


	public String getDateOfBirth() {
		return dateOfBirth;
	}


	public void setDateOfBirth(String dateOfBirth) {
		this.dateOfBirth = dateOfBirth;
	}


	public String getQualification() {
		return qualification;
	}


	public void setQualification(String qualification) {
		this.qualification = qualification;
	}


	public String getSpecialist() {
		return specialist;
	}


	public void setSpecialist(String specialist) {
		this.specialist = specialist;
	}

	public String getDiseases() {
		return diseases;
	}


	public void setDiseases(String diseases) {
		this.diseases = diseases;
	}

	public String getEmail() {
		return email;
	}


	public void setEmail(String email) {
		this.email = email;
	}


	public String getPhone() {
		return phone;
	}


	public void setPhone(String phone) {
		this.phone = phone;
	}


	public String getPassword() {
		return password;
	}


	public void setPassword(String password) {
		this.password = password;
	}

	public int getHospitalId() {
		return hospitalId;
	}

	public void setHospitalId(int hospitalId) {
		this.hospitalId = hospitalId;
	}

	public String getTiming() {
		return timing;
	}

	public void setTiming(String timing) {
		this.timing = timing;
	}
	
}
