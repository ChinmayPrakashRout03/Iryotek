<%@page import="com.hms.entity.Appointment"%>
<%@page import="java.util.List"%>
<%@page import="com.hms.entity.Doctor"%>
<%@page import="com.hms.dao.AppointmentDAO"%>
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
<title>Patient Page</title>


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

	<!-- if "doctorObj" is empty means no one is login. -->

	<c:if test="${empty doctorObj }">

		<c:redirect url="../doctor_login.jsp"></c:redirect>

	</c:if>

	<!-- check is doctor is login or not -->


	<div class="container p-3">
		<div class="row">
			<div class="col-md-12">
				<div class="card my-card">
					<div class="card-body">
						<p class="text-center text-success fs-3">Patient Details</p>

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

						<!-- table for patient list -->
						<div class="table-responsive">
							<table class="table align-middle table-hover text-center mb-0" style="min-width: 950px;">
								<thead class="my-bg-color text-white">
									<tr style="font-size: 0.85rem; letter-spacing: 0.5px; text-transform: uppercase;">
										<th scope="col" class="py-3 px-3">Full Name</th>
										<th scope="col" class="py-3 px-2">Gender</th>
										<th scope="col" class="py-3 px-2">Age</th>
										<th scope="col" class="py-3 px-3">Date</th>
										<th scope="col" class="py-3 px-2">Token</th>
										<th scope="col" class="py-3 px-3">Time Slot</th>
										<th scope="col" class="py-3 px-3">Email</th>
										<th scope="col" class="py-3 px-3">Phone</th>
										<th scope="col" class="py-3 px-3">Diseases</th>
										<th scope="col" class="py-3 px-2">Status</th>
										<th scope="col" class="py-3 px-3">Action</th>
									</tr>
								</thead>
								<tbody>
									<%
									Doctor doctor = (Doctor) session.getAttribute("doctorObj");
									AppointmentDAO appDAO = new AppointmentDAO(DBConnection.getConn());
									List<Appointment> list = appDAO.getAllAppointmentByLoginDoctor(doctor.getId());
									if (list != null && !list.isEmpty()) {
										for (Appointment applist : list) {
									%>

									<tr>
										<td class="fw-bold text-dark px-3"><%=applist.getFullName()%></td>
										<td class="text-capitalize px-2"><%=applist.getGender()%></td>
										<td class="px-2"><%=applist.getAge()%></td>
										<td class="px-3"><%=applist.getAppointmentDate()%></td>
										<td class="px-2">
											<span class="badge bg-danger rounded-pill px-3 py-2 fs-6 shadow-sm"><%=applist.getTokenNo()%></span>
										</td>
										<td class="px-3"><strong class="myP-color"><%=applist.getAppointmentTime()%></strong></td>
										<td class="px-3"><%=applist.getEmail()%></td>
										<td class="px-3"><%=applist.getPhone()%></td>
										<td class="px-3"><span class="badge bg-light text-dark border px-2 py-1"><%=applist.getDiseases()%></span></td>
										<td class="px-2">
											<%
											if ("Pending".equals(applist.getStatus())) {
											%> 
												<span class="badge bg-warning text-dark px-3 py-2 rounded-pill"><i class="fa-solid fa-spinner fa-spin me-1"></i> Pending</span> 
											<%
											} else {
											%> 
												<span class="badge bg-success px-3 py-2 rounded-pill"><i class="fa-solid fa-check me-1"></i> <%=applist.getStatus()%></span> 
											<%
											}
											%>
										</td>
										<td class="px-3">
											<%
											if ("Pending".equals(applist.getStatus())) {
											%> 
												<a href="comment.jsp?id=<%=applist.getId()%>" class="btn btn-success btn-sm px-3 rounded-pill">
													<i class="fa-solid fa-stethoscope me-1"></i> Prescription
												</a> 
											<%
											} else {
											%> 
												<span class="text-muted fs-7"><i class="fa-solid fa-check-double text-success"></i> Treated</span>
											<%
											}
											%>
										</td>
									</tr>

									<%
										}
									} else {
									%>
									<tr>
										<td colspan="11" class="text-center py-5 text-muted fs-5">
											<i class="fa-solid fa-calendar-minus mb-2 d-block fs-1"></i>
											No patient appointments assigned yet.
										</td>
									</tr>
									<%
									}
									%>
								</tbody>
							</table>
						</div>
						<!-- end table for doctor list -->



					</div>
				</div>
			</div>

		</div>

	</div>

</body>
</html>