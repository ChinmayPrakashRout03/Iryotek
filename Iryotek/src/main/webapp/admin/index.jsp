<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.hms.dao.DoctorDAO"%>
<%@page import="com.hms.dao.HospitalDAO"%>
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
<title>Admin page</title>
<%@include file="../component/allcss.jsp"%>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>



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

	<!-- adminObj session maintain if "adminObj" empty than go and login first...-->
	<!-- no one can access admin dashboard without login as admin-->
	<c:if test="${empty adminObj }">
		<c:redirect url="../admin_login.jsp"></c:redirect>
	</c:if>



	<div class="container p-5">
		<p class="text-center text-danger fs-3">Admin Dashboard</p>

		<div class="text-end mb-4">
			<button class="btn btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#blogModal"><i class="fa-solid fa-pen-to-square"></i> Publish New Blog</button>
			<a href="../admin/exportExcel" class="btn btn-outline-success me-2"><i class="fa-solid fa-file-excel"></i> Export Appointments (Excel)</a>
			<a href="../admin/exportPDF" class="btn btn-outline-danger"><i class="fa-solid fa-file-pdf"></i> Export Appointments (PDF)</a>
		</div>

		<%
		// 1. Appointments per specialty
		StringBuilder specLabels = new StringBuilder();
		StringBuilder specData = new StringBuilder();
		java.sql.Connection connSpec = null;
		java.sql.PreparedStatement psSpec = null;
		java.sql.ResultSet rsSpec = null;
		try {
			connSpec = DBConnection.getConn();
			String sql = "SELECT d.specialist, COUNT(a.id) AS apptCount " +
						 "FROM appointment a INNER JOIN doctor d ON a.doctorId = d.id " +
						 "GROUP BY d.specialist";
			psSpec = connSpec.prepareStatement(sql);
			rsSpec = psSpec.executeQuery();
			boolean first = true;
			while (rsSpec.next()) {
				if (!first) {
					specLabels.append(",");
					specData.append(",");
				}
				specLabels.append("\"").append(rsSpec.getString("specialist")).append("\"");
				specData.append(rsSpec.getInt("apptCount"));
				first = false;
			}
		} catch(Exception e) {
			e.printStackTrace();
		} finally {
			try { if (rsSpec != null) rsSpec.close(); } catch(Exception e){}
			try { if (psSpec != null) psSpec.close(); } catch(Exception e){}
			try { if (connSpec != null) connSpec.close(); } catch(Exception e){}
		}

		// 2. Doctors per hospital branch
		StringBuilder hospLabels = new StringBuilder();
		StringBuilder hospData = new StringBuilder();
		java.sql.Connection connHosp = null;
		java.sql.PreparedStatement psHosp = null;
		java.sql.ResultSet rsHosp = null;
		try {
			connHosp = DBConnection.getConn();
			String sql = "SELECT h.name, COUNT(d.id) AS docCount " +
						 "FROM doctor d INNER JOIN hospital h ON d.hospitalId = h.id " +
						 "GROUP BY h.name";
			psHosp = connHosp.prepareStatement(sql);
			rsHosp = psHosp.executeQuery();
			boolean first = true;
			while (rsHosp.next()) {
				if (!first) {
					hospLabels.append(",");
					hospData.append(",");
				}
				hospLabels.append("\"").append(rsHosp.getString("name")).append("\"");
				hospData.append(rsHosp.getInt("docCount"));
				first = false;
			}
		} catch(Exception e) {
			e.printStackTrace();
		} finally {
			try { if (rsHosp != null) rsHosp.close(); } catch(Exception e){}
			try { if (psHosp != null) psHosp.close(); } catch(Exception e){}
			try { if (connHosp != null) connHosp.close(); } catch(Exception e){}
		}
		%>

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

		<!-- create connection with db and others -->
		<% 
		DoctorDAO docDAO = new DoctorDAO(DBConnection.getConn());
		int totalNumberOfDoctor = docDAO.countTotalDoctor();
		int totalNumberOfUser = docDAO.countTotalUser();
		int totalNumberOfAppointment = docDAO.countTotalAppointment();
		int totalNumberOfSpecialist = docDAO.countTotalSpecialist();
		
		HospitalDAO hospDAO = new HospitalDAO(DBConnection.getConn());
		int totalNumberOfHospital = hospDAO.countTotalHospital();
		%>

		<!-- row-1 -->
		<div class="row">
			<div class="col-md-4">
				<div class="card my-card">
					<div class="card-body text-center text-danger">
						<i class="fa-solid fa-user-doctor fa-3x"></i><br>
						<p class="fs-4 text-center">
							Doctor <br><%= totalNumberOfDoctor %>

						</p>
					</div>
				</div>

			</div>
			<div class="col-md-4">
				<div class="card my-card">
					<div class="card-body text-center text-danger">
						<i class="fas fa-user-circle fa-3x"></i><br>
						<p class="fs-4 text-center">
							User <br><%= totalNumberOfUser %>
						</p>
					</div>
				</div>

			</div>
			<div class="col-md-4">
				<div class="card my-card">
					<div class="card-body text-center text-danger">
						<i class="fa-solid fa-calendar-check fa-3x"></i><br>
						<p class="fs-4 text-center">
							Total Appointment <br><%= totalNumberOfAppointment %>
						</p>
					</div>
				</div>

			</div>
			<div class="col-md-4 mt-2">
				<div class="card my-card" data-bs-toggle="modal"
					data-bs-target="#exampleModal">
					<div class="card-body text-center text-danger">
						<i class="fa-solid fa-user-doctor fa-3x"></i><br>
						<p class="fs-4 text-center">
							Specialist <br><%= totalNumberOfSpecialist %>
						</p>
					</div>
				</div>

			</div>
			<div class="col-md-4 mt-2">
				<div class="card my-card">
					<div class="card-body text-center text-danger">
						<i class="fa-solid fa-hospital fa-3x"></i><br>
						<p class="fs-4 text-center">
							Hospital <br><%= totalNumberOfHospital %>
						</p>
					</div>
				</div>

			</div>
		</div>

		<!-- Hidden inputs to safely pass Chart data to JS without IDE syntax errors -->
		<input type="hidden" id="specLabelsData" value='[<%= specLabels.toString() %>]'>
		<input type="hidden" id="specDataData" value='[<%= specData.toString() %>]'>
		<input type="hidden" id="hospLabelsData" value='[<%= hospLabels.toString() %>]'>
		<input type="hidden" id="hospDataData" value='[<%= hospData.toString() %>]'>

		<!-- Charts Row -->
		<div class="row mt-5">
			<div class="col-md-6 mb-4">
				<div class="card my-card">
					<div class="card-body">
						<h5 class="card-title text-center text-danger"><i class="fa-solid fa-chart-bar"></i> Appointments per Specialty</h5>
						<div style="height: 300px; position: relative;">
							<canvas id="specialtyChart"></canvas>
						</div>
					</div>
				</div>
			</div>
			<div class="col-md-6 mb-4">
				<div class="card my-card">
					<div class="card-body">
						<h5 class="card-title text-center text-danger"><i class="fa-solid fa-chart-pie"></i> Doctors per Hospital Branch</h5>
						<div style="height: 300px; position: relative;">
							<canvas id="hospitalChart"></canvas>
						</div>
					</div>
				</div>
			</div>
		</div>

	</div>

	<script type="text/javascript">
		// Parse Chart Data from hidden inputs safely
		var specLabels = [];
		var specData = [];
		var hospLabels = [];
		var hospData = [];

		try {
			var rawSpecLabels = document.getElementById("specLabelsData").value;
			if (rawSpecLabels) specLabels = JSON.parse(rawSpecLabels);
		} catch(e) {}

		try {
			var rawSpecData = document.getElementById("specDataData").value;
			if (rawSpecData) specData = JSON.parse(rawSpecData);
		} catch(e) {}

		try {
			var rawHospLabels = document.getElementById("hospLabelsData").value;
			if (rawHospLabels) hospLabels = JSON.parse(rawHospLabels);
		} catch(e) {}

		try {
			var rawHospData = document.getElementById("hospDataData").value;
			if (rawHospData) hospData = JSON.parse(rawHospData);
		} catch(e) {}

		// Specialty Chart
		var ctxSpec = document.getElementById('specialtyChart').getContext('2d');
		var specialtyChart = new Chart(ctxSpec, {
			type: 'bar',
			data: {
				labels: specLabels,
				datasets: [{
					label: 'Appointments',
					data: specData,
					backgroundColor: 'rgba(91, 126, 60, 0.6)',
					borderColor: 'rgba(91, 126, 60, 1)',
					borderWidth: 1.5,
					borderRadius: 4
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							stepSize: 1
						}
					}
				}
			}
		});

		// Hospital Chart
		var ctxHosp = document.getElementById('hospitalChart').getContext('2d');
		var hospitalChart = new Chart(ctxHosp, {
			type: 'doughnut',
			data: {
				labels: hospLabels,
				datasets: [{
					data: hospData,
					backgroundColor: [
						'rgba(91, 126, 60, 0.7)',
						'rgba(46, 196, 182, 0.7)',
						'rgba(231, 76, 60, 0.7)',
						'rgba(241, 196, 15, 0.7)',
						'rgba(155, 89, 182, 0.7)'
					],
					borderWidth: 1
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false
			}
		});
	</script>

	<!-- Modal -->
	<div class="modal fade" id="exampleModal" tabindex="-1"
		aria-labelledby="exampleModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title text-danger" id="exampleModalLabel">Add Specialist</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal"
						aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<form action="../addSpecialist" method="post">
						<div class="form-group">
							<label class="form-label">Enter Specialist Name</label> 
							<input type="text" name="specialistName" placeholder="Enter Specialist Name" class="form-control">
						</div>
						<div class="text-center mt-2">
							<button type="submit" class="btn btn-outline-danger">Add</button>
						</div>
					</form>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>
	<!-- end of specialist modal -->

	<!-- Add Blog Modal -->
	<div class="modal fade" id="blogModal" tabindex="-1" aria-labelledby="blogModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<div class="modal-header bg-primary text-white">
					<h5 class="modal-title" id="blogModalLabel"><i class="fa-solid fa-newspaper me-2"></i> Publish New Health Article / Blog</h5>
					<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body p-4">
					<form action="../addBlog" method="post">
						<div class="mb-3">
							<label class="form-label fw-bold">Article Title</label>
							<input type="text" name="title" placeholder="Enter article title" class="form-control" required>
						</div>
						<div class="row mb-3">
							<div class="col-md-6">
								<label class="form-label fw-bold">Category</label>
								<input type="text" name="category" placeholder="e.g. Pediatrics, Cardiology" class="form-control" required>
							</div>
							<div class="col-md-6">
								<label class="form-label fw-bold">Author</label>
								<input type="text" name="author" placeholder="e.g. Dr. John (Cardiologist)" class="form-control" required>
							</div>
						</div>
						<div class="mb-3">
							<label class="form-label fw-bold">Image Path</label>
							<input type="text" name="imagePath" placeholder="img/hospital1.jpg" class="form-control" value="img/hospital1.jpg">
						</div>
						<div class="mb-3">
							<label class="form-label fw-bold">Short Excerpt</label>
							<textarea name="excerpt" rows="2" class="form-control" placeholder="Brief 1-2 sentence summary for blog cards" required></textarea>
						</div>
						<div class="mb-3">
							<label class="form-label fw-bold">Full Article Content</label>
							<textarea name="content" rows="6" class="form-control" placeholder="Write full article details..." required></textarea>
						</div>
						<div class="text-end">
							<button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" class="btn btn-primary"><i class="fa-solid fa-paper-plane me-1"></i> Publish Article</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>

</body>
</html>