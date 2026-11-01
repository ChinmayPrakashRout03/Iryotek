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
									List<Appointment> list = doctor != null ? appDAO.getAllAppointmentByLoginDoctor(doctor.getId()) : null;
									if (list == null || list.isEmpty()) {
										list = appDAO.getAllAppointment();
									}
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
											<div class="d-flex align-items-center justify-content-center gap-2">
												<button type="button" class="btn btn-outline-info btn-sm px-2 rounded-pill shadow-sm" onclick="openAITriageModal(<%=applist.getId()%>, '<%=applist.getFullName()%>')" title="Pre-Consultation AI Differential Diagnoses & Clinical Records">
													<i class="fa-solid fa-brain me-1"></i> AI Triage
												</button>
												<%
												if ("Pending".equals(applist.getStatus())) {
												%> 
													<a href="comment.jsp?id=<%=applist.getId()%>" class="btn btn-success btn-sm px-3 rounded-pill" title="Clinical Consultation & Prescription">
														<i class="fa-solid fa-stethoscope me-1"></i> Rx
													</a> 
												<%
												} else {
												%> 
													<span class="text-muted fs-7"><i class="fa-solid fa-check-double text-success"></i> Treated</span>
												<%
												}
												%>
											</div>
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

	<!-- Modal: Pre-Consultation AI Differential Diagnosis & Patient Records -->
	<div class="modal fade" id="aiTriageModal" tabindex="-1" aria-labelledby="aiTriageModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-lg modal-dialog-scrollable">
			<div class="modal-content rounded-4 border-0 shadow-lg">
				<div class="modal-header bg-dark text-white border-bottom-0 py-3">
					<div class="d-flex align-items-center gap-2">
						<i class="fa-solid fa-brain text-cyan fs-4"></i>
						<div>
							<h5 class="modal-title fw-bold mb-0" id="aiTriageModalLabel">Iryo AI Differential Triage Review</h5>
							<small class="text-white-50" id="aiTriagePatientSubtitle">Patient Pre-Consultation Clinical File</small>
						</div>
					</div>
					<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body p-4" id="aiTriageModalBody">
					<div class="text-center py-5">
						<div class="spinner-border text-info" role="status"></div>
						<p class="mt-2 text-muted small">Loading clinical triage file & AI differential analysis...</p>
					</div>
				</div>
				<div class="modal-footer border-top-0 pt-0">
					<button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>

	<script>
	function openAITriageModal(appointmentId, patientName) {
		document.getElementById("aiTriagePatientSubtitle").innerText = "Pre-Consultation Clinical File for " + patientName + " (Appt #" + appointmentId + ")";
		var modalEl = document.getElementById("aiTriageModal");
		var modal = new bootstrap.Modal(modalEl);
		modal.show();

		var bodyEl = document.getElementById("aiTriageModalBody");
		bodyEl.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-info" role="status"></div><p class="mt-2 text-muted small">Loading clinical triage file & AI differential analysis...</p></div>';

		fetch("../doctorAIDiagnosis?appointmentId=" + appointmentId)
			.then(function(res) { return res.json(); })
			.then(function(data) {
				renderAITriageContent(bodyEl, data, patientName);
			})
			.catch(function(err) {
				bodyEl.innerHTML = '<div class="alert alert-danger"><i class="fa-solid fa-triangle-exclamation me-2"></i> Error loading clinical review data: ' + err.message + '</div>';
			});
	}

	function renderAITriageContent(container, data, patientName) {
		var html = '';

		// 1. Mandatory Informational Disclaimer
		html += '<div class="alert alert-warning border-start border-4 border-warning small py-2 px-3 mb-3 d-flex align-items-start gap-2">'
		      + '  <i class="fa-solid fa-triangle-exclamation text-warning mt-1 fs-6"></i>'
		      + '  <div><strong>FOR INFORMATIONAL AND PREPARATORY PURPOSES ONLY:</strong> ' + (data.disclaimer || 'This differential diagnosis assessment is AI-generated for clinical triage and informational preparation only. It does not replace independent clinical evaluation or diagnostic confirmation by a licensed medical practitioner.') + '</div>'
		      + '</div>';

		// 2. Patient Profile & Emergency Contact Summary
		if (data.patientProfile) {
			var p = data.patientProfile;
			html += '<div class="card border-0 bg-light rounded-3 p-3 mb-3">'
			      + '  <div class="row g-2 fs-7">'
			      + '    <div class="col-md-3"><strong>Blood Group:</strong> <span class="badge bg-danger rounded-pill px-2">' + (p.bloodGroup || 'Not specified') + '</span></div>'
			      + '    <div class="col-md-3"><strong>DOB / Gender:</strong> ' + (p.dateOfBirth || '-') + ' (' + (p.gender || '-') + ')</div>'
			      + '    <div class="col-md-6"><strong>Emergency Contact:</strong> ' + (p.emergencyContactName ? (p.emergencyContactName + ' (' + p.emergencyContactRelation + ') - <a href="tel:' + p.emergencyContactPhone + '">' + p.emergencyContactPhone + '</a>') : '<span class="text-muted">None logged</span>') + '</div>'
			      + '  </div>'
			      + '</div>';
		}

		// 3. AI Differential Diagnoses Section
		html += '<div class="card border-0 shadow-sm p-3 mb-3">'
		      + '  <div class="d-flex justify-content-between align-items-center mb-2">'
		      + '    <h6 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-notes-medical text-primary me-2"></i> Evaluated Differential Diagnoses</h6>'
		      + '    <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fs-8">Iryo AI Assessment</span>'
		      + '  </div>';

		if (data.aiDiagnosis && data.aiDiagnosis.differentialList && data.aiDiagnosis.differentialList.length > 0) {
			var diffs = data.aiDiagnosis.differentialList;
			html += '<div class="row g-2">';
			for (var i = 0; i < diffs.length; i++) {
				var d = diffs[i];
				var conf = parseInt(d.confidence) || 50;
				var progCls = conf >= 70 ? 'bg-success' : (conf >= 45 ? 'bg-warning' : 'bg-secondary');
				var badgeCls = conf >= 70 ? 'bg-success-subtle text-success border border-success-subtle' : (conf >= 45 ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-secondary-subtle text-secondary');

				html += '<div class="col-md-4">'
				      + '  <div class="p-2 border rounded-3 bg-light h-100">'
				      + '    <div class="d-flex justify-content-between align-items-center mb-1">'
				      + '      <strong class="fs-7 text-dark">' + (d.condition || 'Condition') + '</strong>'
				      + '      <span class="badge rounded-pill ' + badgeCls + ' fs-8">' + conf + '% Match</span>'
				      + '    </div>'
				      + '    <div class="progress mb-2" style="height: 5px;">'
				      + '      <div class="progress-bar ' + progCls + '" style="width:' + conf + '%;"></div>'
				      + '    </div>'
				      + '    <div class="text-muted fs-8 mb-1"><strong>Indicators:</strong> ' + (d.reasoning || '-') + '</div>'
				      + '    <div class="text-primary fs-8"><strong>Workup:</strong> ' + (d.recommendations || '-') + '</div>'
				      + '  </div>'
				      + '</div>';
			}
			html += '</div>';

			if (data.aiDiagnosis.symptoms) {
				html += '<div class="mt-3 p-2 bg-light rounded-2 fs-7"><strong>Patient-Reported Complaint:</strong> ' + data.aiDiagnosis.symptoms + '</div>';
			}
		} else {
			html += '<p class="text-muted small mb-0">No active AI differential assessment record for this consultation yet.</p>';
		}
		html += '</div>';

		// 4. Medical History Overview (Chronic, Allergies, Surgeries)
		html += '<div class="card border-0 shadow-sm p-3 mb-3">'
		      + '  <h6 class="fw-bold mb-3 text-dark"><i class="fa-solid fa-book-medical text-danger me-2"></i> Patient Medical History Ledger</h6>'
		      + '  <div class="row g-3 fs-7">';

		// Chronic
		html += '<div class="col-md-4">'
		      + '  <strong class="text-danger d-block mb-1"><i class="fa-solid fa-heart-pulse me-1"></i> Chronic Conditions:</strong>';
		if (data.medicalHistory && data.medicalHistory.chronicConditions && data.medicalHistory.chronicConditions.length > 0) {
			for (var c = 0; c < data.medicalHistory.chronicConditions.length; c++) {
				var ch = data.medicalHistory.chronicConditions[c];
				html += '<div class="border-bottom py-1"><strong>' + ch.title + '</strong> <span class="badge bg-secondary-subtle text-dark fs-8">' + ch.severity + '</span></div>';
			}
		} else {
			html += '<span class="text-muted">None logged</span>';
		}
		html += '</div>';

		// Allergies
		html += '<div class="col-md-4">'
		      + '  <strong class="text-warning d-block mb-1"><i class="fa-solid fa-hand-dots me-1"></i> Allergies & Sensitivities:</strong>';
		if (data.medicalHistory && data.medicalHistory.allergies && data.medicalHistory.allergies.length > 0) {
			for (var a = 0; a < data.medicalHistory.allergies.length; a++) {
				var al = data.medicalHistory.allergies[a];
				html += '<div class="border-bottom py-1 text-danger"><strong>' + al.title + '</strong> <span class="badge bg-danger rounded-pill fs-8">' + al.severity + '</span></div>';
			}
		} else {
			html += '<span class="text-muted">No known allergies</span>';
		}
		html += '</div>';

		// Surgeries
		html += '<div class="col-md-4">'
		      + '  <strong class="text-primary d-block mb-1"><i class="fa-solid fa-scalpel me-1"></i> Past Surgeries:</strong>';
		if (data.medicalHistory && data.medicalHistory.surgeries && data.medicalHistory.surgeries.length > 0) {
			for (var s = 0; s < data.medicalHistory.surgeries.length; s++) {
				var su = data.medicalHistory.surgeries[s];
				html += '<div class="border-bottom py-1"><strong>' + su.title + '</strong> (' + (su.date || 'Past') + ')</div>';
			}
		} else {
			html += '<span class="text-muted">None reported</span>';
		}
		html += '</div>';

		html += '  </div>'
		      + '</div>';

		// 5. Uploaded Patient Documents
		html += '<div class="card border-0 shadow-sm p-3 mb-0">'
		      + '  <h6 class="fw-bold mb-2 text-dark"><i class="fa-solid fa-paperclip text-warning me-2"></i> Patient Uploaded Records & Prescriptions</h6>';

		if (data.documents && data.documents.length > 0) {
			html += '<div class="list-group list-group-flush fs-7">';
			for (var d = 0; d < data.documents.length; d++) {
				var doc = data.documents[d];
				html += '<div class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">'
				      + '  <div>'
				      + '    <span class="badge bg-light text-dark border me-2">' + doc.documentType + '</span>'
				      + '    <strong>' + doc.title + '</strong> <small class="text-muted">(' + doc.fileSize + ' &bull; ' + doc.uploadedAt.substring(0, 10) + ')</small>'
				      + '  </div>'
				      + '  <div class="d-flex gap-2">'
				      + '    <a href="../' + doc.viewUrl + '" target="_blank" class="btn btn-sm btn-outline-primary rounded-pill px-2 py-0 fs-8"><i class="fa-regular fa-eye me-1"></i> Preview</a>'
				      + '    <a href="../' + doc.downloadUrl + '" class="btn btn-sm btn-outline-success rounded-pill px-2 py-0 fs-8"><i class="fa-solid fa-download me-1"></i> Download</a>'
				      + '  </div>'
				      + '</div>';
			}
			html += '</div>';
		} else {
			html += '<p class="text-muted small mb-0">No past medical documents or prescriptions uploaded by patient.</p>';
		}
		html += '</div>';

		container.innerHTML = html;
	}
	</script>
</body>
</html>