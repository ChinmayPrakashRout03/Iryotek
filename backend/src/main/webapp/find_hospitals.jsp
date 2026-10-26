<%@page import="java.util.List"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.hms.dao.HospitalDAO"%>
<%@page import="com.hms.dao.SpecialistDAO"%>
<%@page import="com.hms.entity.Specialist"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<!-- for jstl tag -->
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!-- end of jstl tag -->

<%@page isELIgnored="false"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Find Hospitals | Iryotek</title>
<%@include file="component/allcss.jsp"%>

<!-- customs css for this page -->
<style type="text/css">
.my-bg-img {
	background: linear-gradient(rgba(91, 126, 60, 0.6), rgba(91, 126, 60, 0.6)), url("img/hospital1.jpg");
	height: 25vh;
	width: 100%;
	background-size: cover;
	background-repeat: no-repeat;
}

.hospital-card {
	border-left: 4px solid var(--accent-teal);
	transition: var(--transition);
}

.hospital-card:hover {
	transform: translateY(-5px);
	box-shadow: var(--hover-shadow);
}

.filter-section {
	background-color: #ffffff;
	border: 1px solid rgba(91, 126, 60, 0.08);
	box-shadow: var(--card-shadow);
	border-radius: 16px;
	padding: 25px;
}

#hospitalResults {
	min-height: 200px;
}

.no-results {
	color: var(--text-secondary);
	font-size: 1.1rem;
}
</style>
<!-- end of customs css for this page -->

