<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.hms.dao.DoctorDAO"%>
<%@ page import="com.hms.entity.Doctor"%>
<%@ page import="com.hms.db.DBConnection"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>
<%
	String docIdStr = request.getParameter("id");
	Doctor doc = null;
	if (docIdStr != null) {
		try {
			DoctorDAO dao = new DoctorDAO(DBConnection.getConn());
			doc = dao.getDoctorById(Integer.parseInt(docIdStr));
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	String docName = (doc != null) ? doc.getFullName() : "David Lee";
	String specName = (doc != null) ? doc.getSpecialist() : "Surgeon";
%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Dr. <%= docName %> | Iryotek Healthcare</title>
<%@include file="component/allcss.jsp"%>
</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<!-- Page Breadcrumb Header Banner (Dark Green #0b3c36) -->
	<section class="medipro-page-header text-center py-5 text-white" style="background-color: var(--medipro-dark-green);">
		<div class="container py-4">
			<h1 class="display-4 fw-extrabold text-coral mb-2">Dr. <%= docName %></h1>
			<p class="fs-6 text-white-50">Home &raquo; Doctors &raquo; Dr. <%= docName %></p>
		</div>
	</section>

	<!-- Main Doctor Detail Area -->
	<section class="py-5" style="background-color: var(--medipro-cream-bg);">
		<div class="container py-4">
			<!-- Doctor Top Banner Card -->
			<div class="row g-0 rounded-4 overflow-hidden shadow-lg mb-5" style="background-color: var(--medipro-dark-card);">
				<div class="col-md-4">
					<img src="img/doc2.jpg" alt="Dr. <%= docName %>" class="w-100 h-100" style="object-fit: cover; min-height: 280px;">
				</div>
				<div class="col-md-8 p-4 p-md-5 d-flex flex-column justify-content-center text-white">
					<span class="text-coral fw-bold uppercase tracking-wider fs-7 mb-2"><%= specName %></span>
					<h2 class="display-6 fw-bold mb-3">Dr. <%= docName %></h2>
					<p class="text-white-50 leading-relaxed mb-4">
						Dr. <%= docName %> is a highly accomplished and compassionate physician, serving as our Chief Medical Officer. With over 20 years of experience in various medical specialties, Dr. <%= docName %> brings a wealth of knowledge and expertise to our healthcare team.
					</p>
					<div class="d-flex gap-3 text-white fs-5">
						<a href="#" class="text-white-50 hover-coral"><i class="fa-brands fa-twitter"></i></a>
						<a href="#" class="text-white-50 hover-coral"><i class="fa-brands fa-instagram"></i></a>
						<a href="#" class="text-white-50 hover-coral"><i class="fa-brands fa-facebook-f"></i></a>
					</div>
				</div>
			</div>

			<!-- Main Bio & Opening Hours Grid -->
			<div class="row g-5">
				<div class="col-lg-8">
					<!-- Biography -->
					<h3 class="fw-bold text-dark mb-3">Biography</h3>
					<p class="text-muted leading-relaxed mb-4">
						As a board-certified physician, Dr. <%= docName %> has a profound commitment to delivering exceptional healthcare services. His leadership and strategic vision have been instrumental in shaping our medical facility into a center of clinical excellence.
					</p>
					<p class="text-muted leading-relaxed mb-5">
						Patients appreciate his warm bedside manner, and he takes the time to listen to their concerns, ensuring that each individual receives personalized care tailored to their unique needs.
					</p>

					<!-- My Service Checklist -->
					<h4 class="fw-bold text-dark mb-3">My Service</h4>
					<div class="row g-3 mb-5">
						<div class="col-md-6 text-muted fs-7"><i class="fa-solid fa-circle-check text-coral me-2"></i> Mental Health Solutions</div>
						<div class="col-md-6 text-muted fs-7"><i class="fa-solid fa-circle-check text-coral me-2"></i> Rapid Patient Improvement</div>
						<div class="col-md-6 text-muted fs-7"><i class="fa-solid fa-circle-check text-coral me-2"></i> World Class Treatment</div>
						<div class="col-md-6 text-muted fs-7"><i class="fa-solid fa-circle-check text-coral me-2"></i> Medical Research Professionals</div>
						<div class="col-md-6 text-muted fs-7"><i class="fa-solid fa-circle-check text-coral me-2"></i> Medical Advices & Check Ups</div>
						<div class="col-md-6 text-muted fs-7"><i class="fa-solid fa-circle-check text-coral me-2"></i> Trusted Medical Treatment</div>
					</div>

					<!-- My Skills Progress Bars -->
					<h4 class="fw-bold text-dark mb-3">My Skill</h4>
					<div class="mb-3">
						<div class="d-flex justify-content-between mb-1 fs-7 fw-bold"><span>Clinical Diagnosis</span><span>70%</span></div>
						<div class="progress" style="height: 10px; border-radius: 20px;"><div class="progress-bar bg-coral" style="width: 70%;"></div></div>
					</div>
					<div class="mb-4">
						<div class="d-flex justify-content-between mb-1 fs-7 fw-bold"><span>Surgical Expertise</span><span>90%</span></div>
						<div class="progress" style="height: 10px; border-radius: 20px;"><div class="progress-bar bg-coral" style="width: 90%;"></div></div>
					</div>
				</div>

				<!-- Right Sidebar: Coral Opening Hours Widget -->
				<div class="col-lg-4">
					<div class="p-4 rounded-4 text-white shadow-lg" style="background-color: var(--medipro-coral);">
						<div class="fs-2 mb-3"><i class="fa-regular fa-clock"></i></div>
						<h4 class="fw-bold mb-4">Opening Hours</h4>
						<ul class="list-unstyled d-flex flex-column gap-3 mb-4 fs-7">
							<li class="d-flex justify-content-between border-bottom border-white-50 pb-2"><span>Monday - Friday</span><span>8:00 - 7:00 pm</span></li>
							<li class="d-flex justify-content-between border-bottom border-white-50 pb-2"><span>Saturday</span><span>9:00 - 8:00 pm</span></li>
							<li class="d-flex justify-content-between pb-2"><span>Sunday</span><span>10:00 - 9:00 pm</span></li>
						</ul>
						<a href="user_appointment.jsp?doctorNameSelect=<%= (doc != null ? doc.getId() : 1) %>" class="btn btn-dark rounded-pill w-100 py-3 fw-bold">
							Book Consultation <i class="fa-solid fa-calendar-check ms-1"></i>
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<%@include file="component/footer.jsp"%>
</body>
</html>
