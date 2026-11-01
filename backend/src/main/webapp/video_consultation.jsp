<%@page import="com.hms.entity.Appointment"%>
<%@page import="com.hms.entity.Doctor"%>
<%@page import="com.hms.entity.User"%>
<%@page import="com.hms.entity.AIDiagnosis"%>
<%@page import="com.hms.entity.MedicalHistoryItem"%>
<%@page import="com.hms.entity.PatientDocument"%>
<%@page import="com.hms.dao.AppointmentDAO"%>
<%@page import="com.hms.dao.DoctorDAO"%>
<%@page import="com.hms.dao.HospitalDAO"%>
<%@page import="com.hms.dao.AIDiagnosisDAO"%>
<%@page import="com.hms.dao.MedicalHistoryDAO"%>
<%@page import="com.hms.dao.PatientDocumentDAO"%>
<%@page import="com.hms.entity.Hospital"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.google.gson.JsonParser"%>
<%@page import="com.google.gson.JsonArray"%>
<%@page import="com.google.gson.JsonObject"%>
<%@page import="com.google.gson.JsonElement"%>
<%@page import="java.util.List"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@page isELIgnored="false"%>

<%
    // Role check and Authentication
    String role = request.getParameter("role"); // "doctor" or "patient"
    String apptIdStr = request.getParameter("appointmentId");

    if (role == null || (!role.equals("doctor") && !role.equals("patient"))) {
        response.sendRedirect("index.jsp");
        return;
    }

    Doctor loginDoctor = null;
    User loginUser = null;
    String currentUserName = "";

    if ("doctor".equals(role)) {
        loginDoctor = (Doctor) session.getAttribute("doctorObj");
        if (loginDoctor == null) {
            response.sendRedirect("doctor_login.jsp");
            return;
        }
        currentUserName = "Dr. " + loginDoctor.getFullName();
    } else {
        loginUser = (User) session.getAttribute("userObj");
        if (loginUser == null) {
            response.sendRedirect("user_login.jsp");
            return;
        }
        currentUserName = loginUser.getFullName();
    }

    if (apptIdStr == null || apptIdStr.trim().isEmpty()) {
        response.sendRedirect("index.jsp");
        return;
    }

    int apptId = 0;
    try {
        apptId = Integer.parseInt(apptIdStr.trim());
    } catch (NumberFormatException e) {
        response.sendRedirect("index.jsp");
        return;
    }

    AppointmentDAO apptDAO = new AppointmentDAO(DBConnection.getConn());
    Appointment appointment = apptDAO.getAppointmentById(apptId);

    if (appointment == null) {
        response.sendRedirect("index.jsp");
        return;
    }

    DoctorDAO docDAO = new DoctorDAO(DBConnection.getConn());
    Doctor consultingDoctor = docDAO.getDoctorById(appointment.getDoctorId());

    HospitalDAO hospDAO = new HospitalDAO(DBConnection.getConn());
    Hospital hospital = null;
    if (consultingDoctor != null && consultingDoctor.getHospitalId() != null) {
        hospital = hospDAO.getHospitalById(consultingDoctor.getHospitalId());
    }

    String doctorName = consultingDoctor != null ? consultingDoctor.getFullName() : "Specialist";
    String doctorSpecialty = consultingDoctor != null ? consultingDoctor.getSpecialist() : "General Consultation";
    String hospitalName = hospital != null ? hospital.getName() : "Iryotek Central Healthcare";
    String patientName = appointment.getFullName();
%>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Iryotek Telehealth | Video Consultation #<%= apptId %></title>

<!-- Fonts & Core Stylesheets -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<style type="text/css">
:root {
    --tele-dark-bg: #0b131f;
    --tele-stage-bg: #070c14;
    --tele-card-bg: rgba(18, 28, 45, 0.85);
    --tele-glass-border: rgba(255, 255, 255, 0.12);
    --tele-cyan: #00c2cb;
    --tele-cyan-hover: #00a8b0;
    --tele-coral: #ff5e3a;
    --tele-green: #10b981;
    --tele-danger: #ef4444;
}

body {
    background-color: var(--tele-dark-bg) !important;
    color: #ffffff;
    font-family: 'Outfit', 'Rubik', sans-serif;
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
}

/* Consultation Stage Layout */
.telehealth-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    position: relative;
    overflow: hidden;
}

/* Header Bar */
.telehealth-header {
    background: rgba(11, 19, 31, 0.95);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--tele-glass-border);
    padding: 10px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 100;
}

.brand-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
}
.brand-icon-box {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--tele-cyan);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
}
.brand-name {
    font-weight: 800;
    font-size: 1.2rem;
    letter-spacing: 0.5px;
    color: #ffffff;
}
.brand-tag {
    font-size: 0.72rem;
    color: var(--tele-cyan);
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 600;
}

/* Call Stage */
.telehealth-stage {
    flex: 1;
    position: relative;
    background-color: var(--tele-stage-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

/* Remote Video Container */
.remote-video-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000000;
}

video.remote-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

/* Floating Local PIP Camera */
.local-pip-card {
    position: absolute;
    bottom: 96px;
    right: 28px;
    width: 250px;
    height: 160px;
    background: #111827;
    border-radius: 16px;
    border: 2px solid var(--tele-cyan);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6);
    overflow: hidden;
    z-index: 90;
    transition: all 0.3s ease;
}

@media (max-width: 768px) {
    .local-pip-card {
        width: 140px;
        height: 100px;
        bottom: 90px;
        right: 14px;
    }
}

