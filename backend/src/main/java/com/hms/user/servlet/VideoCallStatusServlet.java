package com.hms.user.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonObject;
import com.hms.websocket.VideoConsultationWebSocketServer;

@WebServlet("/videoCallStatus")
public class VideoCallStatusServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        resp.setHeader("Pragma", "no-cache");
        resp.setDateHeader("Expires", 0);

        String appointmentId = req.getParameter("appointmentId");
        JsonObject json = new JsonObject();

        if (appointmentId != null && !appointmentId.trim().isEmpty()) {
            boolean docOnline = VideoConsultationWebSocketServer.isDoctorInRoom(appointmentId.trim());
            boolean patientOnline = VideoConsultationWebSocketServer.isPatientInRoom(appointmentId.trim());
            boolean active = VideoConsultationWebSocketServer.isRoomActive(appointmentId.trim());

            json.addProperty("status", "success");
            json.addProperty("appointmentId", appointmentId);
            json.addProperty("doctorOnline", docOnline);
            json.addProperty("patientOnline", patientOnline);
            json.addProperty("active", active);
        } else {
            json.addProperty("status", "error");
            json.addProperty("message", "Missing appointmentId parameter");
        }

        PrintWriter out = resp.getWriter();
        out.print(json.toString());
        out.flush();
    }
}
