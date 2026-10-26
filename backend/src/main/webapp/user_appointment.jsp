<%@page import="com.hms.entity.Doctor"%>
<%@page import="java.util.List"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.hms.dao.DoctorDAO"%>
<%@page import="com.hms.dao.HospitalDAO"%>
<%@page import="com.hms.entity.Hospital"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>


<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!-- end of jstl tag -->

<%@page isELIgnored="false"%>

<c:if test="${empty userObj}">
	<c:set var="errorMsg" value="Please login first to book an appointment." scope="session" />
	<c:redirect url="user_login.jsp" />
</c:if>

<%
HospitalDAO hospDAO = new HospitalDAO(DBConnection.getConn());
String preSelectedHospitalId = request.getParameter("hospitalId");
Hospital preSelectedHospital = null;
String selectedState = "";
String selectedCity = "";
if (preSelectedHospitalId != null) {
    try {
        preSelectedHospital = hospDAO.getHospitalById(Integer.parseInt(preSelectedHospitalId));
        if (preSelectedHospital != null) {
            selectedState = preSelectedHospital.getState();
            selectedCity = preSelectedHospital.getCity();
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}
%>


<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>User Appointment Page</title>
<!-- all css include -->
<%@include file="component/allcss.jsp"%>

<!-- customs css for this page -->
<style type="text/css">
.my-bg-img{
	background: linear-gradient(rgba(91, 126, 60, 0.5), rgba(91, 126, 60, 0.5)), url("img/hospital1.jpg");
	height: 20vh;
	width: 100%;
	background-size: cover;
	background-repeat: no-repeat;
}
</style>
<!-- end of customs css for this page -->

</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<!-- Page Breadcrumb Header Banner (Dark Green #0b3c36) -->
	<section class="medipro-page-header text-center py-5 text-white" style="background-color: var(--medipro-dark-green);">
		<div class="container py-4">
			<h1 class="display-4 fw-extrabold text-coral mb-2">Appointment Booking</h1>
			<p class="fs-6 text-white-50">Home &raquo; Appointment Booking</p>
		</div>
	</section>

	<!-- Main Appointment Booking Section -->
	<section class="py-5" style="background-color: var(--medipro-cream-bg);">
		<div class="container py-4">
			<!-- Split Booking Widget Card -->
			<div class="row g-0 rounded-4 overflow-hidden shadow-lg mb-5" style="background-color: var(--medipro-dark-card);">
				<!-- Left Column: Form Fields (Dark Green #0e3831) -->
				<div class="col-lg-8 p-4 p-md-5 text-white">
					<!-- Message print -->
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

					<form class="row g-3" action="addAppointment" method="post">
						<input type="hidden" name="userId" value="${userObj.id}">

						<!-- Disease / Treatment -->
						<div class="col-md-6">
							<label class="form-label text-white-80 fs-7">Select Clinic / Specialty</label>
							<select required="required" class="form-select bg-transparent text-white border-secondary rounded-pill px-3 fs-7" name="diseases" id="diseaseSelect" onchange="loadStatesByDisease()">
								<option selected="selected" disabled="disabled" class="text-dark">---Loading...---</option>
							</select>
						</div>

						<!-- State -->
						<div class="col-md-6">
							<label class="form-label text-white-80 fs-7">Select State</label>
							<select required="required" class="form-select bg-transparent text-white border-secondary rounded-pill px-3 fs-7" name="stateSelect" id="stateSelect" onchange="loadCitiesByState()">
								<option selected="selected" disabled="disabled" class="text-dark">---Select Specialty First---</option>
							</select>
						</div>

						<!-- City -->
						<div class="col-md-6">
							<label class="form-label text-white-80 fs-7">Select Location / City</label>
							<select required="required" class="form-select bg-transparent text-white border-secondary rounded-pill px-3 fs-7" name="citySelect" id="citySelect" onchange="loadHospitalsByCity()">
								<option selected="selected" disabled="disabled" class="text-dark">---Select State First---</option>
							</select>
						</div>

						<!-- Hospital -->
						<div class="col-md-6">
							<label class="form-label text-white-80 fs-7">Select Hospital</label>
							<select required="required" class="form-select bg-transparent text-white border-secondary rounded-pill px-3 fs-7" name="hospitalSelect" id="hospitalSelect" onchange="loadDoctorsByHospital()">
								<option selected="selected" disabled="disabled" class="text-dark">---Select City First---</option>
							</select>
						</div>

						<!-- Full Name -->
						<div class="col-md-6">
							<label class="form-label text-white-80 fs-7">Enter Your Name</label>
							<input required="required" name="fullName" type="text" placeholder="Enter Your Name" value="${userObj.fullName}" class="form-control bg-transparent text-white border-secondary rounded-pill px-3 fs-7">
						</div>

						<!-- Email -->
						<div class="col-md-6">
							<label class="form-label text-white-80 fs-7">Enter Your Email</label>
							<input required="required" name="email" type="email" placeholder="Enter Your Email" value="${userObj.email}" class="form-control bg-transparent text-white border-secondary rounded-pill px-3 fs-7">
						</div>

						<!-- Phone -->
						<div class="col-md-6">
							<label class="form-label text-white-80 fs-7">Enter Your Phone No.</label>
							<input required="required" name="phone" type="text" maxlength="15" placeholder="Enter Your Phone No." class="form-control bg-transparent text-white border-secondary rounded-pill px-3 fs-7">
						</div>

						<!-- Date Picker (Next 7 days only) -->
						<% 
							java.util.Calendar userApptCal = java.util.Calendar.getInstance();
							java.text.SimpleDateFormat userApptSdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
							String todayStr = userApptSdf.format(userApptCal.getTime());
							userApptCal.add(java.util.Calendar.DAY_OF_YEAR, 7);
							String maxDateStr = userApptSdf.format(userApptCal.getTime());
						%>
						<div class="col-md-6">
							<label class="form-label text-white-80 fs-7">Select Date (Within 7 Days)</label>
							<input required="required" name="appointmentDate" id="appointmentDate" type="date" min="<%= todayStr %>" max="<%= maxDateStr %>" value="<%= todayStr %>" class="form-control bg-transparent text-white border-secondary rounded-pill px-3 fs-7" onchange="if(this.value < '<%= todayStr %>') { alert('Cannot select past dates.'); this.value='<%= todayStr %>'; } else if(this.value > '<%= maxDateStr %>') { alert('Appointments can only be booked up to 7 days in advance.'); this.value='<%= todayStr %>'; } loadDoctorsByHospital()">
						</div>

						<!-- Doctor Select -->
						<div class="col-md-6">
							<label class="form-label text-white-80 fs-7">Select Doctor</label>
							<select required="required" class="form-select bg-transparent text-white border-secondary rounded-pill px-3 fs-7" name="doctorNameSelect" id="doctorSelect">
								<option selected="selected" disabled="disabled" class="text-dark">---Select Hospital First---</option>
							</select>
						</div>

						<!-- Gender -->
						<div class="col-md-3">
							<label class="form-label text-white-80 fs-7">Gender</label>
							<select class="form-select bg-transparent text-white border-secondary rounded-pill px-3 fs-7" name="gender" required="required">
								<option value="male" class="text-dark">Male</option>
								<option value="female" class="text-dark">Female</option>
							</select>
						</div>

						<!-- Age -->
						<div class="col-md-3">
							<label class="form-label text-white-80 fs-7">Age</label>
							<input name="age" required="required" type="number" min="1" max="120" placeholder="Age" class="form-control bg-transparent text-white border-secondary rounded-pill px-3 fs-7">
						</div>

						<!-- Address -->
						<div class="col-12">
							<label class="form-label text-white-80 fs-7">Full Address</label>
							<textarea name="address" required="required" class="form-control bg-transparent text-white border-secondary rounded-4 px-3 fs-7" rows="2" placeholder="Enter your full address"></textarea>
						</div>

						<!-- Submit Button -->
						<div class="col-12 mt-4">
							<button type="submit" class="btn btn-outline-coral w-100 py-3 text-coral border-coral rounded-pill fw-bold hover-coral-bg text-white">
								Make Appointment <i class="fa-solid fa-arrow-right ms-2"></i>
							</button>
						</div>
					</form>
				</div>

				<!-- Right Column: Quick Contacts Sidebar (Coral #f48c71) -->
				<div class="col-lg-4 p-4 p-md-5 text-white d-flex flex-column justify-content-center" style="background-color: var(--medipro-coral);">
					<h3 class="fw-bold mb-3">Quick Contacts</h3>
					<p class="text-white-80 fs-7 mb-4">
						Have any questions or need to schedule an appointment? Reach out to us quickly!
					</p>

					<div class="d-flex flex-column gap-3 fs-7">
						<div class="d-flex align-items-center gap-3">
							<i class="fa-solid fa-location-dot fs-5"></i>
							<span>Jl. Raya Kuta No.70, Kuta</span>
						</div>
						<div class="d-flex align-items-center gap-3">
							<i class="fa-regular fa-envelope fs-5"></i>
							<span>healthcare@gmail.com</span>
						</div>
						<div class="d-flex align-items-center gap-3">
							<i class="fa-solid fa-phone fs-5"></i>
							<span>808 707 6060</span>
						</div>
						<div class="d-flex align-items-center gap-3">
							<i class="fa-regular fa-clock fs-5"></i>
							<span>8 AM - 5 PM , Monday - Saturday</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>















<!-- footer -->
<%@include file="component/footer.jsp" %>
<!-- end footer -->

<!-- Hidden inputs for pre-selected hospital values to prevent IDE scriptlet syntax errors -->
<input type="hidden" id="preHospIdInput" value="<%= preSelectedHospitalId != null ? preSelectedHospitalId : "" %>">
<input type="hidden" id="preStateInput" value="<%= selectedState %>">
<input type="hidden" id="preCityInput" value="<%= selectedCity %>">
<input type="hidden" id="preHospNameInput" value="<%= preSelectedHospital != null ? preSelectedHospital.getName() : "" %>">

<!-- AJAX JavaScript for doctor filtering -->
<script type="text/javascript">
	var preHospId = document.getElementById("preHospIdInput") ? document.getElementById("preHospIdInput").value : "";
	var preState = document.getElementById("preStateInput") ? document.getElementById("preStateInput").value : "";
	var preCity = document.getElementById("preCityInput") ? document.getElementById("preCityInput").value : "";
	var preHospName = document.getElementById("preHospNameInput") ? document.getElementById("preHospNameInput").value : "";

	function loadDiseases() {
		var diseaseSelect = document.getElementById("diseaseSelect");
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "getAllDiseases", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var diseases = JSON.parse(xhr.responseText);
				diseaseSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Select Disease / Treatment---</option>';
				for (var i = 0; i < diseases.length; i++) {
					var option = document.createElement("option");
					option.value = diseases[i];
					option.text = diseases[i];
					diseaseSelect.appendChild(option);
				}

				if (preHospId && preState) {
					// Select first available disease as fallback
					if (diseases.length > 0) {
						diseaseSelect.value = diseases[0];
						loadStatesByDisease(true);
					}
				}
			}
		};
		xhr.send();
	}

	function loadStatesByDisease(isPreSelect) {
		var disease = document.getElementById("diseaseSelect").value;
		var stateSelect = document.getElementById("stateSelect");
		var citySelect = document.getElementById("citySelect");
		var hospitalSelect = document.getElementById("hospitalSelect");
		var doctorSelect = document.getElementById("doctorSelect");

		if (!disease || disease.startsWith("---")) return;

		stateSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Loading...---</option>';
		citySelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Select State First---</option>';
		hospitalSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Select City First---</option>';
		doctorSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Select Hospital First---</option>';

		var xhr = new XMLHttpRequest();
		xhr.open("GET", "getStatesByDisease?disease=" + encodeURIComponent(disease), true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var states = JSON.parse(xhr.responseText);
				stateSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Select State---</option>';
				for (var i = 0; i < states.length; i++) {
					var option = document.createElement("option");
					option.value = states[i];
					option.text = states[i];
					stateSelect.appendChild(option);
				}

				if (isPreSelect && preState && states.includes(preState)) {
					stateSelect.value = preState;
					loadCitiesByState(true);
				}
			}
		};
		xhr.send();
	}

	function loadCitiesByState(isPreSelect) {
		var state = document.getElementById("stateSelect").value;
		var disease = document.getElementById("diseaseSelect").value;
		var citySelect = document.getElementById("citySelect");
		var hospitalSelect = document.getElementById("hospitalSelect");
		var doctorSelect = document.getElementById("doctorSelect");

		if (!state || state.startsWith("---")) return;

		citySelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Loading...---</option>';
		hospitalSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Select City First---</option>';
		doctorSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Select Hospital First---</option>';

		var xhr = new XMLHttpRequest();
		xhr.open("GET", "getCitiesByState?state=" + encodeURIComponent(state) + "&disease=" + encodeURIComponent(disease), true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var cities = JSON.parse(xhr.responseText);
				citySelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Select City---</option>';
				for (var i = 0; i < cities.length; i++) {
					var option = document.createElement("option");
					option.value = cities[i];
					option.text = cities[i];
					citySelect.appendChild(option);
				}

				if (isPreSelect && preCity && cities.includes(preCity)) {
					citySelect.value = preCity;
					loadHospitalsByCity(true);
				}
			}
		};
		xhr.send();
	}

	function loadHospitalsByCity(isPreSelect) {
		var city = document.getElementById("citySelect").value;
		var disease = document.getElementById("diseaseSelect").value;
		var hospitalSelect = document.getElementById("hospitalSelect");
		var doctorSelect = document.getElementById("doctorSelect");

		if (!city || city.startsWith("---")) return;

		hospitalSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Loading...---</option>';
		doctorSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Select Hospital First---</option>';

		var xhr = new XMLHttpRequest();
		xhr.open("GET", "getHospitalsByCity?city=" + encodeURIComponent(city) + "&disease=" + encodeURIComponent(disease), true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var hospitals = JSON.parse(xhr.responseText);
				hospitalSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Select Hospital---</option>';
				for (var i = 0; i < hospitals.length; i++) {
					var option = document.createElement("option");
					option.value = hospitals[i].id;
					option.text = hospitals[i].name;
					hospitalSelect.appendChild(option);
				}

				if (isPreSelect && preHospId) {
					hospitalSelect.value = preHospId;
					loadDoctorsByHospital();
				}
			}
		};
		xhr.send();
	}

	function loadDoctorsByHospital() {
		var hospitalId = document.getElementById("hospitalSelect").value;
		var disease = document.getElementById("diseaseSelect").value;
		var doctorSelect = document.getElementById("doctorSelect");
		var appointmentDateInput = document.getElementById("appointmentDate");
		var appointmentDate = appointmentDateInput ? appointmentDateInput.value : "";

		if (!hospitalId || isNaN(parseInt(hospitalId))) {
			doctorSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Select Hospital First---</option>';
			return;
		}

		doctorSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Loading...---</option>';

		var xhr = new XMLHttpRequest();
		var url = "getDoctorsByHospital?hospitalId=" + hospitalId + "&disease=" + encodeURIComponent(disease || "") + "&date=" + encodeURIComponent(appointmentDate);
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var doctors = JSON.parse(xhr.responseText);
				doctorSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---Select Doctor---</option>';
				for (var i = 0; i < doctors.length; i++) {
					var option = document.createElement("option");
					option.value = doctors[i].id;
					option.text = doctors[i].fullName + " (" + doctors[i].specialist + ")";
					doctorSelect.appendChild(option);
				}
				if (doctors.length === 0) {
					doctorSelect.innerHTML = '<option value="" selected="selected" disabled="disabled">---No Available Doctors Found---</option>';
				}
			}
		};
		xhr.send();
	}

	window.onload = function() {
		var todayStr = new Date().toISOString().split('T')[0];
		var dateInput = document.getElementById("appointmentDate");
		if (dateInput) {
			dateInput.min = todayStr;
			if (!dateInput.value) {
				dateInput.value = todayStr;
			}
		}
		loadDiseases();
	};
