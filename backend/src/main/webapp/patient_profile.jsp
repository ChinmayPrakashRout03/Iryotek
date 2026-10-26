<%@page import="com.hms.entity.User"%>
<%@page import="com.hms.entity.PatientProfile"%>
<%@page import="com.hms.entity.MedicalHistoryItem"%>
<%@page import="com.hms.entity.PatientDocument"%>
<%@page import="com.hms.entity.AIDiagnosis"%>
<%@page import="com.hms.entity.PatientInsurance"%>
<%@page import="com.hms.entity.InsuranceClaim"%>
<%@page import="com.hms.entity.PatientVital"%>
<%@page import="com.hms.dao.PatientProfileDAO"%>
<%@page import="com.hms.dao.MedicalHistoryDAO"%>
<%@page import="com.hms.dao.PatientDocumentDAO"%>
<%@page import="com.hms.dao.AIDiagnosisDAO"%>
<%@page import="com.hms.dao.InsuranceDAO"%>
<%@page import="com.hms.dao.PatientVitalsDAO"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="java.util.List"%>
<%@page import="java.text.NumberFormat"%>
<%@page import="java.util.Locale"%>
<%@page import="com.google.gson.JsonParser"%>
<%@page import="com.google.gson.JsonArray"%>
<%@page import="com.google.gson.JsonObject"%>
<%@page import="com.google.gson.JsonElement"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>

<c:if test="${empty userObj}">
	<c:redirect url="user_login.jsp" />
</c:if>

<%
	User user = (User) session.getAttribute("userObj");
	PatientProfileDAO profileDAO = new PatientProfileDAO(DBConnection.getConn());
	MedicalHistoryDAO historyDAO = new MedicalHistoryDAO(DBConnection.getConn());
	PatientDocumentDAO docDAO = new PatientDocumentDAO(DBConnection.getConn());
	AIDiagnosisDAO aiDAO = new AIDiagnosisDAO(DBConnection.getConn());
	InsuranceDAO insuranceDAO = new InsuranceDAO(DBConnection.getConn());
	PatientVitalsDAO vitalsDAO = new PatientVitalsDAO(DBConnection.getConn());

	PatientProfile profile = profileDAO.getProfileByUserId(user.getId());
	List<MedicalHistoryItem> chronicList = historyDAO.getHistoryByUserIdAndCategory(user.getId(), "CHRONIC_CONDITION");
	List<MedicalHistoryItem> allergyList = historyDAO.getHistoryByUserIdAndCategory(user.getId(), "ALLERGY");
	List<MedicalHistoryItem> surgeryList = historyDAO.getHistoryByUserIdAndCategory(user.getId(), "SURGERY");
	List<PatientDocument> docList = docDAO.getDocumentsByUserId(user.getId());
	List<AIDiagnosis> aiDiagnosisList = aiDAO.getDiagnosesByUserId(user.getId());

	// Insurance & Claims
	insuranceDAO.seedSampleInsuranceIfEmpty(user.getId(), user.getFullName());
	PatientInsurance insurance = insuranceDAO.getInsuranceByUserId(user.getId());
	List<InsuranceClaim> claimList = insuranceDAO.getClaimsByUserId(user.getId());

	// Vitals
	vitalsDAO.seedSampleVitalsIfEmpty(user.getId());
	List<PatientVital> vitalsList = vitalsDAO.getVitalsByUserId(user.getId());
	List<PatientVital> vitalsDescList = vitalsDAO.getVitalsByUserIdDesc(user.getId());
	PatientVital latestVital = vitalsDAO.getLatestVitalByUserId(user.getId());

	NumberFormat currencyFmt = NumberFormat.getCurrencyInstance(new Locale("en", "US"));

	String activeTab = request.getParameter("tab");
	if (activeTab == null || activeTab.trim().isEmpty()) {
		activeTab = "personal";
	}
%>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Patient Profile, Health Trends & Insurance | Iryotek Healthcare</title>
<%@include file="component/allcss.jsp"%>

<!-- React 18, Prop-Types, Recharts UMD & Babel Standalone for Health Trends Recharts Component -->
<script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prop-types@15.8.1/prop-types.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/recharts@2.12.7/umd/Recharts.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.7/babel.min.js"></script>

<style type="text/css">
:root {
	--profile-theme-cyan: #00c2cb;
	--profile-theme-cyan-dark: #009aa2;
	--profile-theme-coral: #ff5e3a;
	--profile-bg: #f8fafc;
	--card-border: #e2e8f0;
}

body {
	background-color: var(--profile-bg) !important;
	font-family: 'Rubik', 'Outfit', system-ui, -apple-system, sans-serif;
	color: #1e293b;
}

.profile-hero {
	background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
	color: #ffffff;
	padding: 35px 0 25px 0;
	margin-bottom: 25px;
	border-bottom: 3px solid var(--profile-theme-cyan);
}

.profile-avatar-circle {
	width: 76px;
	height: 76px;
	border-radius: 50%;
	background: linear-gradient(135deg, var(--profile-theme-cyan) 0%, #0284c7 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 2.2rem;
	color: #ffffff;
	box-shadow: 0 4px 15px rgba(0, 194, 203, 0.4);
	flex-shrink: 0;
}

.blood-badge {
	background-color: rgba(239, 68, 68, 0.15);
	color: #ef4444;
	border: 1px solid rgba(239, 68, 68, 0.3);
	font-weight: 700;
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 0.82rem;
	display: inline-flex;
	align-items: center;
	gap: 5px;
}

/* Custom Nav Tabs */
.profile-nav-tabs {
	border-bottom: 2px solid #e2e8f0;
	gap: 8px;
}

.profile-nav-tabs .nav-link {
	border: none;
	color: #64748b;
	font-weight: 600;
	padding: 12px 20px;
	border-radius: 12px 12px 0 0;
	font-size: 0.95rem;
	transition: all 0.2s ease;
	display: inline-flex;
	align-items: center;
	gap: 8px;
}

.profile-nav-tabs .nav-link:hover {
	color: #0f172a;
	background: #f1f5f9;
}

.profile-nav-tabs .nav-link.active {
	color: #0f172a;
	background: #ffffff;
	border-bottom: 3px solid var(--profile-theme-cyan);
	box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.03);
}

.profile-card {
	background: #ffffff;
	border: 1px solid var(--card-border);
	border-radius: 16px;
	box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
	padding: 24px;
	margin-bottom: 24px;
}

