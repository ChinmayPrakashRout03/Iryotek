package com.hms.entity;

import java.sql.Timestamp;

public class AIDiagnosis {
    private int id;
    private Integer userId;
    private Integer appointmentId;
    private String symptoms;
    private String urgencyLevel; // Low, Medium, High, Emergency
    private String diagnosesJson;
    private String clinicalNotes;
    private String disclaimer;
    private Timestamp createdAt;

    public AIDiagnosis() {}

    public AIDiagnosis(Integer userId, Integer appointmentId, String symptoms, String urgencyLevel, String diagnosesJson, String clinicalNotes, String disclaimer) {
        this.userId = userId;
        this.appointmentId = appointmentId;
        this.symptoms = symptoms;
        this.urgencyLevel = urgencyLevel;
        this.diagnosesJson = diagnosesJson;
        this.clinicalNotes = clinicalNotes;
        this.disclaimer = disclaimer;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Integer appointmentId) { this.appointmentId = appointmentId; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getUrgencyLevel() { return urgencyLevel; }
    public void setUrgencyLevel(String urgencyLevel) { this.urgencyLevel = urgencyLevel; }

    public String getDiagnosesJson() { return diagnosesJson; }
    public void setDiagnosesJson(String diagnosesJson) { this.diagnosesJson = diagnosesJson; }

    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
