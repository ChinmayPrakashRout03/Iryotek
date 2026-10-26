package com.hms.entity;

public class PrescriptionMedicine {

    private int id;
    private int prescriptionId;
    private int medicineId;
    private String dosageInstructions;
    private int quantity;
    private Medicine medicine;

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
}
