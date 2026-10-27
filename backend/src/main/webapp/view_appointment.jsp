<%@page import="com.hms.entity.Doctor"%>
<%@page import="com.hms.dao.DoctorDAO"%>
<%@page import="com.hms.entity.User"%>
<%@page import="com.hms.entity.Appointment"%>
<%@page import="java.util.List"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.hms.dao.AppointmentDAO"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>


<!-- for jstl tag -->
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!-- end of jstl tag -->

<%@page isELIgnored="false"%>

<c:if test="${empty userObj}">
	<c:redirect url="user_login.jsp" />
</c:if>


<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<!-- for responsive -->
<!-- <meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0"> -->
<!-- for responsive -->
<title>View Appointment Page</title>

<!-- all css include -->
<%@include file="component/allcss.jsp"%>

<!-- customs css for this page -->
<style type="text/css">
.my-card {
	box-shadow: 0px 0px 10px 1px maroon;
	/*box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.3);*/
}

/* backgournd image css */
.my-bg-img {
	background: linear-gradient(rgba(0, 0, 0, .4), rgba(0, 0, 0, .4)),
		url("img/hospital1.jpg");
	height: 20vh;
	width: 100%;
	background-size: cover;
	background-repeat: no-repeat;
}

/* backgournd image css */
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
	<div class="container-fluid px-4 py-4">
		<div class="row">
			<div class="col-12">
				<div class="card my-card border-0 shadow-sm" style="border-radius: 16px; overflow: hidden;">
					<div class="card-header bg-white py-3 border-0">
						<h3 class="fw-bold myP-color mb-0 text-center">
							<i class="fa-solid fa-list-check me-2"></i> My Appointments
						</h3>
					</div>
					<div class="card-body p-0">
						<div class="table-responsive">
							<table class="table align-middle table-hover text-center mb-0" style="width: 100%; min-width: 1000px;">
								<thead class="my-bg-color text-white">
									<tr style="font-size: 0.85rem; letter-spacing: 0.5px; text-transform: uppercase;">
										<th scope="col" class="py-3 px-3">Full Name</th>
										<th scope="col" class="py-3 px-2">Gender</th>
										<th scope="col" class="py-3 px-2">Age</th>
										<th scope="col" class="py-3 px-3">Date</th>
										<th scope="col" class="py-3 px-2">Token</th>
										<th scope="col" class="py-3 px-3">Time Slot</th>
										<th scope="col" class="py-3 px-3">Phone</th>
										<th scope="col" class="py-3 px-3">Diseases</th>
										<th scope="col" class="py-3 px-3">Doctor</th>
										<th scope="col" class="py-3 px-2">Status</th>
										<th scope="col" class="py-3 px-3">Live Queue</th>
										<th scope="col" class="py-3 px-3">Consultation Type</th>
										<th scope="col" class="py-3 px-3">E-Receipt</th>
									</tr>
								</thead>
								<tbody>
									<%
									User user = (User) session.getAttribute("userObj");
									DoctorDAO dDAO = new DoctorDAO(DBConnection.getConn());
									AppointmentDAO appDAO = new AppointmentDAO(DBConnection.getConn());
									List<Appointment> list = null;
									if (user != null) {
										list = appDAO.getAllAppointmentByLoginUser(user.getId());
									}
									if (list != null && !list.isEmpty()) {
										for (Appointment apptList : list) {
											Doctor doctor = dDAO.getDoctorById(apptList.getDoctorId());
											String docName = doctor != null ? doctor.getFullName() : "Unknown";
									%>

									<tr>
										<td class="fw-bold text-dark px-3"><%=apptList.getFullName()%></td>
										<td class="text-capitalize px-2"><%=apptList.getGender()%></td>
										<td class="px-2"><%=apptList.getAge()%></td>
										<td class="px-3"><%=apptList.getAppointmentDate()%></td>
										<td class="px-2">
											<span class="badge bg-danger rounded-pill px-3 py-2 fs-6 shadow-sm"><%=apptList.getTokenNo()%></span>
										</td>
										<td class="px-3"><strong class="myP-color"><%=apptList.getAppointmentTime()%></strong></td>
										<td class="px-3"><%=apptList.getPhone()%></td>
										<td class="px-3"><span class="badge bg-light text-dark border px-2 py-1"><%=apptList.getDiseases()%></span></td>
										<td class="fw-semibold px-3">Dr. <%=docName%></td>
										<td class="px-2">
											<%
											if ("Pending".equals(apptList.getStatus())) {
											%> 
												<span class="badge bg-warning text-dark px-3 py-2 rounded-pill"><i class="fa-solid fa-spinner fa-spin me-1"></i> Pending</span> 
											<%
											} else {
											%> 
												<span class="badge bg-success px-3 py-2 rounded-pill"><i class="fa-solid fa-check me-1"></i> <%=apptList.getStatus()%></span> 
											<%
											}
											%>
										</td>
										<td class="px-3">
											<%
											if ("Pending".equals(apptList.getStatus())) {
											%>
												<span class="badge bg-primary live-queue-tracker text-white rounded-pill px-3 py-2 shadow-sm" 
													  data-doctor-id="<%=apptList.getDoctorId()%>" 
													  data-date="<%=apptList.getAppointmentDate()%>" 
													  data-my-token="<%=apptList.getTokenNo()%>">
													<i class="fa-solid fa-spinner fa-spin me-1"></i> Connecting...
												</span>
											<%
											} else {
											%>
												<span class="text-success fw-bold"><i class="fa-solid fa-circle-check"></i> Completed</span>
											<%
											}
											%>
										</td>
										<td class="px-3">
											<span class="badge bg-light text-primary border px-3 py-2 rounded-pill">
												<i class="fa-solid fa-hospital-user me-1"></i> In-Clinic OPD
											</span>
										</td>
										<td class="px-3">
											<button type="button" class="btn btn-sm text-white fw-bold shadow-sm" style="background: #0e7490; font-size: 11px; border-radius: 6px; padding: 5px 12px;"
												onclick="openEReceiptModal('<%=apptList.getFullName()%>', 'PAT-<%=user != null ? user.getId() : 101%>', 'Dr. <%=docName%>', '<%=doctor != null ? doctor.getSpecialist() : "General Medicine"%>', '<%=apptList.getAppointmentDate()%>', '<%=apptList.getAppointmentTime()%>', '<%=apptList.getTokenNo()%>', '500', '<%=apptList.getDiseases()%>')">
												<i class="fa-solid fa-file-invoice me-1"></i> E-Receipt
											</button>
										</td>
									</tr>

									<%
										}
									} else {
									%>
									<tr>
										<td colspan="13" class="text-center py-5 text-muted fs-5">
											<i class="fa-solid fa-folder-open mb-2 d-block fs-1"></i>
											No appointments booked yet. <a href="user_appointment.jsp" class="text-decoration-none fw-bold myP-color">Book your first appointment now</a>
										</td>
									</tr>
									<%
									}
									%>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

