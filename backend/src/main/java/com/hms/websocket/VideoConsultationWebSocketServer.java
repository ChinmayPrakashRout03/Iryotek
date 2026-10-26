package com.hms.websocket;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

/**
 * WebRTC Signaling & Real-time Collaboration WebSocket Server for Telehealth Consultations.
 * Handles peer discovery, SDP offer/answer exchanges, ICE candidate forwarding,
 * screen-sharing notifications, mutual recording consent protocols, and in-call chat.
 */
@ServerEndpoint("/videoConsultationServer/{appointmentId}")
public class VideoConsultationWebSocketServer {

    private static final Gson gson = new Gson();

    // Map: appointmentId -> Set of Sessions
    private static final Map<String, Set<Session>> roomSessions = new ConcurrentHashMap<>();

    // Map: sessionId -> ParticipantInfo
    private static final Map<String, ParticipantInfo> sessionParticipants = new ConcurrentHashMap<>();

    public static class ParticipantInfo {
        private String sessionId;
        private String appointmentId;
        private String role; // "doctor" or "patient"
        private String name;

        public ParticipantInfo(String sessionId, String appointmentId, String role, String name) {
            this.sessionId = sessionId;
            this.appointmentId = appointmentId;
            this.role = role;
            this.name = name;
        }

        public String getSessionId() { return sessionId; }
        public String getAppointmentId() { return appointmentId; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("appointmentId") String appointmentId) {
        if (appointmentId == null || appointmentId.trim().isEmpty()) {
            try { session.close(); } catch (IOException ignored) {}
            return;
        }

        roomSessions.computeIfAbsent(appointmentId, k -> ConcurrentHashMap.newKeySet()).add(session);
        System.out.println("[WebRTC Signaling] Session connected: " + session.getId() + " in Room: " + appointmentId);
    }

    @OnClose
    public void onClose(Session session, @PathParam("appointmentId") String appointmentId) {
        cleanupSession(session, appointmentId);
    }

    @OnError
    public void onError(Session session, Throwable throwable, @PathParam("appointmentId") String appointmentId) {
        System.err.println("[WebRTC Signaling Error] " + throwable.getMessage() + " in Room: " + appointmentId);
        cleanupSession(session, appointmentId);
    }

    @OnMessage
    public void onMessage(String message, Session session, @PathParam("appointmentId") String appointmentId) {
        try {
            JsonObject json = JsonParser.parseString(message).getAsJsonObject();
            String type = json.has("type") ? json.get("type").getAsString() : "";

            if ("join".equalsIgnoreCase(type)) {
                String role = json.has("role") ? json.get("role").getAsString() : "guest";
                String name = json.has("name") ? json.get("name").getAsString() : "User";

                ParticipantInfo participant = new ParticipantInfo(session.getId(), appointmentId, role, name);
                sessionParticipants.put(session.getId(), participant);

                System.out.println("[WebRTC Signaling] " + role + " ('" + name + "') joined room " + appointmentId);

                // Notify other participants in this room that this peer joined
                Set<Session> peers = roomSessions.get(appointmentId);
                if (peers != null) {
                    for (Session peer : peers) {
                        if (peer.isOpen() && !peer.getId().equals(session.getId())) {
                            ParticipantInfo existingPeer = sessionParticipants.get(peer.getId());

                            // 1. Tell existing peer that new user joined
                            JsonObject peerJoinedMsg = new JsonObject();
                            peerJoinedMsg.addProperty("type", "peer_joined");
                            peerJoinedMsg.addProperty("role", role);
                            peerJoinedMsg.addProperty("name", name);
                            peer.getBasicRemote().sendText(peerJoinedMsg.toString());

                            // 2. Tell new participant that existing peer is already here
                            if (existingPeer != null) {
                                JsonObject alreadyPresentMsg = new JsonObject();
                                alreadyPresentMsg.addProperty("type", "peer_already_present");
                                alreadyPresentMsg.addProperty("role", existingPeer.getRole());
                                alreadyPresentMsg.addProperty("name", existingPeer.getName());
                                session.getBasicRemote().sendText(alreadyPresentMsg.toString());
                            }
                        }
                    }
                }
            } else {
                // Forward signaling message (offer, answer, candidate, consent, record_status, screen_share, chat)
                // to all OTHER participants in the room
                Set<Session> peers = roomSessions.get(appointmentId);
                if (peers != null) {
                    for (Session peer : peers) {
                        if (peer.isOpen() && !peer.getId().equals(session.getId())) {
                            peer.getBasicRemote().sendText(message);
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void cleanupSession(Session session, String appointmentId) {
        if (session == null) return;
        ParticipantInfo p = sessionParticipants.remove(session.getId());

        Set<Session> peers = roomSessions.get(appointmentId);
        if (peers != null) {
            peers.remove(session);
            if (peers.isEmpty()) {
                roomSessions.remove(appointmentId);
            } else if (p != null) {
                // Inform remaining peer that this user left
                JsonObject leaveMsg = new JsonObject();
                leaveMsg.addProperty("type", "peer_left");
                leaveMsg.addProperty("role", p.getRole());
                leaveMsg.addProperty("name", p.getName());

                for (Session peer : peers) {
                    if (peer.isOpen()) {
                        try {
                            peer.getBasicRemote().sendText(leaveMsg.toString());
                        } catch (IOException ignored) {}
                    }
                }
            }
        }
        System.out.println("[WebRTC Signaling] Session disconnected: " + session.getId() + " in Room: " + appointmentId);
    }

    /**
     * Check if a doctor is currently connected to the appointment room.
     */
    public static boolean isDoctorInRoom(String appointmentId) {
        Set<Session> sessions = roomSessions.get(appointmentId);
        if (sessions == null) return false;
        for (Session s : sessions) {
            if (s.isOpen()) {
                ParticipantInfo p = sessionParticipants.get(s.getId());
                if (p != null && "doctor".equalsIgnoreCase(p.getRole())) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check if a patient is currently connected to the appointment room.
     */
    public static boolean isPatientInRoom(String appointmentId) {
        Set<Session> sessions = roomSessions.get(appointmentId);
        if (sessions == null) return false;
        for (Session s : sessions) {
            if (s.isOpen()) {
                ParticipantInfo p = sessionParticipants.get(s.getId());
                if (p != null && "patient".equalsIgnoreCase(p.getRole())) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check if room has at least 1 participant.
     */
    public static boolean isRoomActive(String appointmentId) {
        Set<Session> sessions = roomSessions.get(appointmentId);
        return sessions != null && !sessions.isEmpty();
    }
}
