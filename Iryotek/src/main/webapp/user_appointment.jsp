<%@page import="com.hms.entity.Doctor"%>
<%@page import="java.util.List"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.hms.dao.DoctorDAO"%>
<%@page import="com.hms.dao.HospitalDAO"%>
<%@page import="com.hms.entity.Hospital"%>
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
<title>User Appointment Page</title>
<!-- all css include -->
<%@include file="../component/allcss.jsp"%>

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

	<!-- start 1st Div -->

	<div class="container-fluid my-bg-img p-5">
		<!-- css background image -->
		<p class="text-center fs-2 text-white"></p>

	</div>

	<!-- end of 1st Div -->


	<!-- 2nd Div -->

	<div class="container p-3">
		<p class="fs-2"></p>

		<div class="row">
			
			<!-- col-1 -->
			<div class="col-md-6 p-5">
				<!-- for Background image -->
				<!-- <img alt="" src="img/picDoc.jpg" width="500px" height="400px"> -->
				<img alt="" src="img/doc3.jpg" width="370" height="">
			</div>
			
			<!-- col-2 -->
			<div class="col-md-6">
				<div class="card my-card">
					<div class="card-body">
						<p class="text-center fs-3">User Appointment</p>

						<!-- message print -->
						<!-- for success msg -->
						<c:if test="${not empty successMsg }">
							<p class="text-center text-success fs-5">${successMsg}</p>
							<c:remove var="successMsg" scope="session" />
						</c:if>

						<!-- for error msg -->
						<c:if test="${not empty errorMsg }">
							<p class="text-center text-danger fs-5">${errorMsg}</p>
							<c:remove var="errorMsg" scope="session" />
						</c:if>
						<!-- End of message print -->


						<!-- boostrap form -->
						<form class="row g-3" action="addAppointment" method="post">
							
							<!-- take user Id in hidden field -->
							<input type="hidden" name="userId" value="${ userObj.id }">
							
							<div class="col-md-6">
								<label class="form-label">Full Name</label> <input required="required"
									name="fullName" type="text" placeholder="Enter full name"
									class="form-control">

							</div>

							<div class="col-md-6">
								<label class="form-label">Gender</label> <select
									class="form-control" name="gender" required="required">
									<option selected="selected" disabled="disabled">---Select
										Gender---</option>
									<option value="male">Male</option>
									<option value="female">Female</option>
								</select>
							</div>

							<div class="col-md-6">
								<label class="form-label">Age</label> <input name="age"
								required="required"	type="number" placeholder="Enter your Age" class="form-control">
							</div>
							<div class="col-md-6">
								<label class="form-label">Appointment Date</label> <input
								required="required"	name="appointmentDate" type="date" class="form-control">
							</div>

							<div class="col-md-6">
								<label class="form-label">Email</label> <input name="email"
								required="required"	type="email" placeholder="Enter email" class="form-control">
							</div>

							<div class="col-md-6">
								<label class="form-label">Phone</label> <input name="phone"
								required="required"	type="number" maxlength="11" placeholder="Enter Mobile no."
									class="form-control">
							</div>

							<div class="col-md-6">
								<label class="form-label">Diseases</label> <input
								required="required"	name="diseases" type="text" placeholder="Enter diseases"
									class="form-control">
							</div>

							<div class="col-md-6">
								<label class="form-label">Hospital</label> <select
								 required="required" class="form-control" name="hospitalSelect" id="hospitalSelect" onchange="loadDoctorsByHospital()">
									<option selected="selected" disabled="disabled">---Select Hospital---</option>
									
									<%
									HospitalDAO hospDAO = new HospitalDAO(DBConnection.getConn());
									List<Hospital> hospitalList = hospDAO.getAllHospital();
									String preSelectedHospitalId = request.getParameter("hospitalId");
									for(Hospital h : hospitalList)
									{
										String selected = "";
										if(preSelectedHospitalId != null && preSelectedHospitalId.equals(String.valueOf(h.getId()))) {
											selected = "selected";
										}
									%>
									<option value="<%= h.getId() %>" <%= selected %>><%= h.getName() %> (<%= h.getCity() %>)</option>
									<%
									}
									%>
								</select>
							</div>

							<div class="col-md-6">
								<label class="form-label">Doctor</label> <select
								 required="required" class="form-control" name="doctorNameSelect" id="doctorSelect">
									<option selected="selected" disabled="disabled">---Select Hospital First---</option>
								</select>
							</div>


							<!-- below are visible to right side part of form-->

							<div class="col-md-12">
								<label class="form-label">Full Address</label>
								<textarea name="address" required="required" class="form-control" rows="3" cols=""></textarea>
							</div>


							<c:if test="${empty userObj}">
								<div class="col-md-12">
									<a href="user_login.jsp" class="btn my-bg-color text-white col-md-12">Submit</a>
								</div>
							</c:if>


							<c:if test="${not empty userObj}">

								<div class="col-md-12">
									<button type="submit" class="btn my-bg-color text-white col-md-12">Submit</button>
								</div>

							</c:if>

						</form>

						<!-- end of boostrap form -->

					</div>
				</div>

			</div>



		</div>


	</div>

	<!-- 2nd Div -->















<!-- footer -->
<%@include file="component/footer.jsp" %>
<!-- end footer -->

<!-- AJAX JavaScript for doctor filtering -->
<script type="text/javascript">
	function loadDoctorsByHospital() {
		var hospitalId = document.getElementById("hospitalSelect").value;
		var doctorSelect = document.getElementById("doctorSelect");

		doctorSelect.innerHTML = '<option selected="selected" disabled="disabled">---Loading...---</option>';

		var xhr = new XMLHttpRequest();
		xhr.open("GET", "getDoctorsByHospital?hospitalId=" + hospitalId, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var doctors = JSON.parse(xhr.responseText);
				doctorSelect.innerHTML = '<option selected="selected" disabled="disabled">---Select Doctor---</option>';
				for (var i = 0; i < doctors.length; i++) {
					var option = document.createElement("option");
					option.value = doctors[i].id;
					option.text = doctors[i].fullName + " (" + doctors[i].specialist + ")";
					doctorSelect.appendChild(option);
				}
				if (doctors.length === 0) {
					doctorSelect.innerHTML = '<option selected="selected" disabled="disabled">---No Doctors Found---</option>';
				}
			}
		};
		xhr.send();
	}

	// Auto-load doctors if hospital is pre-selected (from find_hospitals.jsp)
	window.onload = function() {
		var hospitalSelect = document.getElementById("hospitalSelect");
		if (hospitalSelect && hospitalSelect.value && hospitalSelect.value !== "---Select Hospital---") {
			loadDoctorsByHospital();
		}
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
					<button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal">Great, Thank you!</button>
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