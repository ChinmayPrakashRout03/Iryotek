package com.hms.entity;

public class DispensingRequest {

    private int id;
    private int prescriptionId;
    private int prescriptionMedicineId;
    private int patientId;
    private int doctorId;
    private int medicineId;
    private String medicineName;
    private String strength;
    private String dosageForm;
    private String dosageInstructions;
    private String frequency;
    private int durationDays;
    private int calculatedQuantity;
    private int quantityDispensed;
    private int quantityRemaining;
    private String status; // PENDING, DISPENSED, PARTIALLY_DISPENSED, SHORTAGE_REVIEW, CANCELLED
    private String createdAt;
    private String dispensedAt;
    private Integer dispensingPharmacistId;
    private String idempotencyKey;
    private String notes;

    // View-helper joined attributes
    private String patientName;
    private String doctorName;
    private int currentStock;
    private double unitPrice;

    public DispensingRequest() {
        super();
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getPrescriptionId() {
        return prescriptionId;
    }

    public void setPrescriptionId(int prescriptionId) {
        this.prescriptionId = prescriptionId;
    }

    public int getPrescriptionMedicineId() {
        return prescriptionMedicineId;
    }

    public void setPrescriptionMedicineId(int prescriptionMedicineId) {
        this.prescriptionMedicineId = prescriptionMedicineId;
    }

    public int getPatientId() {
        return patientId;
    }

    public void setPatientId(int patientId) {
        this.patientId = patientId;
    }

    public int getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(int doctorId) {
        this.doctorId = doctorId;
    }

    public int getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(int medicineId) {
        this.medicineId = medicineId;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getStrength() {
        return strength;
    }

    public void setStrength(String strength) {
        this.strength = strength;
    }

    public String getDosageForm() {
        return dosageForm;
    }

    public void setDosageForm(String dosageForm) {
        this.dosageForm = dosageForm;
    }

    public String getDosageInstructions() {
        return dosageInstructions;
    }

    public void setDosageInstructions(String dosageInstructions) {
        this.dosageInstructions = dosageInstructions;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(int durationDays) {
        this.durationDays = durationDays;
    }

    public int getCalculatedQuantity() {
        return calculatedQuantity;
    }

    public void setCalculatedQuantity(int calculatedQuantity) {
        this.calculatedQuantity = calculatedQuantity;
    }

    public int getQuantityDispensed() {
        return quantityDispensed;
    }

    public void setQuantityDispensed(int quantityDispensed) {
        this.quantityDispensed = quantityDispensed;
    }

    public int getQuantityRemaining() {
        return quantityRemaining;
    }

    public void setQuantityRemaining(int quantityRemaining) {
        this.quantityRemaining = quantityRemaining;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getDispensedAt() {
        return dispensedAt;
    }

    public void setDispensedAt(String dispensedAt) {
        this.dispensedAt = dispensedAt;
    }

    public Integer getDispensingPharmacistId() {
        return dispensingPharmacistId;
    }

    public void setDispensingPharmacistId(Integer dispensingPharmacistId) {
        this.dispensingPharmacistId = dispensingPharmacistId;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public int getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(int currentStock) {
        this.currentStock = currentStock;
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }
}
