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
<title>My Medicine Orders | Iryotek Pharmacy</title>
<%@include file="component/allcss.jsp"%>
</head>
<body class="bg-light">
	<%@include file="component/navbar.jsp"%>

	<c:if test="${empty userObj}">
		<c:redirect url="user_login.jsp"></c:redirect>
	</c:if>

	<%
		com.hms.entity.User user = (com.hms.entity.User) session.getAttribute("userObj");
		MedicineOrderDAO orderDAO = new MedicineOrderDAO(DBConnection.getConn());
		List<MedicineOrder> orders = orderDAO.getUserOrders(user.getId());
	%>

	<div class="container py-5">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<div>
				<h2 class="fw-bold text-dark mb-1">
					<i class="fa-solid fa-box-archive text-coral me-2"></i> Medicine Order History
				</h2>
				<p class="text-muted mb-0">Track and review all your online pharmacy orders.</p>
			</div>

			<a href="medicines.jsp" class="btn btn-outline-primary rounded-pill px-4">
				<i class="fa-solid fa-plus me-1"></i> Order More Medicines
			</a>
		</div>

		<% if (orders != null && !orders.isEmpty()) { %>
			<div class="row g-4">
				<% for (MedicineOrder order : orders) { %>
					<div class="col-12">
						<div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-2">
							<div class="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
								<div>
									<div class="fs-8 text-muted text-uppercase fw-semibold">Order Number</div>
									<div class="fw-bold text-dark fs-5 font-monospace"><%= order.getOrderNumber() %></div>
								</div>

								<div>
									<div class="fs-8 text-muted text-uppercase fw-semibold">Date Placed</div>
									<div class="fw-semibold text-secondary"><%= order.getCreatedAt() %></div>
								</div>

								<div>
									<div class="fs-8 text-muted text-uppercase fw-semibold">Payment</div>
									<div class="badge bg-secondary-subtle text-dark px-3 py-1 rounded-pill">
										<%= order.getPaymentMethod() %> (<%= order.getPaymentStatus() %>)
									</div>
								</div>

								<div>
									<div class="fs-8 text-muted text-uppercase fw-semibold mb-1">Status</div>
									<%
										String status = order.getOrderStatus();
										String badgeClass = "bg-warning-subtle text-warning-emphasis";
										if ("Confirmed".equalsIgnoreCase(status)) badgeClass = "bg-info-subtle text-info";
										else if ("Preparing".equalsIgnoreCase(status)) badgeClass = "bg-primary-subtle text-primary";
										else if ("Out for Delivery".equalsIgnoreCase(status)) badgeClass = "bg-purple-subtle text-purple";
										else if ("Delivered".equalsIgnoreCase(status)) badgeClass = "bg-success-subtle text-success";
										else if ("Cancelled".equalsIgnoreCase(status)) badgeClass = "bg-danger-subtle text-danger";
									%>
									<span class="badge <%= badgeClass %> px-3 py-2 rounded-pill fw-bold fs-7">
										<i class="fa-solid fa-truck-ramp-box me-1"></i> <%= status %>
									</span>
								</div>
							</div>

							<div class="card-body p-4">
								<div class="row g-4">
									<!-- Items List -->
									<div class="col-md-8">
										<h6 class="fw-bold text-dark text-uppercase fs-8 tracking-wider mb-3">Ordered Items</h6>
										<div class="table-responsive">
											<table class="table table-sm align-middle mb-0">
												<thead>
													<tr class="fs-8 text-muted text-uppercase">
														<th>Medicine</th>
														<th class="text-center">Dosage</th>
														<th class="text-center">Price</th>
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
																	<span class="badge bg-success-subtle text-success rounded-pill px-2 fs-8 ms-1">Prescribed</span>
																<% } %>
															</td>
															<td class="text-center fs-7 text-muted">
																<%= item.getDosageInstructions() != null && !item.getDosageInstructions().isEmpty() ? item.getDosageInstructions() : "-" %>
															</td>
															<td class="text-center font-monospace fs-7">₹<%= String.format("%.2f", item.getPrice()) %></td>
															<td class="text-center fw-bold"><%= item.getQuantity() %></td>
															<td class="text-end font-monospace fw-bold text-coral">₹<%= String.format("%.2f", item.getSubtotal()) %></td>
														</tr>
													<% } %>
												</tbody>
											</table>
										</div>
									</div>

									<!-- Delivery Address & Total -->
									<div class="col-md-4 border-start-md ps-md-4 d-flex flex-column justify-content-between">
										<div>
											<h6 class="fw-bold text-dark text-uppercase fs-8 tracking-wider mb-2">Delivery Address</h6>
											<% if (order.getAddress() != null) { %>
												<div class="fw-bold text-dark fs-7 mb-1"><%= order.getAddress().getFullName() %></div>
												<div class="fs-8 text-muted mb-1"><i class="fa-solid fa-phone me-1"></i> <%= order.getAddress().getPhone() %></div>
												<div class="fs-8 text-secondary"><%= order.getAddress().getFormattedAddress() %></div>
											<% } else { %>
												<div class="text-muted fs-7">Address details unavailable.</div>
											<% } %>
										</div>

										<div class="pt-3 border-top mt-3">
											<div class="d-flex justify-content-between align-items-center">
												<span class="fw-bold text-dark">Total Paid</span>
												<span class="fs-4 fw-bold text-coral">₹<%= String.format("%.2f", order.getTotalAmount()) %></span>
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
				<div class="py-5">
					<i class="fa-solid fa-box-open display-1 text-muted opacity-25 mb-4"></i>
					<h3 class="fw-bold text-dark">No Medicine Orders Yet</h3>
					<p class="text-muted max-w-md mx-auto mb-4">You haven't placed any medicine orders. Browse our pharmacy shop or check your doctor prescriptions.</p>
					<a href="medicines.jsp" class="btn btn-coral rounded-pill px-4 py-2 fw-bold">
						<i class="fa-solid fa-shop me-2"></i> Browse Medicine Shop
					</a>
				</div>
			</div>
		<% } %>
	</div>

	<%@include file="component/footer.jsp"%>
</body>
</html>
