package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.hms.entity.Cart;
import com.hms.entity.CartItem;
import com.hms.entity.Medicine;
import com.hms.entity.Prescription;
import com.hms.entity.PrescriptionMedicine;

public class CartDAO {

    private Connection conn;

    public CartDAO(Connection conn) {
        super();
        this.conn = conn;
    }

    public int getOrCreateCartId(int userId) {
        int cartId = -1;
        try {
            String sql = "SELECT id FROM cart WHERE user_id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                cartId = rs.getInt("id");
            } else {
                String insertSql = "INSERT INTO cart(user_id) VALUES(?)";
                PreparedStatement insertPs = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS);
                insertPs.setInt(1, userId);
                int affected = insertPs.executeUpdate();
                if (affected > 0) {
                    ResultSet genRs = insertPs.getGeneratedKeys();
                    if (genRs.next()) {
                        cartId = genRs.getInt(1);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return cartId;
    }

    public Cart getCartWithItems(int userId) {
        Cart cart = null;
        int cartId = getOrCreateCartId(userId);
        if (cartId <= 0) {
            return null;
        }

        try {
            String cartSql = "SELECT * FROM cart WHERE id = ?";
            PreparedStatement psCart = conn.prepareStatement(cartSql);
            psCart.setInt(1, cartId);
            ResultSet rsCart = psCart.executeQuery();
            if (rsCart.next()) {
                cart = new Cart(
                    rsCart.getInt("id"),
                    rsCart.getInt("user_id"),
                    rsCart.getString("updated_at")
                );
            }

            if (cart != null) {
                List<CartItem> items = new ArrayList<>();
                String itemSql = "SELECT ci.*, m.name, m.category, m.description, m.price, m.stock, m.dosage_form, m.image_url " +
                                 "FROM cart_item ci " +
                                 "JOIN medicine m ON ci.medicine_id = m.id " +
                                 "WHERE ci.cart_id = ? " +
                                 "ORDER BY ci.id ASC";
                PreparedStatement psItem = conn.prepareStatement(itemSql);
                psItem.setInt(1, cartId);
                ResultSet rsItem = psItem.executeQuery();
                while (rsItem.next()) {
                    CartItem ci = new CartItem(
                        rsItem.getInt("id"),
                        rsItem.getInt("cart_id"),
                        rsItem.getInt("medicine_id"),
                        rsItem.getInt("quantity"),
                        rsItem.getString("dosage_instructions"),
                        rsItem.getString("source"),
                        rsItem.getObject("prescription_id") != null ? rsItem.getInt("prescription_id") : null,
                        rsItem.getObject("appointment_id") != null ? rsItem.getInt("appointment_id") : null,
                        rsItem.getObject("doctor_id") != null ? rsItem.getInt("doctor_id") : null
                    );

                    Medicine m = new Medicine(
                        rsItem.getInt("medicine_id"),
                        rsItem.getString("name"),
                        rsItem.getString("category"),
                        rsItem.getString("description"),
                        rsItem.getDouble("price"),
                        rsItem.getInt("stock"),
                        rsItem.getString("dosage_form"),
                        rsItem.getString("image_url")
                    );
                    ci.setMedicine(m);
                    items.add(ci);
                }
                cart.setItems(items);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return cart;
    }

    public boolean addOrUpdateCartItem(int userId, int medicineId, int quantity, String dosage, String source, Integer prescriptionId, Integer appointmentId, Integer doctorId) {
        int cartId = getOrCreateCartId(userId);
        if (cartId <= 0) return false;

        boolean f = false;
        try {
            String checkSql = "SELECT id, quantity, source FROM cart_item WHERE cart_id = ? AND medicine_id = ?";
            PreparedStatement checkPs = conn.prepareStatement(checkSql);
            checkPs.setInt(1, cartId);
            checkPs.setInt(2, medicineId);
            ResultSet rs = checkPs.executeQuery();

            if (rs.next()) {
                int existingId = rs.getInt("id");
                int existingQty = rs.getInt("quantity");
                int newQty = existingQty + quantity;

                String updateSql = "UPDATE cart_item SET quantity = ?, dosage_instructions = ?, source = ?, prescription_id = ?, appointment_id = ?, doctor_id = ? WHERE id = ?";
                PreparedStatement updatePs = conn.prepareStatement(updateSql);
                updatePs.setInt(1, newQty);
                updatePs.setString(2, dosage != null ? dosage : "");
                updatePs.setString(3, source != null ? source : "MANUAL");
                if (prescriptionId != null) updatePs.setInt(4, prescriptionId); else updatePs.setNull(4, java.sql.Types.INTEGER);
                if (appointmentId != null) updatePs.setInt(5, appointmentId); else updatePs.setNull(5, java.sql.Types.INTEGER);
                if (doctorId != null) updatePs.setInt(6, doctorId); else updatePs.setNull(6, java.sql.Types.INTEGER);
                updatePs.setInt(7, existingId);

                int i = updatePs.executeUpdate();
                if (i > 0) f = true;
            } else {
                String insertSql = "INSERT INTO cart_item(cart_id, medicine_id, quantity, dosage_instructions, source, prescription_id, appointment_id, doctor_id) VALUES(?,?,?,?,?,?,?,?)";
                PreparedStatement insertPs = conn.prepareStatement(insertSql);
                insertPs.setInt(1, cartId);
                insertPs.setInt(2, medicineId);
                insertPs.setInt(3, quantity > 0 ? quantity : 1);
                insertPs.setString(4, dosage != null ? dosage : "");
                insertPs.setString(5, source != null ? source : "MANUAL");
                if (prescriptionId != null) insertPs.setInt(6, prescriptionId); else insertPs.setNull(6, java.sql.Types.INTEGER);
                if (appointmentId != null) insertPs.setInt(7, appointmentId); else insertPs.setNull(7, java.sql.Types.INTEGER);
                if (doctorId != null) insertPs.setInt(8, doctorId); else insertPs.setNull(8, java.sql.Types.INTEGER);

                int i = insertPs.executeUpdate();
                if (i > 0) f = true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return f;
    }

    public int autoPopulateFromPrescription(int userId, int prescriptionId) {
        int addedCount = 0;
        try {
            PrescriptionDAO rxDAO = new PrescriptionDAO(conn);
            Prescription rx = rxDAO.getPrescriptionById(prescriptionId);
            if (rx == null || rx.getItems() == null) {
                return 0;
            }

            for (PrescriptionMedicine pm : rx.getItems()) {
                Medicine m = pm.getMedicine();
                if (m != null && m.getStock() > 0) {
                    int qtyToAdd = Math.min(pm.getQuantity(), m.getStock());
                    boolean success = addOrUpdateCartItem(
                        userId,
                        pm.getMedicineId(),
                        qtyToAdd,
                        pm.getDosageInstructions(),
                        "PRESCRIPTION",
                        rx.getId(),
                        rx.getAppointmentId(),
                        rx.getDoctorId()
                    );
                    if (success) {
                        addedCount++;
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return addedCount;
    }

    public boolean updateCartItemQuantity(int cartItemId, int newQuantity) {
        boolean f = false;
        try {
            if (newQuantity <= 0) {
                return removeCartItem(cartItemId);
            }
            String sql = "UPDATE cart_item SET quantity = ? WHERE id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, newQuantity);
            ps.setInt(2, cartItemId);
            int i = ps.executeUpdate();
            if (i > 0) f = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return f;
    }

    public boolean removeCartItem(int cartItemId) {
        boolean f = false;
        try {
            String sql = "DELETE FROM cart_item WHERE id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, cartItemId);
            int i = ps.executeUpdate();
            if (i > 0) f = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return f;
    }

    public boolean clearCart(int userId) {
        boolean f = false;
        int cartId = getOrCreateCartId(userId);
        if (cartId <= 0) return false;

        try {
            String sql = "DELETE FROM cart_item WHERE cart_id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, cartId);
            ps.executeUpdate();
            f = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return f;
    }

    public int getCartItemCount(int userId) {
        int count = 0;
        int cartId = getOrCreateCartId(userId);
        if (cartId <= 0) return 0;
        try {
            String sql = "SELECT SUM(quantity) FROM cart_item WHERE cart_id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, cartId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                count = rs.getInt(1);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return count;
    }
}
