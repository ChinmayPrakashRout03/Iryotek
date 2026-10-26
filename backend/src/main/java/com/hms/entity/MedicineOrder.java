package com.hms.entity;

import java.util.ArrayList;
import java.util.List;

public class MedicineOrder {

    private int id;
    private String orderNumber;
    private int userId;
    private int addressId;
    private double totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus; // Pending, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled
    private Integer prescriptionId;
    private Integer appointmentId;
    private String createdAt;
    private UserAddress address;
    private List<MedicineOrderItem> items = new ArrayList<>();

    public MedicineOrder() {
        super();
    }

    public MedicineOrder(int id, String orderNumber, int userId, int addressId, double totalAmount, String paymentMethod, String paymentStatus, String orderStatus, Integer prescriptionId, Integer appointmentId, String createdAt) {
        super();
        this.id = id;
        this.orderNumber = orderNumber;
        this.userId = userId;
        this.addressId = addressId;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.orderStatus = orderStatus;
        this.prescriptionId = prescriptionId;
        this.appointmentId = appointmentId;
        this.createdAt = createdAt;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getAddressId() {
        return addressId;
    }

    public void setAddressId(int addressId) {
        this.addressId = addressId;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public Integer getPrescriptionId() {
        return prescriptionId;
    }

    public void setPrescriptionId(Integer prescriptionId) {
        this.prescriptionId = prescriptionId;
    }

    public Integer getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Integer appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public UserAddress getAddress() {
        return address;
    }

    public void setAddress(UserAddress address) {
        this.address = address;
    }

    public List<MedicineOrderItem> getItems() {
        return items;
    }

    public void setItems(List<MedicineOrderItem> items) {
        this.items = items;
    }
}
