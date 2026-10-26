<%@page import="com.hms.entity.Hospital"%>
<%@page import="com.hms.dao.HospitalDAO"%>
<%@page import="java.util.List"%>
<%@page import="com.hms.db.DBConnection"%>
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
<title>View Hospitals</title>
<%@include file="../component/allcss.jsp"%>

<!-- customs css for this page -->
<style type="text/css">
.my-card {
	box-shadow: 0px 0px 10px 1px maroon;
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
						<p class="fs-3 text-center text-danger">List of Hospitals</p>

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

						<!-- table for hospital list -->

						<table class="table table-striped">
							<thead>
								<tr class="table-info">
									<th scope="col">Hospital Name</th>
									<th scope="col">Address</th>
									<th scope="col">City</th>
									<th scope="col">State</th>
									<th scope="col">Phone</th>
									<th class="text-center" scope="col">Action</th>
								</tr>
							</thead>
							<tbody>

								<%
								HospitalDAO hospitalDAO = new HospitalDAO(DBConnection.getConn());
								List<Hospital> hospitalList = hospitalDAO.getAllHospital();
								for (Hospital h : hospitalList) {
								%>
								<tr>
									<th><%=h.getName()%></th>
									<td><%=h.getAddress()%></td>
									<td><%=h.getCity()%></td>
									<td><%=h.getState()%></td>
									<td><%=h.getPhone()%></td>
									<td><a class="btn btn-sm btn-danger" href="../deleteHospital?id=<%= h.getId() %>">Delete</a></td>
								</tr>
								<%
								}
								%>


							</tbody>
						</table>

						<!-- end table for hospital list -->


					</div>

				</div>
			</div>
		</div>
	</div>


</body>
</html>
