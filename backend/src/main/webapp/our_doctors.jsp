<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.hms.dao.DoctorDAO"%>
<%@ page import="com.hms.entity.Doctor"%>
<%@ page import="com.hms.db.DBConnection"%>
<%@ page import="java.util.List"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Our Doctors | Iryotek Healthcare</title>
<%@include file="component/allcss.jsp"%>
</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<!-- Page Breadcrumb Header Banner (Dark Green #0b3c36) -->
	<section class="medipro-page-header text-center py-5 text-white" style="background-color: var(--medipro-dark-green);">
		<div class="container py-4">
			<h1 class="display-4 fw-extrabold text-coral mb-2">Our Doctors</h1>
			<p class="fs-6 text-white-50">Home &raquo; Our Doctors</p>
		</div>
	</section>

	<!-- Main Doctors Grid Section -->
	<section class="py-5" style="background-color: var(--medipro-cream-bg);">
		<div class="container py-4">
			<div class="row g-4">
				<%
				DoctorDAO docDAO = new DoctorDAO(DBConnection.getConn());
				List<Doctor> docList = docDAO.getAllDoctor();
				if (docList != null && !docList.isEmpty()) {
					int count = 0;
					for (Doctor d : docList) {
						if (count++ >= 12) break;
				%>
				<div class="col-lg-4 col-md-6">
					<div class="bg-white rounded-4 shadow-sm overflow-hidden border border-light h-100 d-flex flex-column">
						<img src="img/doc<%= (count % 4) + 1 %>.jpg" alt="Dr. <%= d.getFullName() %>" class="w-100" style="height: 320px; object-fit: cover;">
						<div class="p-4 d-flex flex-column justify-content-between flex-grow-1">
							<div>
								<span class="text-coral fw-semibold fs-7 uppercase d-block mb-1"><%= d.getSpecialist() %></span>
								<h4 class="fw-bold text-dark mb-2">Dr. <%= d.getFullName() %></h4>
								<p class="text-muted fs-7 mb-3"><%= d.getQualification() != null ? d.getQualification() : "Compassionate care for all ages." %></p>
							</div>
							<a href="doctor_detail.jsp?id=<%= d.getId() %>" class="btn btn-outline-dark rounded-pill w-100 py-2 fs-7 fw-semibold hover-coral">
								View Doctor Profile <i class="fa-solid fa-chevron-right ms-1"></i>
							</a>
						</div>
					</div>
				</div>
				<%
					}
				} else {
				%>
				<div class="col-12 text-center text-muted py-5">
					<p class="fs-5">No doctors listed. Please register doctors from the Admin Panel.</p>
				</div>
				<%
				}
				%>
			</div>
		</div>
	</section>

	<%@include file="component/footer.jsp"%>
</body>
</html>