</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<!-- Page Breadcrumb Header Banner (Dark Green #0b3c36) -->
	<section class="medipro-page-header text-center py-5 text-white" style="background-color: var(--medipro-dark-green);">
		<div class="container py-4">
			<h1 class="display-4 fw-extrabold text-coral mb-2">Services</h1>
			<p class="fs-6 text-white-50">Home &raquo; Services</p>
		</div>
	</section>

	<!-- Section 1: 6 Dark Green Specialty Cards Grid -->
	<section class="py-5" style="background-color: var(--medipro-cream-bg);">
		<div class="container py-4">
			<div class="text-coral fw-bold fs-7 tracking-wider uppercase mb-2">OUR SERVICES</div>
			<h2 class="faq-main-heading mb-5">Providing Medical Care For The Sickest In Our Community.</h2>

			<div class="row g-4">
				<!-- Card 1 -->
				<div class="col-lg-4 col-md-6">
					<div class="p-4 rounded-4 text-white shadow-lg h-100 d-flex flex-column justify-content-between" style="background-color: var(--medipro-dark-card);">
						<div>
							<div class="fs-1 text-coral mb-3"><i class="fa-solid fa-heart-pulse"></i></div>
							<h4 class="fw-bold mb-2">Cardiology Clinic</h4>
							<p class="fs-7 text-white-50 mb-3">Expert consultations with board-certified cardiologists to assess heart health.</p>
							<ul class="list-unstyled text-white-80 fs-7 d-flex flex-column gap-2 mb-4">
								<li><i class="fa-solid fa-circle-check text-coral me-2"></i> Cardiac Electrophysiology</li>
								<li><i class="fa-solid fa-circle-check text-coral me-2"></i> Cardiac Catheterization</li>
								<li><i class="fa-solid fa-circle-check text-coral me-2"></i> Arrhythmia Management</li>
							</ul>
						</div>
						<a href="service_detail.jsp" class="btn btn-outline-coral text-coral border-coral rounded-pill w-100 py-2 fs-7 fw-bold hover-coral-bg text-white">Read More (+)</a>
					</div>
				</div>

				<!-- Card 2 -->
				<div class="col-lg-4 col-md-6">
					<div class="p-4 rounded-4 text-white shadow-lg h-100 d-flex flex-column justify-content-between" style="background-color: var(--medipro-dark-card);">
						<div>
							<div class="fs-1 text-coral mb-3"><i class="fa-solid fa-microscope"></i></div>
							<h4 class="fw-bold mb-2">Pathology Clinic</h4>
							<p class="fs-7 text-white-50 mb-3">Comprehensive tests to analyze body fluids aiding in precise diagnosis.</p>
							<ul class="list-unstyled text-white-80 fs-7 d-flex flex-column gap-2 mb-4">
								<li><i class="fa-solid fa-circle-check text-coral me-2"></i> Molecular Pathology</li>
								<li><i class="fa-solid fa-circle-check text-coral me-2"></i> Cytogenetics</li>
								<li><i class="fa-solid fa-circle-check text-coral me-2"></i> Immunology</li>
							</ul>
						</div>
						<a href="service_detail.jsp" class="btn btn-outline-coral text-coral border-coral rounded-pill w-100 py-2 fs-7 fw-bold hover-coral-bg text-white">Read More (+)</a>
					</div>
				</div>

				<!-- Card 3 -->
				<div class="col-lg-4 col-md-6">
					<div class="p-4 rounded-4 text-white shadow-lg h-100 d-flex flex-column justify-content-between" style="background-color: var(--medipro-dark-card);">
						<div>
							<div class="fs-1 text-coral mb-3"><i class="fa-solid fa-vial-circle-check"></i></div>
							<h4 class="fw-bold mb-2">Laboratory Analysis</h4>
							<p class="fs-7 text-white-50 mb-3">Advanced menu of lab testing for blood, tissue, and clinical microbiology.</p>
							<ul class="list-unstyled text-white-80 fs-7 d-flex flex-column gap-2 mb-4">
								<li><i class="fa-solid fa-circle-check text-coral me-2"></i> Comprehensive Test Menu</li>
								<li><i class="fa-solid fa-circle-check text-coral me-2"></i> Timely Turnaround</li>
								<li><i class="fa-solid fa-circle-check text-coral me-2"></i> Advanced Diagnostic Tests</li>
							</ul>
						</div>
						<a href="service_detail.jsp" class="btn btn-outline-coral text-coral border-coral rounded-pill w-100 py-2 fs-7 fw-bold hover-coral-bg text-white">Read More (+)</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Filter & Hospital Search Section -->
	<div class="container my-5">
		<div class="filter-section p-4 rounded-4 bg-white shadow-sm border border-light">
			<p class="fs-4 text-center text-dark fw-bold mb-3">
				<i class="fa-solid fa-filter text-coral me-2"></i> Find Doctors & Hospitals Near You
			</p>
			<div class="row justify-content-center">
				<div class="col-md-4">
					<label class="form-label fw-bold fs-7">State</label>
					<select class="form-select rounded-pill px-3 fs-7" id="stateSelect" onchange="loadCities()">
						<option selected="selected" disabled="disabled">---Select State---</option>
						<%
						HospitalDAO hospDAO = new HospitalDAO(DBConnection.getConn());
						List<String> states = hospDAO.getAllStates();
						for (String st : states) {
						%>
						<option value="<%=st%>"><%=st%></option>
						<%
						}
						%>
					</select>
				</div>
				<div class="col-md-4">
					<label class="form-label fw-bold fs-7">City</label>
					<select class="form-select rounded-pill px-3 fs-7" id="citySelect" onchange="searchDoctors()" disabled="disabled">
						<option selected="selected" disabled="disabled">---Select City---</option>
					</select>
				</div>
				<div class="col-md-4">
					<label class="form-label fw-bold fs-7">Specialty</label>
					<select class="form-select rounded-pill px-3 fs-7" id="specialtySelect" onchange="searchDoctors()">
						<option value="ALL" selected="selected">All Specialties</option>
						<%
						SpecialistDAO specDAO = new SpecialistDAO(DBConnection.getConn());
						List<Specialist> specs = specDAO.getAllSpecialist();
						for (Specialist sp : specs) {
						%>
						<option value="<%=sp.getSpecialistName()%>"><%=sp.getSpecialistName()%></option>
						<%
						}
						%>
					</select>
				</div>
			</div>
		</div>

		<div id="hospitalResults" class="mt-4">
			<p class="text-center no-results my-4 text-muted">
				<i class="fa-solid fa-arrow-up text-coral me-1"></i> Select a State and City above to view available doctors & hospitals
			</p>
		</div>
	</div>

	<!-- footer -->
	<%@include file="component/footer.jsp"%>
	<!-- end footer -->

	<!-- AJAX JavaScript -->
	<script type="text/javascript">
		// Load cities when state is selected
		function loadCities() {
			var state = document.getElementById("stateSelect").value;
			var citySelect = document.getElementById("citySelect");

			// Reset city dropdown
			citySelect.innerHTML = '<option selected="selected" disabled="disabled">---Loading...---</option>';
			citySelect.disabled = true;

			// Clear hospitals
			document.getElementById("hospitalResults").innerHTML = '<p class="text-center no-results mt-5"><i class="fa-solid fa-arrow-up"></i> Please select a City</p>';

			// AJAX call to get cities
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "getCitiesByState?state=" + encodeURIComponent(state), true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4 && xhr.status === 200) {
					var cities = JSON.parse(xhr.responseText);
					citySelect.innerHTML = '<option selected="selected" disabled="disabled">---Select City---</option>';
					for (var i = 0; i < cities.length; i++) {
						var option = document.createElement("option");
						option.value = cities[i];
						option.text = cities[i];
						citySelect.appendChild(option);
					}
					citySelect.disabled = false;
				}
			};
			xhr.send();
		}

		// Search doctors
		function searchDoctors() {
			var state = document.getElementById("stateSelect").value;
			var city = document.getElementById("citySelect").value;
			var specialty = document.getElementById("specialtySelect").value;
			var resultsDiv = document.getElementById("hospitalResults");

			// Only search if city is selected (it's required)
			if (!city || city === "---Select City---") {
				return;
			}

			resultsDiv.innerHTML = '<p class="text-center mt-5"><i class="fa-solid fa-spinner fa-spin"></i> Searching Doctors...</p>';

			var xhr = new XMLHttpRequest();
			xhr.open("GET", "searchDoctors?state=" + encodeURIComponent(state) + "&city=" + encodeURIComponent(city) + "&specialty=" + encodeURIComponent(specialty), true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4 && xhr.status === 200) {
					var doctors = JSON.parse(xhr.responseText);

					var displaySpec = specialty === "ALL" ? "All" : specialty;

					if (doctors.length === 0) {
						resultsDiv.innerHTML = '<p class="text-center no-results mt-5"><i class="fa-solid fa-circle-exclamation"></i> No ' + displaySpec + ' doctors found in ' + city + '</p>';
						return;
					}

					var html = '<p class="fs-4 myP-color mb-3"><i class="fa-solid fa-user-doctor"></i> ' + displaySpec + ' Doctors in ' + city + ' (' + doctors.length + ' found)</p>';
					html += '<div class="row">';

					for (var i = 0; i < doctors.length; i++) {
						var d = doctors[i];
						html += '<div class="col-md-6 mb-3">';
						html += '  <div class="card hospital-card h-100">';
						html += '    <div class="card-body">';
						html += '      <h4 class="card-title myP-color"><i class="fa-solid fa-user-md"></i> ' + d.fullName + '</h4>';
						html += '      <p class="card-text mb-1"><strong>Qualification:</strong> ' + d.qualification + '</p>';
						html += '      <p class="card-text mb-1"><strong>Specialty:</strong> ' + d.specialist + '</p>';
						html += '      <hr>';
						html += '      <p class="card-text mb-1"><i class="fa-solid fa-hospital text-primary"></i> ' + d.hospitalName + '</p>';
						html += '      <p class="card-text mb-1"><i class="fa-solid fa-location-dot text-danger"></i> ' + d.hospitalAddress + ', ' + d.city + ', ' + d.state + '</p>';
						html += '      <a href="user_appointment.jsp?hospitalId=' + d.hospitalId + '" class="btn-uiverse mt-3">'; 
						html += '        <i class="fa-solid fa-calendar-check"></i> Book Appointment';
						html += '      </a>';
						html += '    </div>';
						html += '  </div>';
						html += '</div>';
					}

					html += '</div>';
					resultsDiv.innerHTML = html;
				}
			};
			xhr.send();
		}
	</script>

</body>
</html>
