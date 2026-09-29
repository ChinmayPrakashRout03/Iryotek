<%@page import="com.hms.entity.Appointment"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.hms.dao.AppointmentDAO"%>
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
<title>Comment/Prescription Doctor</title>
<%@include file="../component/allcss.jsp"%>


<!-- customs css for this page -->
<style type="text/css">
.my-card {
	box-shadow: 0px 0px 10px 1px maroon;
	/*box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.3);*/
}

/* backgournd image css */
.my-bg-img {
	background: linear-gradient(rgba(0, 0, 0, .4), rgba(0, 0, 0, .4)),
		url("../img/hospital1.jpg");
	height: 20vh;
	width: 100%;
	background-size: cover;
	background-repeat: no-repeat;
}
</style>
<!-- end of customs css for this page -->

</head>
<body>

	<%@include file="navbar.jsp"%>

	<c:if test="${empty doctorObj }">

		<c:redirect url="../doctor_login.jsp"></c:redirect>

	</c:if>

	<!-- check is doctor is login or not -->


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



			<!-- col-2 -->
			<div class="col-md-6 offset-md-3">
				<div class="card my-card">
					<div class="card-body">
						<p class="text-center fs-3">Leave a Treatment Comment</p>

						

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


						<%
						/* get or receive appointment id which is coming through url (from patient.jsp page) */
						int id = Integer.parseInt(request.getParameter("id"));
						AppointmentDAO appDAO = new AppointmentDAO(DBConnection.getConn());
						Appointment appointment = appDAO.getAppointmentById(id);
						
						%>
						
						
						
						<!-- boostrap form -->
						<form class="row g-3" action="../updateStatus" method="post">

							<!-- take user Id in hidden field -->
							<%-- <input type="hidden" name="userId" value="${ userObj.id }"> --%>

							<div class="col-md-6">
								<label class="form-label">Full Name</label> <input
									name="fullName" type="text" placeholder="Enter full name"
									class="form-control" readonly value="<%= appointment.getFullName()%>">

							</div>

							<div class="col-md-6">
								<label class="form-label">Age</label> <input name="age"
									type="number" placeholder="Enter your Age" class="form-control"
									readonly value="<%= appointment.getAge()%>">
							</div>

							<div class="col-md-6">
								<label class="form-label">Phone</label> <input name="phone"
									type="number" maxlength="11" placeholder="Enter Mobile no."
									class="form-control" readonly value="<%= appointment.getPhone()%>">
							</div>

							<div class="col-md-6">
								<label class="form-label">Diseases</label> <input
									name="diseases" type="text" placeholder="Enter diseases"
									class="form-control" readonly value="<%= appointment.getDiseases()%>">
							</div>



							<div class="col-md-12">
								<label class="form-label fw-bold"><i class="fa-solid fa-notes-medical text-primary me-1"></i> Doctor Clinical Remarks</label>
								<textarea name="comment" placeholder="Enter clinical assessment & treatment notes..."
									class="form-control" rows="3" required></textarea>
							</div>

							<!-- Structured Prescribed Medicines Builder -->
							<div class="col-md-12 mt-4">
								<div class="d-flex justify-content-between align-items-center mb-2">
									<label class="form-label fw-bold mb-0"><i class="fa-solid fa-pills text-success me-1"></i> Prescribe Medicines (Auto-Cart)</label>
									<button type="button" class="btn btn-sm btn-outline-success rounded-pill px-3" onclick="addMedicineRow()">
										<i class="fa-solid fa-plus me-1"></i> Add Medicine
									</button>
								</div>
								<p class="text-muted fs-7 mb-3">Available prescribed medicines will automatically be added to the patient's Medicine Cart upon submitting this prescription.</p>
								
								<div id="medicineRowsContainer">
									<%
									com.hms.dao.MedicineDAO medDAO = new com.hms.dao.MedicineDAO(DBConnection.getConn());
									java.util.List<com.hms.entity.Medicine> allMeds = medDAO.getAllMedicines();
									%>
									<div class="row g-2 align-items-center mb-2 medicine-row">
										<div class="col-md-5">
											<select name="medicineId" class="form-select fs-7" required>
												<option value="">-- Select Prescribed Medicine --</option>
												<% for (com.hms.entity.Medicine m : allMeds) { %>
													<option value="<%= m.getId() %>"><%= m.getName() %> (<%= m.getCategory() %>) - ₹<%= m.getPrice() %> [Stock: <%= m.getStock() %>]</option>
												<% } %>
											</select>
										</div>
										<div class="col-md-4">
											<input type="text" name="dosage" placeholder="e.g. 1 tablet twice daily" class="form-control fs-7" required value="1 tablet twice daily">
										</div>
										<div class="col-md-2">
											<input type="number" name="quantity" placeholder="Qty" min="1" max="100" class="form-control fs-7" required value="10">
										</div>
										<div class="col-md-1 text-center">
											<button type="button" class="btn btn-sm btn-outline-danger border-0 rounded-circle" onclick="removeMedicineRow(this)">
												<i class="fa-solid fa-trash-can"></i>
											</button>
										</div>
									</div>
								</div>
							</div>

							<!-- which appointment's comment is it / comment Id -->
							<input type="hidden" name="id" value="<%= appointment.getId()%>" class="form-control">

							<!-- which doctor give a comment / doctor Id -->
							<input type="hidden" name="doctorId" value="<%= appointment.getDoctorId()%>" class="form-control">

							<div class="col-md-12 mt-4">
								<button type="submit" class="btn btn-primary w-100 py-3 rounded-pill fw-bold fs-6">
									<i class="fa-solid fa-file-signature me-2"></i> Finalize & Send Prescription
								</button>
							</div>
						</form>

						<script>
						function addMedicineRow() {
							const container = document.getElementById('medicineRowsContainer');
							const firstRow = container.querySelector('.medicine-row');
							if (firstRow) {
								const newRow = firstRow.cloneNode(true);
								newRow.querySelector('select').selectedIndex = 0;
								newRow.querySelector('input[name="dosage"]').value = "1 tablet daily";
								newRow.querySelector('input[name="quantity"]').value = "5";
								container.appendChild(newRow);
							}
						}

						function removeMedicineRow(btn) {
							const container = document.getElementById('medicineRowsContainer');
							const rows = container.querySelectorAll('.medicine-row');
							if (rows.length > 1) {
								btn.closest('.medicine-row').remove();
							} else {
								alert("At least one prescribed medicine row is required.");
							}
						}
						</script>

						<!-- end of boostrap form -->

					</div>
				</div>

			</div>

		</div>


	</div>

	<!-- 2nd Div -->

</body>
</html>