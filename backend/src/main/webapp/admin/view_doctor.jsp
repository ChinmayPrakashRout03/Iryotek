<%@page import="com.hms.entity.Doctor"%>
<%@page import="com.hms.dao.DoctorDAO"%>
<%@page import="com.hms.entity.Specialist"%>
<%@page import="java.util.List"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.hms.dao.SpecialistDAO"%>
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
<title>Doctor page</title>
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


	<div class="container-fluid p-3">
		<div class="row">
			
			<div class="col-md-12">
				<div class="card my-card">
					<div class="card-body">
						<p class="fs-3 text-center text-danger">List of Doctors</p>

						<!-- message print -->
						<!-- for success msg -->
						<c:if test="${not empty successMsg }">
							<p class="text-center text-success fs-3">${successMsg}</p>
							<c:remove var="successMsg" scope="session" />
						</c:if>

						<!-- for error msg -->
						<c:if test="${not empty errorMsg }">
							<p class="text-center text-danger fs-3">${errorMsg}</p>
							<c:remove var="errorMsg" scope="session" />
						</c:if>
						<!-- End of message print -->

						<!-- table for doctor list -->
						<div class="table-responsive">
							<table class="table align-middle table-hover text-center mb-0" style="min-width: 900px;">
								<thead class="my-bg-color text-white">
									<tr style="font-size: 0.85rem; letter-spacing: 0.5px; text-transform: uppercase;">
										<th scope="col" class="py-3 px-3">Full Name</th>
										<th scope="col" class="py-3 px-2">DOB</th>
										<th scope="col" class="py-3 px-2">Qualification</th>
										<th scope="col" class="py-3 px-3">Specialist</th>
										<th scope="col" class="py-3 px-3">Email</th>
										<th scope="col" class="py-3 px-3">Phone</th>
										<th scope="col" class="py-3 px-3">Hospital</th>
										<th scope="col" class="py-3 px-3">Action</th>
									</tr>
								</thead>
								<tbody>
									<%
									DoctorDAO docDAO2 = new DoctorDAO(DBConnection.getConn());
									HospitalDAO hospDAO2 = new HospitalDAO(DBConnection.getConn());
									List<Doctor> listOfDoc = docDAO2.getAllDoctor();
									if (listOfDoc != null && !listOfDoc.isEmpty()) {
										for (Doctor doctorLst : listOfDoc) {
											Hospital hosp = hospDAO2.getHospitalById(doctorLst.getHospitalId());
									%>
									<tr>
										<td class="fw-bold text-dark px-3"><%=doctorLst.getFullName()%></td>
										<td class="px-2"><%=doctorLst.getDateOfBirth()%></td>
										<td class="px-2"><%=doctorLst.getQualification()%></td>
										<td class="px-3"><span class="badge bg-light text-dark border px-2 py-1"><%=doctorLst.getSpecialist()%></span></td>
										<td class="px-3"><%=doctorLst.getEmail()%></td>
										<td class="px-3"><%=doctorLst.getPhone()%></td>
										<td class="px-3 fw-semibold"><%= hosp != null ? hosp.getName() : "N/A" %></td>
										<td class="px-3">
											<a class="btn btn-sm btn-primary rounded-pill px-3 me-1" href="edit_doctor.jsp?id=<%=doctorLst.getId()%>">
												<i class="fa-solid fa-pen-to-square"></i> Edit
											</a>
											<a class="btn btn-sm btn-danger rounded-pill px-3" href="../deleteDoctor?id=<%= doctorLst.getId() %>">
												<i class="fa-solid fa-trash"></i> Delete
											</a>
										</td>
									</tr>
									<%
										}
									} else {
									%>
									<tr>
										<td colspan="8" class="text-center py-5 text-muted fs-5">
											<i class="fa-solid fa-user-doctor mb-2 d-block fs-1"></i>
											No doctors registered yet.
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