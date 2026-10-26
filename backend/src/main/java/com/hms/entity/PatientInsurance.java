package com.hms.entity;

import java.sql.Timestamp;

public class PatientInsurance {
    private int id;
    private int userId;
    private String providerName;
    private String policyNumber;
    private String groupNumber;
    private String policyHolderName;
    private String relationship;
    private String startDate;
    private String expiryDate;
    private String networkType;
    private String coverageType;
    private double sumInsured;
    private int copayPercent;
    private double deductibleTotal;
    private double deductibleMet;
    private double outOfPocketMax;
    private String status;
    private String insuranceCardUrl;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public PatientInsurance() {
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

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getPolicyNumber() {
        return policyNumber;
    }

    public void setPolicyNumber(String policyNumber) {
        this.policyNumber = policyNumber;
    }

    public String getGroupNumber() {
        return groupNumber;
    }

    public void setGroupNumber(String groupNumber) {
        this.groupNumber = groupNumber;
    }

    public String getPolicyHolderName() {
        return policyHolderName;
    }

    public void setPolicyHolderName(String policyHolderName) {
        this.policyHolderName = policyHolderName;
    }

    public String getRelationship() {
        return relationship;
    }

    public void setRelationship(String relationship) {
        this.relationship = relationship;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getNetworkType() {
        return networkType;
    }

    public void setNetworkType(String networkType) {
        this.networkType = networkType;
    }

    public String getCoverageType() {
        return coverageType;
    }

    public void setCoverageType(String coverageType) {
        this.coverageType = coverageType;
    }

    public double getSumInsured() {
        return sumInsured;
    }

    public void setSumInsured(double sumInsured) {
        this.sumInsured = sumInsured;
    }

    public int getCopayPercent() {
        return copayPercent;
    }

    public void setCopayPercent(int copayPercent) {
        this.copayPercent = copayPercent;
    }

    public double getDeductibleTotal() {
        return deductibleTotal;
    }

    public void setDeductibleTotal(double deductibleTotal) {
        this.deductibleTotal = deductibleTotal;
    }

    public double getDeductibleMet() {
        return deductibleMet;
    }

    public void setDeductibleMet(double deductibleMet) {
        this.deductibleMet = deductibleMet;
    }

    public double getOutOfPocketMax() {
        return outOfPocketMax;
    }

    public void setOutOfPocketMax(double outOfPocketMax) {
        this.outOfPocketMax = outOfPocketMax;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInsuranceCardUrl() {
        return insuranceCardUrl;
    }

    public void setInsuranceCardUrl(String insuranceCardUrl) {
        this.insuranceCardUrl = insuranceCardUrl;
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

    public double getDeductibleRemaining() {
        return Math.max(0.0, deductibleTotal - deductibleMet);
    }

    public int getDeductiblePercent() {
        if (deductibleTotal <= 0) return 0;
        return (int) Math.min(100, Math.round((deductibleMet / deductibleTotal) * 100));
    }

    public int getDeductibleMetPercentage() {
        return getDeductiblePercent();
    }

    public String getValidityDisplay() {
        if (startDate != null && !startDate.isEmpty() && expiryDate != null && !expiryDate.isEmpty()) {
            return startDate + " to " + expiryDate;
        } else if (expiryDate != null && !expiryDate.isEmpty()) {
            return "Valid thru " + expiryDate;
        }
        return "Active (Continuous Coverage)";
    }
}
