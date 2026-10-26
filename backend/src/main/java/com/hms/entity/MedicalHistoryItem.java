package com.hms.entity;

import java.sql.Timestamp;

public class MedicalHistoryItem {
    private int id;
    private int userId;
    private String category; // 'CHRONIC_CONDITION', 'ALLERGY', 'SURGERY'
    private String title;
    private String diagnosedYearOrDate;
    private String severity; // Mild, Moderate, Severe, Critical
    private String notes;
    private Timestamp createdAt;

    public MedicalHistoryItem() {}

    public MedicalHistoryItem(int userId, String category, String title, String diagnosedYearOrDate, String severity, String notes) {
        this.userId = userId;
        this.category = category;
        this.title = title;
        this.diagnosedYearOrDate = diagnosedYearOrDate;
        this.severity = severity;
        this.notes = notes;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDiagnosedYearOrDate() { return diagnosedYearOrDate; }
    public void setDiagnosedYearOrDate(String diagnosedYearOrDate) { this.diagnosedYearOrDate = diagnosedYearOrDate; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
