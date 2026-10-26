package com.hms.entity;

import java.util.ArrayList;
import java.util.List;

public class Prescription {

    private int id;
    private int appointmentId;
    private int userId;
    private int doctorId;
    private String createdAt;
    private String remarks;
    private List<PrescriptionMedicine> items = new ArrayList<>();

    public Prescription() {
        super();
    }

    public Prescription(int id, int appointmentId, int userId, int doctorId, String createdAt, String remarks) {
        super();
        this.id = id;
        this.appointmentId = appointmentId;
        this.userId = userId;
        this.doctorId = doctorId;
        this.createdAt = createdAt;
        this.remarks = remarks;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(int appointmentId) {
        this.appointmentId = appointmentId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(int doctorId) {
        this.doctorId = doctorId;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public List<PrescriptionMedicine> getItems() {
        return items;
    }

    public void setItems(List<PrescriptionMedicine> items) {
        this.items = items;
    }
}