</script>


<c:if test="${not empty lastTokenNo}">
	<!-- Bootstrap Modal -->
	<div class="modal fade" id="appointmentSuccessModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content" style="border-radius: 16px; overflow: hidden; border: none; box-shadow: 0 15px 50px rgba(91, 126, 60, 0.2);">
				<div class="modal-header text-white" style="background-color: var(--primary-dark); border-bottom: 2px solid var(--secondary-dark); padding: 20px;">
					<h5 class="modal-title" id="successModalLabel"><i class="fa-solid fa-circle-check"></i> Booking Confirmed!</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="filter: invert(1);"></button>
				</div>
				<div class="modal-body text-center p-4">
					<div class="mb-3">
						<i class="fa-solid fa-calendar-check" style="font-size: 3.5rem; color: var(--primary-dark);"></i>
					</div>
					<h4 class="mb-3" style="color: var(--primary-dark); font-weight: 700;">Appointment Recorded Successfully</h4>
					<p class="text-muted">Thank you for scheduling your appointment. Please find your booking details below:</p>
					
					<div class="p-3 my-3" style="background-color: var(--light-gray); border-radius: 12px; border: 1px solid var(--secondary-dark);">
						<div class="row">
							<div class="col-6 border-end" style="border-color: var(--secondary-dark) !important;">
								<span class="text-uppercase text-muted d-block" style="font-size: 0.75rem; letter-spacing: 0.5px; font-weight: 600;">Queue Token</span>
								<strong style="font-size: 2.2rem; color: var(--primary-dark); font-weight: 800;">${lastTokenNo}</strong>
							</div>
							<div class="col-6">
								<span class="text-uppercase text-muted d-block" style="font-size: 0.75rem; letter-spacing: 0.5px; font-weight: 600;">Time Slot</span>
								<strong style="font-size: 1.3rem; color: var(--primary-dark); font-weight: 800; line-height: 2.5;">${lastAppointmentTime}</strong>
							</div>
						</div>
					</div>
					
					<p class="mb-0 text-muted" style="font-size: 0.85rem;">Please arrive 10 minutes prior to your time slot.</p>
				</div>
				<div class="modal-footer" style="border-top: none; justify-content: center; padding: 0 24px 24px 24px;">
					<button type="button" class="btn-uiverse px-4" data-bs-dismiss="modal">Great, Thank you!</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Auto-trigger Script -->
	<script type="text/javascript">
		document.addEventListener("DOMContentLoaded", function() {
			var myModal = new bootstrap.Modal(document.getElementById('appointmentSuccessModal'));
			myModal.show();
		});
	</script>
	
	<!-- Clean up session attributes -->
	<c:remove var="lastTokenNo" scope="session" />
	<c:remove var="lastAppointmentTime" scope="session" />
</c:if>

</body>
</html>