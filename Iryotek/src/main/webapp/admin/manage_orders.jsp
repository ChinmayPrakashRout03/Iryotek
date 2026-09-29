<%@page import="com.hms.dao.MedicineOrderDAO"%>
<%@page import="com.hms.entity.MedicineOrder"%>
<%@page import="com.hms.entity.MedicineOrderItem"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="java.util.List"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Manage Medicine Orders | Admin Portal</title>
<%@include file="../component/allcss.jsp"%>
</head>
<body class="bg-light">
	<%@include file="navbar.jsp"%>

	<c:if test="${empty adminObj}">
		<c:redirect url="../admin_login.jsp"></c:redirect>
	</c:if>

	<%
		MedicineOrderDAO orderDAO = new MedicineOrderDAO(DBConnection.getConn());
		List<MedicineOrder> orders = orderDAO.getAllOrders();
		String[] orderStatuses = {"Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"};
	%>

	<div class="container py-5">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<div>
				<h2 class="fw-bold text-dark mb-1">
					<i class="fa-solid fa-boxes-packing text-danger me-2"></i> Medicine Orders Processing
				</h2>
				<p class="text-muted mb-0">Track customer orders, review prescription items, and update fulfillment statuses.</p>
			</div>
		</div>

		<c:if test="${not empty successMsg}">
			<div class="alert alert-success alert-dismissible fade show rounded-4" role="alert">
				<i class="fa-solid fa-circle-check me-2"></i> ${successMsg}
				<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
			</div>
			<c:remove var="successMsg" scope="session" />
		</c:if>

		<c:if test="${not empty errorMsg}">
			<div class="alert alert-danger alert-dismissible fade show rounded-4" role="alert">
				<i class="fa-solid fa-circle-exclamation me-2"></i> ${errorMsg}
				<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
			</div>
			<c:remove var="errorMsg" scope="session" />
		</c:if>

		<!-- Orders List -->
		<% if (orders != null && !orders.isEmpty()) { %>
			<div class="row g-4">
				<% for (MedicineOrder order : orders) { %>
					<div class="col-12">
						<div class="card border-0 shadow-sm rounded-4 overflow-hidden">
							<div class="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
								<div>
									<span class="fs-8 text-muted text-uppercase fw-semibold">Order ID #<%= order.getId() %></span>
									<h5 class="fw-bold text-dark mb-0 font-monospace"><%= order.getOrderNumber() %></h5>
								</div>

								<div>
									<div class="fs-8 text-muted text-uppercase fw-semibold">Placed On</div>
									<div class="fw-semibold text-secondary"><%= order.getCreatedAt() %></div>
								</div>

								<div>
									<div class="fs-8 text-muted text-uppercase fw-semibold">Payment</div>
									<div class="badge bg-secondary-subtle text-dark px-3 py-1 rounded-pill">
										<%= order.getPaymentMethod() %> (<%= order.getPaymentStatus() %>)
									</div>
								</div>

								<!-- Update Status Form -->
								<form action="../adminPharmacy" method="post" class="d-flex align-items-center gap-2">
									<input type="hidden" name="action" value="updateOrderStatus">
									<input type="hidden" name="orderId" value="<%= order.getId() %>">
									<select name="orderStatus" class="form-select form-select-sm rounded-pill fw-semibold" onchange="this.form.submit()">
										<% for (String st : orderStatuses) { %>
											<option value="<%= st %>" <%= st.equalsIgnoreCase(order.getOrderStatus()) ? "selected" : "" %>><%= st %></option>
										<% } %>
									</select>
								</form>
							</div>

							<div class="card-body p-4">
								<div class="row g-4">
									<div class="col-md-8">
										<h6 class="fw-bold text-dark text-uppercase fs-8 tracking-wider mb-2">Itemized Contents</h6>
										<div class="table-responsive">
											<table class="table table-sm align-middle mb-0">
												<thead>
													<tr class="fs-8 text-muted text-uppercase">
														<th>Medicine</th>
														<th class="text-center">Dosage</th>
														<th class="text-center">Qty</th>
														<th class="text-end">Subtotal</th>
													</tr>
												</thead>
												<tbody>
													<% for (MedicineOrderItem item : order.getItems()) { %>
														<tr>
															<td class="fw-bold text-dark py-2">
																<%= item.getMedicineName() %>
																<% if ("PRESCRIPTION".equalsIgnoreCase(item.getSource())) { %>
																	<span class="badge bg-success-subtle text-success rounded-pill px-2 fs-8 ms-1">Prescription Item</span>
																<% } %>
															</td>
															<td class="text-center fs-7 text-muted"><%= item.getDosageInstructions() %></td>
															<td class="text-center fw-bold"><%= item.getQuantity() %></td>
															<td class="text-end font-monospace fw-bold text-danger">₹<%= String.format("%.2f", item.getSubtotal()) %></td>
														</tr>
													<% } %>
												</tbody>
											</table>
										</div>
									</div>

									<div class="col-md-4 border-start-md ps-md-4 d-flex flex-column justify-content-between">
										<div>
											<h6 class="fw-bold text-dark text-uppercase fs-8 tracking-wider mb-2">Delivery Recipient</h6>
											<% if (order.getAddress() != null) { %>
												<div class="fw-bold text-dark fs-7"><%= order.getAddress().getFullName() %></div>
												<div class="fs-8 text-muted"><i class="fa-solid fa-phone me-1"></i> <%= order.getAddress().getPhone() %></div>
												<div class="fs-8 text-secondary mt-1"><%= order.getAddress().getFormattedAddress() %></div>
											<% } %>
										</div>

										<div class="pt-3 border-top mt-3">
											<div class="d-flex justify-content-between align-items-center">
												<span class="fw-bold text-dark">Order Total</span>
												<span class="fs-4 fw-bold text-danger">₹<%= String.format("%.2f", order.getTotalAmount()) %></span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				<% } %>
			</div>
		<% } else { %>
			<div class="card border-0 shadow-sm rounded-4 text-center p-5">
				<i class="fa-solid fa-boxes-packing display-1 text-muted opacity-25 mb-3"></i>
				<h4 class="fw-bold text-secondary">No Medicine Orders Found</h4>
				<p class="text-muted">Customer medicine orders will appear here for order processing and delivery status updates.</p>
			</div>
		<% } %>
	</div>

	<%@include file="../component/footer.jsp"%>
</body>
</html>
