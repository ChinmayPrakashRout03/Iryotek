package com.hms.entity;

import java.util.ArrayList;
import java.util.List;

public class Cart {

    private int id;
    private int userId;
    private String updatedAt;
    private List<CartItem> items = new ArrayList<>();

    public Cart() {
        super();
    }

    public Cart(int id, int userId, String updatedAt) {
        super();
        this.id = id;
        this.userId = userId;
        this.updatedAt = updatedAt;
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

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }

    public double getTotalAmount() {
        double total = 0;
        if (items != null) {
            for (CartItem item : items) {
                total += item.getSubtotal();
            }
        }
        return total;
    }
}
