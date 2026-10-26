<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.hms.dao.DoctorDAO"%>
<%@page import="com.hms.dao.BlogDAO"%>
<%@page import="com.hms.entity.Doctor"%>
<%@page import="com.hms.entity.Blog"%>
<%@page import="java.util.List"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@page isELIgnored="false"%>

<%
DoctorDAO indexDocDAO = new DoctorDAO(DBConnection.getConn());
List<Doctor> indexDoctorList = indexDocDAO.getAllDoctor();
List<String> indexDiseaseList = indexDocDAO.getAllDiseases();

BlogDAO indexBlogDAO = new BlogDAO(DBConnection.getConn());
List<Blog> indexBlogList = indexBlogDAO.getAllBlogs();
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Home Page | Iryotek Healthcare</title>
<%@include file="component/allcss.jsp"%>

</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<!-- 1. Hero Section -->
	<section class="oreo-hero-section">
		<div class="container">
			<div class="row align-items-center">
				<div class="col-lg-6 mb-4 mb-lg-0">
					<p class="oreo-hero-sub">Welcome to</p>
					<h1 class="oreo-hero-main">Iryotek <strong>Hospital</strong></h1>
					<p class="oreo-hero-text">
						Experience collision-free queue allocation, secure medical records, and smart appointment scheduling with top-tier healthcare providers.
					</p>
					<a href="user_appointment.jsp" class="btn-oreo-coral">Book Appointment <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
				</div>
				<div class="col-lg-6 text-center d-none d-lg-block">
					<img src="img/hero_doctors.png" alt="Iryotek Doctors Banner" class="img-fluid" style="max-height: 400px;">
				</div>
			</div>
		</div>
	</section>

	<!-- 2. Overlapping "Make an Appointment" Form Card -->
	<div class="container">
		<div class="floating-appointment-card">
			<h5>Make an Appointment</h5>
			
			<c:if test="${not empty successMsg}">
				<div class="alert alert-success alert-dismissible fade show text-center" role="alert">
					<i class="fa-solid fa-circle-check me-2"></i> ${successMsg}
					<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
				</div>
				<c:remove var="successMsg" scope="session" />
			</c:if>
			<c:if test="${not empty errorMsg}">
				<div class="alert alert-danger alert-dismissible fade show text-center" role="alert">
					<i class="fa-solid fa-triangle-exclamation me-2"></i> ${errorMsg}
					<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
				</div>
				<c:remove var="errorMsg" scope="session" />
			</c:if>

			<form action="addAppointment" method="post" class="row g-4 align-items-center">
				<c:if test="${not empty userObj}">
					<input type="hidden" name="userId" value="${userObj.id}">
				</c:if>
				<c:if test="${empty userObj}">
					<input type="hidden" name="userId" value="1">
				</c:if>

				<!-- Row 1: Name, Mobile, Date -->
				<div class="col-lg-4 col-md-4">
					<input type="text" name="fullName" class="form-control oreo-input-pill" placeholder="Enter Name" value="${userObj != null ? userObj.fullName : ''}" required>
				</div>
				<div class="col-lg-4 col-md-4">
					<input type="text" name="phone" class="form-control oreo-input-pill" placeholder="Enter Mobile" required>
				</div>
				<div class="col-lg-4 col-md-4">
					<% 
						java.util.Calendar heroCal = java.util.Calendar.getInstance();
						java.text.SimpleDateFormat heroSdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
						String heroTodayStr = heroSdf.format(heroCal.getTime());
						heroCal.add(java.util.Calendar.DAY_OF_YEAR, 7);
						String heroMaxDateStr = heroSdf.format(heroCal.getTime());
					%>
					<input type="date" name="appointmentDate" id="heroApptDate" min="<%= heroTodayStr %>" max="<%= heroMaxDateStr %>" value="<%= heroTodayStr %>" class="form-control oreo-input-pill" onchange="if(this.value < '<%= heroTodayStr %>') { alert('Cannot select past dates.'); this.value='<%= heroTodayStr %>'; } else if(this.value > '<%= heroMaxDateStr %>') { alert('Appointments can only be booked up to 7 days in advance.'); this.value='<%= heroTodayStr %>'; }" required>
				</div>

				<!-- Row 2: Select Doctor, Select Department, Submit Button -->
				<div class="col-lg-4 col-md-4">
					<select name="doctorNameSelect" class="form-select oreo-input-pill" required>
						<option value="" selected disabled>Select Doctor</option>
						<%
						if (indexDoctorList != null && !indexDoctorList.isEmpty()) {
							int count = 0;
							for (Doctor d : indexDoctorList) {
								if (count++ > 30) break;
						%>
						<option value="<%= d.getId() %>">Dr. <%= d.getFullName() %> (<%= d.getSpecialist() %>)</option>
						<%
							}
						}
						%>
					</select>
				</div>

				<div class="col-lg-4 col-md-4">
					<select name="diseases" class="form-select oreo-input-pill" required>
						<option value="" selected disabled>Select Department</option>
						<%
						if (indexDiseaseList != null && !indexDiseaseList.isEmpty()) {
							for (String dis : indexDiseaseList) {
						%>
						<option value="<%= dis %>"><%= dis %></option>
						<%
							}
						} else {
						%>
						<option value="Cardiology">Cardiology</option>
						<option value="Orthopedics">Orthopedics</option>
						<option value="Neurology">Neurology</option>
						<option value="Dermatology">Dermatology</option>
						<%
						}
						%>
					</select>
				</div>

				<!-- Hidden fallbacks for address/gender/age if submitted from quick form -->
				<input type="hidden" name="gender" value="male">
				<input type="hidden" name="age" value="25">
				<input type="hidden" name="email" value="${userObj != null ? userObj.email : 'patient@example.com'}">
				<input type="hidden" name="address" value="Online Appointment Request">

				<div class="col-lg-4 col-md-4">
					<c:if test="${empty userObj}">
						<a href="user_login.jsp" class="btn-oreo-coral-submit text-decoration-none">Submit</a>
					</c:if>
					<c:if test="${not empty userObj}">
						<button type="submit" class="btn-oreo-coral-submit">Submit</button>
					</c:if>
				</div>
			</form>
		</div>
	</div>

	<!-- 3. Services Section ("Our Best Services") -->
	<section class="py-5 mt-4" id="departments">
		<div class="container py-4">
			<div class="section-accent-header">
				<span class="section-accent-bar">|</span>
				<h2 class="section-accent-title"><span class="section-cyan-text">Our</span> Best Services</h2>
			</div>
			<p class="section-subtitle">Delivering high-precision clinical diagnosis & comprehensive patient care.</p>

			<div class="row g-4 mt-2">
				<!-- Service 1 -->
				<div class="col-md-4">
					<div class="service-item-card">
						<div class="service-item-icon">
							<i class="fa-solid fa-heart-pulse"></i>
						</div>
						<h4 class="service-item-title">Cardio Monitoring</h4>
						<p class="service-item-desc">
							Advanced 24/7 ECG monitoring and non-invasive cardiovascular diagnostics for optimal heart health.
						</p>
						<a href="find_hospitals.jsp" class="service-item-link">View More <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
					</div>
				</div>

				<!-- Service 2 -->
				<div class="col-md-4">
					<div class="service-item-card">
						<div class="service-item-icon">
							<i class="fa-solid fa-microscope"></i>
						</div>
						<h4 class="service-item-title">Orthodontics</h4>
						<p class="service-item-desc">
							Comprehensive dental alignment, structural corrections, and modern cosmetic dentistry procedures.
						</p>
						<a href="find_hospitals.jsp" class="service-item-link">View More <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
					</div>
				</div>

				<!-- Service 3 -->
				<div class="col-md-4">
					<div class="service-item-card">
						<div class="service-item-icon">
							<i class="fa-solid fa-stethoscope"></i>
						</div>
						<h4 class="service-item-title">Traumatology</h4>
						<p class="service-item-desc">
							Emergency trauma care, acute wound management, and rapid surgical response for critical injuries.
						</p>
						<a href="find_hospitals.jsp" class="service-item-link">View More <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
					</div>
				</div>

				<!-- Service 4 -->
				<div class="col-md-4">
					<div class="service-item-card">
						<div class="service-item-icon">
							<i class="fa-solid fa-bandage"></i>
						</div>
						<h4 class="service-item-title">Cardiology</h4>
						<p class="service-item-desc">
							Specialized heart failure management, coronary care unit interventions, and rehabilitation plans.
						</p>
						<a href="find_hospitals.jsp" class="service-item-link">View More <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
					</div>
				</div>

				<!-- Service 5 -->
				<div class="col-md-4">
					<div class="service-item-card">
						<div class="service-item-icon">
							<i class="fa-solid fa-pills"></i>
						</div>
						<h4 class="service-item-title">Prostheses</h4>
						<p class="service-item-desc">
							Custom prosthetic fitting, joint replacement implants, and specialized physical rehabilitation therapies.
						</p>
						<a href="find_hospitals.jsp" class="service-item-link">View More <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
					</div>
				</div>

				<!-- Service 6 -->
				<div class="col-md-4">
					<div class="service-item-card">
						<div class="service-item-icon">
							<i class="fa-solid fa-hand-holding-droplet"></i>
						</div>
						<h4 class="service-item-title">Pulmonary</h4>
						<p class="service-item-desc">
							Respiratory therapy, asthma management, lung capacity testing, and intensive pulmonary care.
						</p>
						<a href="find_hospitals.jsp" class="service-item-link">View More <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- 4. Shader Buttons — Balloon — Interactive Stats Counter Section -->
	<section class="shader-buttons-balloon-stage" id="stats-section">
		<style>
			.shader-buttons-balloon-stage {
				position: relative;
				width: 100%;
				background: #11131d;
				color: #ffffff;
				padding: 70px 0 65px;
				overflow: hidden;
				isolation: isolate;
			}
			.shader-buttons-balloon-stage::before {
				content: "";
				position: absolute;
				inset: 0;
				z-index: 0;
				background:
					radial-gradient(circle at 50% 15%, rgba(99, 102, 241, 0.18), transparent 50%),
					radial-gradient(circle at 15% 85%, rgba(6, 182, 212, 0.12), transparent 45%),
					radial-gradient(circle at 85% 80%, rgba(236, 72, 153, 0.10), transparent 45%),
					linear-gradient(180deg, #0e1019 0%, #11131d 50%, #0b0d14 100%);
				pointer-events: none;
			}
			.balloon-header-pill {
				display: inline-flex;
				align-items: center;
				gap: 8px;
				background: rgba(255, 255, 255, 0.06);
				border: 1px solid rgba(255, 255, 255, 0.14);
				padding: 6px 16px;
				border-radius: 999px;
				font-size: 0.75rem;
				font-weight: 600;
				letter-spacing: 0.18em;
				text-transform: uppercase;
				color: #a5b4fc;
				box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
				margin-bottom: 12px;
			}
			.balloon-header-pill .pulse-dot {
				width: 7px;
				height: 7px;
				border-radius: 50%;
				background: #38bdf8;
				box-shadow: 0 0 10px #38bdf8;
				animation: balloonPulse 2s infinite;
			}
			@keyframes balloonPulse {
				0%, 100% { opacity: 1; transform: scale(1); }
				50% { opacity: 0.4; transform: scale(0.85); }
			}

			/* Balloon Stat Card / Capsule */
			.balloon-stat-card {
				position: relative;
				height: 100%;
				min-height: 180px;
				background: linear-gradient(165deg, rgba(255, 255, 255, 0.08) 0%, rgba(20, 24, 38, 0.85) 45%, rgba(13, 16, 26, 0.95) 100%);
				border-radius: 26px;
				padding: 24px 20px;
				text-align: center;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				overflow: hidden;
				cursor: pointer;
				border: 1px solid rgba(255, 255, 255, 0.16);
				box-shadow:
					inset 0 2px 3px rgba(255, 255, 255, 0.4),
					inset 0 -4px 8px rgba(0, 0, 0, 0.5),
					0 18px 36px -10px rgba(0, 0, 0, 0.7),
					0 0 24px rgba(99, 102, 241, 0.08);
				transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.25, 1),
				            box-shadow 0.45s cubic-bezier(0.2, 0.8, 0.25, 1),
				            border-color 0.45s cubic-bezier(0.2, 0.8, 0.25, 1);
				user-select: none;
			}
			.balloon-stat-card:hover {
				transform: translateY(-6px) scale(1.025);
				border-color: rgba(255, 255, 255, 0.35);
				box-shadow:
					inset 0 3px 5px rgba(255, 255, 255, 0.6),
					inset 0 -5px 10px rgba(0, 0, 0, 0.6),
					0 24px 48px -8px rgba(0, 0, 0, 0.8),
					0 0 35px rgba(99, 102, 241, 0.25);
			}
			.balloon-stat-card:active {
				transform: translateY(2px) scale(0.975);
				box-shadow:
					inset 0 1px 2px rgba(255, 255, 255, 0.2),
					inset 0 4px 12px rgba(0, 0, 0, 0.7),
					0 8px 18px rgba(0, 0, 0, 0.6);
			}
			.balloon-card-canvas {
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
				border-radius: inherit;
				pointer-events: none;
				z-index: 1;
				opacity: 0.85;
				mix-blend-mode: screen;
			}
			.balloon-stat-content {
				position: relative;
				z-index: 2;
				pointer-events: none;
			}
			.balloon-icon-wrap {
				width: 52px;
				height: 52px;
				border-radius: 18px;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 12px;
				font-size: 1.45rem;
				background: rgba(255, 255, 255, 0.06);
				border: 1px solid rgba(255, 255, 255, 0.12);
				box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.25), 0 8px 16px rgba(0, 0, 0, 0.3);
				transition: transform 0.35s ease;
			}
			.balloon-stat-card:hover .balloon-icon-wrap {
				transform: scale(1.12);
			}
			.balloon-stat-number {
				font-size: 2.5rem;
				font-weight: 800;
				letter-spacing: -0.02em;
				line-height: 1.1;
				margin-bottom: 4px;
				color: #ffffff;
				text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
			}
			.balloon-stat-label {
				font-size: 0.9rem;
				font-weight: 600;
				color: #94a3b8;
				letter-spacing: 0.02em;
				margin-bottom: 6px;
			}
			.balloon-stat-tag {
				display: inline-block;
				font-size: 0.68rem;
				font-weight: 600;
				padding: 2px 9px;
				border-radius: 999px;
				background: rgba(255, 255, 255, 0.05);
				border: 1px solid rgba(255, 255, 255, 0.09);
				color: #cbd5e1;
				letter-spacing: 0.04em;
			}

			/* Dedicated Interactive Balloon Shader Button */
			.balloon-button-wrapper {
				display: flex;
				justify-content: center;
				margin-top: 38px;
				position: relative;
				z-index: 2;
			}
			.threeui-balloon-btn {
				position: relative;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				gap: 12px;
				padding: 15px 36px;
				border-radius: 999px;
				background: linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(40, 45, 68, 0.9) 45%, rgba(17, 19, 29, 0.98) 100%);
				border: 1px solid rgba(255, 255, 255, 0.28);
				color: #ffffff;
				font-size: 0.92rem;
				font-weight: 600;
				letter-spacing: 0.08em;
				text-transform: uppercase;
				text-decoration: none;
				box-shadow:
					inset 0 2px 4px rgba(255, 255, 255, 0.55),
					inset 0 -4px 8px rgba(0, 0, 0, 0.6),
					0 18px 36px -8px rgba(0, 0, 0, 0.75),
					0 0 26px rgba(99, 102, 241, 0.35);
				cursor: pointer;
				overflow: hidden;
				transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.25, 1),
				            box-shadow 0.4s cubic-bezier(0.2, 0.8, 0.25, 1),
				            border-color 0.3s ease;
				user-select: none;
			}
			.threeui-balloon-btn canvas {
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
				border-radius: inherit;
				pointer-events: none;
				z-index: 1;
				opacity: 0.9;
				mix-blend-mode: screen;
			}
			.threeui-balloon-btn span {
				position: relative;
				z-index: 2;
				display: inline-flex;
				align-items: center;
				gap: 8px;
			}
			.threeui-balloon-btn:hover {
				color: #ffffff;
				transform: translateY(-4px) scale(1.035);
				border-color: rgba(255, 255, 255, 0.5);
				box-shadow:
					inset 0 3px 6px rgba(255, 255, 255, 0.75),
					inset 0 -5px 10px rgba(0, 0, 0, 0.6),
					0 26px 52px -6px rgba(0, 0, 0, 0.85),
					0 0 45px rgba(99, 102, 241, 0.5);
			}
			.threeui-balloon-btn:active {
				transform: translateY(2px) scale(0.965);
				box-shadow:
					inset 0 1px 2px rgba(255, 255, 255, 0.25),
					inset 0 4px 10px rgba(0, 0, 0, 0.7),
					0 8px 16px rgba(0, 0, 0, 0.6);
			}
		</style>

		<div class="container position-relative" style="z-index: 1;">
			<!-- Header Title Area -->
			<div class="text-center mb-5">
				<div class="balloon-header-pill">
					<span class="pulse-dot"></span>
					ShaderButtons // Balloon Engine
				</div>
				<h2 class="text-white fw-bold display-6 tracking-tight mb-2">
					Precision Healthcare at Planetary Scale
				</h2>
				<p class="text-secondary mx-auto mb-0" style="max-width: 580px; font-size: 0.95rem;">
					Live telemetry from Iryotek's nationwide hospital cluster, verified doctor registry, and AI symptom triage engine.
				</p>
			</div>

			<!-- 4 Balloon Shader Stats Cards -->
			<div class="row g-4">
				<!-- Stat 1: Doctors -->
				<div class="col-lg-3 col-6">
					<div class="balloon-stat-card" data-balloon-theme="cyan">
						<canvas class="balloon-card-canvas"></canvas>
						<div class="balloon-stat-content">
							<div class="balloon-icon-wrap text-info">
								<i class="fa-solid fa-user-doctor"></i>
							</div>
							<div class="balloon-stat-number tabular-nums">
								<span class="stats-counter" data-value="100414" data-suffix="+" data-duration="2" data-decimals="0">0</span>
							</div>
							<div class="balloon-stat-label">Verified Doctors</div>
							<span class="balloon-stat-tag">1,280+ Hospitals</span>
						</div>
					</div>
				</div>

				<!-- Stat 2: Medicines -->
				<div class="col-lg-3 col-6">
					<div class="balloon-stat-card" data-balloon-theme="emerald">
						<canvas class="balloon-card-canvas"></canvas>
						<div class="balloon-stat-content">
							<div class="balloon-icon-wrap text-success">
								<i class="fa-solid fa-pills"></i>
							</div>
							<div class="balloon-stat-number tabular-nums">
								<span class="stats-counter" data-value="23464" data-suffix="+" data-duration="2" data-decimals="0">0</span>
							</div>
							<div class="balloon-stat-label">Medicines Available</div>
							<span class="balloon-stat-tag">Live Inventory</span>
						</div>
					</div>
				</div>

				<!-- Stat 3: AI Triage Latency -->
				<div class="col-lg-3 col-6">
					<div class="balloon-stat-card" data-balloon-theme="amber">
						<canvas class="balloon-card-canvas"></canvas>
						<div class="balloon-stat-content">
							<div class="balloon-icon-wrap text-warning">
								<i class="fa-solid fa-bolt-lightning"></i>
							</div>
							<div class="balloon-stat-number tabular-nums">
								<span class="stats-counter" data-value="50" data-prefix="< " data-suffix="ms" data-duration="1.5" data-decimals="0">0</span>
							</div>
							<div class="balloon-stat-label">Emergency AI Triage</div>
							<span class="balloon-stat-tag">Sub-second Latency</span>
						</div>
					</div>
				</div>

				<!-- Stat 4: Wait Time Reduction -->
				<div class="col-lg-3 col-6">
					<div class="balloon-stat-card" data-balloon-theme="purple">
						<canvas class="balloon-card-canvas"></canvas>
						<div class="balloon-stat-content">
							<div class="balloon-icon-wrap text-primary" style="color: #c084fc !important;">
								<i class="fa-solid fa-clock-rotate-left"></i>
							</div>
							<div class="balloon-stat-number tabular-nums">
								<span class="stats-counter" data-value="70" data-suffix="%" data-duration="1.8" data-decimals="0">0</span>
							</div>
							<div class="balloon-stat-label">OPD Wait Reduced</div>
							<span class="balloon-stat-tag">Smart Collision-Free</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Interactive Shader Button Component (Balloon Variant) -->
			<div class="balloon-button-wrapper">
				<a href="find_hospitals.jsp" class="threeui-balloon-btn" id="interactive-balloon-btn">
					<canvas></canvas>
					<span>
						<i class="fa-solid fa-sparkles text-info"></i>
						<span>Explore Clinical Network</span>
						<i class="fa-solid fa-arrow-right-long fs-6"></i>
					</span>
				</a>
			</div>
		</div>
	</section>

	<!-- 5. Team Section ("Meet Our Team") -->
	<section class="py-5 mt-3" id="team">
		<div class="container py-4">
			<div class="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4">
				<div>
					<div class="section-accent-header">
						<span class="section-accent-bar">|</span>
						<h2 class="section-accent-title"><span class="section-cyan-text">Meet</span> Our Team</h2>
					</div>
					<p class="section-subtitle">Dedicated medical leaders driving clinical excellence across all departments.</p>
				</div>
				<div class="text-secondary fs-7" style="max-width: 420px; line-height: 1.5;">
					<strong>Iryotek Hospital</strong> Our board-certified specialists bring decades of medical expertise and compassionate patient care.
				</div>
			</div>

			<div class="row g-4 mt-2">
				<!-- Doctor 1 -->
				<div class="col-lg-3 col-md-6">
					<div class="doctor-team-card">
						<div class="doctor-img-wrap">
							<img src="img/doc1.jpg" alt="Dr. John">
						</div>
						<div class="doctor-name">Dr. John</div>
						<div class="doctor-specialty">Dentist</div>
						<div class="doctor-socials">
							<a href="https://facebook.com" target="_blank"><i class="fa-brands fa-facebook-f"></i></a>
							<a href="https://twitter.com" target="_blank"><i class="fa-brands fa-twitter"></i></a>
							<a href="https://instagram.com" target="_blank"><i class="fa-brands fa-instagram"></i></a>
						</div>
						<a href="user_appointment.jsp" class="btn-coral-outline">View More</a>
					</div>
				</div>

				<!-- Doctor 2 -->
				<div class="col-lg-3 col-md-6">
					<div class="doctor-team-card">
						<div class="doctor-img-wrap">
							<img src="img/doc2.jpg" alt="Dr. Amelia">
						</div>
						<div class="doctor-name">Dr. Amelia</div>
						<div class="doctor-specialty">Gynecologist</div>
						<div class="doctor-socials">
							<a href="https://twitter.com" target="_blank"><i class="fa-brands fa-twitter"></i></a>
							<a href="https://instagram.com" target="_blank"><i class="fa-brands fa-instagram"></i></a>
						</div>
						<a href="user_appointment.jsp" class="btn-coral-outline">View More</a>
					</div>
				</div>

				<!-- Doctor 3 -->
				<div class="col-lg-3 col-md-6">
					<div class="doctor-team-card">
						<div class="doctor-img-wrap">
							<img src="img/doc3.jpg" alt="Dr. Jack">
						</div>
						<div class="doctor-name">Dr. Jack</div>
						<div class="doctor-specialty">Audiology</div>
						<div class="doctor-socials">
							<a href="https://facebook.com" target="_blank"><i class="fa-brands fa-facebook-f"></i></a>
							<a href="https://twitter.com" target="_blank"><i class="fa-brands fa-twitter"></i></a>
							<a href="https://instagram.com" target="_blank"><i class="fa-brands fa-instagram"></i></a>
							<a href="https://google.com" target="_blank"><i class="fa-brands fa-google-plus-g"></i></a>
						</div>
						<a href="user_appointment.jsp" class="btn-coral-outline">View More</a>
					</div>
				</div>

				<!-- Doctor 4 -->
				<div class="col-lg-3 col-md-6">
					<div class="doctor-team-card">
						<div class="doctor-img-wrap">
							<img src="img/doc4.jpg" alt="Dr. Charlie">
						</div>
						<div class="doctor-name">Dr. Charlie</div>
						<div class="doctor-specialty">Dentist</div>
						<div class="doctor-socials">
							<a href="https://facebook.com" target="_blank"><i class="fa-brands fa-facebook-f"></i></a>
							<a href="https://twitter.com" target="_blank"><i class="fa-brands fa-twitter"></i></a>
							<a href="https://instagram.com" target="_blank"><i class="fa-brands fa-instagram"></i></a>
						</div>
						<a href="user_appointment.jsp" class="btn-coral-outline">View More</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- 6. "Why Choose Us" Section (Dark Charcoal) -->
	<section class="why-choose-us-section">
		<div class="container">
			<div class="row align-items-center g-5">
				<div class="col-lg-6">
					<div class="section-accent-header mb-1">
						<span class="section-accent-bar">|</span>
						<h3 class="text-white fw-bold mb-0"><span class="section-cyan-text">Why</span> Choose Us</h3>
					</div>
					<p class="text-muted fs-7 mb-4">Leading medical innovation & patient-centric scheduling.</p>

					<h2>Our goal is to make sure with advances in technology</h2>
					<p>
						Iryotek Hospital offers the whole range of multispecialty health services: treatment of chronic diseases, emergency trauma response, AI-driven symptom analysis, automated clinic queue allocation, and 24/7 care.
					</p>
					<a href="find_hospitals.jsp" class="btn-oreo-coral">More about practice</a>
				</div>
				<div class="col-lg-6 text-center">
					<img src="img/doctor_1.jpg" alt="Why Choose Us Medical Team" class="img-fluid" style="border-radius: 12px; box-shadow: 0 15px 40px rgba(0,0,0,0.4); max-height: 380px; width: 100%; object-fit: cover;">
				</div>
			</div>
		</div>
	</section>

	<!-- 7. Emergency Support Section -->
	<section class="emergency-support-banner">
		<div class="container">
			<h3 class="fw-bold text-dark mb-2" style="font-size: 1.8rem;">We provide 24/7 customer support.</h3>
			<p class="text-secondary mb-4" style="font-size: 0.95rem;">Please feel free to contact us at (01) 234 5678 for emergency case.</p>
			<a href="find_hospitals.jsp" class="btn-coral-outline px-4 py-2">Read More</a>
		</div>
	</section>

	<!-- 8. "Latest From Blog" Section (Dynamic Blog Loading) -->
	<section class="py-5" id="blog">
		<div class="container py-4">
			<div class="section-accent-header">
				<span class="section-accent-bar">|</span>
				<h2 class="section-accent-title"><span class="section-cyan-text">Latest</span> From Blog</h2>
			</div>
			<p class="section-subtitle">Stay informed with latest health articles & medical guidelines.</p>

			<div class="row g-4 mt-2 mb-4">
				<%
				if (indexBlogList != null && !indexBlogList.isEmpty()) {
					int bCount = 0;
					for (Blog blog : indexBlogList) {
						if (bCount++ >= 3) break;
				%>
				<div class="col-md-4">
					<div class="blog-item-card h-100 d-flex flex-column">
						<a href="blog_detail.jsp?id=<%= blog.getId() %>">
							<img src="<%= (blog.getImagePath() != null && !blog.getImagePath().trim().isEmpty()) ? blog.getImagePath() : "img/hospital1.jpg" %>" 
							     alt="<%= blog.getTitle() %>" 
							     onerror="this.onerror=null; this.src='img/hospital1.jpg';" 
							     class="blog-img">
						</a>
						<div class="blog-content d-flex flex-column justify-content-between flex-grow-1">
							<div>
								<h4 class="blog-title">
									<a href="blog_detail.jsp?id=<%= blog.getId() %>" class="text-decoration-none text-dark hover-cyan">
										<%= blog.getTitle() %>
									</a>
								</h4>
								<p class="blog-desc">
									<%= blog.getExcerpt() %>
								</p>
							</div>
							<div class="blog-footer mt-3">
								<span><i class="fa-regular fa-calendar me-1"></i> <%= blog.getCreatedAt() != null ? blog.getCreatedAt().toString().substring(0, 10) : "02 Feb 2018" %></span>
								<a href="blog_detail.jsp?id=<%= blog.getId() %>" class="comments text-decoration-none">
									<i class="fa-regular fa-comment me-1"></i> Comment ( <%= blog.getCommentCount() %> )
								</a>
							</div>
						</div>
					</div>
				</div>
				<%
					}
				} else {
				%>
				<div class="col-12 text-center text-muted py-4">
					<p>No blogs published yet. Add new blogs from the admin dashboard!</p>
				</div>
				<%
				}
				%>
			</div>
		</div>
	</section>

	<!-- 9. AI Live Support Widget & Footer -->
	<%@include file="component/support_widget.jsp"%>
	<%@include file="component/footer.jsp"%>

	<style>
		.tabular-nums {
			font-variant-numeric: tabular-nums;
		}
	</style>

	<script type="text/javascript">
		document.addEventListener("DOMContentLoaded", function() {
			var heroDateInput = document.getElementById("heroApptDate");
			if (heroDateInput) {
				var todayStr = new Date().toISOString().split('T')[0];
				heroDateInput.min = todayStr;
				if (!heroDateInput.value) {
					heroDateInput.value = todayStr;
				}
			}

			// StatsCounter Implementation: IntersectionObserver + Critically Damped Spring (bounce: 0)
			var counters = document.querySelectorAll(".stats-counter");
			if ("IntersectionObserver" in window) {
				var counterObserver = new IntersectionObserver(function(entries, observer) {
					entries.forEach(function(entry) {
						if (entry.isIntersecting) {
							var el = entry.target;
							observer.unobserve(el); // once: true

							var targetVal = parseFloat(el.getAttribute("data-value") || "0");
							var duration = parseFloat(el.getAttribute("data-duration") || "1.5");
							var prefix = el.getAttribute("data-prefix") || "";
							var suffix = el.getAttribute("data-suffix") || "";
							var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);

							var startTime = null;
							var totalDurationMs = duration * 1000;

							// Critically damped spring simulation (bounce = 0)
							// x(t) = target * (1 - (1 + omega * t) * e^(-omega * t))
							var omega = 5.5 / duration;

							function animateSpring(timestamp) {
								if (!startTime) startTime = timestamp;
								var elapsedSeconds = (timestamp - startTime) / 1000;
								var elapsedMs = timestamp - startTime;

								var factor = 1 - (1 + omega * elapsedSeconds) * Math.exp(-omega * elapsedSeconds);
								if (elapsedMs >= totalDurationMs) {
									factor = 1;
								}

								var currentVal = targetVal * factor;
								var formattedNum = currentVal.toLocaleString('en-US', {
									minimumFractionDigits: decimals,
									maximumFractionDigits: decimals
								});

								el.textContent = prefix + formattedNum + suffix;

								if (elapsedMs < totalDurationMs && factor < 0.999) {
									requestAnimationFrame(animateSpring);
								} else {
									el.textContent = prefix + targetVal.toLocaleString('en-US', {
										minimumFractionDigits: decimals,
										maximumFractionDigits: decimals
									}) + suffix;
								}
							}

							requestAnimationFrame(animateSpring);
						}
					});
				}, {
					rootMargin: "-50px 0px -50px 0px", // triggers when entering view
					threshold: 0.1
				});

				counters.forEach(function(c) {
					counterObserver.observe(c);
				});
			} else {
				// Fallback if IntersectionObserver is not supported
				counters.forEach(function(el) {
					var targetVal = parseFloat(el.getAttribute("data-value") || "0");
					var prefix = el.getAttribute("data-prefix") || "";
					var suffix = el.getAttribute("data-suffix") || "";
					el.textContent = prefix + targetVal.toLocaleString() + suffix;
				});
			}
			// --- ShaderButtons Balloon Interactive Engine ---
			function initBalloonShaderEffects() {
				var cards = document.querySelectorAll(".balloon-stat-card");
				cards.forEach(function(card) {
					var canvas = card.querySelector(".balloon-card-canvas");
					if (!canvas) return;
					var ctx = canvas.getContext("2d");
					if (!ctx) return;

					var targetX = 0.5, targetY = 0.25;
					var curX = 0.5, curY = 0.25;
					var isHovered = false;
					var hoverStrength = 0;

					function resize() {
						var dpr = Math.min(window.devicePixelRatio || 1, 2);
						var rect = card.getBoundingClientRect();
						if (rect.width > 0 && rect.height > 0) {
							canvas.width = Math.round(rect.width * dpr);
							canvas.height = Math.round(rect.height * dpr);
							ctx.scale(dpr, dpr);
						}
					}
					resize();
					window.addEventListener("resize", resize);

					card.addEventListener("pointermove", function(e) {
						var rect = card.getBoundingClientRect();
						targetX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
						targetY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
						isHovered = true;
					});
					card.addEventListener("pointerenter", function() {
						isHovered = true;
					});
					card.addEventListener("pointerleave", function() {
						isHovered = false;
						targetX = 0.5;
						targetY = 0.25;
					});

					var theme = card.getAttribute("data-balloon-theme") || "cyan";
					var glowColor = "rgba(56, 189, 248, ";
					if (theme === "emerald") glowColor = "rgba(52, 211, 153, ";
					else if (theme === "amber") glowColor = "rgba(251, 191, 36, ";
					else if (theme === "purple") glowColor = "rgba(192, 132, 252, ";

					function renderCard() {
						curX += (targetX - curX) * 0.1;
						curY += (targetY - curY) * 0.1;
						hoverStrength += ((isHovered ? 1 : 0) - hoverStrength) * 0.08;

						var w = card.clientWidth;
						var h = card.clientHeight;
						if (w > 0 && h > 0) {
							ctx.clearRect(0, 0, w, h);

							// 1. Top rim specular arc (Balloon curvature highlight)
							var topGrad = ctx.createLinearGradient(0, 0, w, 0);
							var arcAlpha = 0.35 + hoverStrength * 0.35;
							topGrad.addColorStop(0, "rgba(255, 255, 255, 0.05)");
							topGrad.addColorStop(Math.max(0.1, curX - 0.2), "rgba(255, 255, 255, " + (arcAlpha * 0.4) + ")");
							topGrad.addColorStop(curX, "rgba(255, 255, 255, " + arcAlpha + ")");
							topGrad.addColorStop(Math.min(0.9, curX + 0.2), "rgba(255, 255, 255, " + (arcAlpha * 0.4) + ")");
							topGrad.addColorStop(1, "rgba(255, 255, 255, 0.05)");

							ctx.fillStyle = topGrad;
							ctx.fillRect(16, 2, w - 32, 3);

							// 2. Dynamic Specular Balloon Dome Glare
							var specRadius = Math.max(60, w * 0.4);
							var specGrad = ctx.createRadialGradient(
								curX * w, curY * h, 2,
								curX * w, curY * h, specRadius
							);
							var specAlpha = 0.18 + hoverStrength * 0.26;
							specGrad.addColorStop(0, "rgba(255, 255, 255, " + specAlpha + ")");
							specGrad.addColorStop(0.35, "rgba(255, 255, 255, " + (specAlpha * 0.45) + ")");
							specGrad.addColorStop(0.7, glowColor + (specAlpha * 0.25) + ")");
							specGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

							ctx.fillStyle = specGrad;
							ctx.beginPath();
							ctx.arc(curX * w, curY * h, specRadius, 0, Math.PI * 2);
							ctx.fill();

							// 3. Lower bouncy edge reflection
							var botGrad = ctx.createRadialGradient(
								w * 0.5, h - 4, 5,
								w * 0.5, h - 4, w * 0.5
							);
							botGrad.addColorStop(0, glowColor + (0.15 + hoverStrength * 0.2) + ")");
							botGrad.addColorStop(1, glowColor + "0)");
							ctx.fillStyle = botGrad;
							ctx.fillRect(0, h - 25, w, 25);
						}

						requestAnimationFrame(renderCard);
					}
					requestAnimationFrame(renderCard);
				});

				// Dedicated ThreeUI Balloon Button Shader
				var balloonBtn = document.getElementById("interactive-balloon-btn");
				if (balloonBtn) {
					var btnCanvas = balloonBtn.querySelector("canvas");
					if (btnCanvas) {
						var bCtx = btnCanvas.getContext("2d");
						var bTargetX = 0.5, bCurX = 0.5;
						var bHover = 0;
						var isBtnHovered = false;

						function resizeBtnCanvas() {
							var dpr = Math.min(window.devicePixelRatio || 1, 2);
							var rect = balloonBtn.getBoundingClientRect();
							if (rect.width > 0 && rect.height > 0) {
								btnCanvas.width = Math.round(rect.width * dpr);
								btnCanvas.height = Math.round(rect.height * dpr);
								bCtx.scale(dpr, dpr);
							}
						}
						resizeBtnCanvas();
						window.addEventListener("resize", resizeBtnCanvas);

						balloonBtn.addEventListener("pointermove", function(e) {
							var rect = balloonBtn.getBoundingClientRect();
							bTargetX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
							isBtnHovered = true;
						});
						balloonBtn.addEventListener("pointerenter", function() { isBtnHovered = true; });
						balloonBtn.addEventListener("pointerleave", function() {
							isBtnHovered = false;
							bTargetX = 0.5;
						});

						function renderBtn() {
							bCurX += (bTargetX - bCurX) * 0.12;
							bHover += ((isBtnHovered ? 1 : 0) - bHover) * 0.1;
							var bw = balloonBtn.clientWidth;
							var bh = balloonBtn.clientHeight;

							if (bw > 0 && bh > 0) {
								bCtx.clearRect(0, 0, bw, bh);

								// Inflated upper crescent reflection
								var crescent = bCtx.createLinearGradient(0, 0, bw, 0);
								var alpha = 0.4 + bHover * 0.45;
								crescent.addColorStop(0, "rgba(255, 255, 255, 0.1)");
								crescent.addColorStop(Math.max(0.05, bCurX - 0.25), "rgba(255, 255, 255, " + (alpha * 0.3) + ")");
								crescent.addColorStop(bCurX, "rgba(255, 255, 255, " + alpha + ")");
								crescent.addColorStop(Math.min(0.95, bCurX + 0.25), "rgba(255, 255, 255, " + (alpha * 0.3) + ")");
								crescent.addColorStop(1, "rgba(255, 255, 255, 0.1)");

								bCtx.fillStyle = crescent;
								bCtx.fillRect(18, 3, bw - 36, 3.5);

								// Volumetric core specular
								var glow = bCtx.createRadialGradient(
									bCurX * bw, bh * 0.3, 2,
									bCurX * bw, bh * 0.3, bw * 0.45
								);
								glow.addColorStop(0, "rgba(255, 255, 255, " + (0.2 + bHover * 0.25) + ")");
								glow.addColorStop(0.4, "rgba(99, 102, 241, " + (0.15 + bHover * 0.2) + ")");
								glow.addColorStop(1, "rgba(99, 102, 241, 0)");

								bCtx.fillStyle = glow;
								bCtx.beginPath();
								bCtx.arc(bCurX * bw, bh * 0.3, bw * 0.45, 0, Math.PI * 2);
								bCtx.fill();
							}

							requestAnimationFrame(renderBtn);
						}
						requestAnimationFrame(renderBtn);
					}
				}
			}

			initBalloonShaderEffects();
		});
	</script>
</body>
</html>