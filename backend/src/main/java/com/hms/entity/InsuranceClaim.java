package com.hms.entity;

import java.sql.Timestamp;

public class InsuranceClaim {
    private int id;
    private String claimNumber;
    private int userId;
    private int insuranceId;
    private String providerName;
    private String serviceDate;
    private String hospitalOrClinic;
    private String treatmentDescription;
    private double totalBilledAmount;
    private double insuranceCoveredAmount;
    private double patientResponsibility;
    private String claimStatus; // PENDING_REVIEW, UNDER_AUDIT, APPROVED, IN_PROCESS, SETTLED, REJECTED
    private String remarks;
    private String documentUrl;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public InsuranceClaim() {
        super();
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getClaimNumber() {
        return claimNumber;
    }

    public void setClaimNumber(String claimNumber) {
        this.claimNumber = claimNumber;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getInsuranceId() {
        return insuranceId;
    }

    public void setInsuranceId(int insuranceId) {
        this.insuranceId = insuranceId;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getServiceDate() {
        return serviceDate;
    }

    public void setServiceDate(String serviceDate) {
        this.serviceDate = serviceDate;
    }

    public String getHospitalOrClinic() {
        return hospitalOrClinic;
    }

    public void setHospitalOrClinic(String hospitalOrClinic) {
        this.hospitalOrClinic = hospitalOrClinic;
    }

    public String getTreatmentDescription() {
        return treatmentDescription;
    }

    public void setTreatmentDescription(String treatmentDescription) {
        this.treatmentDescription = treatmentDescription;
    }

    public double getTotalBilledAmount() {
        return totalBilledAmount;
    }

    public void setTotalBilledAmount(double totalBilledAmount) {
        this.totalBilledAmount = totalBilledAmount;
    }

    public double getInsuranceCoveredAmount() {
        return insuranceCoveredAmount;
    }

    public void setInsuranceCoveredAmount(double insuranceCoveredAmount) {
        this.insuranceCoveredAmount = insuranceCoveredAmount;
    }

    public double getPatientResponsibility() {
        return patientResponsibility;
    }

    public void setPatientResponsibility(double patientResponsibility) {
        this.patientResponsibility = patientResponsibility;
    }

    public String getClaimStatus() {
        return claimStatus;
    }

    public void setClaimStatus(String claimStatus) {
        this.claimStatus = claimStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getStatusBadgeClass() {
        if (claimStatus == null) return "bg-secondary text-white";
        switch (claimStatus.toUpperCase()) {
            case "PENDING_REVIEW":
                return "bg-warning text-dark";
            case "UNDER_AUDIT":
                return "bg-info text-white";
            case "APPROVED":
            case "SETTLED":
                return "bg-success text-white";
            case "IN_PROCESS":
                return "bg-primary text-white";
            case "REJECTED":
                return "bg-danger text-white";
            default:
                return "bg-secondary text-white";
        }
    }

    public String getStatusDisplayName() {
        if (claimStatus == null) return "Unknown";
        switch (claimStatus.toUpperCase()) {
            case "PENDING_REVIEW":
                return "Pending Review";
            case "UNDER_AUDIT":
                return "Under Audit";
            case "APPROVED":
                return "Approved";
            case "IN_PROCESS":
                return "In Process";
            case "SETTLED":
                return "Settled & Disbursed";
            case "REJECTED":
                return "Declined / Action Required";
            default:
                return claimStatus;
        }
    }

    public int getTimelineStep() {
        if (claimStatus == null) return 1;
        switch (claimStatus.toUpperCase()) {
            case "PENDING_REVIEW":
                return 1;
            case "UNDER_AUDIT":
                return 2;
            case "IN_PROCESS":
            case "APPROVED":
                return 3;
            case "SETTLED":
                return 4;
            case "REJECTED":
                return -1;
            default:
                return 1;
        }
    }
}
