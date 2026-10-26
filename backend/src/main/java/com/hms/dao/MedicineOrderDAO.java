package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Random;

import com.hms.entity.CartItem;
import com.hms.entity.MedicineOrder;
import com.hms.entity.MedicineOrderItem;
import com.hms.entity.UserAddress;

public class MedicineOrderDAO {

    private Connection conn;

    public MedicineOrderDAO(Connection conn) {
        super();
        this.conn = conn;
    }

    public int placeOrder(MedicineOrder order, List<CartItem> cartItems) {
        int orderId = -1;
        try {
            conn.setAutoCommit(false);

            String orderNum = "ORD-" + new SimpleDateFormat("yyyyMMdd").format(new Date()) + "-" + (1000 + new Random().nextInt(9000));
            order.setOrderNumber(orderNum);

            String orderSql = "INSERT INTO medicine_order(order_number, user_id, address_id, total_amount, payment_method, payment_status, order_status, prescription_id, appointment_id) VALUES(?,?,?,?,?,?,?,?,?)";
            PreparedStatement ps = conn.prepareStatement(orderSql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, order.getOrderNumber());
            ps.setInt(2, order.getUserId());
            ps.setInt(3, order.getAddressId());
            ps.setDouble(4, order.getTotalAmount());
            ps.setString(5, order.getPaymentMethod());
            ps.setString(6, "COD".equalsIgnoreCase(order.getPaymentMethod()) ? "Pending" : "Paid");
            ps.setString(7, "Pending");
            if (order.getPrescriptionId() != null) ps.setInt(8, order.getPrescriptionId()); else ps.setNull(8, java.sql.Types.INTEGER);
            if (order.getAppointmentId() != null) ps.setInt(9, order.getAppointmentId()); else ps.setNull(9, java.sql.Types.INTEGER);

            int affected = ps.executeUpdate();
            if (affected > 0) {
                ResultSet rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    orderId = rs.getInt(1);
                }
            }

            if (orderId > 0 && cartItems != null && !cartItems.isEmpty()) {
                String itemSql = "INSERT INTO medicine_order_item(order_id, medicine_id, medicine_name, price, quantity, subtotal, dosage_instructions, source) VALUES(?,?,?,?,?,?,?,?)";
                PreparedStatement itemPs = conn.prepareStatement(itemSql);

                String deductStockSql = "UPDATE medicine SET stock = stock - ? WHERE id = ? AND stock >= ?";
                PreparedStatement stockPs = conn.prepareStatement(deductStockSql);

                for (CartItem ci : cartItems) {
                    itemPs.setInt(1, orderId);
                    itemPs.setInt(2, ci.getMedicineId());
                    itemPs.setString(3, ci.getMedicine().getName());
                    itemPs.setDouble(4, ci.getMedicine().getPrice());
                    itemPs.setInt(5, ci.getQuantity());
                    itemPs.setDouble(6, ci.getSubtotal());
                    itemPs.setString(7, ci.getDosageInstructions() != null ? ci.getDosageInstructions() : "");
                    itemPs.setString(8, ci.getSource() != null ? ci.getSource() : "MANUAL");
                    itemPs.addBatch();

                    stockPs.setInt(1, ci.getQuantity());
                    stockPs.setInt(2, ci.getMedicineId());
                    stockPs.setInt(3, ci.getQuantity());
                    stockPs.addBatch();
                }
                itemPs.executeBatch();
                stockPs.executeBatch();

                CartDAO cartDAO = new CartDAO(conn);
                cartDAO.clearCart(order.getUserId());
            }

            conn.commit();
            conn.setAutoCommit(true);
        } catch (Exception e) {
            try {
                conn.rollback();
                conn.setAutoCommit(true);
            } catch (Exception ex) {
                ex.printStackTrace();
            }
            e.printStackTrace();
        }
        return orderId;
    }

    public List<MedicineOrder> getUserOrders(int userId) {
        List<MedicineOrder> list = new ArrayList<>();
        try {
            String sql = "SELECT * FROM medicine_order WHERE user_id = ? ORDER BY id DESC";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            UserAddressDAO addrDAO = new UserAddressDAO(conn);
            while (rs.next()) {
                MedicineOrder order = mapResultSetToOrder(rs);
                order.setAddress(addrDAO.getAddressById(order.getAddressId()));
                order.setItems(getOrderItems(order.getId()));
                list.add(order);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<MedicineOrder> getAllOrders() {
        List<MedicineOrder> list = new ArrayList<>();
        try {
            String sql = "SELECT * FROM medicine_order ORDER BY id DESC";
            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            UserAddressDAO addrDAO = new UserAddressDAO(conn);
            while (rs.next()) {
                MedicineOrder order = mapResultSetToOrder(rs);
                order.setAddress(addrDAO.getAddressById(order.getAddressId()));
                order.setItems(getOrderItems(order.getId()));
                list.add(order);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public MedicineOrder getOrderById(int orderId) {
        MedicineOrder order = null;
        try {
            String sql = "SELECT * FROM medicine_order WHERE id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, orderId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                order = mapResultSetToOrder(rs);
                UserAddressDAO addrDAO = new UserAddressDAO(conn);
                order.setAddress(addrDAO.getAddressById(order.getAddressId()));
                order.setItems(getOrderItems(orderId));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return order;
    }

    public boolean updateOrderStatus(int orderId, String status) {
        boolean f = false;
        try {
            String sql = "UPDATE medicine_order SET order_status = ? WHERE id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, status);
            ps.setInt(2, orderId);
            int i = ps.executeUpdate();
            if (i > 0) f = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return f;
    }

    public List<MedicineOrderItem> getOrderItems(int orderId) {
        List<MedicineOrderItem> list = new ArrayList<>();
        try {
            String sql = "SELECT * FROM medicine_order_item WHERE order_id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, orderId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                MedicineOrderItem item = new MedicineOrderItem(
                    rs.getInt("id"),
                    rs.getInt("order_id"),
                    rs.getInt("medicine_id"),
                    rs.getString("medicine_name"),
                    rs.getDouble("price"),
                    rs.getInt("quantity"),
                    rs.getDouble("subtotal"),
                    rs.getString("dosage_instructions"),
                    rs.getString("source")
                );
                list.add(item);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    private MedicineOrder mapResultSetToOrder(ResultSet rs) throws Exception {
        return new MedicineOrder(
            rs.getInt("id"),
            rs.getString("order_number"),
            rs.getInt("user_id"),
            rs.getInt("address_id"),
            rs.getDouble("total_amount"),
            rs.getString("payment_method"),
            rs.getString("payment_status"),
            rs.getString("order_status"),
            rs.getObject("prescription_id") != null ? rs.getInt("prescription_id") : null,
            rs.getObject("appointment_id") != null ? rs.getInt("appointment_id") : null,
            rs.getString("created_at")
        );
    }
}
