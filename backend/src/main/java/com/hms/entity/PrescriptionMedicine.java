package com.hms.entity;

public class PrescriptionMedicine {

    private int id;
    private int prescriptionId;
    private int medicineId;
    private String dosageInstructions;
    private int quantity;
    private Medicine medicine;

    // Enhanced clinical structured calculation fields
    private String medicineName = "";
    private String strength = "";
    private String dosageForm = "Tablet";
    private double unitsPerDose = 1.0;
    private String frequency = "Once daily";
    private double dosesPerDay = 1.0;
    private int durationDays = 1;
    private String route = "Oral";
    private String specialInstructions = "";
    private int calculatedQuantity = 1;
    private String calculationBreakdown = "";
    private boolean needsClarification = false;
    private String clarificationReason = "";
    private String status = "PENDING";

    public PrescriptionMedicine() {
        super();
    }

    public PrescriptionMedicine(int id, int prescriptionId, int medicineId, String dosageInstructions, int quantity) {
        super();
        this.id = id;
        this.prescriptionId = prescriptionId;
        this.medicineId = medicineId;
        this.dosageInstructions = dosageInstructions;
        this.quantity = quantity;
        this.calculatedQuantity = quantity;
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

    public int getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(int medicineId) {
        this.medicineId = medicineId;
    }

    public String getDosageInstructions() {
        return dosageInstructions;
    }

    public void setDosageInstructions(String dosageInstructions) {
        this.dosageInstructions = dosageInstructions;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Medicine getMedicine() {
        return medicine;
    }

    public void setMedicine(Medicine medicine) {
        this.medicine = medicine;
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

    public double getUnitsPerDose() {
        return unitsPerDose;
    }

    public void setUnitsPerDose(double unitsPerDose) {
        this.unitsPerDose = unitsPerDose;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public double getDosesPerDay() {
        return dosesPerDay;
    }

    public void setDosesPerDay(double dosesPerDay) {
        this.dosesPerDay = dosesPerDay;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(int durationDays) {
        this.durationDays = durationDays;
    }

    public String getRoute() {
        return route;
    }

    public void setRoute(String route) {
        this.route = route;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public int getCalculatedQuantity() {
        return calculatedQuantity;
    }

    public void setCalculatedQuantity(int calculatedQuantity) {
        this.calculatedQuantity = calculatedQuantity;
    }

    public String getCalculationBreakdown() {
        return calculationBreakdown;
    }

    public void setCalculationBreakdown(String calculationBreakdown) {
        this.calculationBreakdown = calculationBreakdown;
    }

    public boolean isNeedsClarification() {
        return needsClarification;
    }

    public void setNeedsClarification(boolean needsClarification) {
        this.needsClarification = needsClarification;
    }

    public String getClarificationReason() {
        return clarificationReason;
    }

    public void setClarificationReason(String clarificationReason) {
        this.clarificationReason = clarificationReason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
