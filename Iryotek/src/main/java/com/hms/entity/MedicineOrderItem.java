package com.hms.entity;

public class MedicineOrderItem {

    private int id;
    private int orderId;
    private int medicineId;
    private String medicineName;
    private double price;
    private int quantity;
    private double subtotal;
    private String dosageInstructions;
    private String source;

    public MedicineOrderItem() {
        super();
    }

    public MedicineOrderItem(int id, int orderId, int medicineId, String medicineName, double price, int quantity, double subtotal, String dosageInstructions, String source) {
        super();
        this.id = id;
        this.orderId = orderId;
        this.medicineId = medicineId;
        this.medicineName = medicineName;
        this.price = price;
        this.quantity = quantity;
        this.subtotal = subtotal;
        this.dosageInstructions = dosageInstructions;
        this.source = source;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
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

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
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
}
