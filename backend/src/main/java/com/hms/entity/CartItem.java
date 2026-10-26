package com.hms.entity;

public class CartItem {

    private int id;
    private int cartId;
    private int medicineId;
    private int quantity;
    private String dosageInstructions;
    private String source; // "PRESCRIPTION" or "MANUAL"
    private Integer prescriptionId;
    private Integer appointmentId;
    private Integer doctorId;
    private Medicine medicine;

    public CartItem() {
        super();
    }

    public CartItem(int id, int cartId, int medicineId, int quantity, String dosageInstructions, String source, Integer prescriptionId, Integer appointmentId, Integer doctorId) {
        super();
        this.id = id;
        this.cartId = cartId;
        this.medicineId = medicineId;
        this.quantity = quantity;
        this.dosageInstructions = dosageInstructions;
        this.source = source;
        this.prescriptionId = prescriptionId;
        this.appointmentId = appointmentId;
        this.doctorId = doctorId;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getCartId() {
        return cartId;
    }

    public void setCartId(int cartId) {
        this.cartId = cartId;
    }

    public int getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(int medicineId) {
        this.medicineId = medicineId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getDosageInstructions() {
        return dosageInstructions;
    }

    public void setDosageInstructions(String dosageInstructions) {
        this.dosageInstructions = dosageInstructions;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Integer getPrescriptionId() {
        return prescriptionId;
    }

    public void setPrescriptionId(Integer prescriptionId) {
        this.prescriptionId = prescriptionId;
    }

    public Integer getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Integer appointmentId) {
        this.appointmentId = appointmentId;
    }

    public Integer getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Integer doctorId) {
        this.doctorId = doctorId;
    }

    public Medicine getMedicine() {
        return medicine;
    }

    public void setMedicine(Medicine medicine) {
        this.medicine = medicine;
    }

    public double getSubtotal() {
        if (medicine != null) {
            return medicine.getPrice() * quantity;
        }
        return 0;
    }
}