video.local-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1); /* Mirror local webcam */
}

.local-pip-badge {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 6px;
}

/* Waiting Radar Animation */
.waiting-radar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(16, 28, 48, 0.95) 0%, rgba(7, 12, 20, 0.98) 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 50;
    text-align: center;
    padding: 20px;
}

.radar-circle-wrap {
    position: relative;
    width: 140px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
}

.radar-ripple {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid var(--tele-cyan);
    opacity: 0;
    animation: ripple 2.4s infinite cubic-bezier(0.2, 0.8, 0.2, 1);
}
.radar-ripple:nth-child(2) {
    animation-delay: 0.8s;
}
.radar-ripple:nth-child(3) {
    animation-delay: 1.6s;
}

@keyframes ripple {
    0% { transform: scale(0.6); opacity: 0.9; }
    100% { transform: scale(2.2); opacity: 0; }
}

.radar-avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--tele-cyan) 0%, #007788 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: white;
    box-shadow: 0 0 25px rgba(0, 194, 203, 0.4);
    z-index: 2;
}

/* Floating Control Dock */
.control-dock-container {
    position: absolute;
    bottom: 22px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
}

.glass-control-bar {
    background: rgba(18, 28, 45, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid var(--tele-glass-border);
    padding: 8px 18px;
    border-radius: 40px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    gap: 12px;
}

.call-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    transition: all 0.25s ease;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
}

.call-btn:hover {
    background: rgba(255, 255, 255, 0.22);
    transform: translateY(-2px);
}

.call-btn.btn-active-cyan {
    background: var(--tele-cyan) !important;
    color: #ffffff !important;
    box-shadow: 0 0 16px rgba(0, 194, 203, 0.4);
}

.call-btn.btn-active-danger {
    background: var(--tele-danger) !important;
    color: #ffffff !important;
    box-shadow: 0 0 16px rgba(239, 68, 68, 0.4);
}

.call-btn.btn-hangup {
    width: 54px;
    height: 54px;
    background: var(--tele-danger) !important;
    color: white !important;
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
}

.call-btn.btn-hangup:hover {
    background: #dc2626 !important;
    transform: translateY(-2px) scale(1.05);
}

/* Pulsing REC badge */
.animate-pulse {
    animation: pulseGlow 1.4s infinite ease-in-out;
}
@keyframes pulseGlow {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.96); }
}

/* In-Call Drawer Sidebar */
.telehealth-drawer {
    position: absolute;
    top: 60px;
    right: -420px;
    width: 390px;
    height: calc(100vh - 60px);
    background: rgba(14, 22, 36, 0.96);
    backdrop-filter: blur(25px);
    border-left: 1px solid var(--tele-glass-border);
    transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 95;
    display: flex;
    flex-direction: column;
}

.telehealth-drawer.open {
    right: 0;
}

.drawer-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--tele-glass-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

/* Chat bubble styling */
.chat-bubble-stream {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.chat-bubble {
    max-width: 82%;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 0.88rem;
    line-height: 1.4;
    word-break: break-word;
}
.chat-bubble.me {
    align-self: flex-end;
    background: var(--tele-cyan);
    color: #ffffff;
    border-bottom-right-radius: 3px;
}
.chat-bubble.peer {
    align-self: flex-start;
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    border-bottom-left-radius: 3px;
}
.chat-time {
    font-size: 0.68rem;
    opacity: 0.75;
    margin-top: 4px;
    display: block;
}

/* Screen sharing alert bar */
.screen-share-banner {
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 194, 203, 0.9);
    color: white;
    padding: 6px 18px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0, 194, 203, 0.4);
    z-index: 80;
    display: flex;
    align-items: center;
    gap: 10px;
}
</style>
</head>
<body>

