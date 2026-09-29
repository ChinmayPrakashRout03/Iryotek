package com.hms.websocket;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import com.hms.db.DBConnection;

@ServerEndpoint("/queueStatus")
public class QueueWebSocketServer {

    private static final java.util.Set<SessionRegistration> clientRegistrations = java.util.concurrent.ConcurrentHashMap.newKeySet();

    public static class SessionRegistration {
        private Session session;
        private int doctorId;
        private String appointmentDate;

        public Session getSession() { return session; }
        public void setSession(Session session) { this.session = session; }
        public int getDoctorId() { return doctorId; }
        public void setDoctorId(int doctorId) { this.doctorId = doctorId; }
        public String getAppointmentDate() { return appointmentDate; }
        public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            SessionRegistration that = (SessionRegistration) o;
            return doctorId == that.doctorId &&
                   session.getId().equals(that.session.getId()) &&
                   appointmentDate.equals(that.appointmentDate);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(session.getId(), doctorId, appointmentDate);
        }
    }

    @OnOpen
    public void onOpen(Session session) {
        System.out.println("[INFO] WebSocket opened: " + session.getId());
    }

    @OnClose
    public void onClose(Session session) {
        clientRegistrations.removeIf(reg -> reg.getSession().getId().equals(session.getId()));
        System.out.println("[INFO] WebSocket closed: " + session.getId());
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        if (session != null) {
            clientRegistrations.removeIf(reg -> reg.getSession().getId().equals(session.getId()));
        }
        System.out.println("[ERROR] WebSocket error: " + throwable.getMessage());
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        System.out.println("[INFO] Received message from " + session.getId() + ": " + message);
        try {
            if (message.contains("\"type\":\"register\"") || message.contains("\"type\": \"register\"")) {
                int docId = 0;
                String docIdStr = extractJsonValue(message, "doctorId");
                if (!docIdStr.isEmpty()) {
                    docId = Integer.parseInt(docIdStr.trim());
                }

                String date = extractJsonValue(message, "appointmentDate");

                SessionRegistration reg = new SessionRegistration();
                reg.setSession(session);
                reg.setDoctorId(docId);
                reg.setAppointmentDate(date);

                clientRegistrations.add(reg);
                System.out.println("[INFO] Registered session " + session.getId() + " for Doctor: " + docId + ", Date: " + date);

                // Send immediate status update
                sendSingleUpdate(session, reg);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void notifyUpdate(int doctorId, String appointmentDate) {
        System.out.println("[INFO] Broadcast triggered for Doctor: " + doctorId + ", Date: " + appointmentDate);
        if (appointmentDate == null) return;
        
        int currentServingToken = getCurrentServingToken(doctorId, appointmentDate);
        String jsonPayload = "{\"type\":\"update\",\"doctorId\":" + doctorId + ",\"appointmentDate\":\"" + appointmentDate + "\",\"currentServingToken\":" + currentServingToken + "}";

        for (SessionRegistration reg : clientRegistrations) {
            if (reg.getDoctorId() == doctorId && appointmentDate.equals(reg.getAppointmentDate())) {
                Session session = reg.getSession();
                if (session.isOpen()) {
                    try {
                        session.getBasicRemote().sendText(jsonPayload);
                        System.out.println("[INFO] Sent queue update to session: " + session.getId());
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    private static void sendSingleUpdate(Session session, SessionRegistration reg) {
        int currentServingToken = getCurrentServingToken(reg.getDoctorId(), reg.getAppointmentDate());
        String jsonPayload = "{\"type\":\"update\",\"doctorId\":" + reg.getDoctorId() + ",\"appointmentDate\":\"" + reg.getAppointmentDate() + "\",\"currentServingToken\":" + currentServingToken + "}";
        if (session.isOpen()) {
            try {
                session.getBasicRemote().sendText(jsonPayload);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private static int getCurrentServingToken(int doctorId, String appointmentDate) {
        int currentToken = 0;
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConn();
            // Find lowest pending token number
            String sql = "select tokenNo from appointment where doctorId=? and appointmentDate=? and status='Pending' order by tokenNo asc limit 1";
            ps = conn.prepareStatement(sql);
            ps.setInt(1, doctorId);
            ps.setString(2, appointmentDate);
            rs = ps.executeQuery();
            if (rs.next()) {
                currentToken = rs.getInt("tokenNo");
            } else {
                // If no pending appointments, get max token number for today (indicating all served)
                String sqlMax = "select max(tokenNo) from appointment where doctorId=? and appointmentDate=?";
                PreparedStatement psMax = conn.prepareStatement(sqlMax);
                psMax.setInt(1, doctorId);
                psMax.setString(2, appointmentDate);
                ResultSet rsMax = psMax.executeQuery();
                if (rsMax.next()) {
                    currentToken = rsMax.getInt(1);
                }
                rsMax.close();
                psMax.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try { if (rs != null) rs.close(); } catch(Exception e){}
            try { if (ps != null) ps.close(); } catch(Exception e){}
            try { if (conn != null) conn.close(); } catch(Exception e){}
        }
        return currentToken;
    }

    private String extractJsonValue(String json, String key) {
        int keyIdx = json.indexOf("\"" + key + "\"");
        if (keyIdx == -1) return "";
        int colonIdx = json.indexOf(":", keyIdx);
        if (colonIdx == -1) return "";
        int startIdx = colonIdx + 1;
        while (startIdx < json.length() && (json.charAt(startIdx) == ' ' || json.charAt(startIdx) == '"')) {
            startIdx++;
        }
        int endIdx = startIdx;
        if (json.indexOf("\"", colonIdx) != -1 && json.indexOf("\"", colonIdx) < startIdx) {
            while (endIdx < json.length() && json.charAt(endIdx) != '"') {
                endIdx++;
            }
        } else {
            while (endIdx < json.length() && json.charAt(endIdx) != ',' && json.charAt(endIdx) != '}' && json.charAt(endIdx) != ' ') {
                endIdx++;
            }
        }
        return json.substring(startIdx, endIdx);
    }
}
