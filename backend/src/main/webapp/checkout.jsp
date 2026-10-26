<%@page import="com.hms.dao.CartDAO"%>
<%@page import="com.hms.dao.UserAddressDAO"%>
<%@page import="com.hms.entity.Cart"%>
<%@page import="com.hms.entity.CartItem"%>
<%@page import="com.hms.entity.UserAddress"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="java.util.List"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Medicine Order Checkout | Iryotek</title>
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
		Cart cart = cartDAO.getCartWithItems(user.getId());

		if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
			response.sendRedirect("cart.jsp");
			return;
		}

		UserAddressDAO addressDAO = new UserAddressDAO(DBConnection.getConn());
		List<UserAddress> addresses = addressDAO.getUserAddresses(user.getId());
	%>

	<div class="container py-5">
		<h2 class="fw-bold text-dark mb-4">
			<i class="fa-solid fa-credit-card text-coral me-2"></i> Medicine Checkout
		</h2>

		<form action="placeOrder" method="post">
			<div class="row g-4">
				<!-- Left Column: Address & Payment Selection -->
				<div class="col-lg-8">
					<!-- Step 1: Select Delivery Address -->
					<div class="card border-0 shadow-sm rounded-4 mb-4">
						<div class="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
							<h5 class="fw-bold text-dark mb-0">
								<span class="badge bg-primary rounded-circle me-2">1</span> Select Delivery Address
							</h5>
							<button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3" data-bs-toggle="modal" data-bs-target="#addAddressModal">
								<i class="fa-solid fa-plus me-1"></i> Add New Address
							</button>
						</div>

						<div class="card-body p-4">
							<% if (addresses != null && !addresses.isEmpty()) { %>
								<div class="row g-3">
									<% for (UserAddress addr : addresses) { %>
										<div class="col-md-6">
											<label class="card h-100 border rounded-4 p-3 cursor-pointer address-card hover-shadow transition">
												<div class="d-flex align-items-start gap-3">
													<input type="radio" name="addressId" value="<%= addr.getId() %>" class="form-check-input mt-1" <%= addr.getIsDefault() == 1 ? "checked" : "" %> required>
													<div>
														<div class="fw-bold text-dark mb-1">
															<%= addr.getFullName() %>
															<% if (addr.getIsDefault() == 1) { %>
																<span class="badge bg-success-subtle text-success fs-8 ms-1">Default</span>
															<% } %>
														</div>
														<div class="fs-7 text-muted mb-1"><i class="fa-solid fa-phone me-1"></i> <%= addr.getPhone() %></div>
														<div class="fs-7 text-secondary"><%= addr.getFormattedAddress() %></div>
													</div>
												</div>
											</label>
										</div>
									<% } %>
								</div>
							<% } else { %>
								<div class="alert alert-warning border-0 rounded-4 mb-0">
									<i class="fa-solid fa-triangle-exclamation me-2"></i> No delivery addresses saved. Please add a delivery address below to complete checkout.
								</div>
							<% } %>
						</div>
					</div>

					<!-- Step 2: Select Payment Method -->
					<div class="card border-0 shadow-sm rounded-4 mb-4">
						<div class="card-header bg-white border-0 pt-4 px-4 pb-0">
							<h5 class="fw-bold text-dark mb-0">
								<span class="badge bg-primary rounded-circle me-2">2</span> Select Payment Method
							</h5>
						</div>

						<div class="card-body p-4">
							<div class="row g-3">
								<div class="col-md-6">
									<label class="card border rounded-4 p-3 cursor-pointer hover-shadow transition" style="border-color: #00c2cb !important; background: #f0fdfa;">
										<div class="d-flex align-items-center gap-3">
											<input type="radio" name="paymentMethod" value="UPI" id="payMethodUPI" class="form-check-input" checked required onchange="toggleUpiBox(this.value)">
											<div>
												<div class="fw-bold text-dark"><i class="fa-solid fa-bolt text-teal me-2"></i> UPI & Direct App Transfer <span class="badge bg-teal-subtle text-teal ms-1">0% Fee</span></div>
												<div class="fs-8 text-muted">Instant Dynamic QR & Direct UPI App Intents</div>
											</div>
										</div>
									</label>
								</div>

								<div class="col-md-6">
									<label class="card border rounded-4 p-3 cursor-pointer hover-shadow transition">
										<div class="d-flex align-items-center gap-3">
											<input type="radio" name="paymentMethod" value="Cash on Delivery" id="payMethodCOD" class="form-check-input" required onchange="toggleUpiBox(this.value)">
											<div>
												<div class="fw-bold text-dark"><i class="fa-solid fa-hand-holding-dollar text-warning me-2"></i> Cash on Delivery (COD)</div>
												<div class="fs-8 text-muted">Pay cash or scan courier's UPI QR upon arrival</div>
											</div>
										</div>
									</label>
								</div>

								<div class="col-md-6">
									<label class="card border rounded-4 p-3 cursor-pointer hover-shadow transition">
										<div class="d-flex align-items-center gap-3">
											<input type="radio" name="paymentMethod" value="Credit/Debit Card" class="form-check-input" required onchange="toggleUpiBox(this.value)">
											<div>
												<div class="fw-bold text-dark"><i class="fa-solid fa-credit-card text-success me-2"></i> Credit / Debit Card</div>
												<div class="fs-8 text-muted">Visa, Mastercard, RuPay</div>
											</div>
										</div>
									</label>
								</div>

								<div class="col-md-6">
									<label class="card border rounded-4 p-3 cursor-pointer hover-shadow transition">
										<div class="d-flex align-items-center gap-3">
											<input type="radio" name="paymentMethod" value="Net Banking" class="form-check-input" required onchange="toggleUpiBox(this.value)">
											<div>
												<div class="fw-bold text-dark"><i class="fa-solid fa-building-columns text-info me-2"></i> Net Banking</div>
												<div class="fs-8 text-muted">All major Indian banks</div>
											</div>
										</div>
									</label>
								</div>
							</div>

							<!-- Instant UPI Gateway Dynamic Container -->
							<div id="upiGatewayBox" class="mt-4 p-4 rounded-4 border" style="background: linear-gradient(180deg, #f8fafc 0%, #f0fdfa 100%); border-color: #ccfbf1 !important;">
								<div class="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom">
									<div class="d-flex align-items-center gap-2">
										<span class="badge bg-dark px-2 py-1 fs-7">⚡ Instant UPI</span>
										<span class="fs-8 text-muted">Direct Bank Settlement · 0% Fee · Medicine Delivery</span>
									</div>
									<span class="badge bg-success-subtle text-success fs-8">
										<span class="spinner-grow spinner-grow-sm me-1" style="width: 8px; height: 8px;"></span> Live Observer Active
									</span>
								</div>

								<div class="row align-items-center g-4">
									<div class="col-md-5 text-center">
										<div class="p-2 bg-white rounded-3 shadow-sm d-inline-block border position-relative">
											<img id="upiQrImage" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi%3A%2F%2Fpay%3Fpa%3Diryotek.pharma%40upi%26pn%3DIryotek%2BHealthcare%26am%3D<%= String.format("%.2f", cart.getTotalAmount()) %>%26cu%3DINR%26tn%3DMedicine%2BDelivery" alt="UPI QR Code" class="img-fluid rounded" style="width: 180px; height: 180px;">
											<div class="position-absolute top-50 start-50 translate-middle bg-white rounded-circle shadow-sm p-1 border" style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
												<span style="font-weight: 800; font-size: 10px; color: #0284c7; letter-spacing: -0.5px;">UPI</span>
											</div>
										</div>
										<div class="fs-8 text-muted mt-2">Scan with Google Pay, PhonePe, Paytm, CRED or BHIM</div>

										<!-- Direct UPI App Launch Buttons -->
										<div class="mt-3">
											<div class="fs-8 text-muted mb-2 fw-semibold text-uppercase">Pay Directly via Mobile App</div>
											<div class="d-flex flex-wrap gap-1 justify-content-center">
												<a href="gpay://upi/pay?pa=iryotek.pharma@upi&pn=Iryotek%20Healthcare&am=<%= String.format("%.2f", cart.getTotalAmount()) %>&cu=INR&tn=Medicine%2BDelivery" class="btn btn-xs btn-outline-dark fs-8 py-1 px-2 rounded-pill">GPay</a>
												<a href="phonepe://upi/pay?pa=iryotek.pharma@upi&pn=Iryotek%20Healthcare&am=<%= String.format("%.2f", cart.getTotalAmount()) %>&cu=INR&tn=Medicine%2BDelivery" class="btn btn-xs btn-outline-primary fs-8 py-1 px-2 rounded-pill">PhonePe</a>
												<a href="paytmmp://upi/pay?pa=iryotek.pharma@upi&pn=Iryotek%20Healthcare&am=<%= String.format("%.2f", cart.getTotalAmount()) %>&cu=INR&tn=Medicine%2BDelivery" class="btn btn-xs btn-outline-info fs-8 py-1 px-2 rounded-pill">Paytm</a>
												<a href="cred://upi/pay?pa=iryotek.pharma@upi&pn=Iryotek%20Healthcare&am=<%= String.format("%.2f", cart.getTotalAmount()) %>&cu=INR&tn=Medicine%2BDelivery" class="btn btn-xs btn-outline-secondary fs-8 py-1 px-2 rounded-pill">CRED</a>
												<a href="bhim://upi/pay?pa=iryotek.pharma@upi&pn=Iryotek%20Healthcare&am=<%= String.format("%.2f", cart.getTotalAmount()) %>&cu=INR&tn=Medicine%2BDelivery" class="btn btn-xs btn-outline-success fs-8 py-1 px-2 rounded-pill">BHIM</a>
												<a href="upi://pay?pa=iryotek.pharma@upi&pn=Iryotek%20Healthcare&am=<%= String.format("%.2f", cart.getTotalAmount()) %>&cu=INR&tn=Medicine%2BDelivery" class="btn btn-xs btn-teal fs-8 py-1 px-2 rounded-pill text-white fw-bold" style="background: #0f766e;">Other UPI Apps 📲</a>
											</div>
										</div>
									</div>

									<div class="col-md-7">
										<div class="mb-2">
											<div class="d-flex justify-content-between align-items-center">
												<span class="fs-8 text-muted text-uppercase fw-semibold">Receiving UPI VPA</span>
											</div>
											<div class="input-group input-group-sm mt-1">
												<input type="text" class="form-control font-monospace" value="iryotek.pharma@upi" id="vpaField" readonly>
												<button class="btn btn-outline-secondary" type="button" onclick="navigator.clipboard.writeText(document.getElementById('vpaField').value); this.innerText='Copied!'; setTimeout(() => this.innerText='Copy', 2000)">Copy</button>
											</div>
										</div>

										<div id="vpaHelpAlert" class="alert alert-warning py-2 px-3 fs-8 mb-3 rounded-3" style="line-height: 1.4;">
											<strong>⚠️ Note for Phone Scanners:</strong> <code>iryotek.pharma@upi</code> is a demo VPA. Real UPI apps (PhonePe, GPay, Paytm) check NPCI servers and show <em>"Invalid UPI"</em> for unregistered handles. <strong>Type your real UPI ID above</strong> to scan and pay directly from your phone!
										</div>

										<div class="mb-3">
											<span class="fs-8 text-muted d-block text-uppercase fw-semibold">Amount to Transfer</span>
											<div class="fw-bold fs-5 text-dark font-monospace">₹<%= String.format("%.2f", cart.getTotalAmount()) %></div>
										</div>

										<div>
											<label class="form-label fs-8 text-uppercase fw-bold text-dark mb-1">Enter 12-Digit UPI Ref / UTR to Confirm:</label>
											<div class="input-group">
												<input type="text" name="upiUtr" id="upiUtrInput" class="form-control rounded-start-pill font-monospace" placeholder="e.g. 428910394851" maxlength="12" pattern="\d{12}">
												<button class="btn btn-outline-primary rounded-end-pill px-3 fs-8" type="button" onclick="document.getElementById('upiUtrInput').value = Math.floor(100000000000 + Math.random() * 900000000000)">⚡ Auto-Fill Test</button>
											</div>
											<small class="fs-8 text-muted mt-1 d-block">Found in your banking/UPI app transaction details.</small>
										</div>
									</div>
								</div>
							</div>
						</div>

						<script>
							const orderAmount = "<%= String.format("%.2f", cart.getTotalAmount()) %>";

							function updateUpiQr(vpa) {
								const cleanVpa = (vpa || 'iryotek.pharma@upi').trim();
								const uri = 'upi://pay?pa=' + encodeURIComponent(cleanVpa) + '&pn=Iryotek%20Healthcare&am=' + orderAmount + '&cu=INR&tn=Medicine%2BDelivery';
								const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(uri);
								const img = document.getElementById('upiQrImage');
								if (img) img.src = qrUrl;

								const alertBox = document.getElementById('vpaHelpAlert');
								if (alertBox) {
									if (cleanVpa === 'iryotek.pharma@upi' || cleanVpa.endsWith('@upi')) {
										alertBox.className = 'alert alert-warning py-2 px-3 fs-8 mb-3 rounded-3';
										alertBox.innerHTML = '<strong>⚠️ Note for Phone Scanners:</strong> <code>' + cleanVpa + '</code> is a demo VPA. Real UPI apps (PhonePe, GPay, Paytm) check NPCI servers and show <em>"Invalid UPI"</em> for unregistered handles. <strong>Type your real UPI ID above</strong> to scan and pay directly from your phone!';
									} else {
										alertBox.className = 'alert alert-success py-2 px-3 fs-8 mb-3 rounded-3';
										alertBox.innerHTML = '<strong>✅ Active Real VPA:</strong> <code>' + cleanVpa + '</code>. NPCI-compliant QR code generated.';
									}
								}
							}

							function setQuickHandle(handle) {
								const field = document.getElementById('vpaField');
								if (field) {
									const prefix = field.value.split('@')[0] || 'merchant';
									field.value = prefix + handle;
									updateUpiQr(field.value);
								}
							}

							function toggleUpiBox(method) {
								const box = document.getElementById('upiGatewayBox');
								if (box) {
									box.style.display = (method === 'UPI') ? 'block' : 'none';
								}
							}
						</script>
					</div>
				</div>

				<!-- Right Column: Order Review -->
				<div class="col-lg-4">
					<div class="card border-0 shadow-sm rounded-4 p-4 sticky-top" style="top: 100px;">
						<h5 class="fw-bold text-dark mb-4 border-bottom pb-3">Items in Order</h5>

						<div class="max-h-64 overflow-auto pe-1 mb-3">
							<% for (CartItem item : cart.getItems()) { %>
								<div class="d-flex justify-content-between align-items-center mb-3">
									<div>
										<div class="fw-bold fs-7 text-dark"><%= item.getMedicine().getName() %></div>
										<div class="fs-8 text-muted">Qty: <%= item.getQuantity() %> × ₹<%= item.getMedicine().getPrice() %></div>
									</div>
									<div class="fw-bold font-monospace text-coral">₹<%= String.format("%.2f", item.getSubtotal()) %></div>
								</div>
							<% } %>
						</div>

						<hr>

						<div class="d-flex justify-content-between mb-2">
							<span class="text-muted">Subtotal</span>
							<span class="fw-bold text-dark">₹<%= String.format("%.2f", cart.getTotalAmount()) %></span>
						</div>

						<div class="d-flex justify-content-between mb-3">
							<span class="text-muted">Pharmacy Delivery</span>
							<span class="fw-bold text-success">FREE</span>
						</div>

						<hr>

						<div class="d-flex justify-content-between mb-4">
							<span class="fw-bold fs-5 text-dark">Total Amount</span>
							<span class="display-6 fw-bold text-coral">₹<%= String.format("%.2f", cart.getTotalAmount()) %></span>
						</div>

						<% if (addresses != null && !addresses.isEmpty()) { %>
							<button type="submit" class="btn btn-coral rounded-pill py-3 fw-bold w-100 shadow-sm">
								<i class="fa-solid fa-lock me-2"></i> Confirm & Place Order
							</button>
						<% } else { %>
							<button type="button" class="btn btn-secondary rounded-pill py-3 fw-bold w-100 disabled" disabled>
								Add Address to Continue
							</button>
						<% } %>
					</div>
				</div>
			</div>
		</form>
	</div>

	<!-- Add Address Modal -->
	<div class="modal fade" id="addAddressModal" tabindex="-1" aria-labelledby="addAddressModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content rounded-4 border-0">
				<div class="modal-header border-0 pb-0">
					<h5 class="modal-title fw-bold" id="addAddressModalLabel">Add Delivery Address</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<form action="addressAction" method="post">
					<input type="hidden" name="action" value="add">
					<input type="hidden" name="redirectUrl" value="checkout.jsp">
					<div class="modal-body p-4">
						<div class="row g-3">
							<div class="col-md-6">
								<label class="form-label fs-7 fw-semibold">Recipient Name</label>
								<input type="text" name="fullName" class="form-control rounded-pill" required value="<%= user.getFullName() %>">
							</div>
							<div class="col-md-6">
								<label class="form-label fs-7 fw-semibold">Mobile Phone</label>
								<input type="text" name="phone" class="form-control rounded-pill" required placeholder="10-digit mobile number">
							</div>
							<div class="col-12">
								<label class="form-label fs-7 fw-semibold">Street / Flat / House Address</label>
								<textarea name="streetAddress" class="form-control rounded-3" rows="2" required placeholder="House No., Street Name, Area"></textarea>
							</div>
							<div class="col-md-4">
								<label class="form-label fs-7 fw-semibold">City</label>
								<input type="text" name="city" class="form-control rounded-pill" required placeholder="City">
							</div>
							<div class="col-md-4">
								<label class="form-label fs-7 fw-semibold">State</label>
								<input type="text" name="state" class="form-control rounded-pill" required placeholder="State">
							</div>
							<div class="col-md-4">
								<label class="form-label fs-7 fw-semibold">PIN Code</label>
								<input type="text" name="pincode" class="form-control rounded-pill" required placeholder="6-digit PIN">
							</div>
							<div class="col-12">
								<div class="form-check">
									<input type="checkbox" name="isDefault" class="form-check-input" id="isDefaultCheck" checked>
									<label class="form-check-label fs-7" for="isDefaultCheck">Set as default delivery address</label>
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer border-0 pt-0">
						<button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
						<button type="submit" class="btn btn-primary rounded-pill px-4">Save Address</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<%@include file="component/footer.jsp"%>
</body>
</html>
