<%@page import="com.hms.dao.CartDAO"%>
<%@page import="com.hms.entity.Cart"%>
<%@page import="com.hms.entity.CartItem"%>
<%@page import="com.hms.db.DBConnection"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>My Shared Medicine Cart | Iryotek</title>
<%@include file="component/allcss.jsp"%>
</head>
<body class="bg-light">
	<%@include file="component/navbar.jsp"%>

	<c:if test="${empty userObj}">
		<c:redirect url="user_login.jsp"></c:redirect>
	</c:if>

	<%
		com.hms.entity.User user = (com.hms.entity.User) session.getAttribute("userObj");
		CartDAO cartDAO = new CartDAO(DBConnection.getConn());
		Cart cart = null;
		if (user != null) {
			cart = cartDAO.getCartWithItems(user.getId());
		}
	%>

	<div class="container py-5">
		<!-- Header Banner -->
		<div class="d-flex justify-content-between align-items-center mb-4">
			<div>
				<h2 class="fw-bold text-dark mb-1">
					<i class="fa-solid fa-cart-shopping text-cyan me-2"></i> Shared Medicine Cart
				</h2>
				<p class="text-muted mb-0">Contains your auto-added doctor prescriptions and online pharmacy items.</p>
			</div>

			<% if (cart != null && cart.getItems() != null && !cart.getItems().isEmpty()) { %>
				<form action="cartAction" method="post" onsubmit="return confirm('Are you sure you want to clear your cart? Note: Your doctor prescriptions will remain permanently saved in your medical record.');">
					<input type="hidden" name="action" value="clear">
					<button type="submit" class="btn btn-outline-danger rounded-pill px-3 py-2 fs-7">
						<i class="fa-solid fa-trash-can me-1"></i> Clear Cart
					</button>
				</form>
			<% } %>
		</div>

		<% if (cart != null && cart.getItems() != null && !cart.getItems().isEmpty()) { %>
			<div class="row g-4">
				<!-- Items Table -->
				<div class="col-lg-8">
					<div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
						<div class="card-body p-0">
							<div class="table-responsive">
								<table class="table align-middle mb-0">
									<thead class="bg-light border-bottom">
										<tr class="text-muted fs-8 text-uppercase">
											<th class="py-3 px-4">Medicine Details</th>
											<th class="py-3 text-center">Unit Price</th>
											<th class="py-3 text-center" style="width: 140px;">Quantity</th>
											<th class="py-3 text-end px-4">Total</th>
											<th class="py-3 text-center" style="width: 50px;"></th>
										</tr>
									</thead>
									<tbody>
										<% for (CartItem item : cart.getItems()) { %>
											<tr>
												<td class="py-3 px-4">
													<div class="d-flex align-items-center gap-3">
														<%
															String cartDosageKey = (item.getMedicine().getDosageForm() != null && !item.getMedicine().getDosageForm().trim().isEmpty()) ? item.getMedicine().getDosageForm().trim().toLowerCase() : "default";
															String cartFallbackSvg = "img/medicines/" + cartDosageKey + ".svg";
															String cartImgUrl = item.getMedicine().getImageUrl();
															if (cartImgUrl == null || cartImgUrl.trim().isEmpty() || cartImgUrl.contains("netmeds.com")) {
																cartImgUrl = cartFallbackSvg;
															}
														%>
														<img src="<%= cartImgUrl %>" 
														     alt="<%= item.getMedicine().getName() %>" 
														     onerror="this.onerror=null; this.src='<%= cartFallbackSvg %>';"
														     class="rounded-3 border p-1"
														     style="width: 48px; height: 48px; object-fit: contain; background: #ffffff;">
														<div>
															<h6 class="fw-bold text-dark mb-1"><%= item.getMedicine().getName() %></h6>
															<div class="d-flex flex-wrap align-items-center gap-2">
																<% if ("PRESCRIPTION".equalsIgnoreCase(item.getSource())) { %>
																	<span class="badge bg-success-subtle text-success rounded-pill px-2 py-1 fs-8">
																		<i class="fa-solid fa-user-doctor me-1"></i> Doctor Prescribed
																	</span>
																<% } else { %>
																	<span class="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 fs-8">
																		<i class="fa-solid fa-shop me-1"></i> Pharmacy Shop
																	</span>
																<% } %>

																<% if (item.getDosageInstructions() != null && !item.getDosageInstructions().isEmpty()) { %>
																	<span class="fs-8 text-muted">
																		<i class="fa-solid fa-clock me-1"></i> <%= item.getDosageInstructions() %>
																	</span>
																<% } %>
															</div>
														</div>
													</div>
												</td>

												<td class="text-center font-monospace fw-semibold text-secondary">
													₹<%= String.format("%.2f", item.getMedicine().getPrice()) %>
												</td>

												<td class="text-center">
													<form action="cartAction" method="post" class="d-flex align-items-center justify-content-center gap-1">
														<input type="hidden" name="action" value="update">
														<input type="hidden" name="cartItemId" value="<%= item.getId() %>">
														<button type="submit" name="quantity" value="<%= item.getQuantity() - 1 %>" class="btn btn-sm btn-outline-secondary rounded-circle px-2 py-0">
															<i class="fa-solid fa-minus fs-8"></i>
														</button>
														<span class="fw-bold px-2"><%= item.getQuantity() %></span>
														<button type="submit" name="quantity" value="<%= item.getQuantity() + 1 %>" class="btn btn-sm btn-outline-secondary rounded-circle px-2 py-0" <%= item.getQuantity() >= item.getMedicine().getStock() ? "disabled" : "" %>>
															<i class="fa-solid fa-plus fs-8"></i>
														</button>
													</form>
												</td>

												<td class="text-end px-4 font-monospace fw-bold text-coral fs-5">
													₹<%= String.format("%.2f", item.getSubtotal()) %>
												</td>

												<td class="text-center pe-3">
													<form action="cartAction" method="post">
														<input type="hidden" name="action" value="remove">
														<input type="hidden" name="cartItemId" value="<%= item.getId() %>">
														<button type="submit" class="btn btn-sm text-muted hover-danger border-0">
															<i class="fa-solid fa-xmark fs-5"></i>
														</button>
													</form>
												</td>
											</tr>
										<% } %>
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<div class="alert alert-info border-0 rounded-4 d-flex align-items-center gap-3">
						<i class="fa-solid fa-shield-heart fs-3 text-info"></i>
						<div class="fs-7 text-secondary">
							<strong>Prescription Safety Guarantee:</strong> Removing medicines or clearing your cart will never delete your official doctor's prescription. Prescriptions are permanently saved under your appointment records.
						</div>
					</div>
				</div>

				<!-- Summary Card -->
				<div class="col-lg-4">
					<div class="card border-0 shadow-sm rounded-4 p-4 sticky-top" style="top: 100px;">
						<h5 class="fw-bold text-dark mb-4 border-bottom pb-3">Order Summary</h5>

						<div class="d-flex justify-content-between mb-2">
							<span class="text-muted">Total Items</span>
							<span class="fw-bold text-dark"><%= cart.getItems().size() %> items</span>
						</div>

						<div class="d-flex justify-content-between mb-3">
							<span class="text-muted">Estimated Delivery</span>
							<span class="fw-semibold text-success"><i class="fa-solid fa-bolt me-1"></i> Express 24h</span>
						</div>

						<hr>

						<div class="d-flex justify-content-between mb-4">
							<span class="fw-bold fs-5 text-dark">Total Amount</span>
							<span class="display-6 fw-bold text-coral">₹<%= String.format("%.2f", cart.getTotalAmount()) %></span>
						</div>

						<a href="checkout.jsp" class="btn btn-coral rounded-pill py-3 fw-bold w-100 mb-3 shadow-sm">
							Proceed To Checkout <i class="fa-solid fa-arrow-right ms-2"></i>
						</a>

						<a href="medicines.jsp" class="btn btn-outline-secondary rounded-pill py-2 fw-semibold w-100 fs-7">
							<i class="fa-solid fa-plus me-1"></i> Add More Medicines
						</a>
					</div>
				</div>
			</div>
		<% } else { %>
			<div class="card border-0 shadow-sm rounded-4 text-center p-5">
				<div class="py-5">
					<i class="fa-solid fa-cart-flatbed display-1 text-muted opacity-25 mb-4"></i>
					<h3 class="fw-bold text-dark">Your Medicine Cart is Empty</h3>
					<p class="text-muted max-w-md mx-auto mb-4">When a doctor prescribes medicines during your consultation, they will automatically appear here. You can also browse our online pharmacy.</p>
					<div class="d-flex justify-content-center gap-3">
						<a href="medicines.jsp" class="btn btn-coral rounded-pill px-4 py-2 fw-bold">
							<i class="fa-solid fa-shop me-2"></i> Browse Medicine Shop
						</a>
						<a href="view_appointment.jsp" class="btn btn-outline-primary rounded-pill px-4 py-2">
							<i class="fa-solid fa-calendar-check me-2"></i> View Appointments
						</a>
					</div>
				</div>
			</div>
		<% } %>
	</div>

	<%@include file="component/footer.jsp"%>
</body>
</html>