<div class="telehealth-container">
    <!-- Top Header -->
    <header class="telehealth-header">
        <div class="d-flex align-items-center gap-3">
            <a href="<%= "doctor".equals(role) ? "doctor/patient.jsp" : "view_appointment.jsp" %>" class="brand-badge">
                <div class="brand-icon-box">
                    <i class="fa-solid fa-heart-pulse"></i>
                </div>
                <div>
                    <div class="brand-name">IRYOTEK <span class="brand-tag">Telehealth</span></div>
                </div>
            </a>
            <div class="vr bg-secondary opacity-50 mx-2 d-none d-md-block" style="height: 25px;"></div>
            <div class="d-none d-md-block text-white-50 fs-7">
                <span class="text-white fw-bold">Appt #<%= apptId %></span> &bull; 
                <span><%= doctorSpecialty %></span> &bull; 
                <span><%= hospitalName %></span>
            </div>
        </div>

        <div class="d-flex align-items-center gap-3">
            <!-- Recording Indicator -->
            <span id="recordingBadge" class="badge bg-danger text-white rounded-pill px-3 py-2 d-none animate-pulse">
                <i class="fa-solid fa-record-vinyl me-1"></i> REC <span id="recordingTimer">00:00</span>
            </span>

            <!-- Stopwatch Call Duration -->
            <div class="bg-dark px-3 py-1 rounded-pill border border-secondary border-opacity-25 fs-7 font-monospace">
                <i class="fa-regular fa-clock text-info me-1"></i> <span id="callDuration">00:00:00</span>
            </div>

            <!-- Connection Status -->
            <span id="connStatusBadge" class="badge bg-warning text-dark rounded-pill px-3 py-2 fs-8">
                <i class="fa-solid fa-spinner fa-spin me-1"></i> Initializing
            </span>
        </div>
    </header>

    <!-- Main Consultation Video Stage -->
    <main class="telehealth-stage">
        <!-- Screen Sharing Banner -->
        <div id="screenShareBanner" class="screen-share-banner d-none">
            <i class="fa-solid fa-display"></i>
            <span>You are currently sharing your screen</span>
            <button class="btn btn-sm btn-dark text-white rounded-pill px-2 py-0 fs-8" onclick="stopScreenSharing()">Stop</button>
        </div>

        <!-- Remote Video -->
        <div class="remote-video-container">
            <video id="remoteVideo" autoplay playsinline></video>

            <!-- Waiting Room Overlay -->
            <div id="waitingOverlay" class="waiting-radar-overlay">
                <div class="radar-circle-wrap">
                    <div class="radar-ripple"></div>
                    <div class="radar-ripple"></div>
                    <div class="radar-ripple"></div>
                    <div class="radar-avatar">
                        <i class="<%= "doctor".equals(role) ? "fa-solid fa-user-injured" : "fa-solid fa-user-doctor" %>"></i>
                    </div>
                </div>
                <h4 class="fw-bold mb-2">
                    Waiting for <%= "doctor".equals(role) ? patientName : "Dr. " + doctorName %>
                </h4>
                <p class="text-white-50 fs-6 max-w-450 mb-4">
                    The encrypted P2P medical consultation room is ready. As soon as the other participant connects, the video call will start automatically.
                </p>
                <div class="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-dark border border-secondary border-opacity-50 fs-7">
                    <i class="fa-solid fa-shield-halved text-success"></i> End-to-End Encrypted Session &bull; Token #<%= appointment.getTokenNo() %>
                </div>
            </div>
        </div>

        <!-- Local Floating Picture-in-Picture Video -->
        <div id="localPipCard" class="local-pip-card">
            <video id="localVideo" autoplay playsinline muted class="local-video"></video>
            <div class="local-pip-badge">
                <i class="fa-solid fa-circle-user text-cyan me-1"></i> You (<%= "doctor".equals(role) ? "Doctor" : "Patient" %>)
            </div>
        </div>

        <!-- Glassmorphism Call Controls -->
        <div class="control-dock-container">
            <div class="glass-control-bar">
                <!-- 1. Mic Toggle -->
                <button id="btnMic" class="call-btn btn-active-cyan" onclick="toggleAudio()" title="Mute/Unmute Mic">
                    <i class="fa-solid fa-microphone"></i>
                </button>

                <!-- 2. Camera Toggle -->
                <button id="btnCamera" class="call-btn btn-active-cyan" onclick="toggleVideo()" title="Camera On/Off">
                    <i class="fa-solid fa-video"></i>
                </button>

                <!-- 3. Screen Share -->
                <button id="btnScreenShare" class="call-btn" onclick="toggleScreenShare()" title="Share Screen">
                    <i class="fa-solid fa-display"></i>
                </button>

                <!-- 4. Call Recording (With Mutual Consent) -->
                <button id="btnRecord" class="call-btn" onclick="handleRecordClick()" title="Record Consultation with Consent">
                    <i class="fa-solid fa-circle-dot text-danger"></i>
                </button>

                <!-- 5. Chat Toggle -->
                <button id="btnChat" class="call-btn" onclick="toggleDrawer('chat')" title="Open Chat">
                    <i class="fa-solid fa-comment-medical"></i>
                </button>

                <!-- 6. Patient / Clinical Info Toggle -->
                <button id="btnInfo" class="call-btn" onclick="toggleDrawer('info')" title="View Patient Details">
                    <i class="fa-solid fa-notes-medical"></i>
                </button>

                <!-- 7. Hangup Button -->
                <button class="call-btn btn-hangup" onclick="confirmEndCall()" title="End Consultation">
                    <i class="fa-solid fa-phone-slash"></i>
                </button>
            </div>
        </div>

        <!-- Side Drawer (Chat / Info) -->
        <aside id="teleDrawer" class="telehealth-drawer">
            <div class="drawer-header">
                <ul class="nav nav-pills gap-2" id="drawerTabs" role="tablist">
                    <li class="nav-item">
                        <button class="nav-link active rounded-pill px-3 py-1 fs-7" id="tab-chat" onclick="switchDrawerTab('chat')">
                            <i class="fa-solid fa-comment-dots me-1"></i> Live Chat
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link rounded-pill px-3 py-1 fs-7" id="tab-info" onclick="switchDrawerTab('info')">
                            <i class="fa-solid fa-clipboard-user me-1"></i> Patient Info
                        </button>
                    </li>
                </ul>
                <button class="btn btn-sm text-white-50 hover-white p-1" onclick="closeDrawer()">
                    <i class="fa-solid fa-xmark fs-5"></i>
                </button>
            </div>

            <!-- Tab 1: Live Chat -->
            <div id="drawerContentChat" class="drawer-body d-flex flex-column">
                <div id="chatMessageStream" class="chat-bubble-stream flex-grow-1 overflow-auto mb-3">
                    <div class="text-center text-white-50 fs-8 my-2">
                        <i class="fa-solid fa-lock text-success me-1"></i> Messages are encrypted & ephemeral.
                    </div>
                </div>
                <div class="d-flex gap-2">
                    <input type="text" id="chatInput" class="form-control bg-dark border-secondary text-white rounded-pill px-3 fs-7" placeholder="Type a message..." onkeydown="if(event.key==='Enter') sendChatMessage()">
                    <button class="btn btn-primary rounded-circle" style="width: 38px; height: 38px;" onclick="sendChatMessage()">
                        <i class="fa-solid fa-paper-plane fs-7"></i>
                    </button>
                </div>
            </div>

            <!-- Tab 2: Patient & Medical Info -->
            <div id="drawerContentInfo" class="drawer-body d-none">
                <h6 class="fw-bold text-cyan mb-3">Appointment Overview</h6>
                <div class="bg-dark bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-25 mb-3 fs-7">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-white-50">Patient Name:</span>
                        <span class="fw-bold"><%= patientName %></span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-white-50">Age / Gender:</span>
                        <span><%= appointment.getAge() %> yrs &bull; <%= appointment.getGender() %></span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-white-50">Token No:</span>
                        <span class="badge bg-danger rounded-pill px-2">#<%= appointment.getTokenNo() %></span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-white-50">Time Slot:</span>
                        <span class="text-info fw-bold"><%= appointment.getAppointmentTime() %></span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span class="text-white-50">Phone:</span>
                        <span><%= appointment.getPhone() %></span>
                    </div>
                </div>

                <h6 class="fw-bold text-cyan mb-2">Reported Symptoms / Disease</h6>
                <div class="bg-dark bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-25 mb-3 fs-7">
                    <p class="mb-0"><%= appointment.getDiseases() %></p>
                </div>

                <h6 class="fw-bold text-cyan mb-2">Patient Address</h6>
                <div class="bg-dark bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-25 mb-3 fs-7">
                    <p class="mb-0"><%= appointment.getAddress() %></p>
                </div>

                <%
                    AIDiagnosisDAO vAiDAO = new AIDiagnosisDAO(DBConnection.getConn());
                    AIDiagnosis vAiDiag = vAiDAO.getDiagnosisByAppointmentId(apptId);
                    if (vAiDiag == null) {
                        vAiDiag = vAiDAO.getLatestDiagnosisByUserId(appointment.getUserId());
                    }

                    MedicalHistoryDAO vHistDAO = new MedicalHistoryDAO(DBConnection.getConn());
                    List<MedicalHistoryItem> vChronic = vHistDAO.getHistoryByUserIdAndCategory(appointment.getUserId(), "CHRONIC_CONDITION");
                    List<MedicalHistoryItem> vAllergy = vHistDAO.getHistoryByUserIdAndCategory(appointment.getUserId(), "ALLERGY");
                    List<MedicalHistoryItem> vSurgery = vHistDAO.getHistoryByUserIdAndCategory(appointment.getUserId(), "SURGERY");

                    PatientDocumentDAO vDocDAO = new PatientDocumentDAO(DBConnection.getConn());
                    List<PatientDocument> vDocs = vDocDAO.getDocumentsByUserId(appointment.getUserId());
                %>

                <!-- Sakura AI Differential Diagnoses Review Box -->
                <div class="bg-dark bg-opacity-75 p-3 rounded-3 border border-cyan border-opacity-25 mb-3 fs-7">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-bold text-cyan"><i class="fa-solid fa-brain me-1"></i> Iryo AI Differential Triage</span>
                        <span class="badge bg-info text-dark rounded-pill px-2 fs-8">AI Assisted</span>
                    </div>

                    <!-- Informational Disclaimer Banner -->
                    <div class="p-2 mb-2 rounded-2 border border-warning border-opacity-50 text-warning" style="font-size: 0.72rem; background: rgba(234, 179, 8, 0.1);">
                        <i class="fa-solid fa-triangle-exclamation me-1"></i> <strong>Informational Notice:</strong> For preparatory clinical triage purposes only. Not a confirmed diagnosis.
                    </div>

                    <% if (vAiDiag != null) { %>
                        <div class="mb-2">
                            <span class="badge rounded-pill <%= "EMERGENCY".equalsIgnoreCase(vAiDiag.getUrgencyLevel()) ? "bg-danger" : ("URGENT".equalsIgnoreCase(vAiDiag.getUrgencyLevel()) ? "bg-warning text-dark" : "bg-success") %> px-2 py-1 fs-8">
                                <%= vAiDiag.getUrgencyLevel() %>
                            </span>
                        </div>
                        <%
                            try {
                                JsonElement elem = JsonParser.parseString(vAiDiag.getDiagnosesJson());
                                if (elem.isJsonArray()) {
                                    JsonArray dArr = elem.getAsJsonArray();
                        %>
                            <div class="d-flex flex-column gap-2 mb-1">
                                <% for (int k = 0; k < dArr.size(); k++) {
                                    JsonObject dObj = dArr.get(k).getAsJsonObject();
                                    String condName = dObj.has("condition") ? dObj.get("condition").getAsString() : "Condition";
                                    int confScore = dObj.has("confidence") ? dObj.get("confidence").getAsInt() : 50;
                                    String progCls = confScore >= 70 ? "bg-success" : (confScore >= 45 ? "bg-warning" : "bg-secondary");
                                %>
                                    <div class="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="fw-semibold text-white fs-8"><%= condName %></span>
                                            <span class="badge bg-secondary rounded-pill fs-8"><%= confScore %>%</span>
                                        </div>
                                        <div class="progress" style="height: 4px;">
                                            <div class="progress-bar <%= progCls %>" style="width: <%= confScore %>%;"></div>
                                        </div>
                                    </div>
                                <% } %>
                            </div>
                        <%
                                }
                            } catch (Exception ignored) {}
                        %>
                    <% } else { %>
                        <p class="text-white-50 fs-8 mb-0">No active AI differential assessment record found.</p>
                    <% } %>
                </div>

                <!-- Patient Medical History (Chronic, Allergies, Surgeries) -->
                <div class="bg-dark bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-25 mb-3 fs-7">
                    <h6 class="fw-bold text-cyan mb-2" style="font-size: 0.85rem;"><i class="fa-solid fa-notes-medical me-1"></i> Medical History Ledger</h6>
                    
                    <div class="mb-2">
                        <strong class="text-danger fs-8 d-block mb-1">Chronic Conditions:</strong>
                        <% if (!vChronic.isEmpty()) { %>
                            <% for (MedicalHistoryItem c : vChronic) { %>
                                <span class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 me-1 mb-1 fs-8"><%= c.getTitle() %> (<%= c.getSeverity() %>)</span>
                            <% } %>
                        <% } else { %><span class="text-white-50 fs-8">None logged</span><% } %>
                    </div>

                    <div class="mb-2">
                        <strong class="text-warning fs-8 d-block mb-1">Allergies:</strong>
                        <% if (!vAllergy.isEmpty()) { %>
                            <% for (MedicalHistoryItem a : vAllergy) { %>
                                <span class="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 me-1 mb-1 fs-8"><%= a.getTitle() %></span>
                            <% } %>
                        <% } else { %><span class="text-white-50 fs-8">No known allergies</span><% } %>
                    </div>

                    <div>
                        <strong class="text-info fs-8 d-block mb-1">Uploaded Records & Prescriptions:</strong>
                        <% if (!vDocs.isEmpty()) { %>
                            <% for (PatientDocument d : vDocs) { %>
                                <a href="patientDocument?action=view&id=<%= d.getId() %>" target="_blank" class="badge bg-light bg-opacity-10 text-white text-decoration-none border border-secondary border-opacity-50 me-1 mb-1 fs-8">
                                    <i class="fa-regular fa-file me-1"></i> <%= d.getTitle() %>
                                </a>
                            <% } %>
                        <% } else { %><span class="text-white-50 fs-8">No files uploaded</span><% } %>
                    </div>
                </div>

                <% if ("doctor".equals(role)) { %>
                    <div class="mt-2">
                        <a href="doctor/comment.jsp?id=<%= apptId %>" target="_blank" class="btn btn-outline-success w-100 rounded-pill py-2 fs-7 fw-bold">
                            <i class="fa-solid fa-prescription-bottle-medical me-2"></i> Open Prescription Pad
                        </a>
                        <small class="text-white-50 d-block text-center mt-2 fs-8">Opens in a new tab without interrupting call</small>
                    </div>
                <% } %>
            </div>
        </aside>
    </main>
