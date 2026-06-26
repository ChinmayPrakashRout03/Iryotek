package com.hms.entity;

public class Hospital {

	private int id;
	private String name;
	private String address;
	private String city;
	private String state;
	private String phone;

	public Hospital() {
		super();
	}

	public Hospital(String name, String address, String city, String state, String phone) {
		super();
		this.name = name;
		this.address = address;
		this.city = city;
		this.state = state;
		this.phone = phone;
	}

	public Hospital(int id, String name, String address, String city, String state, String phone) {
		super();
		this.id = id;
		this.name = name;
		this.address = address;
		this.city = city;
		this.state = state;
		this.phone = phone;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

}
