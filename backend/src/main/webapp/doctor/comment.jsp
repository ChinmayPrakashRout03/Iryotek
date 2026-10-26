<%@page import="com.hms.entity.Appointment"%>
<%@page import="com.hms.entity.AIDiagnosis"%>
<%@page import="com.hms.entity.MedicalHistoryItem"%>
<%@page import="com.hms.entity.PatientDocument"%>
<%@page import="com.hms.dao.AIDiagnosisDAO"%>
<%@page import="com.hms.dao.MedicalHistoryDAO"%>
<%@page import="com.hms.dao.PatientDocumentDAO"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.hms.dao.AppointmentDAO"%>
<%@page import="com.google.gson.JsonParser"%>
<%@page import="com.google.gson.JsonArray"%>
<%@page import="com.google.gson.JsonObject"%>
<%@page import="com.google.gson.JsonElement"%>
<%@page import="java.util.List"%>
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
			<div class="col-lg-8 offset-lg-2 col-md-10 offset-md-1">
				<div class="card my-card rounded-4 shadow-lg border-0 mb-4">
					<div class="card-body p-4">
						<div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
							<div>
								<h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-stethoscope text-primary me-2"></i> Clinical Consultation & Prescription</h4>
								<small class="text-muted">Enter clinical remarks and prescribe auto-cart medications</small>
							</div>
							<a href="patient.jsp" class="btn btn-sm btn-outline-secondary rounded-pill px-3"><i class="fa-solid fa-arrow-left me-1"></i> Back</a>
						</div>

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
						int id = Integer.parseInt(request.getParameter("id"));
						AppointmentDAO appDAO = new AppointmentDAO(DBConnection.getConn());
						Appointment appointment = appDAO.getAppointmentById(id);

						AIDiagnosisDAO aiDAO = new AIDiagnosisDAO(DBConnection.getConn());
						AIDiagnosis aiDiag = aiDAO.getDiagnosisByAppointmentId(id);
						if (aiDiag == null && appointment != null) {
							aiDiag = aiDAO.getLatestDiagnosisByUserId(appointment.getUserId());
						}

						MedicalHistoryDAO histDAO = new MedicalHistoryDAO(DBConnection.getConn());
						List<MedicalHistoryItem> chronicList = appointment != null ? histDAO.getHistoryByUserIdAndCategory(appointment.getUserId(), "CHRONIC_CONDITION") : null;
						List<MedicalHistoryItem> allergyList = appointment != null ? histDAO.getHistoryByUserIdAndCategory(appointment.getUserId(), "ALLERGY") : null;
						List<MedicalHistoryItem> surgeryList = appointment != null ? histDAO.getHistoryByUserIdAndCategory(appointment.getUserId(), "SURGERY") : null;

						PatientDocumentDAO docDAO = new PatientDocumentDAO(DBConnection.getConn());
						List<PatientDocument> docList = appointment != null ? docDAO.getDocumentsByUserId(appointment.getUserId()) : null;
						%>

						<!-- Pre-Consultation AI Differential Triage & Medical Records Box -->
						<div class="card border border-primary-subtle bg-light rounded-3 p-3 mb-4">
							<div class="d-flex justify-content-between align-items-center mb-2">
								<h6 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-brain text-primary me-2"></i> Sakura AI Pre-Consultation Triage & Differential Review</h6>
								<span class="badge bg-primary text-white rounded-pill px-2 py-1 fs-8">AI Assisted</span>
							</div>

							<!-- Informational Disclaimer -->
							<div class="alert alert-warning border-start border-4 border-warning small py-2 px-3 mb-3 d-flex align-items-start gap-2">
								<i class="fa-solid fa-triangle-exclamation text-warning mt-1 fs-6"></i>
								<div><strong>FOR INFORMATIONAL AND PREPARATORY PURPOSES ONLY:</strong> This AI differential diagnosis is intended to aid clinical preparation and triage prior to consultation. It is NOT a confirmed diagnosis. Final clinical assessment rests with the consulting doctor.</div>
							</div>

							<% if (aiDiag != null) { %>
								<div class="mb-2">
									<span class="badge rounded-pill <%= "EMERGENCY".equalsIgnoreCase(aiDiag.getUrgencyLevel()) ? "bg-danger" : ("URGENT".equalsIgnoreCase(aiDiag.getUrgencyLevel()) ? "bg-warning text-dark" : "bg-success") %> px-3 py-1 fs-8">
										<%= aiDiag.getUrgencyLevel() %> PRIORITY
									</span>
									<span class="ms-2 fs-7 text-muted">Patient Reported: "<em><%= aiDiag.getSymptoms() %></em>"</span>
								</div>

								<%
									try {
										JsonElement elem = JsonParser.parseString(aiDiag.getDiagnosesJson());
										if (elem.isJsonArray()) {
											JsonArray dArr = elem.getAsJsonArray();
								%>
									<div class="row g-2 mb-2">
										<% for (int k = 0; k < dArr.size(); k++) {
											JsonObject dObj = dArr.get(k).getAsJsonObject();
											String condName = dObj.has("condition") ? dObj.get("condition").getAsString() : "Condition";
											int confScore = dObj.has("confidence") ? dObj.get("confidence").getAsInt() : 50;
											String reason = dObj.has("reasoning") ? dObj.get("reasoning").getAsString() : "";
											String progCls = confScore >= 70 ? "bg-success" : (confScore >= 45 ? "bg-warning" : "bg-secondary");
										%>
											<div class="col-md-4">
												<div class="p-2 border rounded-2 bg-white h-100">
													<div class="d-flex justify-content-between align-items-center mb-1">
														<strong class="fs-8 text-dark"><%= condName %></strong>
														<span class="badge rounded-pill bg-light text-dark border fs-8"><%= confScore %>%</span>
													</div>
													<div class="progress mb-1" style="height: 4px;">
														<div class="progress-bar <%= progCls %>" style="width: <%= confScore %>%;"></div>
													</div>
													<% if (!reason.isEmpty()) { %>
														<div class="text-muted fs-8"><%= reason %></div>
													<% } %>
												</div>
											</div>
										<% } %>
									</div>
								<%
										}
									} catch (Exception ignored) {}
								%>
							<% } else { %>
								<p class="text-muted small mb-2">No previous Sakura AI triage logged for this patient.</p>
							<% } %>

							<!-- Medical History Pills -->
							<div class="row g-2 pt-2 border-top mt-2 fs-8">
								<div class="col-md-4">
									<strong class="text-danger"><i class="fa-solid fa-heart-pulse me-1"></i> Chronic:</strong>
									<% if (chronicList != null && !chronicList.isEmpty()) { %>
										<% for (MedicalHistoryItem c : chronicList) { %>
											<span class="badge bg-danger-subtle text-danger border border-danger-subtle me-1"><%= c.getTitle() %></span>
										<% } %>
									<% } else { %><span class="text-muted">None logged</span><% } %>
								</div>
								<div class="col-md-4">
									<strong class="text-warning"><i class="fa-solid fa-hand-dots me-1"></i> Allergies:</strong>
									<% if (allergyList != null && !allergyList.isEmpty()) { %>
										<% for (MedicalHistoryItem a : allergyList) { %>
											<span class="badge bg-warning-subtle text-dark border border-warning-subtle me-1"><%= a.getTitle() %></span>
										<% } %>
									<% } else { %><span class="text-muted">No allergies</span><% } %>
								</div>
								<div class="col-md-4">
									<strong class="text-primary"><i class="fa-solid fa-folder-open me-1"></i> Documents:</strong>
									<% if (docList != null && !docList.isEmpty()) { %>
										<% for (PatientDocument d : docList) { %>
											<a href="../patientDocument?action=view&id=<%= d.getId() %>" target="_blank" class="badge bg-light text-primary border text-decoration-none me-1"><i class="fa-regular fa-file me-1"></i> <%= d.getDocumentType() %></a>
										<% } %>
									<% } else { %><span class="text-muted">No files</span><% } %>
								</div>
							</div>
						</div>

						<!-- boostrap form -->
						<form class="row g-3" action="../updateStatus" method="post">

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