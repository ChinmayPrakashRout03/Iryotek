package com.hms.entity;

public class UserAddress {

    private int id;
    private int userId;
    private String fullName;
    private String phone;
    private String streetAddress;
    private String city;
    private String state;
    private String pincode;
    private int isDefault;

    public UserAddress() {
        super();
    }

    public UserAddress(int id, int userId, String fullName, String phone, String streetAddress, String city, String state, String pincode, int isDefault) {
        super();
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.phone = phone;
        this.streetAddress = streetAddress;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.isDefault = isDefault;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStreetAddress() {
        return streetAddress;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
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

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public int getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(int isDefault) {
        this.isDefault = isDefault;
    }

    public String getFormattedAddress() {
        return streetAddress + ", " + city + ", " + state + " - " + pincode;
    }
}