</div>

<!-- Modal 1: Recording Consent Request (Shown on Recipient's Screen) -->
<div class="modal fade" id="consentRequestModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold text-warning">
                    <i class="fa-solid fa-triangle-exclamation me-2"></i> Consultation Recording Consent
                </h5>
            </div>
            <div class="modal-body py-4">
                <div class="text-center mb-3">
                    <i class="fa-solid fa-record-vinyl text-danger fa-3x animate-pulse"></i>
                </div>
                <p class="fs-6 mb-2 text-center" id="consentModalDesc">
                    The doctor has requested permission to record this telehealth consultation for official medical records.
                </p>
                <div class="bg-black bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-25 fs-7 text-white-50">
                    <i class="fa-solid fa-shield-halved text-cyan me-1"></i> Both video and audio streams will be captured. In compliance with patient privacy laws, recording can only proceed with your express permission.
                </div>
            </div>
            <div class="modal-footer border-secondary justify-content-center gap-3">
                <button type="button" class="btn btn-secondary rounded-pill px-4" onclick="respondConsent(false)">
                    <i class="fa-solid fa-xmark me-1"></i> Decline
                </button>
                <button type="button" class="btn btn-success rounded-pill px-4" onclick="respondConsent(true)">
                    <i class="fa-solid fa-check me-1"></i> I Consent & Agree
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Modal 2: Download Recorded Consultation -->
<div class="modal fade" id="recordingSavedModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content bg-dark text-white border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold text-success">
                    <i class="fa-solid fa-circle-check me-2"></i> Consultation Recording Ready
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body py-3">
                <p class="fs-7 text-white-50 mb-3">
                    Your telehealth consultation was successfully recorded. You can preview it below or download the video file to your computer.
                </p>
                <div class="rounded-3 overflow-hidden bg-black mb-3 text-center">
                    <video id="playbackVideo" controls class="w-100" style="max-height: 380px;"></video>
                </div>
            </div>
            <div class="modal-footer border-secondary justify-content-between">
                <span class="fs-8 text-white-50">Format: WebM Video (Audio & Screen)</span>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Close</button>
                    <a id="btnDownloadFile" class="btn btn-primary rounded-pill px-4 fw-bold">
                        <i class="fa-solid fa-download me-1"></i> Download Video File
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Bootstrap 5 JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- Audio Notification Chimes using Web Audio API Synthesizer (Zero asset dependency) -->
<script type="text/javascript">
const SoundFX = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playJoinChime() {
        try {
            this.init();
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
            osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.6);
        } catch (e) {}
    },
    playConsentChime() {
        try {
            this.init();
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(880, now + 0.2);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.5);
        } catch (e) {}
    }
};
</script>

