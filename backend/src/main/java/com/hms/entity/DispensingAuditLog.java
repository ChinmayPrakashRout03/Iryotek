package com.hms.entity;

public class DispensingAuditLog {

    private int id;
    private int dispensingRequestId;
    private int medicineId;
    private int pharmacistId;
    private String action; // DISPENSE, PARTIAL_DISPENSE, SHORTAGE_FLAG, CANCEL
    private int quantityDispensed;
    private int previousStock;
    private int newStock;
    private String timestamp;
    private String idempotencyKey;
    private String remarks;

    // View helper
    private String medicineName;

    public DispensingAuditLog() {
        super();
    }

    public DispensingAuditLog(int id, int dispensingRequestId, int medicineId, int pharmacistId, String action,
                              int quantityDispensed, int previousStock, int newStock, String timestamp,
                              String idempotencyKey, String remarks) {
        super();
        this.id = id;
        this.dispensingRequestId = dispensingRequestId;
        this.medicineId = medicineId;
        this.pharmacistId = pharmacistId;
        this.action = action;
        this.quantityDispensed = quantityDispensed;
        this.previousStock = previousStock;
        this.newStock = newStock;
        this.timestamp = timestamp;
        this.idempotencyKey = idempotencyKey;
        this.remarks = remarks;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getDispensingRequestId() {
        return dispensingRequestId;
    }

    public void setDispensingRequestId(int dispensingRequestId) {
        this.dispensingRequestId = dispensingRequestId;
    }

    public int getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(int medicineId) {
        this.medicineId = medicineId;
    }

    public int getPharmacistId() {
        return pharmacistId;
    }

    public void setPharmacistId(int pharmacistId) {
        this.pharmacistId = pharmacistId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public int getQuantityDispensed() {
        return quantityDispensed;
    }

    public void setQuantityDispensed(int quantityDispensed) {
        this.quantityDispensed = quantityDispensed;
    }

    public int getPreviousStock() {
        return previousStock;
    }

    public void setPreviousStock(int previousStock) {
        this.previousStock = previousStock;
    }

    public int getNewStock() {
        return newStock;
    }

    public void setNewStock(int newStock) {
        this.newStock = newStock;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }
}
