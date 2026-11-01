<%@page import="com.hms.dao.PharmacyDAO"%>
<%@page import="com.hms.dao.PharmacyDAO.DispenseResult"%>
<%@page import="com.hms.entity.DispensingRequest"%>
<%@page import="com.hms.entity.DispensingAuditLog"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="java.util.List"%>
<%@page import="java.util.UUID"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Smart Pharmacy Dispensing Queue | Admin Portal</title>
<%@include file="../component/allcss.jsp"%>
<style>
.stat-card {
	border-radius: 1rem;
	transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}
.shortage-banner {
	background-color: #fff2f2;
	border: 1px solid #f5c2c7;
	border-left: 5px solid #dc3545;
	border-radius: 0.75rem;
}
.formula-badge {
	background: #f1f5f9;
	color: #334155;
	border: 1px dashed #cbd5e1;
	font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	font-size: 0.8rem;
}
</style>
</head>
<body class="bg-light">
	<%@include file="navbar.jsp"%>

	<c:if test="${empty adminObj}">
		<c:redirect url="../admin_login.jsp"></c:redirect>
	</c:if>

	<%
		String filter = request.getParameter("filter");
		if (filter == null || filter.trim().isEmpty()) {
			filter = "ALL";
		}

		PharmacyDAO pharmacyDAO = new PharmacyDAO(DBConnection.getConn());
		List<DispensingRequest> requests = pharmacyDAO.getAllDispensingRequests(filter);
		List<DispensingAuditLog> auditLogs = pharmacyDAO.getAuditLogs(30);

		// Compute overview stats
		int pendingCount = 0;
		int shortageCount = 0;
		int dispensedCount = 0;

		List<DispensingRequest> allForStats = pharmacyDAO.getAllDispensingRequests("ALL");
		for (DispensingRequest r : allForStats) {
			if ("SHORTAGE_REVIEW".equalsIgnoreCase(r.getStatus()) || (r.getCurrentStock() < r.getQuantityRemaining() && !"DISPENSED".equalsIgnoreCase(r.getStatus()))) {
				shortageCount++;
			}
			if ("PENDING".equalsIgnoreCase(r.getStatus()) || "PARTIALLY_DISPENSED".equalsIgnoreCase(r.getStatus())) {
				pendingCount++;
			} else if ("DISPENSED".equalsIgnoreCase(r.getStatus())) {
				dispensedCount++;
			}
		}
	%>

	<div class="container-fluid px-lg-5 py-4">
		<!-- Header -->
		<div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
			<div>
				<div class="d-flex align-items-center gap-2">
					<span class="badge bg-danger text-white rounded-pill px-3 py-1 fs-8">
						<i class="fa-solid fa-microchip-ai me-1"></i> Smart Pharmacy Intelligence
					</span>
					<span class="text-muted fs-8">Deterministic Dispensing & ACID Inventory Control</span>
				</div>
				<h2 class="fw-bold text-dark mt-2 mb-1">
					<i class="fa-solid fa-prescription-bottle-medical text-danger me-2"></i> Dispensing Verification Queue
				</h2>
				<p class="text-muted mb-0">Review doctor-approved prescriptions, verify calculated quantities, check live inventory, and execute atomic stock deductions.</p>
			</div>

			<div class="d-flex gap-2">
				<a href="manage_medicines.jsp" class="btn btn-outline-secondary rounded-pill">
					<i class="fa-solid fa-pills me-1"></i> Manage Stock Inventory
				</a>
				<button class="btn btn-primary rounded-pill" onclick="window.location.reload();">
					<i class="fa-solid fa-rotate me-1"></i> Refresh Queue
				</button>
			</div>
		</div>

		<!-- Feedback Alerts -->
		<c:if test="${not empty successMsg}">
			<div class="alert alert-success alert-dismissible fade show rounded-4 shadow-sm" role="alert">
				<i class="fa-solid fa-circle-check me-2"></i> ${successMsg}
				<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
			</div>
			<c:remove var="successMsg" scope="session" />
		</c:if>

		<c:if test="${not empty errorMsg}">
			<div class="alert alert-danger alert-dismissible fade show rounded-4 shadow-sm" role="alert">
				<i class="fa-solid fa-triangle-exclamation me-2"></i> ${errorMsg}
				<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
			</div>
			<c:remove var="errorMsg" scope="session" />
		</c:if>

		<!-- Stats Cards -->
		<div class="row g-3 mb-4">
			<div class="col-sm-6 col-xl-3">
				<div class="card stat-card border-0 shadow-sm p-3 bg-white">
					<div class="d-flex align-items-center justify-content-between">
						<div>
							<div class="fs-8 text-uppercase text-muted fw-semibold">Pending Dispensing</div>
							<div class="fs-3 fw-bold text-primary mt-1"><%= pendingCount %></div>
						</div>
						<div class="bg-primary-subtle text-primary p-3 rounded-circle fs-4">
							<i class="fa-solid fa-clock"></i>
						</div>
					</div>
					<div class="fs-8 text-muted mt-2">Awaiting pharmacist verification</div>
				</div>
			</div>

			<div class="col-sm-6 col-xl-3">
				<div class="card stat-card border-0 shadow-sm p-3 bg-white">
					<div class="d-flex align-items-center justify-content-between">
						<div>
							<div class="fs-8 text-uppercase text-muted fw-semibold">Shortage Reviews</div>
							<div class="fs-3 fw-bold text-danger mt-1"><%= shortageCount %></div>
						</div>
						<div class="bg-danger-subtle text-danger p-3 rounded-circle fs-4">
							<i class="fa-solid fa-triangle-exclamation"></i>
						</div>
					</div>
					<div class="fs-8 text-danger mt-2">Available stock < required quantity</div>
				</div>
			</div>

			<div class="col-sm-6 col-xl-3">
				<div class="card stat-card border-0 shadow-sm p-3 bg-white">
					<div class="d-flex align-items-center justify-content-between">
						<div>
							<div class="fs-8 text-uppercase text-muted fw-semibold">Fully Dispensed</div>
							<div class="fs-3 fw-bold text-success mt-1"><%= dispensedCount %></div>
						</div>
						<div class="bg-success-subtle text-success p-3 rounded-circle fs-4">
							<i class="fa-solid fa-circle-check"></i>
						</div>
					</div>
					<div class="fs-8 text-muted mt-2">Inventory successfully deducted</div>
				</div>
			</div>

			<div class="col-sm-6 col-xl-3">
				<div class="card stat-card border-0 shadow-sm p-3 bg-white">
					<div class="d-flex align-items-center justify-content-between">
						<div>
							<div class="fs-8 text-uppercase text-muted fw-semibold">Audit Log Entries</div>
							<div class="fs-3 fw-bold text-dark mt-1"><%= auditLogs != null ? auditLogs.size() : 0 %></div>
						</div>
						<div class="bg-dark-subtle text-dark p-3 rounded-circle fs-4">
							<i class="fa-solid fa-shield-halved"></i>
						</div>
					</div>
					<div class="fs-8 text-muted mt-2">Immutable transaction history</div>
				</div>
			</div>
		</div>

		<!-- Nav Tabs for Filter -->
		<ul class="nav nav-pills mb-4 gap-2 bg-white p-2 rounded-4 shadow-sm border">
			<li class="nav-item">
				<a class="nav-link rounded-pill <%= "ALL".equalsIgnoreCase(filter) ? "active bg-danger text-white" : "text-secondary" %>" href="manage_prescriptions.jsp?filter=ALL">
					All Dispensing Items (<%= allForStats.size() %>)
				</a>
			</li>
			<li class="nav-item">
				<a class="nav-link rounded-pill <%= "PENDING".equalsIgnoreCase(filter) ? "active bg-danger text-white" : "text-secondary" %>" href="manage_prescriptions.jsp?filter=PENDING">
					Pending Dispensing (<%= pendingCount %>)
				</a>
			</li>
			<li class="nav-item">
				<a class="nav-link rounded-pill <%= "SHORTAGE_REVIEW".equalsIgnoreCase(filter) ? "active bg-danger text-white" : "text-secondary" %>" href="manage_prescriptions.jsp?filter=SHORTAGE_REVIEW">
					Requires Pharmacist Review (<%= shortageCount %>)
				</a>
			</li>
			<li class="nav-item">
				<a class="nav-link rounded-pill <%= "DISPENSED".equalsIgnoreCase(filter) ? "active bg-danger text-white" : "text-secondary" %>" href="manage_prescriptions.jsp?filter=DISPENSED">
					Dispensed (<%= dispensedCount %>)
				</a>
			</li>
		</ul>

		<!-- Prescriptions Queue Table -->
		<div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
			<div class="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
				<h5 class="fw-bold mb-0 text-dark">
					<i class="fa-solid fa-list-check text-danger me-2"></i> Dispensing Requests Queue
				</h5>
				<span class="fs-8 text-muted">Showing <%= requests != null ? requests.size() : 0 %> records</span>
			</div>
			<div class="card-body p-0">
				<div class="table-responsive">
					<table class="table table-hover align-middle mb-0">
						<thead class="table-light fs-8 text-uppercase text-muted">
							<tr>
								<th class="ps-4 py-3">Prescription & Patient</th>
								<th class="py-3">Prescribed Medicine</th>
								<th class="py-3">Dose & Regimen</th>
								<th class="py-3 text-center">Calculated Qty</th>
								<th class="py-3 text-center">Inventory Stock</th>
								<th class="py-3 text-center">Status</th>
								<th class="pe-4 py-3 text-end">Dispensing Action</th>
							</tr>
						</thead>
						<tbody>
							<% if (requests != null && !requests.isEmpty()) { %>
								<% for (DispensingRequest item : requests) { 
									boolean hasShortage = item.getCurrentStock() < item.getQuantityRemaining() && !"DISPENSED".equalsIgnoreCase(item.getStatus());
									int shortage = Math.max(0, item.getQuantityRemaining() - item.getCurrentStock());
								%>
									<tr>
										<td class="ps-4 py-3">
											<div class="fw-bold text-dark">Rx #<%= item.getPrescriptionId() %> &bull; Req #<%= item.getId() %></div>
											<div class="fs-8 text-muted">
												<i class="fa-solid fa-user me-1"></i> <%= item.getPatientName() != null ? item.getPatientName() : "Patient #" + item.getPatientId() %>
											</div>
											<div class="fs-8 text-muted">
												<i class="fa-solid fa-user-doctor me-1"></i> Dr. <%= item.getDoctorName() != null ? item.getDoctorName() : "Doctor #" + item.getDoctorId() %>
											</div>
										</td>

										<td class="py-3">
											<div class="fw-bold text-dark"><%= item.getMedicineName() %></div>
											<div class="d-flex align-items-center gap-1 mt-1">
												<span class="badge bg-secondary-subtle text-secondary border fs-8"><%= item.getDosageForm() %></span>
												<% if (item.getStrength() != null && !item.getStrength().isEmpty()) { %>
													<span class="badge bg-info-subtle text-info border fs-8"><%= item.getStrength() %></span>
												<% } %>
											</div>
										</td>

										<td class="py-3">
											<div class="fs-7 fw-semibold text-dark"><%= item.getDosageInstructions() %></div>
											<div class="fs-8 text-muted">
												<i class="fa-regular fa-clock me-1"></i> <%= item.getFrequency() %> &bull; <%= item.getDurationDays() %> days
											</div>
											<% if (item.getNotes() != null && !item.getNotes().isEmpty()) { %>
												<div class="formula-badge px-2 py-1 rounded mt-1 d-inline-block">
													<%= item.getNotes() %>
												</div>
											<% } %>
										</td>

										<td class="text-center py-3">
											<span class="badge bg-primary text-white fs-6 font-monospace px-3 py-2 rounded-pill shadow-xs">
												<%= item.getCalculatedQuantity() %>
											</span>
											<% if (item.getQuantityDispensed() > 0) { %>
												<div class="fs-8 text-muted mt-1">
													Dispensed: <strong><%= item.getQuantityDispensed() %></strong> | Rem: <strong><%= item.getQuantityRemaining() %></strong>
												</div>
											<% } %>
										</td>

										<td class="text-center py-3">
											<% if (item.getCurrentStock() <= 0) { %>
												<span class="badge bg-danger text-white fs-7 px-3 py-1 rounded-pill">
													0 in stock
												</span>
											<% } else if (item.getCurrentStock() < item.getQuantityRemaining()) { %>
												<span class="badge bg-warning text-dark fs-7 px-3 py-1 rounded-pill">
													<%= item.getCurrentStock() %> (Short by <%= shortage %>)
												</span>
											<% } else { %>
												<span class="badge bg-success-subtle text-success border border-success-subtle fs-7 px-3 py-1 rounded-pill">
													<i class="fa-solid fa-check me-1"></i> <%= item.getCurrentStock() %> available
												</span>
											<% } %>
										</td>

										<td class="text-center py-3">
											<% if ("DISPENSED".equalsIgnoreCase(item.getStatus())) { %>
												<span class="badge bg-success text-white px-3 py-2 rounded-pill fs-8">
													<i class="fa-solid fa-circle-check me-1"></i> DISPENSED
												</span>
											<% } else if (hasShortage || "SHORTAGE_REVIEW".equalsIgnoreCase(item.getStatus())) { %>
												<span class="badge bg-danger text-white px-3 py-2 rounded-pill fs-8">
													<i class="fa-solid fa-triangle-exclamation me-1"></i> SHORTAGE REVIEW
												</span>
											<% } else if ("PARTIALLY_DISPENSED".equalsIgnoreCase(item.getStatus())) { %>
												<span class="badge bg-info text-white px-3 py-2 rounded-pill fs-8">
													<i class="fa-solid fa-pie-chart me-1"></i> PARTIAL
												</span>
											<% } else { %>
												<span class="badge bg-warning text-dark px-3 py-2 rounded-pill fs-8">
													<i class="fa-solid fa-clock me-1"></i> PENDING
												</span>
											<% } %>
										</td>

										<td class="pe-4 py-3 text-end">
											<% if (!"DISPENSED".equalsIgnoreCase(item.getStatus())) { %>
												<% if (hasShortage) { %>
													<!-- Shortage Review Trigger Button -->
													<button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3"
														onclick="openShortageModal(<%= item.getId() %>, '<%= item.getMedicineName() %>', <%= item.getQuantityRemaining() %>, <%= item.getCurrentStock() %>, <%= shortage %>)">
														<i class="fa-solid fa-triangle-exclamation me-1"></i> Shortage Review
													</button>
												<% } else { %>
													<!-- Full Dispense Form with Idempotency Key -->
													<form action="../dispenseMedicine" method="post" class="d-inline" onsubmit="return confirmDispense(this);">
														<input type="hidden" name="requestId" value="<%= item.getId() %>">
														<input type="hidden" name="quantity" value="<%= item.getQuantityRemaining() %>">
														<input type="hidden" name="idempotencyKey" value="IDEMP-<%= UUID.randomUUID().toString() %>">
														<button type="submit" class="btn btn-sm btn-success rounded-pill px-3 shadow-xs">
															<i class="fa-solid fa-check me-1"></i> Dispense <%= item.getQuantityRemaining() %>
														</button>
													</form>
												<% } %>

												<!-- Partial Dispense Button -->
												<button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-2 ms-1" title="Partial Dispensing"
													onclick="openPartialDispenseModal(<%= item.getId() %>, '<%= item.getMedicineName() %>', <%= item.getQuantityRemaining() %>, <%= item.getCurrentStock() %>)">
													<i class="fa-solid fa-ellipsis-vertical"></i>
												</button>
											<% } else { %>
												<span class="text-success fs-8 fw-semibold">
													<i class="fa-solid fa-check-double me-1"></i> Fulfilled
												</span>
											<% } %>
										</td>
									</tr>

									<% if (hasShortage) { %>
										<!-- Insufficient Stock Warning Alert Row -->
										<tr class="bg-light">
											<td colspan="7" class="p-3">
												<div class="shortage-banner p-3">
													<div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
														<div>
															<h6 class="fw-bold text-danger mb-1">
																<i class="fa-solid fa-triangle-exclamation me-2"></i> Insufficient Stock Warning
															</h6>
															<div class="fs-7 text-dark">
																<strong>Medicine:</strong> <%= item.getMedicineName() %> &bull;
																<strong>Required:</strong> <%= item.getQuantityRemaining() %> &bull;
																<strong>Available:</strong> <%= item.getCurrentStock() %> &bull;
																<strong class="text-danger">Shortage:</strong> <%= shortage %> &bull;
																<strong>Status:</strong> <span class="badge bg-danger text-white">Requires pharmacist review</span>
															</div>
															<small class="text-muted">The system will not automatically alter or truncate the doctor's approved prescription. Clinical pharmacist review required.</small>
														</div>

														<div class="d-flex gap-2">
															<% if (item.getCurrentStock() > 0) { %>
																<button class="btn btn-sm btn-outline-danger rounded-pill"
																	onclick="openPartialDispenseModal(<%= item.getId() %>, '<%= item.getMedicineName() %>', <%= item.getQuantityRemaining() %>, <%= item.getCurrentStock() %>)">
																	Dispense Partial (<%= item.getCurrentStock() %>)
																</button>
															<% } %>
															<a href="manage_medicines.jsp" class="btn btn-sm btn-primary rounded-pill">
																<i class="fa-solid fa-box-open me-1"></i> Restock Medicine
															</a>
														</div>
													</div>
												</div>
											</td>
										</tr>
									<% } %>

								<% } %>
							<% } else { %>
								<tr>
									<td colspan="7" class="text-center py-5 text-muted">
										<i class="fa-solid fa-inbox display-6 text-muted mb-3 d-block"></i>
										No dispensing requests match the selected filter.
									</td>
								</tr>
							<% } %>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Immutable Auditable Dispensing Transaction History -->
		<div class="card border-0 shadow-sm rounded-4 overflow-hidden">
			<div class="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
				<div>
					<h5 class="fw-bold mb-0 text-dark">
						<i class="fa-solid fa-receipt text-danger me-2"></i> Pharmacy Dispensing Audit Log
					</h5>
					<span class="fs-8 text-muted">Immutable ledger with ACID transaction guarantees and duplicate deduction prevention</span>
				</div>
				<span class="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1 fs-8">Audit Compliant</span>
			</div>
			<div class="card-body p-0">
				<div class="table-responsive">
					<table class="table table-hover align-middle mb-0">
						<thead class="table-light fs-8 text-uppercase text-muted">
							<tr>
								<th class="ps-4 py-3">Timestamp</th>
								<th class="py-3">Log ID & Action</th>
								<th class="py-3">Req ID</th>
								<th class="py-3">Medicine</th>
								<th class="py-3 text-center">Qty Dispensed</th>
								<th class="py-3 text-center">Inventory Delta</th>
								<th class="py-3">Idempotency Key</th>
								<th class="pe-4 py-3">Remarks</th>
							</tr>
						</thead>
						<tbody>
							<% if (auditLogs != null && !auditLogs.isEmpty()) { %>
								<% for (DispensingAuditLog log : auditLogs) { %>
									<tr>
										<td class="ps-4 py-3 fs-8 text-muted">
											<%= log.getCreatedAt() %>
										</td>
										<td class="py-3">
											<span class="badge bg-<%= "DISPENSE".equalsIgnoreCase(log.getAction()) ? "success" : "info" %> text-white rounded-pill fs-8">
												<%= log.getAction() %>
											</span>
											<span class="fs-8 text-muted ms-1">#<%= log.getId() %></span>
										</td>
										<td class="py-3 font-monospace fs-8">
											Req #<%= log.getDispensingRequestId() %>
										</td>
										<td class="py-3 fw-semibold text-dark">
											<%= log.getMedicineName() != null ? log.getMedicineName() : "Medicine #" + log.getMedicineId() %>
										</td>
										<td class="text-center py-3 fw-bold text-success font-monospace">
											+<%= log.getQuantityDispensed() %>
										</td>
										<td class="text-center py-3 font-monospace fs-8">
											<span class="text-muted"><%= log.getPreviousStock() %></span>
											<i class="fa-solid fa-arrow-right text-muted mx-1"></i>
											<span class="fw-bold text-dark"><%= log.getNewStock() %></span>
										</td>
										<td class="py-3 font-monospace fs-8 text-muted" title="<%= log.getIdempotencyKey() %>">
											<%= log.getIdempotencyKey() != null && log.getIdempotencyKey().length() > 18 ? log.getIdempotencyKey().substring(0, 18) + "..." : log.getIdempotencyKey() %>
										</td>
										<td class="pe-4 py-3 fs-8 text-secondary">
											<%= log.getRemarks() != null ? log.getRemarks() : "-" %>
										</td>
									</tr>
								<% } %>
							<% } else { %>
								<tr>
									<td colspan="8" class="text-center py-4 text-muted">
										No audit log entries recorded yet.
									</td>
								</tr>
							<% } %>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>

	<!-- Shortage Review Modal -->
	<div class="modal fade" id="shortageReviewModal" tabindex="-1" aria-labelledby="shortageReviewModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content rounded-4 border-0 shadow">
				<div class="modal-header bg-danger text-white border-0 py-3">
					<h5 class="modal-title fw-bold" id="shortageReviewModalLabel">
						<i class="fa-solid fa-triangle-exclamation me-2"></i> Insufficient Stock Review
					</h5>
					<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body p-4">
					<div class="alert alert-danger border-0 rounded-3 mb-3">
						<h6 class="fw-bold mb-2">Insufficient Stock</h6>
						<div class="fs-7">
							<strong>Medicine:</strong> <span id="modalShortageMed"></span><br>
							<strong>Required:</strong> <span id="modalShortageReq"></span><br>
							<strong>Available:</strong> <span id="modalShortageAvl"></span><br>
							<strong>Shortage:</strong> <span id="modalShortageDiff" class="text-danger fw-bold"></span><br>
							<strong>Status:</strong> <span class="badge bg-danger text-white">Requires pharmacist review</span>
						</div>
					</div>

					<p class="fs-7 text-secondary">
						In accordance with clinical safety regulations, the system cannot automatically alter the doctor's approved prescription. You may either:
					</p>
					<ul class="fs-8 text-muted">
						<li>Dispense the partial available quantity (<span id="modalShortagePartialMax"></span> units) and track remaining shortage.</li>
						<li>Restock the medicine inventory before completing dispensing.</li>
						<li>Contact the prescribing doctor for authorized therapy substitution.</li>
					</ul>
				</div>
				<div class="modal-footer border-0 pt-0">
					<button type="button" class="btn btn-light rounded-pill" data-bs-dismiss="modal">Close</button>
					<a href="manage_medicines.jsp" class="btn btn-outline-danger rounded-pill">Restock Inventory</a>
					<button type="button" id="modalShortagePartialBtn" class="btn btn-danger rounded-pill">Dispense Available Partial</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Partial Dispensing Modal -->
	<div class="modal fade" id="partialDispenseModal" tabindex="-1" aria-labelledby="partialDispenseModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content rounded-4 border-0 shadow">
				<form action="../dispenseMedicine" method="post" id="partialDispenseForm">
					<div class="modal-header bg-primary text-white border-0 py-3">
						<h5 class="modal-title fw-bold" id="partialDispenseModalLabel">
							<i class="fa-solid fa-pie-chart me-2"></i> Partial Medicine Dispensing
						</h5>
						<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body p-4">
						<input type="hidden" name="requestId" id="partialRequestId">
						<input type="hidden" name="idempotencyKey" id="partialIdempotencyKey">

						<div class="mb-3">
							<label class="form-label fs-8 text-uppercase fw-semibold text-muted">Medicine Name</label>
							<input type="text" class="form-control rounded-3 bg-light" id="partialMedName" readonly>
						</div>

						<div class="row g-2 mb-3">
							<div class="col-6">
								<label class="form-label fs-8 text-uppercase fw-semibold text-muted">Remaining Required</label>
								<input type="text" class="form-control rounded-3 bg-light" id="partialReqRemaining" readonly>
							</div>
							<div class="col-6">
								<label class="form-label fs-8 text-uppercase fw-semibold text-muted">Stock In Hand</label>
								<input type="text" class="form-control rounded-3 bg-light" id="partialCurrentStock" readonly>
							</div>
						</div>

						<div class="mb-3">
							<label class="form-label fs-8 text-uppercase fw-semibold text-muted">Quantity to Dispense Now</label>
							<input type="number" name="quantity" id="partialDispenseQtyInput" class="form-control rounded-3 fw-bold" min="1" required>
							<div class="form-text fs-8 text-muted">Must be between 1 and available stock/remaining limit.</div>
						</div>
					</div>
					<div class="modal-footer border-0 pt-0">
						<button type="button" class="btn btn-light rounded-pill" data-bs-dismiss="modal">Cancel</button>
						<button type="submit" class="btn btn-primary rounded-pill">Execute Partial Dispense</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<script>
	function confirmDispense(form) {
		const qty = form.querySelector('input[name="quantity"]').value;
		return confirm("Confirm dispensing of " + qty + " units? Stock will be deducted atomically from pharmacy inventory.");
	}

	function openShortageModal(reqId, medName, required, available, diff) {
		document.getElementById('modalShortageMed').textContent = medName;
		document.getElementById('modalShortageReq').textContent = required + " units";
		document.getElementById('modalShortageAvl').textContent = available + " units";
		document.getElementById('modalShortageDiff').textContent = diff + " units";
		document.getElementById('modalShortagePartialMax').textContent = available;

		const partialBtn = document.getElementById('modalShortagePartialBtn');
		if (available > 0) {
			partialBtn.style.display = 'inline-block';
			partialBtn.onclick = function() {
				const shortageModal = bootstrap.Modal.getInstance(document.getElementById('shortageReviewModal'));
				if (shortageModal) shortageModal.hide();
				openPartialDispenseModal(reqId, medName, required, available);
			};
		} else {
			partialBtn.style.display = 'none';
		}

		new bootstrap.Modal(document.getElementById('shortageReviewModal')).show();
	}

	function openPartialDispenseModal(reqId, medName, remaining, stock) {
		document.getElementById('partialRequestId').value = reqId;
		document.getElementById('partialMedName').value = medName;
		document.getElementById('partialReqRemaining').value = remaining + " units";
		document.getElementById('partialCurrentStock').value = stock + " units";
		document.getElementById('partialIdempotencyKey').value = 'IDEMP-' + crypto.randomUUID();

		const maxAllowed = Math.min(remaining, stock);
		const qtyInput = document.getElementById('partialDispenseQtyInput');
		qtyInput.max = maxAllowed > 0 ? maxAllowed : 1;
		qtyInput.value = maxAllowed > 0 ? maxAllowed : 1;

		new bootstrap.Modal(document.getElementById('partialDispenseModal')).show();
	}
	</script>
</body>
</html>