<!-- WebRTC, MediaRecorder, AudioContext & Signaling Logic -->
<script type="text/javascript">
    const currentRole = "<%= role %>";
    const currentUserName = "<%= currentUserName %>";
    const appointmentId = "<%= apptId %>";

    let localStream = null;
    let remoteStream = null;
    let screenStream = null;
    let pc = null;
    let ws = null;
    let isInitiator = false;

    // Recording State
    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;
    let recordingInterval = null;
    let recordingSeconds = 0;

    // Stopwatch Call Duration
    let callSeconds = 0;
    let callTimerInterval = null;

    // WebRTC Peer Configuration (Standard Public Google STUN Servers)
    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
        ]
    };

    // DOM Elements
    const localVideo = document.getElementById("localVideo");
    const remoteVideo = document.getElementById("remoteVideo");
    const waitingOverlay = document.getElementById("waitingOverlay");
    const connStatusBadge = document.getElementById("connStatusBadge");
    const callDuration = document.getElementById("callDuration");
    const recordingBadge = document.getElementById("recordingBadge");
    const recordingTimer = document.getElementById("recordingTimer");
    const screenShareBanner = document.getElementById("screenShareBanner");

    // Initialize Telehealth Consultation
    window.addEventListener("DOMContentLoaded", async () => {
        startCallTimer();
        await setupLocalMedia();
        initWebSocketSignaling();
    });

    // 1. Get Local Camera & Microphone Stream
    async function setupLocalMedia() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: { echoCancellation: true, noiseSuppression: true }
            });
            localVideo.srcObject = localStream;
        } catch (err) {
            console.error("Camera/Mic access error:", err);
            alert("Could not access camera/microphone: " + err.message + "\nPlease allow camera permissions.");
        }
    }

    // 2. Initialize WebSocket Signaling Server
    function initWebSocketSignaling() {
        const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
        const wsUrl = protocol + window.location.host + "<%= request.getContextPath() %>/videoConsultationServer/" + appointmentId;

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("[Signaling] Connected to room " + appointmentId);
            connStatusBadge.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Waiting for Peer';
            connStatusBadge.className = 'badge bg-warning text-dark rounded-pill px-3 py-2 fs-8';

            // Send Join Message
            wsSend({
                type: "join",
                role: currentRole,
                name: currentUserName
            });
        };

        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            console.log("[Signaling] Message received:", data.type);

            switch (data.type) {
                case "peer_already_present":
                    // Peer is already in room, we can initiate call offer
                    console.log("[Signaling] Peer already in room:", data.role);
                    SoundFX.playJoinChime();
                    isInitiator = true;
                    await createPeerConnection();
                    await sendOffer();
                    break;

                case "peer_joined":
                    console.log("[Signaling] New peer joined:", data.role);
                    SoundFX.playJoinChime();
                    if (!isInitiator) {
                        isInitiator = true;
                        await createPeerConnection();
                        await sendOffer();
                    }
                    break;

                case "offer":
                    console.log("[Signaling] Received WebRTC offer");
                    if (!pc) await createPeerConnection();
                    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    wsSend({ type: "answer", sdp: answer });
                    break;

                case "answer":
                    console.log("[Signaling] Received WebRTC answer");
                    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    break;

                case "ice-candidate":
                    if (data.candidate && pc) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                        } catch (e) {
                            console.error("Error adding ice candidate:", e);
                        }
                    }
                    break;

                case "request_record_consent":
                    // Another peer wants to record, show formal consent dialog
                    SoundFX.playConsentChime();
                    document.getElementById("consentModalDesc").innerHTML =
                        '<strong>' + escapeHtml(data.requesterName) + '</strong> (' + data.requesterRole + ') is requesting permission to record this medical consultation for health documentation.';
                    const consentModal = new bootstrap.Modal(document.getElementById("consentRequestModal"));
                    consentModal.show();
                    break;

                case "record_consent_response":
                    if (data.consentGranted) {
                        alert("Consent granted by " + data.responderName + ". Starting call recording.");
                        startActualRecording();
                    } else {
                        alert(data.responderName + " declined recording consent. Recording will not start.");
                    }
                    break;

                case "recording_status":
                    if (data.isRecording) {
                        recordingBadge.classList.remove("d-none");
                        startRecordingTimer();
                    } else {
                        recordingBadge.classList.add("d-none");
                        stopRecordingTimer();
                    }
                    break;

                case "screen_share_status":
                    if (data.isSharing) {
                        showToast(data.name + " started screen sharing.");
                    } else {
                        showToast(data.name + " stopped screen sharing.");
                    }
                    break;

                case "chat":
                    appendChatMessage(data.senderName, data.text, data.senderRole === currentRole);
                    break;

                case "peer_left":
                    showToast(data.name + " has left the consultation.");
                    waitingOverlay.classList.remove("d-none");
                    remoteVideo.srcObject = null;
                    connStatusBadge.innerHTML = '<i class="fa-solid fa-circle-xmark me-1"></i> Peer Left';
                    connStatusBadge.className = 'badge bg-secondary rounded-pill px-3 py-2 fs-8';
                    break;
            }
        };

        ws.onclose = () => {
            console.log("[Signaling] Disconnected from room");
            connStatusBadge.innerHTML = '<i class="fa-solid fa-circle-xmark me-1"></i> Disconnected';
            connStatusBadge.className = 'badge bg-danger rounded-pill px-3 py-2 fs-8';
        };
    }

    function wsSend(msgObj) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(msgObj));
        }
    }

    // 3. Create WebRTC Peer Connection
    async function createPeerConnection() {
        if (pc) return;
        pc = new RTCPeerConnection(rtcConfig);

        // Add Local Audio and Video Tracks
        if (localStream) {
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        }

        // Handle Remote Tracks
        pc.ontrack = (event) => {
            console.log("[WebRTC] Received remote track:", event.track.kind);
            if (!remoteStream) {
                remoteStream = event.streams[0] || new MediaStream();
                remoteVideo.srcObject = remoteStream;
            }
            waitingOverlay.classList.add("d-none");
            connStatusBadge.innerHTML = '<i class="fa-solid fa-circle me-1 text-success"></i> Connected (P2P)';
            connStatusBadge.className = 'badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 rounded-pill px-3 py-2 fs-8';
        };

        // ICE Candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                wsSend({
                    type: "ice-candidate",
                    candidate: event.candidate
                });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log("[WebRTC] Connection state:", pc.connectionState);
            if (pc.connectionState === "connected") {
                waitingOverlay.classList.add("d-none");
            } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
                waitingOverlay.classList.remove("d-none");
            }
        };
    }

    // 4. Send SDP Offer
    async function sendOffer() {
        if (!pc) return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        wsSend({ type: "offer", sdp: offer });
    }

    // 5. In-Call Media Controls (Mic, Video, Screen)
    function toggleAudio() {
        if (!localStream) return;
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            const btn = document.getElementById("btnMic");
            if (audioTrack.enabled) {
                btn.className = "call-btn btn-active-cyan";
                btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            } else {
                btn.className = "call-btn btn-active-danger";
                btn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
            }
        }
    }

    function toggleVideo() {
        if (!localStream) return;
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            const btn = document.getElementById("btnCamera");
            if (videoTrack.enabled) {
                btn.className = "call-btn btn-active-cyan";
                btn.innerHTML = '<i class="fa-solid fa-video"></i>';
            } else {
                btn.className = "call-btn btn-active-danger";
                btn.innerHTML = '<i class="fa-solid fa-video-slash"></i>';
            }
        }
    }

    // 6. Screen Sharing
    async function toggleScreenShare() {
        if (screenStream) {
            stopScreenSharing();
            return;
        }

        try {
            screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: true
            });

            const screenTrack = screenStream.getVideoTracks()[0];
            const sender = pc ? pc.getSenders().find(s => s.track && s.track.kind === 'video') : null;
            if (sender) {
                await sender.replaceTrack(screenTrack);
            }

            localVideo.srcObject = screenStream;
            screenShareBanner.classList.remove("d-none");
            document.getElementById("btnScreenShare").className = "call-btn btn-active-cyan";

            wsSend({ type: "screen_share_status", isSharing: true, name: currentUserName });

            // Listen for native "Stop Sharing" button in browser bar
            screenTrack.onended = () => {
                stopScreenSharing();
            };
        } catch (err) {
            console.error("Screen sharing canceled or failed:", err);
        }
    }

    async function stopScreenSharing() {
        if (!screenStream) return;
        screenStream.getTracks().forEach(t => t.stop());
        screenStream = null;

        const originalVideoTrack = localStream ? localStream.getVideoTracks()[0] : null;
        const sender = pc ? pc.getSenders().find(s => s.track && s.track.kind === 'video') : null;
        if (sender && originalVideoTrack) {
            await sender.replaceTrack(originalVideoTrack);
        }

        localVideo.srcObject = localStream;
        screenShareBanner.classList.add("d-none");
        document.getElementById("btnScreenShare").className = "call-btn";

        wsSend({ type: "screen_share_status", isSharing: false, name: currentUserName });
    }

    // 7. Call Recording with Mutual Consent
    function handleRecordClick() {
        if (isRecording) {
            stopActualRecording();
            return;
        }

        // Ask initiator to send consent request
        const confirmConsentReq = confirm(
            "Recording this consultation requires the explicit consent of the other participant.\n\nSend a recording consent request now?"
        );
        if (confirmConsentReq) {
            wsSend({
                type: "request_record_consent",
                requesterRole: currentRole,
                requesterName: currentUserName
            });
            alert("Recording consent request sent to the other participant. Please wait for their response.");
        }
    }

    function respondConsent(consentGranted) {
        const modalEl = document.getElementById("consentRequestModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        wsSend({
            type: "record_consent_response",
            responderRole: currentRole,
            responderName: currentUserName,
            consentGranted: consentGranted
        });

        if (consentGranted) {
            showToast("You granted consent to record this consultation.");
        } else {
            showToast("You declined recording consent.");
        }
    }

    // Start client-side recording combining audio tracks + video tracks
    function startActualRecording() {
        try {
            recordedChunks = [];

            // Mix Audio: combine local microphone + remote audio into a single AudioContext stream
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const audioDest = audioCtx.createMediaStreamDestination();

            if (localStream && localStream.getAudioTracks().length > 0) {
                const localSource = audioCtx.createMediaStreamSource(localStream);
                localSource.connect(audioDest);
            }
            if (remoteStream && remoteStream.getAudioTracks().length > 0) {
                const remoteSource = audioCtx.createMediaStreamSource(remoteStream);
                remoteSource.connect(audioDest);
            }

            // Pick video track (remote video track or local screen)
            let videoTrack = null;
            if (remoteStream && remoteStream.getVideoTracks().length > 0) {
                videoTrack = remoteStream.getVideoTracks()[0];
            } else if (localStream && localStream.getVideoTracks().length > 0) {
                videoTrack = localStream.getVideoTracks()[0];
            }

            const streamToRecord = new MediaStream();
            if (videoTrack) streamToRecord.addTrack(videoTrack);
            audioDest.stream.getAudioTracks().forEach(t => streamToRecord.addTrack(t));

            let options = { mimeType: 'video/webm;codecs=vp9,opus' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm' };
            }

            mediaRecorder = new MediaRecorder(streamToRecord, options);

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const blobUrl = URL.createObjectURL(blob);

                // Show preview and download modal
                const playbackVideo = document.getElementById("playbackVideo");
                playbackVideo.src = blobUrl;

                const downloadBtn = document.getElementById("btnDownloadFile");
                downloadBtn.href = blobUrl;
                downloadBtn.download = "Iryotek_Consultation_Appt_" + appointmentId + "_" + new Date().toISOString().slice(0,10) + ".webm";

                const saveModal = new bootstrap.Modal(document.getElementById("recordingSavedModal"));
                saveModal.show();
            };

            mediaRecorder.start(1000); // 1-second chunks
            isRecording = true;

            document.getElementById("btnRecord").className = "call-btn btn-active-danger";
            recordingBadge.classList.remove("d-none");
            startRecordingTimer();

            wsSend({ type: "recording_status", isRecording: true });
        } catch (e) {
            console.error("Recording initialization failed:", e);
            alert("Could not start recording: " + e.message);
        }
    }

    function stopActualRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            document.getElementById("btnRecord").className = "call-btn";
            recordingBadge.classList.add("d-none");
            stopRecordingTimer();

            wsSend({ type: "recording_status", isRecording: false });
        }
    }

    function startRecordingTimer() {
        recordingSeconds = 0;
        clearInterval(recordingInterval);
        recordingInterval = setInterval(() => {
            recordingSeconds++;
            const mins = String(Math.floor(recordingSeconds / 60)).padStart(2, '0');
            const secs = String(recordingSeconds % 60).padStart(2, '0');
            recordingTimer.textContent = mins + ":" + secs;
        }, 1000);
    }

    function stopRecordingTimer() {
        clearInterval(recordingInterval);
        recordingSeconds = 0;
    }

    // 8. Overall Call Stopwatch
    function startCallTimer() {
        callSeconds = 0;
        clearInterval(callTimerInterval);
        callTimerInterval = setInterval(() => {
            callSeconds++;
            const hrs = String(Math.floor(callSeconds / 3600)).padStart(2, '0');
            const mins = String(Math.floor((callSeconds % 3600) / 60)).padStart(2, '0');
            const secs = String(callSeconds % 60).padStart(2, '0');
            callDuration.textContent = hrs + ":" + mins + ":" + secs;
        }, 1000);
    }

    // 9. Side Drawer Controls (Chat & Medical Details)
    function toggleDrawer(tabName) {
        const drawer = document.getElementById("teleDrawer");
        if (drawer.classList.contains("open")) {
            closeDrawer();
        } else {
            drawer.classList.add("open");
            switchDrawerTab(tabName);
        }
    }

    function closeDrawer() {
        document.getElementById("teleDrawer").classList.remove("open");
    }

    function switchDrawerTab(tabName) {
        const tabChat = document.getElementById("tab-chat");
        const tabInfo = document.getElementById("tab-info");
        const contentChat = document.getElementById("drawerContentChat");
        const contentInfo = document.getElementById("drawerContentInfo");

        if (tabName === 'chat') {
            tabChat.classList.add("active");
            tabInfo.classList.remove("active");
            contentChat.classList.remove("d-none");
            contentInfo.classList.add("d-none");
        } else {
            tabInfo.classList.add("active");
            tabChat.classList.remove("active");
            contentInfo.classList.remove("d-none");
            contentChat.classList.add("d-none");
        }
    }

    function sendChatMessage() {
        const input = document.getElementById("chatInput");
        const text = input.value.trim();
        if (!text) return;

        wsSend({
            type: "chat",
            senderName: currentUserName,
            senderRole: currentRole,
            text: text
        });

        appendChatMessage(currentUserName, text, true);
        input.value = "";
    }

    function appendChatMessage(name, text, isMe) {
        const stream = document.getElementById("chatMessageStream");
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const bubble = document.createElement("div");
        bubble.className = "chat-bubble " + (isMe ? "me" : "peer");
        bubble.innerHTML = '<strong>' + escapeHtml(name) + '</strong><br>' + escapeHtml(text) + '<span class="chat-time">' + now + '</span>';

        stream.appendChild(bubble);
        stream.scrollTop = stream.scrollHeight;
    }

    // 10. End Call Confirmation
    function confirmEndCall() {
        const sure = confirm("Are you sure you want to end this video consultation?");
        if (sure) {
            if (isRecording) {
                stopActualRecording();
            }
            if (localStream) {
                localStream.getTracks().forEach(t => t.stop());
            }
            if (screenStream) {
                screenStream.getTracks().forEach(t => t.stop());
            }
            if (pc) {
                pc.close();
            }
            if (ws) {
                wsSend({ type: "leave", role: currentRole, name: currentUserName });
                ws.close();
            }

            if (currentRole === "doctor") {
                window.location.href = "doctor/comment.jsp?id=" + appointmentId;
            } else {
                window.location.href = "view_appointment.jsp";
            }
        }
    }

    // Utility: Toast alert
    function showToast(msg) {
        console.log("[Toast]", msg);
    }

    function escapeHtml(text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
</script>
</body>
</html>