.card-section-title {
	font-size: 1.15rem;
	font-weight: 700;
	color: #0f172a;
	margin-bottom: 18px;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.btn-oreo-cyan {
	background-color: var(--profile-theme-cyan);
	color: #ffffff;
	font-weight: 600;
	border: none;
	transition: all 0.2s;
}

.btn-oreo-cyan:hover {
	background-color: var(--profile-theme-cyan-dark);
	color: #ffffff;
	transform: translateY(-1px);
}

.btn-oreo-coral {
	background-color: var(--profile-theme-coral);
	color: #ffffff;
	font-weight: 600;
	border: none;
	transition: all 0.2s;
}

.btn-oreo-coral:hover {
	background-color: #e04b28;
	color: #ffffff;
	transform: translateY(-1px);
}

/* Medical History Badge & Items */
.history-badge-mild {
	background-color: #dcfce7;
	color: #166534;
	border: 1px solid #86efac;
}

.history-badge-moderate {
	background-color: #fef9c3;
	color: #854d0e;
	border: 1px solid #fde047;
}

.history-badge-severe {
	background-color: #ffedd5;
	color: #9a3412;
	border: 1px solid #fdba74;
}

.history-badge-critical {
	background-color: #fee2e2;
	color: #991b1b;
	border: 1px solid #fca5a5;
}

.history-item-row {
	border-left: 4px solid var(--profile-theme-cyan);
	background: #f8fafc;
	border-radius: 8px;
	padding: 12px 16px;
	margin-bottom: 12px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition: background 0.2s;
}

.history-item-row:hover {
	background: #f1f5f9;
}

.history-item-row.allergy-item {
	border-left-color: #ef4444;
}

.history-item-row.surgery-item {
	border-left-color: #8b5cf6;
}

.history-item-title {
	font-weight: 700;
	font-size: 0.95rem;
	color: #0f172a;
}

.history-item-meta {
	font-size: 0.8rem;
	color: #64748b;
}

/* Document Vault Card */
.doc-grid-card {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 16px;
	transition: all 0.2s ease;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.doc-grid-card:hover {
	border-color: var(--profile-theme-cyan);
	box-shadow: 0 6px 20px rgba(0, 194, 203, 0.12);
	transform: translateY(-2px);
}

.doc-type-icon {
	width: 44px;
	height: 44px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.25rem;
	margin-bottom: 10px;
}

.doc-icon-rx { background: #e0f2fe; color: #0284c7; }
.doc-icon-lab { background: #f0fdf4; color: #16a34a; }
.doc-icon-rad { background: #f3e8ff; color: #9333ea; }
.doc-icon-other { background: #fef3c7; color: #d97706; }

/* Disclaimer Banner */
.clinical-disclaimer-box {
	background: #fefce8;
	border-left: 4px solid #eab308;
	border-radius: 8px;
	padding: 12px 16px;
	margin-bottom: 20px;
	font-size: 0.84rem;
	color: #713f12;
	line-height: 1.45;
	display: flex;
	align-items: flex-start;
	gap: 12px;
}

/* Health Trends Vitals Dashboard Styles */
.vital-stat-card {
	background: #ffffff;
	border: 1px solid var(--card-border);
	border-radius: 16px;
	padding: 18px 20px;
	transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	position: relative;
	overflow: hidden;
}

.vital-stat-card:hover {
	transform: translateY(-3px);
	box-shadow: 0 10px 25px rgba(0, 194, 203, 0.12);
	border-color: rgba(0, 194, 203, 0.4);
}

.vital-stat-icon {
	width: 48px;
	height: 48px;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.35rem;
}

.vital-icon-hr { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
.vital-icon-bp { background: rgba(2, 132, 199, 0.12); color: #0284c7; }
.vital-icon-wt { background: rgba(16, 185, 129, 0.12); color: #10b981; }
.vital-icon-glu { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
.vital-icon-spo2 { background: rgba(99, 102, 241, 0.12); color: #6366f1; }
.vital-icon-temp { background: rgba(236, 72, 153, 0.12); color: #ec4899; }

.metric-selector-btn {
	border-radius: 30px;
	padding: 8px 16px;
	font-size: 0.88rem;
	font-weight: 600;
	border: 1px solid #cbd5e1;
	background: #ffffff;
	color: #475569;
	transition: all 0.2s ease;
	display: inline-flex;
	align-items: center;
	gap: 6px;
}

.metric-selector-btn:hover {
	background: #f1f5f9;
	color: #0f172a;
	border-color: #94a3b8;
}

.metric-selector-btn.active {
	background: linear-gradient(135deg, var(--profile-theme-cyan) 0%, #0284c7 100%);
	color: #ffffff;
	border-color: var(--profile-theme-cyan);
	box-shadow: 0 4px 12px rgba(0, 194, 203, 0.35);
}

.recharts-custom-tooltip {
	background: rgba(15, 23, 42, 0.94);
	color: #f8fafc;
	padding: 12px 16px;
	border-radius: 12px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.12);
	font-size: 0.86rem;
	backdrop-filter: blur(8px);
}

/* Insurance & Billing Styles */
.insurance-hero-banner {
	background: linear-gradient(135deg, #0b192c 0%, #1e3e62 50%, #00c2cb 100%);
	color: #ffffff;
	border-radius: 20px;
	padding: 28px;
	margin-bottom: 24px;
	box-shadow: 0 12px 30px rgba(0, 194, 203, 0.2);
	position: relative;
	overflow: hidden;
}

.insurance-hero-banner::before {
	content: '';
	position: absolute;
	top: -50px;
	right: -50px;
	width: 220px;
	height: 220px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.06);
	pointer-events: none;
}

.provider-chip {
	background: rgba(255, 255, 255, 0.18);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.25);
	padding: 6px 14px;
	border-radius: 30px;
	font-weight: 700;
	font-size: 0.9rem;
	display: inline-flex;
	align-items: center;
	gap: 6px;
}

.financial-metric-card {
	background: #ffffff;
	border: 1px solid var(--card-border);
	border-radius: 16px;
	padding: 20px;
	transition: all 0.2s ease;
	height: 100%;
}

.financial-metric-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.claim-stepper {
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
	margin: 20px 0 10px 0;
}

.claim-stepper::before {
	content: '';
	position: absolute;
	top: 14px;
	left: 5%;
	right: 5%;
	height: 3px;
	background: #e2e8f0;
	z-index: 1;
}

.step-node {
	position: relative;
	z-index: 2;
	text-align: center;
	width: 20%;
}

.step-circle {
	width: 30px;
	height: 30px;
	border-radius: 50%;
	background: #e2e8f0;
	color: #64748b;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.8rem;
	font-weight: 700;
	margin: 0 auto 6px auto;
	border: 3px solid #ffffff;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;
}

.step-node.completed .step-circle {
	background: #10b981;
	color: #ffffff;
}

.step-node.active .step-circle {
	background: var(--profile-theme-cyan);
	color: #ffffff;
	box-shadow: 0 0 0 4px rgba(0, 194, 203, 0.25);
}

.step-node.rejected .step-circle {
	background: #ef4444;
	color: #ffffff;
}

.step-label {
	font-size: 0.72rem;
	font-weight: 600;
	color: #64748b;
}

.step-node.active .step-label {
	color: #0f172a;
	font-weight: 700;
}
</style>
</head>
<body>

<%@include file="component/navbar.jsp"%>

<!-- Profile Header Banner -->
<div class="profile-hero">
	<div class="container">
		<div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
			<div class="d-flex align-items-center gap-3">
				<div class="profile-avatar-circle">
					<i class="fa-solid fa-user-injured"></i>
				</div>
				<div>
					<h3 class="fw-bold mb-1"><%= user.getFullName() %></h3>
					<div class="d-flex flex-wrap align-items-center gap-3 text-white-50 fs-7">
						<span><i class="fa-regular fa-envelope me-1"></i> <%= user.getEmail() %></span>
						<% if (profile != null && profile.getPhone() != null && !profile.getPhone().isEmpty()) { %>
							<span><i class="fa-solid fa-phone me-1"></i> <%= profile.getPhone() %></span>
						<% } %>
						<% if (profile != null && profile.getBloodGroup() != null && !profile.getBloodGroup().isEmpty()) { %>
							<span class="blood-badge"><i class="fa-solid fa-droplet"></i> <%= profile.getBloodGroup() %></span>
						<% } %>
					</div>
				</div>
			</div>
			<div>
				<a href="symptom_checker.jsp" class="btn btn-outline-info rounded-pill px-3 py-2 text-white">
					<i class="fa-solid fa-robot text-cyan me-1"></i> Sakura AI Health Assistant
				</a>
			</div>
		</div>
	</div>
</div>

<div class="container pb-5">
	<!-- Flash Notifications -->
	<c:if test="${not empty succMsg}">
		<div class="alert alert-success alert-dismissible fade show rounded-3 shadow-sm mb-4" role="alert">
			<i class="fa-solid fa-circle-check me-2"></i> ${succMsg}
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>
		<c:remove var="succMsg" scope="session" />
	</c:if>

	<c:if test="${not empty errorMsg}">
		<div class="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm mb-4" role="alert">
			<i class="fa-solid fa-triangle-exclamation me-2"></i> ${errorMsg}
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>
		<c:remove var="errorMsg" scope="session" />
	</c:if>

	<!-- Profile Navigation Tabs -->
	<ul class="nav profile-nav-tabs mb-4" id="profileTab" role="tablist">
		<li class="nav-item" role="presentation">
			<button class="nav-link <%= "personal".equals(activeTab) ? "active" : "" %>" id="personal-tab" data-bs-toggle="tab" data-bs-target="#personal" type="button" role="tab">
				<i class="fa-solid fa-id-card text-primary"></i> Personal & Emergency Contacts
			</button>
		</li>
		<li class="nav-item" role="presentation">
			<button class="nav-link <%= "history".equals(activeTab) ? "active" : "" %>" id="history-tab" data-bs-toggle="tab" data-bs-target="#history" type="button" role="tab">
				<i class="fa-solid fa-notes-medical text-danger"></i> Medical History
				<span class="badge bg-danger rounded-pill ms-1"><%= (chronicList.size() + allergyList.size() + surgeryList.size()) %></span>
			</button>
		</li>
		<li class="nav-item" role="presentation">
			<button class="nav-link <%= "documents".equals(activeTab) ? "active" : "" %>" id="documents-tab" data-bs-toggle="tab" data-bs-target="#documents" type="button" role="tab">
				<i class="fa-solid fa-folder-open text-warning"></i> Document Vault
				<span class="badge bg-secondary rounded-pill ms-1"><%= docList.size() %></span>
			</button>
		</li>
		<li class="nav-item" role="presentation">
			<button class="nav-link <%= "vitals".equals(activeTab) ? "active" : "" %>" id="vitals-tab" data-bs-toggle="tab" data-bs-target="#vitals" type="button" role="tab">
				<i class="fa-solid fa-chart-line text-info"></i> Health Trends
				<span class="badge bg-info-subtle text-info border border-info-subtle rounded-pill ms-1"><%= vitalsList.size() %> logs</span>
			</button>
		</li>
		<li class="nav-item" role="presentation">
			<button class="nav-link <%= "insurance".equals(activeTab) ? "active" : "" %>" id="insurance-tab" data-bs-toggle="tab" data-bs-target="#insurance" type="button" role="tab">
				<i class="fa-solid fa-file-invoice-dollar text-success"></i> Insurance & Billing
				<% if (insurance != null && "ACTIVE".equalsIgnoreCase(insurance.getStatus())) { %>
					<span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill ms-1">Active</span>
				<% } else { %>
					<span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill ms-1">Setup</span>
				<% } %>
			</button>
		</li>
		<li class="nav-item" role="presentation">
			<button class="nav-link <%= "ai_triage".equals(activeTab) ? "active" : "" %>" id="ai-triage-tab" data-bs-toggle="tab" data-bs-target="#ai_triage" type="button" role="tab">
				<i class="fa-solid fa-brain text-purple" style="color: #8b5cf6;"></i> Sakura AI Insights
			</button>
		</li>
	</ul>

	<!-- Tab Contents -->
	<div class="tab-content" id="profileTabContent">

		<!-- TAB 1: Personal Details & Emergency Contacts -->
		<div class="tab-pane fade <%= "personal".equals(activeTab) ? "show active" : "" %>" id="personal" role="tabpanel">
			<form action="updatePatientProfile" method="post">
				<div class="row">
					<!-- Personal Information -->
					<div class="col-lg-7">
						<div class="profile-card">
							<div class="card-section-title">
								<span><i class="fa-solid fa-user-pen text-primary me-2"></i> Personal Information</span>
							</div>

							<div class="row g-3">
								<div class="col-md-6">
									<label class="form-label fw-bold small text-muted">Full Name</label>
									<input type="text" name="fullName" class="form-control rounded-pill px-3" value="<%= user.getFullName() %>" required>
								</div>
								<div class="col-md-6">
									<label class="form-label fw-bold small text-muted">Account Email</label>
									<input type="email" class="form-control rounded-pill px-3 bg-light" value="<%= user.getEmail() %>" readonly>
								</div>
								<div class="col-md-6">
									<label class="form-label fw-bold small text-muted">Primary Phone</label>
									<input type="tel" name="phone" class="form-control rounded-pill px-3" placeholder="+91 98765 43210" value="<%= profile != null && profile.getPhone() != null ? profile.getPhone() : "" %>">
								</div>
								<div class="col-md-6">
									<label class="form-label fw-bold small text-muted">Date of Birth</label>
									<input type="date" name="dateOfBirth" class="form-control rounded-pill px-3" value="<%= profile != null && profile.getDateOfBirth() != null ? profile.getDateOfBirth() : "" %>">
								</div>
								<div class="col-md-6">
									<label class="form-label fw-bold small text-muted">Gender</label>
									<select name="gender" class="form-select rounded-pill px-3">
										<option value="">-- Select Gender --</option>
										<option value="Male" <%= profile != null && "Male".equalsIgnoreCase(profile.getGender()) ? "selected" : "" %>>Male</option>
										<option value="Female" <%= profile != null && "Female".equalsIgnoreCase(profile.getGender()) ? "selected" : "" %>>Female</option>
										<option value="Other" <%= profile != null && "Other".equalsIgnoreCase(profile.getGender()) ? "selected" : "" %>>Other</option>
									</select>
								</div>
								<div class="col-md-6">
									<label class="form-label fw-bold small text-muted">Blood Group</label>
									<select name="bloodGroup" class="form-select rounded-pill px-3">
										<option value="">-- Select Blood Group --</option>
										<% String[] groups = {"A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"};
										   for (String bg : groups) { %>
											<option value="<%= bg %>" <%= profile != null && bg.equals(profile.getBloodGroup()) ? "selected" : "" %>><%= bg %></option>
										<% } %>
									</select>
								</div>

								<div class="col-12">
									<label class="form-label fw-bold small text-muted">Street Address</label>
									<input type="text" name="address" class="form-control rounded-pill px-3" placeholder="Apartment, building, street" value="<%= profile != null && profile.getAddress() != null ? profile.getAddress() : "" %>">
								</div>
								<div class="col-md-4">
									<label class="form-label fw-bold small text-muted">City</label>
									<input type="text" name="city" class="form-control rounded-pill px-3" placeholder="City" value="<%= profile != null && profile.getCity() != null ? profile.getCity() : "" %>">
								</div>
								<div class="col-md-4">
									<label class="form-label fw-bold small text-muted">State</label>
									<input type="text" name="state" class="form-control rounded-pill px-3" placeholder="State" value="<%= profile != null && profile.getState() != null ? profile.getState() : "" %>">
								</div>
								<div class="col-md-4">
									<label class="form-label fw-bold small text-muted">Pincode</label>
									<input type="text" name="pincode" class="form-control rounded-pill px-3" placeholder="Pincode" value="<%= profile != null && profile.getPincode() != null ? profile.getPincode() : "" %>">
								</div>
							</div>
						</div>
					</div>

					<!-- Emergency Contact Card -->
					<div class="col-lg-5">
						<div class="profile-card border-danger border-opacity-25" style="background: linear-gradient(180deg, #ffffff 0%, #fff7f7 100%);">
							<div class="card-section-title text-danger">
								<span><i class="fa-solid fa-truck-medical text-danger me-2"></i> Emergency Contact</span>
								<span class="badge bg-danger rounded-pill px-2 py-1 fs-8">Critical</span>
							</div>
							<p class="text-muted small">Designate a primary contact for our medical staff and trauma desk in case of emergencies.</p>

							<div class="row g-3">
								<div class="col-12">
									<label class="form-label fw-bold small text-muted">Contact Person Name</label>
									<input type="text" name="emergencyContactName" class="form-control rounded-pill px-3" placeholder="Full name of emergency contact" value="<%= profile != null && profile.getEmergencyContactName() != null ? profile.getEmergencyContactName() : "" %>">
								</div>
								<div class="col-12">
									<label class="form-label fw-bold small text-muted">Relationship to Patient</label>
									<select name="emergencyContactRelation" class="form-select rounded-pill px-3">
										<option value="">-- Select Relationship --</option>
										<% String[] relations = {"Spouse", "Parent", "Child", "Sibling", "Guardian", "Friend", "Other"};
										   for (String rel : relations) { %>
											<option value="<%= rel %>" <%= profile != null && rel.equalsIgnoreCase(profile.getEmergencyContactRelation()) ? "selected" : "" %>><%= rel %></option>
										<% } %>
									</select>
								</div>
								<div class="col-12">
									<label class="form-label fw-bold small text-muted">Emergency Phone Number</label>
									<div class="input-group">
										<span class="input-group-text rounded-start-pill bg-light border-end-0"><i class="fa-solid fa-phone text-danger"></i></span>
										<input type="tel" name="emergencyContactPhone" class="form-control rounded-end-pill border-start-0" placeholder="Direct 24/7 contact number" value="<%= profile != null && profile.getEmergencyContactPhone() != null ? profile.getEmergencyContactPhone() : "" %>">
									</div>
								</div>
							</div>
						</div>

						<div class="d-grid mt-3">
							<button type="submit" class="btn btn-oreo-coral rounded-pill py-2 fs-6 shadow-sm">
								<i class="fa-solid fa-floppy-disk me-2"></i> Save Profile & Emergency Contact
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>

		<!-- TAB 2: Dedicated Medical History Tab -->
		<div class="tab-pane fade <%= "history".equals(activeTab) ? "show active" : "" %>" id="history" role="tabpanel">
			<div class="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h5 class="fw-bold mb-1 text-dark"><i class="fa-solid fa-book-medical text-primary me-2"></i> Patient Medical History Ledger</h5>
					<p class="text-muted small mb-0">Record chronic conditions, allergies, and surgical history so your doctors have an accurate clinical picture before consultations.</p>
				</div>
				<button class="btn btn-oreo-cyan rounded-pill px-3 py-2 shadow-sm" data-bs-toggle="modal" data-bs-target="#addHistoryModal">
					<i class="fa-solid fa-plus me-1"></i> Log Medical Record
				</button>
			</div>

			<div class="row">
				<!-- 1. Chronic Conditions -->
				<div class="col-lg-4 mb-4">
					<div class="profile-card h-100">
						<div class="card-section-title">
							<span><i class="fa-solid fa-heart-pulse text-danger me-2"></i> Chronic Conditions</span>
							<span class="badge bg-danger rounded-pill px-2 py-1 fs-8"><%= chronicList.size() %></span>
						</div>
						<% if (chronicList.isEmpty()) { %>
							<div class="text-center py-4 text-muted">
								<i class="fa-solid fa-heart-circle-check fs-2 text-success opacity-50 mb-2"></i>
								<p class="small mb-2">No chronic conditions logged.</p>
								<button class="btn btn-sm btn-outline-primary rounded-pill" onclick="openAddHistoryModal('CHRONIC_CONDITION')">+ Add Condition</button>
							</div>
						<% } else { %>
							<% for (MedicalHistoryItem item : chronicList) { %>
								<div class="history-item-row">
									<div>
										<div class="history-item-title"><%= item.getTitle() %></div>
										<div class="history-item-meta">
											<% if (item.getDiagnosedYearOrDate() != null && !item.getDiagnosedYearOrDate().isEmpty()) { %>
												<span>Diagnosed: <%= item.getDiagnosedYearOrDate() %></span> &bull;
											<% } %>
											<span class="badge rounded-pill <%= "Critical".equalsIgnoreCase(item.getSeverity()) ? "history-badge-critical" : ("Severe".equalsIgnoreCase(item.getSeverity()) ? "history-badge-severe" : ("Moderate".equalsIgnoreCase(item.getSeverity()) ? "history-badge-moderate" : "history-badge-mild")) %>"><%= item.getSeverity() %></span>
										</div>
										<% if (item.getNotes() != null && !item.getNotes().isEmpty()) { %>
											<div class="small text-muted mt-1"><i class="fa-regular fa-comment-dots me-1"></i> <%= item.getNotes() %></div>
										<% } %>
									</div>
									<a href="medicalHistory?action=delete&id=<%= item.getId() %>" class="btn btn-sm btn-light text-danger rounded-circle ms-2" onclick="return confirm('Remove this condition from history?');" title="Delete">
										<i class="fa-solid fa-trash-can"></i>
									</a>
								</div>
							<% } %>
						<% } %>
					</div>
				</div>

				<!-- 2. Allergies & Sensitivities -->
				<div class="col-lg-4 mb-4">
					<div class="profile-card h-100">
						<div class="card-section-title">
							<span><i class="fa-solid fa-hand-dots text-warning me-2"></i> Allergies & Sensitivities</span>
							<span class="badge bg-warning text-dark rounded-pill px-2 py-1 fs-8"><%= allergyList.size() %></span>
						</div>
						<% if (allergyList.isEmpty()) { %>
							<div class="text-center py-4 text-muted">
								<i class="fa-solid fa-shield-virus fs-2 text-primary opacity-50 mb-2"></i>
								<p class="small mb-2">No known drug/food allergies logged.</p>
								<button class="btn btn-sm btn-outline-warning text-dark rounded-pill" onclick="openAddHistoryModal('ALLERGY')">+ Add Allergy</button>
							</div>
						<% } else { %>
							<% for (MedicalHistoryItem item : allergyList) { %>
								<div class="history-item-row allergy-item">
									<div>
										<div class="history-item-title"><%= item.getTitle() %></div>
										<div class="history-item-meta">
											<span class="badge rounded-pill <%= "Critical".equalsIgnoreCase(item.getSeverity()) ? "history-badge-critical" : ("Severe".equalsIgnoreCase(item.getSeverity()) ? "history-badge-severe" : "history-badge-moderate") %>"><%= item.getSeverity() %></span>
										</div>
										<% if (item.getNotes() != null && !item.getNotes().isEmpty()) { %>
											<div class="small text-muted mt-1"><%= item.getNotes() %></div>
										<% } %>
									</div>
									<a href="medicalHistory?action=delete&id=<%= item.getId() %>" class="btn btn-sm btn-light text-danger rounded-circle ms-2" onclick="return confirm('Remove this allergy record?');" title="Delete">
										<i class="fa-solid fa-trash-can"></i>
									</a>
								</div>
							<% } %>
						<% } %>
					</div>
				</div>

				<!-- 3. Past Surgeries & Procedures -->
				<div class="col-lg-4 mb-4">
					<div class="profile-card h-100">
						<div class="card-section-title">
							<span><i class="fa-solid fa-scalpel text-primary me-2"></i> Past Surgeries & Procedures</span>
							<span class="badge bg-primary rounded-pill px-2 py-1 fs-8"><%= surgeryList.size() %></span>
						</div>
						<% if (surgeryList.isEmpty()) { %>
							<div class="text-center py-4 text-muted">
								<i class="fa-solid fa-hospital fs-2 text-info opacity-50 mb-2"></i>
								<p class="small mb-2">No past surgical procedures logged.</p>
								<button class="btn btn-sm btn-outline-info rounded-pill" onclick="openAddHistoryModal('SURGERY')">+ Add Surgery</button>
							</div>
						<% } else { %>
							<% for (MedicalHistoryItem item : surgeryList) { %>
								<div class="history-item-row surgery-item">
									<div>
										<div class="history-item-title"><%= item.getTitle() %></div>
										<div class="history-item-meta">
											<% if (item.getDiagnosedYearOrDate() != null && !item.getDiagnosedYearOrDate().isEmpty()) { %>
												<span>Procedure Date/Year: <%= item.getDiagnosedYearOrDate() %></span>
											<% } %>
										</div>
										<% if (item.getNotes() != null && !item.getNotes().isEmpty()) { %>
											<div class="small text-muted mt-1"><%= item.getNotes() %></div>
										<% } %>
									</div>
									<a href="medicalHistory?action=delete&id=<%= item.getId() %>" class="btn btn-sm btn-light text-danger rounded-circle ms-2" onclick="return confirm('Remove this surgery record?');" title="Delete">
										<i class="fa-solid fa-trash-can"></i>
									</a>
								</div>
							<% } %>
						<% } %>
					</div>
				</div>
			</div>
		</div>

		<!-- TAB 3: Document Vault -->
		<div class="tab-pane fade <%= "documents".equals(activeTab) ? "show active" : "" %>" id="documents" role="tabpanel">
			<div class="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h5 class="fw-bold mb-1 text-dark"><i class="fa-solid fa-folder-closed text-warning me-2"></i> Personal Medical Document Vault</h5>
					<p class="text-muted small mb-0">Upload prescriptions, laboratory reports, discharge summaries, and X-rays for review by doctors during consultations.</p>
				</div>
				<button class="btn btn-oreo-coral rounded-pill px-3 py-2 shadow-sm" data-bs-toggle="modal" data-bs-target="#uploadDocModal">
					<i class="fa-solid fa-cloud-arrow-up me-1"></i> Upload Document
				</button>
			</div>

			<% if (docList.isEmpty()) { %>
				<div class="profile-card text-center py-5">
					<i class="fa-solid fa-file-medical fs-1 text-muted opacity-50 mb-3"></i>
					<h5 class="fw-bold text-dark">No documents in your vault yet</h5>
					<p class="text-muted small mb-3">Upload your past prescriptions, blood test results, MRI/CT scans, or discharge summaries.</p>
					<button class="btn btn-oreo-coral rounded-pill px-4 py-2" data-bs-toggle="modal" data-bs-target="#uploadDocModal">
						<i class="fa-solid fa-cloud-arrow-up me-1"></i> Upload First Document
					</button>
				</div>
			<% } else { %>
				<div class="row g-3">
					<% for (PatientDocument doc : docList) { 
						String iconClass = "doc-icon-other";
						String faIcon = "fa-file-lines";
						if ("Prescription".equalsIgnoreCase(doc.getDocumentType())) {
							iconClass = "doc-icon-rx";
							faIcon = "fa-prescription";
						} else if ("Lab Report".equalsIgnoreCase(doc.getDocumentType())) {
							iconClass = "doc-icon-lab";
							faIcon = "fa-flask-vial";
						} else if ("Radiology / X-Ray".equalsIgnoreCase(doc.getDocumentType())) {
							iconClass = "doc-icon-rad";
							faIcon = "fa-x-ray";
						}
					%>
						<div class="col-md-6 col-lg-4">
							<div class="doc-grid-card">
								<div>
									<div class="d-flex justify-content-between align-items-start">
										<div class="doc-type-icon <%= iconClass %>">
											<i class="fa-solid <%= faIcon %>"></i>
										</div>
										<span class="badge bg-light text-dark border px-2 py-1 fs-8"><%= doc.getDocumentType() %></span>
									</div>
									<h6 class="fw-bold text-dark mb-1 text-truncate" title="<%= doc.getTitle() %>"><%= doc.getTitle() %></h6>
									<div class="text-muted small mb-2"><i class="fa-regular fa-file me-1"></i> <%= doc.getFileName() %> (<%= doc.getFileSize() %>)</div>
									<% if (doc.getNotes() != null && !doc.getNotes().isEmpty()) { %>
										<p class="small text-muted mb-2 text-truncate-2" style="font-size: 0.8rem;"><%= doc.getNotes() %></p>
									<% } %>
								</div>
								<div class="pt-3 border-top d-flex justify-content-between align-items-center">
									<span class="text-muted fs-8"><i class="fa-regular fa-clock me-1"></i> <%= doc.getUploadedAt() != null ? doc.getUploadedAt().toString().substring(0, 10) : "" %></span>
									<div class="d-flex gap-2">
										<a href="patientDocument?action=view&id=<%= doc.getId() %>" target="_blank" class="btn btn-sm btn-outline-primary rounded-pill px-2" title="Preview in browser">
											<i class="fa-regular fa-eye"></i>
										</a>
										<a href="patientDocument?action=download&id=<%= doc.getId() %>" class="btn btn-sm btn-outline-success rounded-pill px-2" title="Download">
											<i class="fa-solid fa-download"></i>
										</a>
										<a href="patientDocument?action=delete&id=<%= doc.getId() %>" class="btn btn-sm btn-outline-danger rounded-pill px-2" onclick="return confirm('Delete this document from your vault?');" title="Delete">
											<i class="fa-solid fa-trash-can"></i>
										</a>
									</div>
								</div>
							</div>
						</div>
					<% } %>
				</div>
			<% } %>
		</div>

		<!-- TAB 4: Sakura AI Differential Diagnoses & Clinical Insights -->
		<div class="tab-pane fade <%= "ai_triage".equals(activeTab) ? "show active" : "" %>" id="ai_triage" role="tabpanel">
			<!-- Clinical Disclaimer Box -->
			<div class="clinical-disclaimer-box">
				<i class="fa-solid fa-shield-halved text-warning fs-5 mt-1"></i>
				<div>
					<strong>Clinical Safety Notice:</strong>
					These differential diagnosis summaries are generated by Sakura AI based on patient-reported symptoms for pre-consultation review and triage. They are strictly <em>informational</em> and do not constitute a definitive medical diagnosis. Your consulting doctor will review this analysis alongside physical examination and laboratory diagnostics.
				</div>
			</div>

			<div class="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h5 class="fw-bold mb-1 text-dark"><i class="fa-solid fa-brain text-primary me-2"></i> Sakura AI Triage & Differential Diagnoses</h5>
					<p class="text-muted small mb-0">Review previous symptom assessments and AI differential diagnoses recorded for your consultations.</p>
				</div>
				<a href="symptom_checker.jsp" class="btn btn-oreo-cyan rounded-pill px-3 py-2 shadow-sm">
					<i class="fa-solid fa-plus me-1"></i> New Symptom Assessment
				</a>
			</div>

			<% if (aiDiagnosisList.isEmpty()) { %>
				<div class="profile-card text-center py-5">
					<i class="fa-solid fa-notes-medical fs-1 text-muted opacity-50 mb-3"></i>
					<h5 class="fw-bold text-dark">No AI differential assessments logged</h5>
					<p class="text-muted small mb-3">Use Sakura AI to analyze any symptoms you are feeling before booking an appointment.</p>
					<a href="symptom_checker.jsp" class="btn btn-oreo-cyan rounded-pill px-4 py-2">
						<i class="fa-solid fa-comments me-1"></i> Chat with Sakura AI
					</a>
				</div>
			<% } else { %>
				<div class="row g-4">
					<% for (AIDiagnosis diag : aiDiagnosisList) { %>
						<div class="col-12">
							<div class="profile-card border-start border-4 <%= "EMERGENCY".equalsIgnoreCase(diag.getUrgencyLevel()) ? "border-danger" : ("URGENT".equalsIgnoreCase(diag.getUrgencyLevel()) ? "border-warning" : "border-success") %>">
								<div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom">
									<div class="d-flex align-items-center gap-2">
										<span class="badge rounded-pill px-3 py-2 <%= "EMERGENCY".equalsIgnoreCase(diag.getUrgencyLevel()) ? "bg-danger" : ("URGENT".equalsIgnoreCase(diag.getUrgencyLevel()) ? "bg-warning text-dark" : "bg-success") %>">
											<i class="fa-solid fa-heart-pulse me-1"></i> <%= diag.getUrgencyLevel() %> TRIAGE
										</span>
										<% if (diag.getAppointmentId() != null && diag.getAppointmentId() > 0) { %>
											<span class="badge bg-light text-dark border rounded-pill px-2 py-1 fs-8">Appt #<%= diag.getAppointmentId() %></span>
										<% } %>
									</div>
									<span class="text-muted small"><i class="fa-regular fa-clock me-1"></i> Recorded: <%= diag.getCreatedAt() != null ? diag.getCreatedAt().toString().substring(0, 19) : "" %></span>
								</div>

								<div class="mb-3">
									<label class="fw-bold text-muted small">Patient-Reported Symptoms:</label>
									<div class="p-2 bg-light rounded-3 text-dark small"><%= diag.getSymptoms() %></div>
								</div>

								<!-- Parsed Differential Diagnoses with Confidence Bars -->
								<%
									try {
										JsonElement elem = JsonParser.parseString(diag.getDiagnosesJson());
										if (elem.isJsonArray()) {
											JsonArray dArr = elem.getAsJsonArray();
								%>
									<label class="fw-bold text-dark small mb-2"><i class="fa-solid fa-stethoscope text-primary me-1"></i> Evaluated Differential Diagnoses & Confidence Match:</label>
									<div class="row g-2 mb-3">
										<% for (int k = 0; k < dArr.size(); k++) {
											JsonObject dObj = dArr.get(k).getAsJsonObject();
											String condName = dObj.has("condition") ? dObj.get("condition").getAsString() : "Condition";
											int confScore = dObj.has("confidence") ? dObj.get("confidence").getAsInt() : 50;
											String reason = dObj.has("reasoning") ? dObj.get("reasoning").getAsString() : "";
											String rec = dObj.has("recommendations") ? dObj.get("recommendations").getAsString() : "";
											String badgeCls = confScore >= 70 ? "history-badge-mild" : (confScore >= 45 ? "history-badge-moderate" : "history-badge-severe");
											String progCls = confScore >= 70 ? "bg-success" : (confScore >= 45 ? "bg-warning" : "bg-secondary");
										%>
											<div class="col-md-4">
												<div class="p-3 bg-light rounded-3 border h-100">
													<div class="d-flex justify-content-between align-items-center mb-1">
														<span class="fw-bold small text-dark"><%= condName %></span>
														<span class="badge rounded-pill <%= badgeCls %> fs-8"><%= confScore %>% Match</span>
													</div>
													<div class="progress mb-2" style="height: 5px;">
														<div class="progress-bar <%= progCls %>" role="progressbar" style="width: <%= confScore %>%;"></div>
													</div>
													<% if (!reason.isEmpty()) { %>
														<div class="text-muted fs-8 mb-1"><strong>Indicators:</strong> <%= reason %></div>
													<% } %>
													<% if (!rec.isEmpty()) { %>
														<div class="text-primary fs-8"><i class="fa-regular fa-lightbulb me-1"></i> <%= rec %></div>
													<% } %>
												</div>
											</div>
										<% } %>
									</div>
								<%
										}
									} catch (Exception ignored) {}
								%>

								<div class="alert alert-light border small text-muted mb-0 py-2">
									<i class="fa-solid fa-circle-info text-info me-1"></i> <%= diag.getDisclaimer() %>
								</div>
							</div>
						</div>
					<% } %>
				</div>
			<% } %>
		</div>

		<!-- TAB 5: Health Trends (Recharts Dashboard) -->
		<div class="tab-pane fade <%= "vitals".equals(activeTab) ? "show active" : "" %>" id="vitals" role="tabpanel">
			<!-- Header & Quick Actions -->
			<div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
				<div>
					<h4 class="fw-bold mb-1 text-dark">
						<i class="fa-solid fa-chart-line text-info me-2"></i> Health Trends & Historical Vitals
					</h4>
					<p class="text-muted small mb-0">Track and visualize your vital signs over time using clinical charts and automated healthy ranges.</p>
				</div>
				<div class="d-flex gap-2">
					<button type="button" class="btn btn-oreo-cyan rounded-pill px-4 py-2" data-bs-toggle="modal" data-bs-target="#logVitalModal">
						<i class="fa-solid fa-plus-circle me-1"></i> Log New Reading
					</button>
				</div>
			</div>

			<!-- 6 Key Metrics Snapshot Cards -->
			<div class="row g-3 mb-4">
				<!-- Heart Rate -->
				<div class="col-md-4 col-sm-6">
					<div class="vital-stat-card h-100">
						<div class="d-flex justify-content-between align-items-start mb-2">
							<span class="text-muted small fw-bold text-uppercase">Heart Rate</span>
							<div class="vital-stat-icon vital-icon-hr">
								<i class="fa-solid fa-heart-pulse"></i>
							</div>
						</div>
						<div class="d-flex align-items-baseline gap-2 mb-1">
							<h3 class="fw-bold mb-0 text-dark"><%= latestVital != null && latestVital.getHeartRate() > 0 ? latestVital.getHeartRate() : "--" %></h3>
							<span class="text-muted small">BPM</span>
						</div>
						<div class="d-flex justify-content-between align-items-center">
							<span class="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle fs-8">
								<%= latestVital != null ? latestVital.getHeartRateStatus() : "No Data" %>
							</span>
							<span class="text-muted fs-8"><%= latestVital != null && latestVital.getRecordedDate() != null ? latestVital.getRecordedDate() : "" %></span>
						</div>
					</div>
				</div>

				<!-- Blood Pressure -->
				<div class="col-md-4 col-sm-6">
					<div class="vital-stat-card h-100">
						<div class="d-flex justify-content-between align-items-start mb-2">
							<span class="text-muted small fw-bold text-uppercase">Blood Pressure</span>
							<div class="vital-stat-icon vital-icon-bp">
								<i class="fa-solid fa-stethoscope"></i>
							</div>
						</div>
						<div class="d-flex align-items-baseline gap-2 mb-1">
							<h3 class="fw-bold mb-0 text-dark"><%= latestVital != null ? latestVital.getBpDisplay() : "--" %></h3>
						</div>
						<div class="d-flex justify-content-between align-items-center">
							<span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle fs-8">
								<%= latestVital != null ? latestVital.getBpStatus() : "No Data" %>
							</span>
							<span class="text-muted fs-8">Target: &lt;120/80</span>
						</div>
					</div>
				</div>

				<!-- Weight -->
				<div class="col-md-4 col-sm-6">
					<div class="vital-stat-card h-100">
						<div class="d-flex justify-content-between align-items-start mb-2">
							<span class="text-muted small fw-bold text-uppercase">Body Weight</span>
							<div class="vital-stat-icon vital-icon-wt">
								<i class="fa-solid fa-weight-scale"></i>
							</div>
						</div>
						<div class="d-flex align-items-baseline gap-2 mb-1">
							<h3 class="fw-bold mb-0 text-dark"><%= latestVital != null && latestVital.getWeight() > 0 ? String.format("%.1f", latestVital.getWeight()) : "--" %></h3>
							<span class="text-muted small">kg</span>
						</div>
						<div class="d-flex justify-content-between align-items-center">
							<span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle fs-8">
								<i class="fa-solid fa-check me-1"></i> Stable Trend
							</span>
							<span class="text-muted fs-8">Ideal BMI range</span>
						</div>
					</div>
				</div>

				<!-- Blood Glucose -->
				<div class="col-md-4 col-sm-6">
					<div class="vital-stat-card h-100">
						<div class="d-flex justify-content-between align-items-start mb-2">
							<span class="text-muted small fw-bold text-uppercase">Blood Glucose</span>
							<div class="vital-stat-icon vital-icon-glu">
								<i class="fa-solid fa-droplet"></i>
							</div>
						</div>
						<div class="d-flex align-items-baseline gap-2 mb-1">
							<h3 class="fw-bold mb-0 text-dark"><%= latestVital != null && latestVital.getBloodGlucose() > 0 ? latestVital.getBloodGlucose() : "--" %></h3>
							<span class="text-muted small">mg/dL</span>
						</div>
						<div class="d-flex justify-content-between align-items-center">
							<span class="badge rounded-pill bg-warning-subtle text-warning border border-warning-subtle fs-8">
								<%= latestVital != null && latestVital.getBloodGlucose() > 0 ? (latestVital.getBloodGlucose() < 100 ? "Fasting Normal" : (latestVital.getBloodGlucose() <= 125 ? "Pre-diabetes" : "Elevated")) : "No Data" %>
							</span>
							<span class="text-muted fs-8">Target: 70-99 mg/dL</span>
						</div>
					</div>
				</div>

				<!-- Oxygen Saturation (SpO2) -->
				<div class="col-md-4 col-sm-6">
					<div class="vital-stat-card h-100">
						<div class="d-flex justify-content-between align-items-start mb-2">
							<span class="text-muted small fw-bold text-uppercase">Oxygen (SpO2)</span>
							<div class="vital-stat-icon vital-icon-spo2">
								<i class="fa-solid fa-lungs"></i>
							</div>
						</div>
						<div class="d-flex align-items-baseline gap-2 mb-1">
							<h3 class="fw-bold mb-0 text-dark"><%= latestVital != null && latestVital.getOxygenSaturation() > 0 ? latestVital.getOxygenSaturation() : "--" %></h3>
							<span class="text-muted small">%</span>
						</div>
						<div class="d-flex justify-content-between align-items-center">
							<span class="badge rounded-pill bg-indigo-subtle text-primary border fs-8">
								<%= latestVital != null ? latestVital.getSpo2Status() : "No Data" %>
							</span>
							<span class="text-muted fs-8">Target: &ge; 95%</span>
						</div>
					</div>
				</div>

				<!-- Temperature -->
				<div class="col-md-4 col-sm-6">
					<div class="vital-stat-card h-100">
						<div class="d-flex justify-content-between align-items-start mb-2">
							<span class="text-muted small fw-bold text-uppercase">Body Temp</span>
							<div class="vital-stat-icon vital-icon-temp">
								<i class="fa-solid fa-temperature-half"></i>
							</div>
						</div>
						<div class="d-flex align-items-baseline gap-2 mb-1">
							<h3 class="fw-bold mb-0 text-dark"><%= latestVital != null && latestVital.getTemperature() > 0 ? String.format("%.1f", latestVital.getTemperature()) : "--" %></h3>
							<span class="text-muted small">&deg;F</span>
						</div>
						<div class="d-flex justify-content-between align-items-center">
							<span class="badge rounded-pill bg-pink-subtle text-danger border fs-8">
								<%= latestVital != null && latestVital.getTemperature() > 0 ? (latestVital.getTemperature() > 99.5 ? "Fever" : "Normal Temp") : "No Data" %>
							</span>
							<span class="text-muted fs-8">Normal: 97.8 - 99.1&deg;F</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Recharts Interactive Dashboard Component Card -->
			<div class="profile-card mb-4">
				<div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 border-bottom mb-3">
					<div>
						<h5 class="fw-bold mb-1 text-dark">
							<i class="fa-solid fa-chart-area text-cyan me-2"></i> Clinical Trend Visualizer (Recharts)
						</h5>
						<span class="text-muted small">Interactive historical timeseries with clinical target boundaries and tooltips</span>
					</div>
					<div class="d-flex flex-wrap align-items-center gap-2" id="vitals-metric-controls">
						<button type="button" class="metric-selector-btn active" data-metric="heartRate">
							<i class="fa-solid fa-heart-pulse text-danger"></i> Heart Rate
						</button>
						<button type="button" class="metric-selector-btn" data-metric="bloodPressure">
							<i class="fa-solid fa-stethoscope text-primary"></i> Blood Pressure
						</button>
						<button type="button" class="metric-selector-btn" data-metric="weight">
							<i class="fa-solid fa-weight-scale text-success"></i> Weight
						</button>
						<button type="button" class="metric-selector-btn" data-metric="glucose">
							<i class="fa-solid fa-droplet text-warning"></i> Glucose
						</button>
						<button type="button" class="metric-selector-btn" data-metric="spo2">
							<i class="fa-solid fa-lungs text-info"></i> SpO2
						</button>
					</div>
				</div>

				<!-- React & Recharts Mount Target -->
				<div id="recharts-vitals-root" style="min-height: 380px; width: 100%;">
					<div class="d-flex align-items-center justify-content-center" style="height: 380px;">
						<div class="spinner-border text-info" role="status">
							<span class="visually-hidden">Loading Recharts Visualizer...</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Historical Vitals Log Table -->
			<div class="profile-card">
				<div class="card-section-title">
					<span><i class="fa-solid fa-clock-rotate-left text-primary me-2"></i> Recorded Clinical History</span>
					<span class="badge bg-light text-dark border rounded-pill"><%= vitalsDescList.size() %> Total Readings</span>
				</div>

				<% if (vitalsDescList.isEmpty()) { %>
					<div class="text-center py-4 text-muted">
						<i class="fa-solid fa-file-waveform fs-2 mb-2 opacity-50"></i>
						<p class="mb-0">No vitals entries logged yet. Click "Log New Reading" to start tracking!</p>
					</div>
				<% } else { %>
					<div class="table-responsive">
						<table class="table table-hover align-middle mb-0">
							<thead class="table-light fs-8 text-uppercase">
								<tr>
									<th>Recorded Date</th>
									<th>Heart Rate</th>
									<th>Blood Pressure</th>
									<th>Weight</th>
									<th>Blood Glucose</th>
									<th>SpO2</th>
									<th>Temp</th>
									<th>Clinical Notes</th>
									<th class="text-end">Action</th>
								</tr>
							</thead>
							<tbody class="fs-7">
								<% for (PatientVital v : vitalsDescList) { %>
									<tr>
										<td class="fw-bold text-dark">
											<i class="fa-regular fa-calendar-check text-cyan me-1"></i> <%= v.getRecordedDate() %>
										</td>
										<td>
											<span class="fw-bold"><%= v.getHeartRate() > 0 ? v.getHeartRate() + " BPM" : "--" %></span>
											<span class="d-block fs-8 text-muted"><%= v.getHeartRateStatus() %></span>
										</td>
										<td>
											<span class="fw-bold"><%= v.getBpDisplay() %></span>
											<span class="d-block fs-8 text-muted"><%= v.getBpStatus() %></span>
										</td>
										<td>
											<%= v.getWeight() > 0 ? String.format("%.1f kg", v.getWeight()) : "--" %>
										</td>
										<td>
											<%= v.getBloodGlucose() > 0 ? v.getBloodGlucose() + " mg/dL" : "--" %>
										</td>
										<td>
											<%= v.getOxygenSaturation() > 0 ? v.getOxygenSaturation() + "%" : "--" %>
										</td>
										<td>
											<%= v.getTemperature() > 0 ? String.format("%.1f °F", v.getTemperature()) : "--" %>
										</td>
										<td class="text-muted fs-8" style="max-width: 200px;">
											<%= v.getNotes() != null && !v.getNotes().isEmpty() ? v.getNotes() : "Routine check" %>
										</td>
										<td class="text-end">
											<a href="patientVitals?action=delete&id=<%= v.getId() %>" class="btn btn-sm btn-outline-danger rounded-circle" onclick="return confirm('Delete this vital reading?');" title="Delete record">
												<i class="fa-solid fa-trash-can"></i>
											</a>
										</td>
									</tr>
								<% } %>
							</tbody>
						</table>
					</div>
				<% } %>
			</div>
		</div>

		<!-- TAB 6: Insurance & Billing -->
		<div class="tab-pane fade <%= "insurance".equals(activeTab) ? "show active" : "" %>" id="insurance" role="tabpanel">
			<!-- Insurance Hero / Coverage Overview Banner -->
			<div class="insurance-hero-banner">
				<div class="row align-items-center">
					<div class="col-lg-8">
						<div class="d-flex flex-wrap align-items-center gap-2 mb-2">
							<span class="provider-chip">
								<i class="fa-solid fa-shield-halved text-warning"></i>
								<%= insurance != null ? insurance.getProviderName() : "No Provider Linked" %>
							</span>
							<span class="badge rounded-pill bg-success px-3 py-2">
								<i class="fa-solid fa-circle-check me-1"></i> <%= insurance != null ? insurance.getStatus() : "INACTIVE" %>
							</span>
							<span class="badge rounded-pill bg-info text-dark px-3 py-2">
								<i class="fa-solid fa-network-wired me-1"></i> <%= insurance != null ? insurance.getNetworkType() : "PPO Network" %>
							</span>
						</div>
						<h3 class="fw-bold mb-1 text-white">
							<%= insurance != null && insurance.getCoverageType() != null ? insurance.getCoverageType() : "Comprehensive Health Insurance Cover" %>
						</h3>
						<div class="d-flex flex-wrap gap-3 text-white-50 small mt-2">
							<span><strong class="text-white">Policy #:</strong> <%= insurance != null ? insurance.getPolicyNumber() : "N/A" %></span>
							<span><strong class="text-white">Group #:</strong> <%= insurance != null ? insurance.getGroupNumber() : "N/A" %></span>
							<span><strong class="text-white">Policyholder:</strong> <%= insurance != null ? insurance.getPolicyHolderName() : user.getFullName() %> (<%= insurance != null ? insurance.getRelationship() : "Self" %>)</span>
							<span><strong class="text-white">Valid:</strong> <%= insurance != null ? insurance.getValidityDisplay() : "Active" %></span>
						</div>
					</div>
					<div class="col-lg-4 text-lg-end mt-3 mt-lg-0">
						<div class="d-flex flex-column flex-sm-row flex-lg-column gap-2 justify-content-lg-end">
							<button type="button" class="btn btn-light rounded-pill px-4 py-2 fw-bold text-dark shadow-sm" data-bs-toggle="modal" data-bs-target="#linkInsuranceModal">
								<i class="fa-solid fa-pen-to-square text-cyan me-1"></i> <%= insurance != null ? "Update Policy Details" : "Link Insurance Provider" %>
							</button>
							<button type="button" class="btn btn-oreo-coral rounded-pill px-4 py-2 fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#submitClaimModal">
								<i class="fa-solid fa-file-circle-plus me-1"></i> Submit New Claim
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Financial Metric Cards (4 cards) -->
			<div class="row g-3 mb-4">
				<!-- Total Sum Insured -->
				<div class="col-md-3 col-sm-6">
					<div class="financial-metric-card">
						<div class="d-flex justify-content-between align-items-center text-muted small mb-2">
							<span class="text-uppercase fw-bold">Sum Insured</span>
							<i class="fa-solid fa-umbrella text-cyan fs-5"></i>
						</div>
						<h3 class="fw-bold text-dark mb-1">
							<%= insurance != null ? currencyFmt.format(insurance.getSumInsured()) : "$500,000.00" %>
						</h3>
						<span class="text-success small fw-semibold">
							<i class="fa-solid fa-check-double me-1"></i> Cashless Hospitalization
						</span>
					</div>
				</div>

				<!-- Deductible Progress -->
				<div class="col-md-3 col-sm-6">
					<div class="financial-metric-card">
						<div class="d-flex justify-content-between align-items-center text-muted small mb-2">
							<span class="text-uppercase fw-bold">Deductible Met</span>
							<i class="fa-solid fa-chart-pie text-primary fs-5"></i>
						</div>
						<h3 class="fw-bold text-dark mb-1">
							<%= insurance != null ? currencyFmt.format(insurance.getDeductibleMet()) : "$450.00" %>
						</h3>
						<div class="progress my-2" style="height: 6px;">
							<%
								int dedPct = insurance != null ? insurance.getDeductibleMetPercentage() : 30;
							%>
							<div class="progress-bar bg-primary" role="progressbar" style="width: <%= dedPct %>%;" aria-valuenow="<%= dedPct %>" aria-valuemin="0" aria-valuemax="100"></div>
						</div>
						<div class="d-flex justify-content-between fs-8 text-muted">
							<span><%= dedPct %>% of <%= insurance != null ? currencyFmt.format(insurance.getDeductibleTotal()) : "$1,500.00" %></span>
							<span><%= insurance != null ? currencyFmt.format(insurance.getDeductibleRemaining()) : "$1,050.00" %> left</span>
						</div>
					</div>
				</div>

				<!-- Co-Pay Percentage -->
				<div class="col-md-3 col-sm-6">
					<div class="financial-metric-card">
						<div class="d-flex justify-content-between align-items-center text-muted small mb-2">
							<span class="text-uppercase fw-bold">Co-Pay Rate</span>
							<i class="fa-solid fa-hand-holding-dollar text-warning fs-5"></i>
						</div>
						<h3 class="fw-bold text-dark mb-1">
							<%= insurance != null ? insurance.getCopayPercent() : 10 %>%
						</h3>
						<span class="text-muted small">
							<i class="fa-solid fa-shield-virus text-warning me-1"></i> In-Network Hospital Rate
						</span>
					</div>
				</div>

				<!-- Out-of-Pocket Maximum -->
				<div class="col-md-3 col-sm-6">
					<div class="financial-metric-card">
						<div class="d-flex justify-content-between align-items-center text-muted small mb-2">
							<span class="text-uppercase fw-bold">Out-of-Pocket Max</span>
							<i class="fa-solid fa-shield-heart text-danger fs-5"></i>
						</div>
						<h3 class="fw-bold text-dark mb-1">
							<%= insurance != null ? currencyFmt.format(insurance.getOutOfPocketMax()) : "$4,000.00" %>
						</h3>
						<span class="text-muted small">
							<i class="fa-solid fa-lock text-success me-1"></i> Annual Patient Safety Cap
						</span>
					</div>
				</div>
			</div>

			<!-- Claims Tracking Section -->
			<div class="profile-card">
				<div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
					<div>
						<h5 class="fw-bold mb-1 text-dark">
							<i class="fa-solid fa-list-check text-cyan me-2"></i> Pending & Historical Insurance Claims
						</h5>
						<span class="text-muted small">Real-time settlement status, audits, and insurance disbursements</span>
					</div>
					<div class="d-flex gap-2">
						<span class="badge bg-light text-dark border rounded-pill px-3 py-2">
							<%= claimList.size() %> Claims Filed
						</span>
					</div>
				</div>

				<% if (claimList.isEmpty()) { %>
					<div class="text-center py-5">
						<i class="fa-solid fa-file-invoice fs-1 text-muted opacity-50 mb-3"></i>
						<h5 class="fw-bold text-dark">No insurance claims filed yet</h5>
						<p class="text-muted small mb-3">Submit hospital bills, consultation receipts, or pharmacy invoices to file a cashless or reimbursement claim.</p>
						<button type="button" class="btn btn-oreo-cyan rounded-pill px-4 py-2" data-bs-toggle="modal" data-bs-target="#submitClaimModal">
							<i class="fa-solid fa-plus me-1"></i> Submit First Claim
						</button>
					</div>
				<% } else { %>
					<div class="row g-4">
						<% for (InsuranceClaim claim : claimList) { %>
							<div class="col-12">
								<div class="p-3 bg-light rounded-4 border">
									<!-- Claim Header Bar -->
									<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-2 border-bottom">
										<div>
											<span class="fw-bold text-dark fs-6 me-2">
												<i class="fa-solid fa-receipt text-cyan me-1"></i> <%= claim.getClaimNumber() %>
											</span>
											<span class="badge rounded-pill <%= claim.getStatusBadgeClass() %> px-3 py-1 fs-8">
												<%= claim.getClaimStatus() %>
											</span>
										</div>
										<div class="text-muted small">
											<i class="fa-regular fa-calendar-days me-1"></i> Service Date: <strong><%= claim.getServiceDate() %></strong>
										</div>
									</div>

									<!-- Hospital & Procedure details -->
									<div class="row g-3 mb-3">
										<div class="col-md-4">
											<div class="text-muted fs-8 text-uppercase fw-bold">Hospital / Healthcare Provider</div>
											<div class="fw-bold text-dark fs-7"><%= claim.getHospitalOrClinic() %></div>
											<div class="text-muted fs-8">Insurer: <%= claim.getProviderName() %></div>
										</div>
										<div class="col-md-5">
											<div class="text-muted fs-8 text-uppercase fw-bold">Treatment / Procedure</div>
											<div class="text-dark fs-7"><%= claim.getTreatmentDescription() %></div>
											<% if (claim.getRemarks() != null && !claim.getRemarks().isEmpty()) { %>
												<div class="text-muted fs-8 mt-1"><em>TPA Note: <%= claim.getRemarks() %></em></div>
											<% } %>
										</div>
										<div class="col-md-3 text-md-end">
											<div class="text-muted fs-8 text-uppercase fw-bold">Billed Amount</div>
											<div class="fw-bold text-dark fs-5"><%= currencyFmt.format(claim.getTotalBilledAmount()) %></div>
											<div class="text-success fs-8">Covered: <%= currencyFmt.format(claim.getInsuranceCoveredAmount()) %></div>
											<div class="text-muted fs-8">Patient Copay: <%= currencyFmt.format(claim.getPatientResponsibility()) %></div>
										</div>
									</div>

									<!-- 5-Step Visual Stepper for Claim Lifecycle -->
									<div class="claim-stepper px-2 pt-2">
										<%
											int step = claim.getTimelineStep();
											boolean isRej = "REJECTED".equalsIgnoreCase(claim.getClaimStatus());
										%>
										<div class="step-node <%= step >= 1 ? "completed" : "" %>">
											<div class="step-circle"><i class="fa-solid fa-file-import"></i></div>
											<div class="step-label">Submitted</div>
										</div>
										<div class="step-node <%= step >= 2 ? "completed" : (step == 1 ? "active" : "") %>">
											<div class="step-circle"><i class="fa-solid fa-magnifying-glass-chart"></i></div>
											<div class="step-label">Under Audit</div>
										</div>
										<div class="step-node <%= step >= 3 ? "completed" : (step == 2 ? "active" : "") %>">
											<div class="step-circle"><i class="fa-solid fa-gears"></i></div>
											<div class="step-label">Processing</div>
										</div>
										<div class="step-node <%= isRej ? "rejected" : (step >= 4 ? "completed" : (step == 3 ? "active" : "")) %>">
											<div class="step-circle">
												<i class="fa-solid <%= isRej ? "fa-xmark" : "fa-clipboard-check" %>"></i>
											</div>
											<div class="step-label"><%= isRej ? "Rejected" : "Approved" %></div>
										</div>
										<div class="step-node <%= step >= 5 ? "completed" : (step == 4 ? "active" : "") %>">
											<div class="step-circle"><i class="fa-solid fa-building-columns"></i></div>
											<div class="step-label">Settled</div>
										</div>
									</div>
								</div>
							</div>
						<% } %>
					</div>
				<% } %>
			</div>
		</div>

	</div>
</div>

<!-- Modal 1: Add Medical History Item -->
<div class="modal fade" id="addHistoryModal" tabindex="-1" aria-labelledby="addHistoryModalLabel" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered">
		<div class="modal-content rounded-4 border-0 shadow">
			<form action="medicalHistory" method="post">
				<input type="hidden" name="action" value="add">
				<div class="modal-header border-bottom-0 pb-0">
					<h5 class="modal-title fw-bold" id="addHistoryModalLabel">
						<i class="fa-solid fa-notes-medical text-primary me-2"></i> Log Medical History Record
					</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<div class="mb-3">
						<label class="form-label fw-bold small text-muted">Category</label>
						<select name="category" id="historyCategorySelect" class="form-select rounded-pill px-3" required>
							<option value="CHRONIC_CONDITION">Chronic Condition (e.g. Diabetes, Hypertension)</option>
							<option value="ALLERGY">Allergy / Sensitivity (e.g. Penicillin, Peanuts)</option>
							<option value="SURGERY">Past Surgery / Surgical Procedure</option>
						</select>
					</div>

					<div class="mb-3">
						<label class="form-label fw-bold small text-muted">Condition / Allergy / Surgery Name</label>
						<input type="text" name="title" class="form-control rounded-pill px-3" placeholder="e.g. Type 2 Diabetes, Penicillin Allergy, Appendectomy" required>
					</div>

					<div class="row g-2 mb-3">
						<div class="col-6">
							<label class="form-label fw-bold small text-muted">Diagnosed Date / Year</label>
							<input type="text" name="diagnosedYearOrDate" class="form-control rounded-pill px-3" placeholder="e.g. 2021 or 15-Mar-2022">
						</div>
						<div class="col-6">
							<label class="form-label fw-bold small text-muted">Severity</label>
							<select name="severity" class="form-select rounded-pill px-3">
								<option value="Mild">Mild</option>
								<option value="Moderate" selected>Moderate</option>
								<option value="Severe">Severe</option>
								<option value="Critical">Critical</option>
							</select>
						</div>
					</div>

					<div class="mb-2">
						<label class="form-label fw-bold small text-muted">Clinical Notes & Ongoing Medications</label>
						<textarea name="notes" class="form-control rounded-3" rows="3" placeholder="Medications, triggers, or specific surgical notes for your doctor..."></textarea>
					</div>
				</div>
				<div class="modal-footer border-top-0 pt-0">
					<button type="button" class="btn btn-light rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
					<button type="submit" class="btn btn-oreo-cyan rounded-pill px-4">Save to Medical History</button>
				</div>
			</form>
		</div>
	</div>
</div>

<!-- Modal 2: Upload Document -->
<div class="modal fade" id="uploadDocModal" tabindex="-1" aria-labelledby="uploadDocModalLabel" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered">
		<div class="modal-content rounded-4 border-0 shadow">
			<form action="patientDocument" method="post" enctype="multipart/form-data">
				<input type="hidden" name="action" value="upload">
				<div class="modal-header border-bottom-0 pb-0">
					<h5 class="modal-title fw-bold" id="uploadDocModalLabel">
						<i class="fa-solid fa-cloud-arrow-up text-coral me-2"></i> Upload to Medical Vault
					</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<div class="mb-3">
						<label class="form-label fw-bold small text-muted">Document Type</label>
						<select name="documentType" class="form-select rounded-pill px-3" required>
							<option value="Prescription">Prescription</option>
							<option value="Lab Report">Laboratory / Blood Test Report</option>
							<option value="Discharge Summary">Discharge Summary / Hospital Record</option>
							<option value="Radiology / X-Ray">Radiology / X-Ray / MRI / CT</option>
							<option value="Other">Other Medical Record</option>
						</select>
					</div>

					<div class="mb-3">
						<label class="form-label fw-bold small text-muted">Document Title</label>
						<input type="text" name="title" class="form-control rounded-pill px-3" placeholder="e.g. Dr. Sharma Prescription - Oct 2026" required>
					</div>

					<div class="mb-3">
						<label class="form-label fw-bold small text-muted">Select File (PDF, Images, DOC up to 15MB)</label>
						<input type="file" name="documentFile" class="form-control rounded-pill px-3" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required>
					</div>

					<div class="mb-2">
						<label class="form-label fw-bold small text-muted">Notes / Clinical Description</label>
						<textarea name="notes" class="form-control rounded-3" rows="2" placeholder="Brief note about this medical document..."></textarea>
					</div>
				</div>
				<div class="modal-footer border-top-0 pt-0">
					<button type="button" class="btn btn-light rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
					<button type="submit" class="btn btn-oreo-coral rounded-pill px-4">Upload Securely</button>
				</div>
			</form>
		</div>
	</div>
</div>

<!-- Modal 3: Log New Vitals Reading -->
<div class="modal fade" id="logVitalModal" tabindex="-1" aria-labelledby="logVitalModalLabel" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered">
		<div class="modal-content rounded-4 border-0 shadow">
			<form action="patientVitals" method="post">
				<div class="modal-header border-bottom-0 pb-0">
					<h5 class="modal-title fw-bold" id="logVitalModalLabel">
						<i class="fa-solid fa-heart-pulse text-danger me-2"></i> Log New Vital Signs Reading
					</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<p class="text-muted small mb-3">Record your latest physiological measurements to update your health trend analytics.</p>

					<div class="mb-3">
						<label class="form-label fw-bold small text-muted">Reading Date</label>
						<input type="date" name="recordedDate" class="form-control rounded-pill px-3" value="<%= new java.text.SimpleDateFormat("yyyy-MM-dd").format(new java.util.Date()) %>" required>
					</div>

					<div class="row g-2 mb-3">
						<div class="col-6">
							<label class="form-label fw-bold small text-muted">Heart Rate (BPM)</label>
							<div class="input-group">
								<input type="number" name="heartRate" class="form-control rounded-start-pill px-3" placeholder="e.g. 72" min="30" max="220" required>
								<span class="input-group-text rounded-end-pill small text-muted">BPM</span>
							</div>
						</div>
						<div class="col-6">
							<label class="form-label fw-bold small text-muted">Weight (kg)</label>
							<div class="input-group">
								<input type="number" step="0.1" name="weight" class="form-control rounded-start-pill px-3" placeholder="e.g. 70.5" min="20" max="300">
								<span class="input-group-text rounded-end-pill small text-muted">kg</span>
							</div>
						</div>
					</div>

					<div class="row g-2 mb-3">
						<div class="col-6">
							<label class="form-label fw-bold small text-muted">BP Systolic</label>
							<div class="input-group">
								<input type="number" name="bloodPressureSystolic" class="form-control rounded-start-pill px-3" placeholder="e.g. 120" min="60" max="250">
								<span class="input-group-text rounded-end-pill small text-muted">mmHg</span>
							</div>
						</div>
						<div class="col-6">
							<label class="form-label fw-bold small text-muted">BP Diastolic</label>
							<div class="input-group">
								<input type="number" name="bloodPressureDiastolic" class="form-control rounded-start-pill px-3" placeholder="e.g. 80" min="40" max="150">
								<span class="input-group-text rounded-end-pill small text-muted">mmHg</span>
							</div>
						</div>
					</div>

					<div class="row g-2 mb-3">
						<div class="col-6">
							<label class="form-label fw-bold small text-muted">Blood Glucose</label>
							<div class="input-group">
								<input type="number" name="bloodGlucose" class="form-control rounded-start-pill px-3" placeholder="e.g. 95" min="40" max="600">
								<span class="input-group-text rounded-end-pill small text-muted">mg/dL</span>
							</div>
						</div>
						<div class="col-6">
							<label class="form-label fw-bold small text-muted">Oxygen Saturation</label>
							<div class="input-group">
								<input type="number" name="oxygenSaturation" class="form-control rounded-start-pill px-3" placeholder="e.g. 99" min="70" max="100">
								<span class="input-group-text rounded-end-pill small text-muted">% SpO2</span>
							</div>
						</div>
					</div>

					<div class="row g-2 mb-3">
						<div class="col-6">
							<label class="form-label fw-bold small text-muted">Body Temperature</label>
							<div class="input-group">
								<input type="number" step="0.1" name="temperature" class="form-control rounded-start-pill px-3" placeholder="e.g. 98.6" min="90" max="110">
								<span class="input-group-text rounded-end-pill small text-muted">°F</span>
							</div>
						</div>
						<div class="col-6">
							<label class="form-label fw-bold small text-muted">Reading Context</label>
							<input type="text" name="notes" class="form-control rounded-pill px-3" placeholder="e.g. Resting morning">
						</div>
					</div>
				</div>
				<div class="modal-footer border-top-0 pt-0">
					<button type="button" class="btn btn-light rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
					<button type="submit" class="btn btn-oreo-cyan rounded-pill px-4">Save Vital Entry</button>
				</div>
			</form>
		</div>
	</div>
</div>

<!-- Modal 4: Link / Update Insurance Provider -->
<div class="modal fade" id="linkInsuranceModal" tabindex="-1" aria-labelledby="linkInsuranceModalLabel" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered modal-lg">
		<div class="modal-content rounded-4 border-0 shadow">
			<form action="linkInsurance" method="post">
				<div class="modal-header border-bottom-0 pb-0">
					<h5 class="modal-title fw-bold" id="linkInsuranceModalLabel">
						<i class="fa-solid fa-shield-halved text-warning me-2"></i> Link & Manage Health Insurance Policy
					</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<p class="text-muted small mb-3">Link your health insurance provider to enable cashless approvals, verify network benefits, and file direct claims.</p>

					<div class="row g-3 mb-3">
						<div class="col-md-6">
							<label class="form-label fw-bold small text-muted">Insurance Provider Name</label>
							<input type="text" name="providerName" class="form-control rounded-pill px-3" list="providerOptions" placeholder="e.g. Star Health & Allied Insurance" value="<%= insurance != null ? insurance.getProviderName() : "Star Health & Allied Insurance" %>" required>
							<datalist id="providerOptions">
								<option value="Star Health & Allied Insurance">
								<option value="BlueCross BlueShield">
								<option value="UnitedHealthcare">
								<option value="HDFC ERGO Health">
								<option value="Care Health Insurance">
								<option value="Cigna Global">
								<option value="Aetna Health">
								<option value="Max Bupa / Niva Bupa">
								<option value="Kaiser Permanente">
							</datalist>
						</div>
						<div class="col-md-6">
							<label class="form-label fw-bold small text-muted">Policy / Member ID</label>
							<input type="text" name="policyNumber" class="form-control rounded-pill px-3" placeholder="e.g. POL-89214798" value="<%= insurance != null ? insurance.getPolicyNumber() : "" %>" required>
						</div>
						<div class="col-md-6">
							<label class="form-label fw-bold small text-muted">Group / Employer Number</label>
							<input type="text" name="groupNumber" class="form-control rounded-pill px-3" placeholder="e.g. GRP-44021" value="<%= insurance != null && insurance.getGroupNumber() != null ? insurance.getGroupNumber() : "" %>">
						</div>
						<div class="col-md-6">
							<label class="form-label fw-bold small text-muted">Policyholder Full Name</label>
							<input type="text" name="policyHolderName" class="form-control rounded-pill px-3" value="<%= insurance != null && insurance.getPolicyHolderName() != null ? insurance.getPolicyHolderName() : user.getFullName() %>" required>
						</div>
						<div class="col-md-4">
							<label class="form-label fw-bold small text-muted">Relationship to Policyholder</label>
							<select name="relationship" class="form-select rounded-pill px-3">
								<option value="Self" <%= insurance != null && "Self".equalsIgnoreCase(insurance.getRelationship()) ? "selected" : "" %>>Self (Primary Insured)</option>
								<option value="Spouse" <%= insurance != null && "Spouse".equalsIgnoreCase(insurance.getRelationship()) ? "selected" : "" %>>Spouse</option>
								<option value="Child" <%= insurance != null && "Child".equalsIgnoreCase(insurance.getRelationship()) ? "selected" : "" %>>Child / Dependent</option>
								<option value="Parent" <%= insurance != null && "Parent".equalsIgnoreCase(insurance.getRelationship()) ? "selected" : "" %>>Parent</option>
							</select>
						</div>
						<div class="col-md-4">
							<label class="form-label fw-bold small text-muted">Policy Start Date</label>
							<input type="date" name="startDate" class="form-control rounded-pill px-3" value="<%= insurance != null && insurance.getStartDate() != null ? insurance.getStartDate() : "2026-01-01" %>">
						</div>
						<div class="col-md-4">
							<label class="form-label fw-bold small text-muted">Policy Expiry / Renewal Date</label>
							<input type="date" name="expiryDate" class="form-control rounded-pill px-3" value="<%= insurance != null && insurance.getExpiryDate() != null ? insurance.getExpiryDate() : "2026-12-31" %>">
						</div>
					</div>

					<div class="p-3 bg-light rounded-3 mb-3 border">
						<h6 class="fw-bold text-dark small mb-3"><i class="fa-solid fa-coins text-cyan me-1"></i> Coverage & Cost Sharing Breakdown</h6>
						<div class="row g-3">
							<div class="col-md-4">
								<label class="form-label fw-bold small text-muted">Total Sum Insured ($)</label>
								<input type="number" step="1000" name="sumInsured" class="form-control rounded-pill px-3" value="<%= insurance != null ? (long)insurance.getSumInsured() : 500000 %>">
							</div>
							<div class="col-md-4">
								<label class="form-label fw-bold small text-muted">Annual Deductible ($)</label>
								<input type="number" step="100" name="deductibleTotal" class="form-control rounded-pill px-3" value="<%= insurance != null ? (long)insurance.getDeductibleTotal() : 1500 %>">
							</div>
							<div class="col-md-4">
								<label class="form-label fw-bold small text-muted">Deductible Met To-Date ($)</label>
								<input type="number" step="50" name="deductibleMet" class="form-control rounded-pill px-3" value="<%= insurance != null ? (long)insurance.getDeductibleMet() : 450 %>">
							</div>
							<div class="col-md-4">
								<label class="form-label fw-bold small text-muted">Co-Pay Rate (%)</label>
								<div class="input-group">
									<input type="number" name="copayPercent" class="form-control rounded-start-pill px-3" value="<%= insurance != null ? insurance.getCopayPercent() : 10 %>" min="0" max="50">
									<span class="input-group-text rounded-end-pill small text-muted">%</span>
								</div>
							</div>
							<div class="col-md-4">
								<label class="form-label fw-bold small text-muted">Out-of-Pocket Max ($)</label>
								<input type="number" step="100" name="outOfPocketMax" class="form-control rounded-pill px-3" value="<%= insurance != null ? (long)insurance.getOutOfPocketMax() : 4000 %>">
							</div>
							<div class="col-md-4">
								<label class="form-label fw-bold small text-muted">Network Type</label>
								<select name="networkType" class="form-select rounded-pill px-3">
									<option value="In-Network PPO" <%= insurance != null && "In-Network PPO".equalsIgnoreCase(insurance.getNetworkType()) ? "selected" : "" %>>In-Network PPO</option>
									<option value="HMO Network" <%= insurance != null && "HMO Network".equalsIgnoreCase(insurance.getNetworkType()) ? "selected" : "" %>>HMO Network</option>
									<option value="POS Tier 1" <%= insurance != null && "POS Tier 1".equalsIgnoreCase(insurance.getNetworkType()) ? "selected" : "" %>>POS Tier 1</option>
									<option value="Comprehensive Open" <%= insurance != null && "Comprehensive Open".equalsIgnoreCase(insurance.getNetworkType()) ? "selected" : "" %>>Comprehensive Open</option>
								</select>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer border-top-0 pt-0">
					<button type="button" class="btn btn-light rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
					<button type="submit" class="btn btn-oreo-cyan rounded-pill px-4">Save & Link Insurance</button>
				</div>
			</form>
		</div>
	</div>
</div>

<!-- Modal 5: Submit New Insurance Claim -->
<div class="modal fade" id="submitClaimModal" tabindex="-1" aria-labelledby="submitClaimModalLabel" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered">
		<div class="modal-content rounded-4 border-0 shadow">
			<form action="submitInsuranceClaim" method="post">
				<div class="modal-header border-bottom-0 pb-0">
					<h5 class="modal-title fw-bold" id="submitClaimModalLabel">
						<i class="fa-solid fa-file-circle-plus text-coral me-2"></i> Submit Insurance Claim
					</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<p class="text-muted small mb-3">Submit your hospital, pharmacy, or consultation bills for reimbursement or cashless claim tracking.</p>

					<div class="mb-3">
						<label class="form-label fw-bold small text-muted">Hospital / Clinic / Provider Name</label>
						<input type="text" name="hospitalOrClinic" class="form-control rounded-pill px-3" placeholder="e.g. Iryotek Central Hospital, Mumbai" required>
					</div>

					<div class="mb-3">
						<label class="form-label fw-bold small text-muted">Treatment / Procedure Description</label>
						<input type="text" name="treatmentDescription" class="form-control rounded-pill px-3" placeholder="e.g. Cardiology OPD Consultation & 2D Echo" required>
					</div>

					<div class="row g-2 mb-3">
						<div class="col-6">
							<label class="form-label fw-bold small text-muted">Date of Service</label>
							<input type="date" name="serviceDate" class="form-control rounded-pill px-3" value="<%= new java.text.SimpleDateFormat("yyyy-MM-dd").format(new java.util.Date()) %>" required>
						</div>
						<div class="col-6">
							<label class="form-label fw-bold small text-muted">Total Billed Amount ($)</label>
							<div class="input-group">
								<span class="input-group-text rounded-start-pill small text-muted">$</span>
								<input type="number" step="0.01" name="totalBilledAmount" class="form-control rounded-end-pill px-3" placeholder="e.g. 850.00" required>
							</div>
						</div>
					</div>

					<div class="mb-2">
						<label class="form-label fw-bold small text-muted">Medical Notes & Bill Summary</label>
						<textarea name="remarks" class="form-control rounded-3" rows="3" placeholder="Optional details regarding doctor consultation, prescription bills, or admission reason..."></textarea>
					</div>
				</div>
				<div class="modal-footer border-top-0 pt-0">
					<button type="button" class="btn btn-light rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
					<button type="submit" class="btn btn-oreo-coral rounded-pill px-4">Submit Claim for Review</button>
				</div>
			</form>
		</div>
	</div>
</div>

<%@include file="component/footer.jsp"%>

<%
	StringBuilder vitalsJson = new StringBuilder("[");
	for (int i = 0; i < vitalsList.size(); i++) {
		PatientVital v = vitalsList.get(i);
		vitalsJson.append("{")
			.append("\"id\":").append(v.getId()).append(",")
			.append("\"date\":\"").append(v.getRecordedDate() != null ? v.getRecordedDate() : "").append("\",")
			.append("\"heartRate\":").append(v.getHeartRate()).append(",")
			.append("\"systolic\":").append(v.getBloodPressureSystolic()).append(",")
			.append("\"diastolic\":").append(v.getBloodPressureDiastolic()).append(",")
			.append("\"weight\":").append(v.getWeight()).append(",")
			.append("\"glucose\":").append(v.getBloodGlucose()).append(",")
			.append("\"spo2\":").append(v.getOxygenSaturation()).append(",")
			.append("\"temp\":").append(v.getTemperature()).append(",")
			.append("\"notes\":\"").append(v.getNotes() != null ? v.getNotes().replace("\"", "\\\"").replace("\n", " ").replace("\r", "") : "").append("\"")
			.append("}");
		if (i < vitalsList.size() - 1) vitalsJson.append(",");
	}
	vitalsJson.append("]");
%>

<script>
window.initialVitalsData = <%= vitalsJson.toString() %>;

function openAddHistoryModal(category) {
	var select = document.getElementById("historyCategorySelect");
	if (select && category) {
		select.value = category;
	}
	var modalEl = document.getElementById('addHistoryModal');
	var modal = new bootstrap.Modal(modalEl);
	modal.show();
}

// Ensure Recharts recalculates dimensions when user switches to vitals tab
document.addEventListener('DOMContentLoaded', function() {
	var vitalsTabBtn = document.getElementById('vitals-tab');
	if (vitalsTabBtn) {
		vitalsTabBtn.addEventListener('shown.bs.tab', function() {
			setTimeout(function() {
				window.dispatchEvent(new Event('resize'));
			}, 50);
		});
	}
});
</script>

<!-- Recharts React Component for Health Trends Dashboard -->
<script type="text/babel">
const { useState, useEffect } = React;
const {
	ResponsiveContainer,
	AreaChart,
	Area,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ReferenceLine,
	Legend
} = window.Recharts || {};

const ClinicalCustomTooltip = ({ active, payload, label, activeMetric }) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="recharts-custom-tooltip">
				<div className="fw-bold mb-1 border-bottom pb-1" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
					<i className="fa-regular fa-calendar-check me-1 text-info"></i> {label}
				</div>
				{activeMetric === 'heartRate' && (
					<div>
						<div className="text-danger fw-bold fs-6">
							<i className="fa-solid fa-heart-pulse me-1"></i> {data.heartRate} BPM
						</div>
						<div className="text-white-50 fs-8 mt-1">Normal Resting: 60 - 100 BPM</div>
					</div>
				)}
				{activeMetric === 'bloodPressure' && (
					<div>
						<div className="text-primary fw-bold fs-6">
							<i className="fa-solid fa-stethoscope me-1"></i> {data.systolic}/{data.diastolic} mmHg
						</div>
						<div className="text-white-50 fs-8 mt-1">Optimal Target: &lt;120/80 mmHg</div>
					</div>
				)}
				{activeMetric === 'weight' && (
					<div>
						<div className="text-success fw-bold fs-6">
							<i className="fa-solid fa-weight-scale me-1"></i> {data.weight} kg
						</div>
						<div className="text-white-50 fs-8 mt-1">Target BMI: 18.5 - 24.9</div>
					</div>
				)}
				{activeMetric === 'glucose' && (
					<div>
						<div className="text-warning fw-bold fs-6">
							<i className="fa-solid fa-droplet me-1"></i> {data.glucose} mg/dL
						</div>
						<div className="text-white-50 fs-8 mt-1">Fasting Normal: 70 - 99 mg/dL</div>
					</div>
				)}
				{activeMetric === 'spo2' && (
					<div>
						<div className="text-info fw-bold fs-6">
							<i className="fa-solid fa-lungs me-1"></i> {data.spo2}% SpO2
						</div>
						<div className="text-pink fw-semibold fs-8" style={{ color: '#ec4899' }}>
							<i className="fa-solid fa-temperature-half me-1"></i> {data.temp} °F
						</div>
						<div className="text-white-50 fs-8 mt-1">Optimal Saturation: &ge; 95%</div>
					</div>
				)}
				{data.notes && (
					<div className="text-white-50 fs-8 mt-1 fst-italic">
						Note: {data.notes}
					</div>
				)}
			</div>
		);
	}
	return null;
};

const HealthTrendsDashboard = () => {
	const [activeMetric, setActiveMetric] = useState('heartRate');
	const [vitalsData, setVitalsData] = useState(window.initialVitalsData || []);

	useEffect(() => {
		const controlButtons = document.querySelectorAll('#vitals-metric-controls .metric-selector-btn');
		controlButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				controlButtons.forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				const metric = btn.getAttribute('data-metric');
				if (metric) {
					setActiveMetric(metric);
				}
			});
		});
	}, []);

	if (!window.Recharts || !ResponsiveContainer) {
		return (
			<div className="alert alert-warning">
				Recharts library is initializing...
			</div>
		);
	}

	if (!vitalsData || vitalsData.length === 0) {
		return (
			<div className="text-center py-5 text-muted">
				<i className="fa-solid fa-chart-line fs-1 mb-2 opacity-50"></i>
				<p>No historical vitals data recorded yet. Please log your first reading!</p>
			</div>
		);
	}

	return (
		<div style={{ width: '100%', height: 360 }}>
			<ResponsiveContainer width="100%" height="100%">
				{activeMetric === 'bloodPressure' ? (
					<LineChart data={vitalsData} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
						<XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
						<YAxis domain={[50, 160]} stroke="#94a3b8" tick={{ fontSize: 12 }} unit=" mmHg" />
						<Tooltip content={<ClinicalCustomTooltip activeMetric={activeMetric} />} />
						<Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
						<ReferenceLine y={120} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Systolic Limit (120)', fill: '#ef4444', fontSize: 11 }} />
						<ReferenceLine y={80} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'Diastolic Limit (80)', fill: '#3b82f6', fontSize: 11 }} />
						<Line type="monotone" dataKey="systolic" name="Systolic BP" stroke="#0284c7" strokeWidth={3} dot={{ r: 5, fill: '#0284c7' }} activeDot={{ r: 7 }} />
						<Line type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="#00c2cb" strokeWidth={3} dot={{ r: 5, fill: '#00c2cb' }} activeDot={{ r: 7 }} />
					</LineChart>
				) : activeMetric === 'weight' ? (
					<AreaChart data={vitalsData} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
						<defs>
							<linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
								<stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
						<XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
						<YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{ fontSize: 12 }} unit=" kg" />
						<Tooltip content={<ClinicalCustomTooltip activeMetric={activeMetric} />} />
						<Area type="monotone" dataKey="weight" name="Weight (kg)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" dot={{ r: 5, fill: '#10b981' }} activeDot={{ r: 7 }} />
					</AreaChart>
				) : activeMetric === 'glucose' ? (
					<AreaChart data={vitalsData} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
						<defs>
							<linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
								<stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
						<XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
						<YAxis domain={[60, 160]} stroke="#94a3b8" tick={{ fontSize: 12 }} unit=" mg/dL" />
						<Tooltip content={<ClinicalCustomTooltip activeMetric={activeMetric} />} />
						<ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Fasting Upper Limit (100)', fill: '#f59e0b', fontSize: 11 }} />
						<Area type="monotone" dataKey="glucose" name="Blood Glucose" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#glucoseGrad)" dot={{ r: 5, fill: '#f59e0b' }} activeDot={{ r: 7 }} />
					</AreaChart>
				) : activeMetric === 'spo2' ? (
					<LineChart data={vitalsData} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
						<XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
						<YAxis yAxisId="left" domain={[85, 100]} stroke="#6366f1" tick={{ fontSize: 12 }} unit=" %" />
						<YAxis yAxisId="right" orientation="right" domain={[96, 102]} stroke="#ec4899" tick={{ fontSize: 12 }} unit=" °F" />
						<Tooltip content={<ClinicalCustomTooltip activeMetric={activeMetric} />} />
						<Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
						<ReferenceLine yAxisId="left" y={95} stroke="#6366f1" strokeDasharray="4 4" label={{ value: 'SpO2 Optimal (95%)', fill: '#6366f1', fontSize: 11 }} />
						<Line yAxisId="left" type="monotone" dataKey="spo2" name="Oxygen (SpO2 %)" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1' }} activeDot={{ r: 7 }} />
						<Line yAxisId="right" type="monotone" dataKey="temp" name="Temperature (°F)" stroke="#ec4899" strokeWidth={2} dot={{ r: 4, fill: '#ec4899' }} activeDot={{ r: 6 }} strokeDasharray="5 5" />
					</LineChart>
				) : (
					<AreaChart data={vitalsData} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
						<defs>
							<linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
								<stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
						<XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
						<YAxis domain={[50, 120]} stroke="#94a3b8" tick={{ fontSize: 12 }} unit=" BPM" />
						<Tooltip content={<ClinicalCustomTooltip activeMetric={activeMetric} />} />
						<ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Resting Upper (100)', fill: '#ef4444', fontSize: 11 }} />
						<ReferenceLine y={60} stroke="#0284c7" strokeDasharray="4 4" label={{ value: 'Resting Lower (60)', fill: '#0284c7', fontSize: 11 }} />
						<Area type="monotone" dataKey="heartRate" name="Heart Rate (BPM)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#hrGrad)" dot={{ r: 5, fill: '#ef4444' }} activeDot={{ r: 7 }} />
					</AreaChart>
				)}
			</ResponsiveContainer>
		</div>
	);
};

// Render HealthTrendsDashboard into DOM container
const rootElement = document.getElementById('recharts-vitals-root');
if (rootElement && window.ReactDOM) {
	if (ReactDOM.createRoot) {
		const root = ReactDOM.createRoot(rootElement);
		root.render(<HealthTrendsDashboard />);
	} else {
		ReactDOM.render(<HealthTrendsDashboard />, rootElement);
	}
}
</script>
</body>
</html>
