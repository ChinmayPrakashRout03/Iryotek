<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>

<!-- 1. Super Top Bar (White) -->
<div class="super-top-bar">
	<div class="container d-flex justify-content-between align-items-center">
		<div>
			<a href="mailto:info@iryotek.com" class="me-3"><i class="fa-regular fa-envelope me-1"></i> info@iryotek.com</a>
			<span>|</span>
			<a href="tel:+2025550191" class="ms-3"><i class="fa-solid fa-phone me-1"></i> + 202-555-0191</a>
		</div>
		<div class="d-flex align-items-center">
			<c:if test="${empty userObj}">
				<a href="user_login.jsp" class="fw-semibold">Sign in</a>
				<span class="mx-2 text-muted">|</span>
				<a href="signup.jsp" class="fw-semibold">Sign up</a>
			</c:if>
			<c:if test="${not empty userObj}">
				<span class="fw-semibold me-2"><i class="fa-solid fa-circle-user text-primary"></i> ${userObj.fullName}</span>
				<a href="userLogout" class="text-danger ms-2"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
			</c:if>
			<span class="mx-2 text-muted">|</span>
			<a href="doctor_login.jsp" class="text-secondary"><i class="fa-solid fa-user-doctor me-1"></i> Doctor</a>
			<span class="mx-2 text-muted">|</span>
			<a href="admin_login.jsp" class="text-secondary"><i class="fa-solid fa-lock me-1"></i> Admin</a>
		</div>
	</div>
</div>

<!-- 2. Cyan Main Header Band -->
<div class="cyan-header-band">
	<div class="container d-flex justify-content-between align-items-center">
		<a href="index.jsp" class="brand-logo">
			<div class="brand-logo-icon">
				<i class="fa-solid fa-heart-pulse"></i>
			</div>
			<div>
				<div class="brand-title">IRYOTEK</div>
				<div class="brand-subtitle">Care Your Health</div>
			</div>
		</a>
	</div>
</div>

<!-- 3. Floating Navigation Card -->
<div class="floating-navbar-container">
	<div class="container">
		<div class="floating-navbar-card navbar navbar-expand-lg">
			<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#iryotekNavbarNav" aria-controls="iryotekNavbarNav" aria-expanded="false" aria-label="Toggle navigation">
				<i class="fa-solid fa-bars text-dark fs-5"></i>
			</button>
			<div class="collapse navbar-collapse" id="iryotekNavbarNav">
				<ul class="navbar-nav me-auto mb-2 mb-lg-0 align-items-center">
					<li class="nav-item"><a class="nav-link" href="find_hospitals.jsp">Services</a></li>
					<li class="nav-item"><a class="nav-link" href="index.jsp#departments">Departments</a></li>
					<li class="nav-item"><a class="nav-link" href="doctor_login.jsp">Doctors</a></li>
					<li class="nav-item dropdown">
						<a class="nav-link dropdown-toggle" href="#" id="blogDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
							Blog
						</a>
						<ul class="dropdown-menu border-0 shadow-sm" aria-labelledby="blogDropdown">
							<li><a class="dropdown-item" href="index.jsp#blog"><i class="fa-solid fa-newspaper text-cyan me-2"></i> Latest News</a></li>
							<li><a class="dropdown-item" href="blog_detail.jsp?id=1"><i class="fa-solid fa-heart-pulse text-danger me-2"></i> Health Tips</a></li>
						</ul>
					</li>
					<li class="nav-item"><a class="nav-link" href="medicines.jsp"><i class="fa-solid fa-pills text-coral me-1"></i> Medicine Shop</a></li>
					
					<c:if test="${not empty userObj}">
						<%
							com.hms.entity.User navUser = (com.hms.entity.User) session.getAttribute("userObj");
							int cartBadgeCount = 0;
							if (navUser != null) {
								com.hms.dao.CartDAO navCartDAO = new com.hms.dao.CartDAO(com.hms.db.DBConnection.getConn());
								cartBadgeCount = navCartDAO.getCartItemCount(navUser.getId());
							}
						%>
						<li class="nav-item"><a class="nav-link" href="view_appointment.jsp"><i class="fa-solid fa-calendar-check text-primary me-1"></i> Appointments</a></li>
						<li class="nav-item"><a class="nav-link" href="view_medicine_orders.jsp"><i class="fa-solid fa-box text-success me-1"></i> Orders</a></li>
						<li class="nav-item">
							<a class="nav-link position-relative" href="cart.jsp">
								<i class="fa-solid fa-cart-shopping me-1"></i> Cart
								<% if (cartBadgeCount > 0) { %>
									<span class="badge bg-danger rounded-pill px-2 py-1 ms-1 fs-8"><%= cartBadgeCount %></span>
								<% } %>
							</a>
						</li>
					</c:if>
					<li class="nav-item ms-lg-2">
						<a class="btn btn-sm btn-oreo-coral text-white px-3 py-2 rounded-pill fw-bold" href="user_appointment.jsp">
							<i class="fa-solid fa-calendar-plus me-1"></i> Book Appointment
						</a>
					</li>
				</ul>
				<form action="medicines.jsp" method="get" class="d-flex align-items-center ms-auto">
					<input class="nav-search-box" type="search" name="search" placeholder="Search medicines..." aria-label="Search">
				</form>
			</div>
		</div>
	</div>
</div>

<%@include file="global_notifications.jsp" %>