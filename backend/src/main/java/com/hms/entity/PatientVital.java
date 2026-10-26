package com.hms.entity;

import java.sql.Timestamp;

public class PatientVital {
    private int id;
    private int userId;
    private String recordedDate; // e.g. "2026-09-28" or "2026-09-28 10:30 AM"
    private int heartRate; // BPM
    private int bloodPressureSystolic; // mmHg
    private int bloodPressureDiastolic; // mmHg
    private double weight; // kg
    private int bloodGlucose; // mg/dL
    private int oxygenSaturation; // % SpO2
    private double temperature; // °F
    private String notes;
    private Timestamp createdAt;

    public PatientVital() {
        super();
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

    public String getRecordedDate() {
        return recordedDate;
    }

    public void setRecordedDate(String recordedDate) {
        this.recordedDate = recordedDate;
    }

    public int getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(int heartRate) {
        this.heartRate = heartRate;
    }

    public int getBloodPressureSystolic() {
        return bloodPressureSystolic;
    }

    public void setBloodPressureSystolic(int bloodPressureSystolic) {
        this.bloodPressureSystolic = bloodPressureSystolic;
    }

    public int getBloodPressureDiastolic() {
        return bloodPressureDiastolic;
    }

    public void setBloodPressureDiastolic(int bloodPressureDiastolic) {
        this.bloodPressureDiastolic = bloodPressureDiastolic;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public int getBloodGlucose() {
        return bloodGlucose;
    }

    public void setBloodGlucose(int bloodGlucose) {
        this.bloodGlucose = bloodGlucose;
    }

    public int getOxygenSaturation() {
        return oxygenSaturation;
    }

    public void setOxygenSaturation(int oxygenSaturation) {
        this.oxygenSaturation = oxygenSaturation;
    }

    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public String getBpDisplay() {
        if (bloodPressureSystolic > 0 && bloodPressureDiastolic > 0) {
            return bloodPressureSystolic + "/" + bloodPressureDiastolic + " mmHg";
        }
        return "N/A";
    }

    public String getHeartRateStatus() {
        if (heartRate <= 0) return "N/A";
        if (heartRate < 60) return "Low (Bradycardia)";
        if (heartRate <= 100) return "Normal (Resting)";
        return "Elevated";
    }

    public String getBpStatus() {
        if (bloodPressureSystolic <= 0 || bloodPressureDiastolic <= 0) return "N/A";
        if (bloodPressureSystolic < 120 && bloodPressureDiastolic < 80) return "Normal";
        if (bloodPressureSystolic <= 129 && bloodPressureDiastolic < 80) return "Elevated";
        if (bloodPressureSystolic <= 139 || bloodPressureDiastolic <= 89) return "Stage 1 HTN";
        return "Stage 2 HTN";
    }

    public String getSpo2Status() {
        if (oxygenSaturation <= 0) return "N/A";
        if (oxygenSaturation >= 95) return "Optimal";
        if (oxygenSaturation >= 90) return "Moderate";
        return "Low";
    }
}
