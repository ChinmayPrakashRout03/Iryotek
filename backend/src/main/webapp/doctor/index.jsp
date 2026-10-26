<%@page import="com.hms.entity.Doctor"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.hms.dao.DoctorDAO"%>
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
<title>Index Page | Doctor</title>
<%@include file="../component/allcss.jsp"%>


<!-- customs css for this page -->
<style type="text/css">
.my-card {
	box-shadow: 0px 0px 10px 1px maroon;
	/*box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.3);*/
}
</style>
<!-- end of customs css for this page -->



</head>
<body>
	<%@include file="navbar.jsp"%>


	<!-- check is doctor is login or not if login then only he can access doctors dashboard -->
	<!-- otherwise redirect him to doctor login page for log in -->
	<!-- if "doctorObj" is empty means no one is login. -->

	<c:if test="${empty doctorObj }">

		<c:redirect url="../doctor_login.jsp"></c:redirect>

	</c:if>

	<!-- check is doctor is login or not -->


	<div class="container p-5">
		<p class="text-center text-success fs-3">Doctor DashBoard</p>

		<%
		
		
		DoctorDAO docDAO = new DoctorDAO(DBConnection.getConn());
		int totalNumberOfDoctor = docDAO.countTotalDoctor();
		
		//get current login doctor object from session
		Doctor currentLoginDoctor = (Doctor)session.getAttribute("doctorObj");
		
		
		%>

		<div class="row g-4">
			<div class="col-md-4">
				<div class="card my-card h-100 shadow-sm border-0 rounded-4">
					<div class="card-body text-center text-success p-4">
						<i class="fa-solid fa-user-doctor fa-3x mb-3 text-cyan"></i><br>
						<p class="fs-4 text-center mb-0">
							Doctor Network <br><strong class="fs-2 text-dark"><%= totalNumberOfDoctor %></strong>
						</p>
					</div>
				</div>
			</div>

			<div class="col-md-4">
				<div class="card my-card h-100 shadow-sm border-0 rounded-4">
					<div class="card-body text-center text-success p-4">
						<i class="fa-solid fa-calendar-check fa-3x mb-3 text-primary"></i><br>
						<p class="fs-4 text-center mb-0">
							Total Appointments <br><strong class="fs-2 text-dark"><%= docDAO.countTotalAppointmentByDoctorId(currentLoginDoctor.getId()) %></strong>
						</p>
					</div>
				</div>
			</div>

			<div class="col-md-4">
				<div class="card my-card h-100 shadow-sm border-0 rounded-4 bg-gradient" style="background: linear-gradient(135deg, #0b3c36 0%, #104841 100%);">
					<div class="card-body text-center text-white p-4 d-flex flex-column justify-content-between">
						<div>
							<i class="fa-solid fa-video fa-3x mb-3 text-coral"></i><br>
							<h5 class="fw-bold mb-1">Telehealth Video OPD</h5>
							<p class="fs-7 text-white-50 mb-3">Live WebRTC consultations with screen sharing & consent recording</p>
						</div>
						<a href="patient.jsp" class="btn btn-outline-light rounded-pill px-4 py-2 fw-bold fs-7">
							<i class="fa-solid fa-stethoscope me-1"></i> Start Consultations
						</a>
					</div>
				</div>
			</div>
		</div>


	</div>




</body>
</html>