<script type="text/javascript">
	// 1. Live OPD Queue Updates via WebSocket
	function connectQueueSocket() {
		try {
			var protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
			var wsUrl = protocol + window.location.host + "<%= request.getContextPath() %>/queueStatus";
			var queueWs = new WebSocket(wsUrl);

			queueWs.onmessage = function(event) {
				try {
					var data = JSON.parse(event.data);
					updateLiveTrackers(data);
				} catch(e) {}
			};
		} catch(err) {}
	}
	connectQueueSocket();

	function updateLiveTrackers(data) {
		var trackers = document.querySelectorAll('.live-queue-tracker');
		trackers.forEach(function(el) {
			if (el.getAttribute('data-doctor-id') == data.doctorId && el.getAttribute('data-date') === data.appointmentDate) {
				var myToken = parseInt(el.getAttribute('data-my-token'));
				var servingToken = data.currentServingToken;
				if (servingToken === 0) {
					el.innerHTML = '<i class="fa-solid fa-clock"></i> Queue not started';
					el.className = 'badge bg-secondary live-queue-tracker text-white';
				} else if (servingToken === myToken) {
					el.innerHTML = '<i class="fa-solid fa-bell fa-shake text-white"></i> YOUR TURN!';
					el.className = 'badge bg-danger live-queue-tracker text-white';
				} else if (servingToken > myToken) {
					el.innerHTML = '<i class="fa-solid fa-check"></i> Passed/Completed';
					el.className = 'badge bg-success live-queue-tracker text-white';
				} else {
					var diff = myToken - servingToken;
					el.innerHTML = '<i class="fa-solid fa-user-clock"></i> Serving: #' + servingToken + ' (' + diff + ' behind)';
					el.className = 'badge bg-info text-dark live-queue-tracker';
				}
			}
		});
	}

	// 2. Poll for Doctor Live Video Room Presence
	function checkDoctorVideoStatus() {
		var buttons = document.querySelectorAll('[id^="teleBtn_"]');
		buttons.forEach(function(btn) {
			var apptId = btn.id.replace('teleBtn_', '');
			fetch('<%= request.getContextPath() %>/videoCallStatus?appointmentId=' + apptId)
				.then(function(res) { return res.json(); })
				.then(function(data) {
					var statusBadge = document.getElementById('teleStatus_' + apptId);
					if (data && data.doctorOnline) {
						btn.className = 'btn btn-sm btn-success rounded-pill px-3 py-1 shadow-sm d-inline-flex align-items-center gap-1';
						btn.innerHTML = '<i class="fa-solid fa-video me-1"></i> Doctor Waiting - Join Call';
						if (statusBadge) {
							statusBadge.classList.remove('d-none');
						}
					} else {
						btn.className = 'btn btn-sm btn-primary rounded-pill px-3 py-1 shadow-sm d-inline-flex align-items-center gap-1';
						btn.innerHTML = '<i class="fa-solid fa-video me-1"></i> Video Call';
						if (statusBadge) {
							statusBadge.classList.add('d-none');
						}
					}
				})
				.catch(function(err) {});
		});
	}

	setInterval(checkDoctorVideoStatus, 3500);
	checkDoctorVideoStatus();
</script>
<%@include file="component/ereceipt_modal.jsp"%>
</body>
</html>