<%@page import="com.hms.dao.PrescriptionDAO"%>
<%@page import="com.hms.dao.DoctorDAO"%>
<%@page import="com.hms.dao.AppointmentDAO"%>
<%@page import="com.hms.entity.Prescription"%>
<%@page import="com.hms.entity.PrescriptionMedicine"%>
<%@page import="com.hms.entity.Doctor"%>
<%@page import="com.hms.entity.Appointment"%>
<%@page import="com.hms.db.DBConnection"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Prescription Generated | Iryotek</title>
<%@include file="component/allcss.jsp"%>
</head>
<body class="bg-light">
	<%@include file="component/navbar.jsp"%>

	<c:if test="${empty userObj}">
		<c:redirect url="user_login.jsp"></c:redirect>
	</c:if>

	<%
		int apptId = 0;
		try {
			apptId = Integer.parseInt(request.getParameter("appointmentId"));
		} catch (Exception e) { }

		PrescriptionDAO rxDAO = new PrescriptionDAO(DBConnection.getConn());
		Prescription rx = rxDAO.getPrescriptionByAppointmentId(apptId);

		Doctor doctor = null;
		Appointment appt = null;
		if (rx != null) {
			DoctorDAO docDAO = new DoctorDAO(DBConnection.getConn());
			doctor = docDAO.getDoctorById(rx.getDoctorId());
			AppointmentDAO appDAO = new AppointmentDAO(DBConnection.getConn());
			appt = appDAO.getAppointmentById(rx.getAppointmentId());
		}
	%>

	<div class="container py-5">
		<% if (rx != null) { %>
			<!-- Prescription Card -->
			<div class="card border-0 shadow-sm rounded-4 overflow-hidden max-w-4xl mx-auto">
				<!-- Header Banner -->
				<div class="bg-success text-white p-4 p-md-5 d-flex justify-content-between align-items-center flex-wrap gap-3">
					<div>
						<span class="badge bg-white text-success rounded-pill px-3 py-2 fw-bold mb-2">
							<i class="fa-solid fa-circle-check me-1"></i> Prescription Generated
						</span>
						<h2 class="fw-bold mb-1">Official Medical Prescription</h2>
						<p class="mb-0 text-white-80">Prescribed by Dr. <%= doctor != null ? doctor.getFullName() : "Doctor" %> (<%= doctor != null ? doctor.getSpecialist() : "" %>)</p>
					</div>

					<div class="text-md-end bg-white-10 p-3 rounded-3 backdrop-blur">
						<div class="fs-8 text-white-80">Date Issued</div>
						<div class="fw-bold fs-6"><%= rx.getCreatedAt() %></div>
					</div>
				</div>

				<div class="card-body p-4 p-md-5">
					<!-- Auto Cart Alert Banner -->
					<div class="alert alert-success border-0 rounded-4 p-4 mb-4 d-flex align-items-center gap-3">
						<i class="fa-solid fa-cart-flatbed-suitcases display-5 text-success"></i>
						<div>
							<h5 class="fw-bold text-success mb-1">Prescribed Medicines Added to Cart</h5>
							<p class="mb-0 text-secondary fs-7">
								Available medicines from this prescription have been automatically placed in your Medicine Cart. You can review quantities, add extra items, or proceed to checkout.
							</p>
						</div>
					</div>

					<!-- Patient Info Grid -->
					<div class="row g-3 p-3 bg-light rounded-4 border mb-4">
						<div class="col-sm-4">
							<span class="fs-8 text-muted text-uppercase fw-semibold">Patient Name</span>
							<div class="fw-bold text-dark"><%= appt != null ? appt.getFullName() : "Patient" %></div>
						</div>
						<div class="col-sm-4">
							<span class="fs-8 text-muted text-uppercase fw-semibold">Token & Time</span>
							<div class="fw-bold text-cyan">Token #<%= appt != null ? appt.getTokenNo() : "" %> (<%= appt != null ? appt.getAppointmentTime() : "" %>)</div>
						</div>
						<div class="col-sm-4">
							<span class="fs-8 text-muted text-uppercase fw-semibold">Diagnosis / Disease</span>
							<div class="fw-bold text-dark"><%= appt != null ? appt.getDiseases() : "" %></div>
						</div>
					</div>

					<!-- Clinical Remarks -->
					<div class="mb-4">
						<h6 class="fw-bold text-dark text-uppercase fs-8 tracking-wider mb-2">Doctor Clinical Remarks / Treatment Notes</h6>
						<div class="p-3 bg-light border-start border-4 border-cyan rounded-3 fst-italic text-secondary">
							"<%= rx.getRemarks() != null ? rx.getRemarks() : "No additional remarks." %>"
						</div>
					</div>

					<!-- Itemized Prescribed Medicines -->
					<h6 class="fw-bold text-dark text-uppercase fs-8 tracking-wider mb-3">Prescribed Medications</h6>
					<div class="table-responsive mb-4">
						<table class="table align-middle border rounded-4 overflow-hidden">
							<thead class="bg-light">
								<tr class="fs-8 text-uppercase text-muted">
									<th class="py-3 px-4">Medicine Name</th>
									<th class="py-3">Dosage / Instructions</th>
									<th class="py-3 text-center">Prescribed Qty</th>
									<th class="py-3 text-center">Stock Availability</th>
								</tr>
							</thead>
							<tbody>
								<% if (rx.getItems() != null && !rx.getItems().isEmpty()) { %>
									<% for (PrescriptionMedicine item : rx.getItems()) { %>
										<tr>
											<td class="py-3 px-4">
												<div class="fw-bold text-dark"><%= item.getMedicine() != null ? item.getMedicine().getName() : "Medicine #" + item.getMedicineId() %></div>
												<div class="fs-8 text-muted"><%= item.getMedicine() != null ? item.getMedicine().getCategory() : "" %></div>
											</td>
											<td>
												<span class="badge bg-secondary-subtle text-dark px-3 py-2 rounded-pill fs-7">
													<i class="fa-solid fa-clock me-1"></i> <%= item.getDosageInstructions() %>
												</span>
											</td>
											<td class="text-center fw-bold font-monospace fs-6">
												<%= item.getQuantity() %>
											</td>
											<td class="text-center">
												<% if (item.getMedicine() != null && item.getMedicine().getStock() > 0) { %>
													<span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill fs-7">
														<i class="fa-solid fa-check me-1"></i> Available & Auto-Added
													</span>
												<% } else { %>
													<span class="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fs-7">
														<i class="fa-solid fa-triangle-exclamation me-1"></i> Out of Stock
													</span>
												<% } %>
											</td>
										</tr>
									<% } %>
								<% } else { %>
									<tr>
										<td colspan="4" class="text-center py-4 text-muted">No medicines itemized in prescription.</td>
									</tr>
								<% } %>
							</tbody>
						</table>
					</div>

					<!-- Action Buttons -->
					<div class="d-flex flex-wrap gap-3 pt-3 border-top justify-content-center justify-content-md-start">
						<a href="cart.jsp" class="btn btn-coral rounded-pill px-4 py-3 fw-bold">
							<i class="fa-solid fa-cart-shopping me-2"></i> View Medicine Cart
						</a>
						<a href="medicines.jsp" class="btn btn-outline-primary rounded-pill px-4 py-3 fw-semibold">
							<i class="fa-solid fa-shop me-2"></i> Go to Medicine Shop
						</a>
						<a href="view_appointment.jsp" class="btn btn-outline-secondary rounded-pill px-4 py-3">
							<i class="fa-solid fa-calendar-check me-2"></i> My Appointments
						</a>
					</div>
				</div>
			</div>
		<% } else { %>
			<div class="card border-0 shadow-sm rounded-4 text-center p-5">
				<i class="fa-solid fa-file-circle-xmark display-1 text-muted opacity-25 mb-3"></i>
				<h4 class="fw-bold text-secondary">Prescription Not Found</h4>
				<p class="text-muted">No prescription record exists for this appointment yet.</p>
				<div class="mt-3">
					<a href="view_appointment.jsp" class="btn btn-primary rounded-pill px-4">Back to Appointments</a>
				</div>
			</div>
		<% } %>
	</div>

	<%@include file="component/footer.jsp"%>
</body>
</html>
