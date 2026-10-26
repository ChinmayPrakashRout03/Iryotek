package com.hms.entity;

import java.sql.Timestamp;

public class PatientDocument {
    private int id;
    private int userId;
    private String documentType; // 'Prescription', 'Lab Report', 'Discharge Summary', 'Radiology / X-Ray', 'Other'
    private String title;
    private String fileName;
    private String filePath;
    private String fileSize;
    private Timestamp uploadedAt;
    private String notes;

    public PatientDocument() {}

    public PatientDocument(int userId, String documentType, String title, String fileName, String filePath, String fileSize, String notes) {
        this.userId = userId;
        this.documentType = documentType;
        this.title = title;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.notes = notes;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }

    public Timestamp getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Timestamp uploadedAt) { this.uploadedAt = uploadedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
