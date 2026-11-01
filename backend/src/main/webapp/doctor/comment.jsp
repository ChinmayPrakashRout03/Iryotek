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
								<h6 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-brain text-primary me-2"></i> Iryo AI Pre-Consultation Triage & Differential Review</h6>
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
								<p class="text-muted small mb-2">No previous Iryo AI triage logged for this patient.</p>
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

							<!-- Intelligent Structured Prescribed Medicines Builder -->
							<div class="col-md-12 mt-4">
								<div class="card border border-success-subtle bg-white shadow-sm rounded-4 overflow-hidden mb-3">
									<div class="card-header bg-success-subtle p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
										<div>
											<h6 class="fw-bold text-success-emphasis mb-0">
												<i class="fa-solid fa-calculator text-success me-2"></i> Smart Prescription Intelligence & Dispensing Calculator
											</h6>
											<small class="text-muted">Deterministic quantity calculation engine: Units per dose × Doses per day × Duration days</small>
										</div>
										<button type="button" class="btn btn-sm btn-success rounded-pill px-3 shadow-sm" onclick="addMedicineRow()">
											<i class="fa-solid fa-plus me-1"></i> Add Prescribed Medicine
										</button>
									</div>

									<div class="card-body p-3">
										<!-- AI Quick Natural Language Prescription Parser -->
										<div class="p-3 mb-3 bg-light rounded-3 border border-dashed border-primary">
											<div class="d-flex justify-content-between align-items-center mb-2">
												<label class="form-label mb-0 fw-semibold text-primary fs-7">
													<i class="fa-solid fa-wand-magic-sparkles me-1"></i> AI Natural Language Prescription Assistant
												</label>
												<span class="badge bg-primary-subtle text-primary border border-primary-subtle fs-8">AI + Deterministic Safety</span>
											</div>
											<div class="input-group">
												<input type="text" id="aiPrescriptionInput" class="form-control form-control-sm fs-7"
													placeholder="e.g. Paracetamol 500mg 1 tablet 3 times daily for 5 days after food">
												<button type="button" class="btn btn-sm btn-primary fw-semibold px-3" onclick="parseNaturalPrescription()">
													<i class="fa-solid fa-robot me-1"></i> AI Parse & Auto-Fill
												</button>
											</div>
											<div id="aiParseFeedback" class="mt-2 fs-8 text-muted d-none"></div>
										</div>

										<div id="medicineRowsContainer">
											<%
											com.hms.dao.MedicineDAO medDAO = new com.hms.dao.MedicineDAO(DBConnection.getConn());
											java.util.List<com.hms.entity.Medicine> allMeds = medDAO.getAllMedicines();
											%>
											<!-- Template Row 1 -->
											<div class="medicine-item-card p-3 mb-3 border rounded-3 bg-light-subtle shadow-xs position-relative" data-row-index="0">
												<div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
													<span class="badge bg-secondary-subtle text-secondary fw-semibold row-number-badge">Medicine #1</span>
													<button type="button" class="btn btn-sm btn-link text-danger p-0 text-decoration-none" onclick="removeMedicineRow(this)" title="Remove item">
														<i class="fa-solid fa-trash-can"></i> Remove
													</button>
												</div>

												<div class="row g-2">
													<!-- Medicine Select -->
													<div class="col-md-5">
														<label class="form-label fs-8 fw-semibold text-dark mb-1">Select Medicine & Verified Formulation</label>
														<select name="medicineId" class="form-select form-select-sm fs-7 med-select" required onchange="onMedicineChanged(this)">
															<option value="">-- Choose Medicine from Formulary --</option>
															<% for (com.hms.entity.Medicine m : allMeds) { %>
																<option value="<%= m.getId() %>"
																	data-name="<%= m.getName() %>"
																	data-form="<%= m.getDosageForm() %>"
																	data-stock="<%= m.getStock() %>"
																	data-price="<%= m.getPrice() %>">
																	<%= m.getName() %> (<%= m.getDosageForm() %>) - Stock: <%= m.getStock() %>
																</option>
															<% } %>
														</select>
														<div class="med-meta-display mt-1 fs-8 text-muted d-flex gap-2">
															<span class="med-form-badge badge bg-light text-dark border">Form: -</span>
															<span class="med-stock-badge badge bg-light text-dark border">Available: -</span>
														</div>
													</div>

													<!-- Dose: Units Per Dose -->
													<div class="col-md-2">
														<label class="form-label fs-8 fw-semibold text-dark mb-1">Units / Dose</label>
														<input type="number" step="0.5" min="0.5" name="unitsPerDose" value="1.0"
															class="form-control form-control-sm fs-7 units-input" required oninput="recalculateRow(this)">
														<small class="text-muted fs-8 unit-label">tablet(s)</small>
													</div>

													<!-- Frequency -->
													<div class="col-md-3">
														<label class="form-label fs-8 fw-semibold text-dark mb-1">Frequency</label>
														<select name="frequency" class="form-select form-select-sm fs-7 freq-select" required onchange="recalculateRow(this)">
															<option value="Once daily">Once daily (1x/day)</option>
															<option value="Twice daily">Twice daily (2x/day)</option>
															<option value="Three times daily" selected>Three times daily (3x/day)</option>
															<option value="Four times daily">Four times daily (4x/day)</option>
															<option value="Every 8 hours">Every 8 hours (3x/day)</option>
															<option value="Every 12 hours">Every 12 hours (2x/day)</option>
															<option value="Every other day">Every other day (0.5x/day)</option>
															<option value="PRN max 3 times daily">PRN (As needed, max 3x/day)</option>
															<option value="PRN max 2 times daily">PRN (As needed, max 2x/day)</option>
														</select>
													</div>

													<!-- Duration in Days -->
													<div class="col-md-2">
														<label class="form-label fs-8 fw-semibold text-dark mb-1">Duration</label>
														<div class="input-group input-group-sm">
															<input type="number" min="1" max="180" name="durationDays" value="5"
																class="form-control fs-7 duration-input" required oninput="recalculateRow(this)">
															<span class="input-group-text fs-8">days</span>
														</div>
													</div>

													<!-- Route -->
													<div class="col-md-3 mt-2">
														<label class="form-label fs-8 fw-semibold text-dark mb-1">Route</label>
														<select name="route" class="form-select form-select-sm fs-7">
															<option value="Oral" selected>Oral (PO)</option>
															<option value="Topical">Topical</option>
															<option value="Inhalation">Inhalation</option>
															<option value="Ophthalmic">Ophthalmic (Eye)</option>
															<option value="Otic">Otic (Ear)</option>
															<option value="Injection">Injection (IV/IM)</option>
															<option value="Sublingual">Sublingual</option>
														</select>
													</div>

													<!-- Special Instructions -->
													<div class="col-md-5 mt-2">
														<label class="form-label fs-8 fw-semibold text-dark mb-1">Special Instructions</label>
														<input type="text" name="specialInstructions" placeholder="e.g. After meals, take with water"
															class="form-control form-control-sm fs-7 special-instr-input" value="After meals" oninput="recalculateRow(this)">
													</div>

													<!-- Explicit Qty Override (Optional) -->
													<div class="col-md-4 mt-2">
														<label class="form-label fs-8 fw-semibold text-muted mb-1">Explicit Qty (Optional)</label>
														<input type="number" min="1" name="quantity" placeholder="Auto-calculated"
															class="form-control form-control-sm fs-7 explicit-qty-input" oninput="recalculateRow(this)">
													</div>

													<!-- Calculation Breakdown & Safeguard Display Box -->
													<div class="col-md-12 mt-2">
														<div class="calc-result-box p-2 rounded-2 border bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
															<div class="d-flex align-items-center gap-2">
																<span class="badge bg-primary text-white fs-8 px-2 py-1">
																	<i class="fa-solid fa-equals me-1"></i> Calculated Quantity: <strong class="calc-qty-num fs-7 ms-1">15</strong> <span class="calc-unit-label">tablets</span>
																</span>
																<small class="text-secondary font-monospace fs-8 calc-formula-text">1 tablet × 3 doses/day × 5 days = 15 tablets</small>
															</div>
															<div class="calc-clarification-banner text-danger fs-8 fw-semibold d-none">
																<i class="fa-solid fa-triangle-exclamation me-1"></i> <span class="clarification-text"></span>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- which appointment's comment is it / comment Id -->
							<input type="hidden" name="id" value="<%= appointment.getId()%>" class="form-control">

							<!-- which doctor give a comment / doctor Id -->
							<input type="hidden" name="doctorId" value="<%= appointment.getDoctorId()%>" class="form-control">

							<div class="col-md-12 mt-3">
								<button type="button" class="btn btn-primary w-100 py-3 rounded-pill fw-bold fs-6 shadow-sm" onclick="openPrescriptionReviewModal()">
									<i class="fa-solid fa-clipboard-check me-2"></i> Review Prescription Summary & Finalize
								</button>
							</div>

							<!-- Modal: Prescription Summary & Final Clinical Approval -->
							<div class="modal fade" id="prescriptionReviewModal" tabindex="-1" aria-labelledby="reviewModalLabel" aria-hidden="true">
								<div class="modal-dialog modal-lg modal-dialog-centered">
									<div class="modal-content rounded-4 border-0 shadow-lg">
										<div class="modal-header bg-primary text-white rounded-top-4 p-3">
											<h5 class="modal-title fw-bold" id="reviewModalLabel">
												<i class="fa-solid fa-file-prescription me-2"></i> Prescription Clinical Summary & Approval
											</h5>
											<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
										</div>
										<div class="modal-body p-4">
											<div class="alert alert-info border-0 rounded-3 small py-2 px-3 mb-3">
												<strong>Clinician Verification:</strong> Please review the calculated dispensing quantities before authorizing. Total quantities are deterministically computed based on your prescribed dosage, frequency, and treatment duration.
											</div>

											<div class="p-3 bg-light rounded-3 border mb-3">
												<div class="row g-2 fs-7">
													<div class="col-6"><strong>Patient:</strong> <%= appointment.getFullName() %> (Token #<%= appointment.getTokenNo() %>)</div>
													<div class="col-6"><strong>Date:</strong> <%= appointment.getAppointmentDate() %></div>
													<div class="col-12 mt-1"><strong>Doctor Remarks:</strong> <span id="modalRemarksPreview" class="text-muted fst-italic"></span></div>
												</div>
											</div>

											<h6 class="fw-bold text-dark fs-7 mb-2 text-uppercase tracking-wider">Itemized Prescription Summary</h6>
											<div class="table-responsive">
												<table class="table table-bordered align-middle fs-7 mb-0">
													<thead class="table-light">
														<tr>
															<th>Medicine</th>
															<th>Dose</th>
															<th>Frequency</th>
															<th>Duration</th>
															<th class="text-center text-primary">Calculated Dispense Quantity</th>
															<th>Stock Status</th>
														</tr>
													</thead>
													<tbody id="modalSummaryTableBody">
														<!-- Injected dynamically -->
													</tbody>
												</table>
											</div>

											<div id="modalClarificationWarning" class="alert alert-danger mt-3 d-none">
												<i class="fa-solid fa-circle-exclamation me-2"></i>
												<strong id="modalClarificationText">Prescription clarification required. The medicine quantity cannot be calculated safely from the available instructions.</strong>
											</div>
										</div>
										<div class="modal-footer bg-light p-3 rounded-bottom-4 d-flex justify-content-between">
											<button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">
												<i class="fa-solid fa-pen-to-square me-1"></i> Review / Edit Prescription
											</button>
											<button type="button" id="confirmApproveBtn" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onclick="submitFinalPrescription()">
												<i class="fa-solid fa-circle-check me-2"></i> Approve & Authorize Prescription
											</button>
										</div>
									</div>
								</div>
							</div>
						</form>

						<script>
						function updateRowNumbers() {
							const rows = document.querySelectorAll('#medicineRowsContainer .medicine-item-card');
							rows.forEach((r, idx) => {
								r.setAttribute('data-row-index', idx);
								const badge = r.querySelector('.row-number-badge');
								if (badge) badge.textContent = 'Medicine #' + (idx + 1);
							});
						}

						function onMedicineChanged(selectElem) {
							const row = selectElem.closest('.medicine-item-card');
							const opt = selectElem.selectedOptions[0];
							if (!opt || !opt.value) {
								row.querySelector('.med-form-badge').textContent = 'Form: -';
								row.querySelector('.med-stock-badge').textContent = 'Available: -';
								return;
							}
							const form = opt.getAttribute('data-form') || 'Tablet';
							const stock = parseInt(opt.getAttribute('data-stock') || '0', 10);

							row.querySelector('.med-form-badge').textContent = 'Form: ' + form;
							const stockBadge = row.querySelector('.med-stock-badge');
							stockBadge.textContent = 'Stock: ' + stock;
							if (stock <= 0) {
								stockBadge.className = 'med-stock-badge badge bg-danger text-white border';
							} else if (stock < 15) {
								stockBadge.className = 'med-stock-badge badge bg-warning text-dark border';
							} else {
								stockBadge.className = 'med-stock-badge badge bg-success text-white border';
							}

							// Update unit label
							const unitLabel = row.querySelector('.unit-label');
							if (form.toLowerCase().includes('capsule')) unitLabel.textContent = 'capsule(s)';
							else if (form.toLowerCase().includes('syrup')) unitLabel.textContent = 'mL';
							else if (form.toLowerCase().includes('inhaler')) unitLabel.textContent = 'puff(s)';
							else if (form.toLowerCase().includes('ointment') || form.toLowerCase().includes('cream')) unitLabel.textContent = 'application';
							else if (form.toLowerCase().includes('drop')) unitLabel.textContent = 'drop(s)';
							else unitLabel.textContent = 'tablet(s)';

							recalculateRow(selectElem);
						}

						function recalculateRow(elem) {
							const row = elem.closest('.medicine-item-card');
							const medSelect = row.querySelector('.med-select');
							const unitsInput = row.querySelector('.units-input');
							const freqSelect = row.querySelector('.freq-select');
							const durationInput = row.querySelector('.duration-input');
							const routeSelect = row.querySelector('select[name="route"]');
							const specialInstr = row.querySelector('.special-instr-input');
							const explicitQtyInput = row.querySelector('.explicit-qty-input');

							const form = (medSelect.selectedOptions[0] ? medSelect.selectedOptions[0].getAttribute('data-form') : 'Tablet') || 'Tablet';
							const units = parseFloat(unitsInput.value) || 0;
							const freq = freqSelect.value;
							const duration = parseInt(durationInput.value, 10) || 0;
							const route = routeSelect ? routeSelect.value : 'Oral';
							const instr = specialInstr ? specialInstr.value : '';
							const explicitQty = explicitQtyInput.value ? parseInt(explicitQtyInput.value, 10) : '';

							// Local fast deterministic calculator preview
							let dosesPerDay = 1.0;
							const f = freq.toLowerCase();
							if (f.includes('four times') || f.includes('qid')) dosesPerDay = 4.0;
							else if (f.includes('three times') || f.includes('tid') || f.includes('every 8 hours')) dosesPerDay = 3.0;
							else if (f.includes('twice') || f.includes('bid') || f.includes('every 12 hours')) dosesPerDay = 2.0;
							else if (f.includes('once') || f.includes('od')) dosesPerDay = 1.0;
							else if (f.includes('every other day')) dosesPerDay = 0.5;
							else if (f.includes('prn max 3')) dosesPerDay = 3.0;
							else if (f.includes('prn max 2')) dosesPerDay = 2.0;

							const clarificationBanner = row.querySelector('.calc-clarification-banner');
							const clarificationText = row.querySelector('.clarification-text');
							const calcQtyNum = row.querySelector('.calc-qty-num');
							const calcUnitLabel = row.querySelector('.calc-unit-label');
							const formulaText = row.querySelector('.calc-formula-text');

							if (units <= 0 || duration <= 0 || !freq) {
								clarificationBanner.classList.remove('d-none');
								clarificationText.textContent = 'Prescription clarification required. The medicine quantity cannot be calculated safely from the available instructions.';
								calcQtyNum.textContent = '0';
								return;
							}

							clarificationBanner.classList.add('d-none');

							let totalUnits = units * dosesPerDay * duration;
							let dispenseQty = Math.ceil(totalUnits);
							let unitName = 'tablets';

							if (form.toLowerCase().includes('capsule')) unitName = 'capsules';
							else if (form.toLowerCase().includes('syrup')) { unitName = 'mL'; }
							else if (form.toLowerCase().includes('inhaler')) {
								dispenseQty = Math.max(1, Math.ceil(totalUnits / 200.0));
								unitName = dispenseQty === 1 ? 'canister' : 'canisters';
							} else if (form.toLowerCase().includes('ointment') || form.toLowerCase().includes('cream')) {
								dispenseQty = Math.max(1, Math.ceil(duration / 14.0));
								unitName = dispenseQty === 1 ? 'tube' : 'tubes';
							} else if (form.toLowerCase().includes('drop')) {
								dispenseQty = Math.max(1, Math.ceil(duration / 28.0));
								unitName = dispenseQty === 1 ? 'bottle' : 'bottles';
							}

							calcQtyNum.textContent = dispenseQty;
							calcUnitLabel.textContent = unitName;
							formulaText.textContent = units + ' unit × ' + dosesPerDay + ' doses/day × ' + duration + ' days = ' + dispenseQty + ' ' + unitName;
						}

						function addMedicineRow() {
							const container = document.getElementById('medicineRowsContainer');
							const firstRow = container.querySelector('.medicine-item-card');
							if (firstRow) {
								const newRow = firstRow.cloneNode(true);
								newRow.querySelector('select.med-select').selectedIndex = 0;
								newRow.querySelector('.med-form-badge').textContent = 'Form: -';
								newRow.querySelector('.med-stock-badge').textContent = 'Available: -';
								newRow.querySelector('.units-input').value = '1.0';
								newRow.querySelector('.freq-select').value = 'Three times daily';
								newRow.querySelector('.duration-input').value = '5';
								newRow.querySelector('.special-instr-input').value = 'After meals';
								newRow.querySelector('.explicit-qty-input').value = '';
								container.appendChild(newRow);
								updateRowNumbers();
								recalculateRow(newRow.querySelector('.units-input'));
							}
						}

						function removeMedicineRow(btn) {
							const container = document.getElementById('medicineRowsContainer');
							const rows = container.querySelectorAll('.medicine-item-card');
							if (rows.length > 1) {
								btn.closest('.medicine-item-card').remove();
								updateRowNumbers();
							} else {
								alert("At least one prescribed medicine item is required.");
							}
						}

						function parseNaturalPrescription() {
							const input = document.getElementById('aiPrescriptionInput');
							const feedback = document.getElementById('aiParseFeedback');
							const rawText = input.value.trim();
							if (!rawText) {
								alert("Please enter a prescription instruction to parse.");
								return;
							}

							feedback.classList.remove('d-none');
							feedback.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Analyzing clinical instruction with Iryotek AI...';

							fetch('../parsePrescription?rawText=' + encodeURIComponent(rawText))
								.then(r => r.json())
								.then(data => {
									if (!data.valid) {
										feedback.innerHTML = '<span class="text-danger"><i class="fa-solid fa-triangle-exclamation me-1"></i> ' + (data.clarificationMessage || 'Prescription clarification required.') + '</span>';
										return;
									}

									feedback.innerHTML = '<span class="text-success"><i class="fa-solid fa-circle-check me-1"></i> Extracted: <strong>' + (data.medicineName || 'Medicine') + '</strong> ' + (data.strength || '') + ' | ' + data.unitsPerDose + ' ' + data.dosageForm + ' ' + data.frequency + ' for ' + data.durationDays + ' days (' + data.calculationBreakdown + ')</span>';

									// Auto-populate into the first empty or last row
									const container = document.getElementById('medicineRowsContainer');
									let targetRow = Array.from(container.querySelectorAll('.medicine-item-card')).find(r => !r.querySelector('.med-select').value);
									if (!targetRow) {
										addMedicineRow();
										const allRows = container.querySelectorAll('.medicine-item-card');
										targetRow = allRows[allRows.length - 1];
									}

									// Attempt to match select by name
									const select = targetRow.querySelector('.med-select');
									const searchName = (data.medicineName || '').toLowerCase();
									let matchedIndex = 0;
									for (let i = 0; i < select.options.length; i++) {
										const optText = select.options[i].text.toLowerCase();
										if (searchName && optText.includes(searchName)) {
											matchedIndex = i;
											break;
										}
									}
									if (matchedIndex > 0) {
										select.selectedIndex = matchedIndex;
									}

									targetRow.querySelector('.units-input').value = data.unitsPerDose || 1.0;
									if (data.frequency) {
										const fSelect = targetRow.querySelector('.freq-select');
										for (let j = 0; j < fSelect.options.length; j++) {
											if (fSelect.options[j].value.toLowerCase().includes(data.frequency.toLowerCase())) {
												fSelect.selectedIndex = j;
												break;
											}
										}
									}
									targetRow.querySelector('.duration-input').value = data.durationDays || 5;
									if (data.specialInstructions) {
										targetRow.querySelector('.special-instr-input').value = data.specialInstructions;
									}

									onMedicineChanged(select);
								})
								.catch(err => {
									feedback.innerHTML = '<span class="text-danger"><i class="fa-solid fa-circle-xmark me-1"></i> Failed to communicate with parser.</span>';
								});
						}

						function openPrescriptionReviewModal() {
							const commentVal = document.querySelector('textarea[name="comment"]').value.trim();
							if (!commentVal) {
								alert("Please enter Doctor Clinical Remarks before reviewing the prescription.");
								document.querySelector('textarea[name="comment"]').focus();
								return;
							}

							const rows = document.querySelectorAll('#medicineRowsContainer .medicine-item-card');
							const tbody = document.getElementById('modalSummaryTableBody');
							tbody.innerHTML = '';
							let hasClarification = false;
							let clarificationReason = '';

							rows.forEach(r => {
								const select = r.querySelector('.med-select');
								const opt = select.selectedOptions[0];
								if (!select.value) return;

								const medName = opt.getAttribute('data-name') || select.value;
								const form = opt.getAttribute('data-form') || 'Tablet';
								const stock = parseInt(opt.getAttribute('data-stock') || '0', 10);
								const units = parseFloat(r.querySelector('.units-input').value) || 0;
								const freq = r.querySelector('.freq-select').value;
								const duration = parseInt(r.querySelector('.duration-input').value, 10) || 0;
								const calcQty = parseInt(r.querySelector('.calc-qty-num').textContent, 10) || 0;
								const calcUnit = r.querySelector('.calc-unit-label').textContent;
								const formula = r.querySelector('.calc-formula-text').textContent;

								if (units <= 0 || duration <= 0 || !freq) {
									hasClarification = true;
									clarificationReason = "Units per dose or duration missing for " + medName;
								}

								let stockBadge = '<span class="badge bg-success-subtle text-success border border-success-subtle">In Stock (' + stock + ')</span>';
								if (stock < calcQty) {
									stockBadge = '<span class="badge bg-danger-subtle text-danger border border-danger-subtle"><i class="fa-solid fa-triangle-exclamation me-1"></i> Insufficient (' + stock + ' avl, short ' + (calcQty - stock) + ')</span>';
								}

								const tr = document.createElement('tr');
								tr.innerHTML = '<td><strong>' + medName + '</strong><br><small class="text-muted">' + form + '</small></td>' +
									'<td>' + units + ' ' + (units === 1 ? 'unit' : 'units') + '</td>' +
									'<td>' + freq + '</td>' +
									'<td>' + duration + ' days</td>' +
									'<td class="text-center"><span class="badge bg-primary text-white fs-7 px-3 py-1 font-monospace">' + calcQty + ' ' + calcUnit + '</span><br><small class="text-muted fs-8">' + formula + '</small></td>' +
									'<td>' + stockBadge + '</td>';
								tbody.appendChild(tr);
							});

							document.getElementById('modalRemarksPreview').textContent = '"' + commentVal + '"';

							const warningBox = document.getElementById('modalClarificationWarning');
							const approveBtn = document.getElementById('confirmApproveBtn');
							if (hasClarification) {
								warningBox.classList.remove('d-none');
								document.getElementById('modalClarificationText').textContent = 'Prescription clarification required. The medicine quantity cannot be calculated safely from the available instructions (' + clarificationReason + ').';
								approveBtn.disabled = true;
							} else {
								warningBox.classList.add('d-none');
								approveBtn.disabled = false;
							}

							const modal = new bootstrap.Modal(document.getElementById('prescriptionReviewModal'));
							modal.show();
						}

						function submitFinalPrescription() {
							const form = document.querySelector('form[action="../updateStatus"]');
							form.submit();
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