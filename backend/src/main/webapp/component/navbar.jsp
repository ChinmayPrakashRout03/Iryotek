<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>

<!-- 1. Super Top Bar (White with ThreeUI Proximity Micro-Dock) -->
<div class="super-top-bar">
	<div class="container d-flex justify-content-between align-items-center">
		<div>
			<a href="mailto:info@iryotek.com" class="me-3"><i class="fa-regular fa-envelope me-1"></i> info@iryotek.com</a>
			<span>|</span>
			<a href="tel:+2025550191" class="ms-3"><i class="fa-solid fa-phone me-1"></i> + 202-555-0191</a>
		</div>
		<div class="d-flex align-items-center">
			<div class="super-top-dock" data-threeui-dock="sable-utility" data-dock-state="idle" data-dock-frame>
				<c:if test="${empty userObj}">
					<a href="user_login.jsp" class="super-top-dock-item" data-dock-item aria-label="Sign in">
						<i class="fa-solid fa-arrow-right-to-bracket text-cyan"></i> Sign in
					</a>
					<span class="super-top-dock-divider"></span>
					<a href="signup.jsp" class="super-top-dock-item" data-dock-item aria-label="Sign up">
						<i class="fa-solid fa-user-plus text-coral"></i> Sign up
					</a>
				</c:if>
				<c:if test="${not empty userObj}">
					<a href="patient_profile.jsp" class="super-top-dock-item" data-dock-item aria-label="Patient Profile">
						<i class="fa-solid fa-circle-user text-cyan"></i> ${userObj.fullName}
					</a>
					<span class="super-top-dock-divider"></span>
					<a href="userLogout" class="super-top-dock-item text-danger" data-dock-item aria-label="Logout">
						<i class="fa-solid fa-right-from-bracket"></i> Logout
					</a>
				</c:if>
				<span class="super-top-dock-divider"></span>
				<a href="doctor_login.jsp" class="super-top-dock-item" data-dock-item aria-label="Doctor Portal">
					<i class="fa-solid fa-user-doctor text-secondary"></i> Doctor
				</a>
				<span class="super-top-dock-divider"></span>
				<a href="admin_login.jsp" class="super-top-dock-item" data-dock-item aria-label="Admin Portal">
					<i class="fa-solid fa-lock text-secondary"></i> Admin
				</a>
			</div>
		</div>
	</div>
</div>

<!-- 2. Cyan Main Header Band -->
<div class="cyan-header-band">
	<div class="container d-flex justify-content-between align-items-center">
		<a href="index.jsp" class="brand-logo">
			<img src="${pageContext.request.contextPath}/img/logo-emblem.png" alt="Iryotek Logo" class="brand-emblem-img" style="height: 46px; width: auto; object-fit: contain; filter: drop-shadow(0 0 8px rgba(0, 194, 203, 0.45));">
			<div>
				<div class="brand-title">IRYOTEK</div>
				<div class="brand-subtitle">Care Your Health</div>
			</div>
		</a>
	</div>
</div>

<!-- 3. Floating Navigation Card (ThreeUI Sable Animated Top Dock) -->
<div class="floating-navbar-container">
	<div class="container">
		<div class="threeui-sable-navbar navbar navbar-expand-lg">
			<button class="navbar-toggler border-0 text-white p-2" type="button" data-bs-toggle="collapse" data-bs-target="#iryotekNavbarNav" aria-controls="iryotekNavbarNav" aria-expanded="false" aria-label="Toggle navigation">
				<i class="fa-solid fa-bars fs-5"></i>
			</button>
			<div class="collapse navbar-collapse w-100" id="iryotekNavbarNav">
				<nav class="threeui-dock-nav me-auto" data-threeui-dock="sable-nav" data-dock-state="idle" data-dock-max="0.00" aria-label="Primary Navigation">
					<a class="threeui-dock-item" data-dock-item href="find_hospitals.jsp">
						<span class="threeui-dock-icon text-cyan"><i class="fa-solid fa-briefcase-medical"></i></span>
						<span>Services</span>
					</a>
					<a class="threeui-dock-item" data-dock-item href="index.jsp#departments">
						<span class="threeui-dock-icon text-primary"><i class="fa-solid fa-hospital"></i></span>
						<span>Departments</span>
					</a>
					<a class="threeui-dock-item" data-dock-item href="doctor_login.jsp">
						<span class="threeui-dock-icon text-info"><i class="fa-solid fa-user-doctor"></i></span>
						<span>Doctors</span>
					</a>
					<div class="dropdown d-inline-flex align-items-start" style="overflow: visible;">
						<button class="threeui-dock-item dropdown-toggle border-0" data-dock-item type="button" id="blogDropdown" data-bs-toggle="dropdown" aria-expanded="false">
							<span class="threeui-dock-icon text-warning"><i class="fa-solid fa-newspaper"></i></span>
							<span>Blog</span>
						</button>
						<ul class="dropdown-menu threeui-sable-dropdown border-0 shadow" aria-labelledby="blogDropdown">
							<li><a class="dropdown-item" href="index.jsp#blog"><i class="fa-solid fa-newspaper text-cyan me-2"></i> Latest News</a></li>
							<li><a class="dropdown-item" href="blog_detail.jsp?id=1"><i class="fa-solid fa-heart-pulse text-danger me-2"></i> Health Tips</a></li>
						</ul>
					</div>
					<a class="threeui-dock-item" data-dock-item href="medicines.jsp">
						<span class="threeui-dock-icon text-coral"><i class="fa-solid fa-pills"></i></span>
						<span>Medicine Shop</span>
					</a>
					
					<c:if test="${not empty userObj}">
						<%
							com.hms.entity.User navUser = (com.hms.entity.User) session.getAttribute("userObj");
							int cartBadgeCount = 0;
							if (navUser != null) {
								com.hms.dao.CartDAO navCartDAO = new com.hms.dao.CartDAO(com.hms.db.DBConnection.getConn());
								cartBadgeCount = navCartDAO.getCartItemCount(navUser.getId());
							}
						%>
						<a class="threeui-dock-item" data-dock-item href="patient_profile.jsp">
							<span class="threeui-dock-icon text-info"><i class="fa-solid fa-id-card"></i></span>
							<span>My Profile</span>
						</a>
						<a class="threeui-dock-item" data-dock-item href="view_appointment.jsp">
							<span class="threeui-dock-icon text-primary"><i class="fa-solid fa-calendar-check"></i></span>
							<span>Appointments</span>
						</a>
						<a class="threeui-dock-item" data-dock-item href="view_medicine_orders.jsp">
							<span class="threeui-dock-icon text-success"><i class="fa-solid fa-box"></i></span>
							<span>Orders</span>
						</a>
						<a class="threeui-dock-item position-relative" data-dock-item href="cart.jsp">
							<span class="threeui-dock-icon text-warning"><i class="fa-solid fa-cart-shopping"></i></span>
							<span>Cart</span>
							<% if (cartBadgeCount > 0) { %>
								<span class="threeui-dock-badge"><%= cartBadgeCount %></span>
							<% } %>
						</a>
					</c:if>
					<a class="threeui-dock-item threeui-dock-cta ms-lg-2" data-dock-item href="user_appointment.jsp">
						<span class="threeui-dock-icon"><i class="fa-solid fa-calendar-plus"></i></span>
						<span>Book Appointment</span>
					</a>
				</nav>
				<form action="medicines.jsp" method="get" class="threeui-dock-search-wrap ms-auto">
					<input class="threeui-dock-search" type="search" name="search" placeholder="Search medicines..." aria-label="Search">
					<i class="fa-solid fa-magnifying-glass threeui-dock-search-icon"></i>
				</form>
			</div>
		</div>
	</div>
</div>

<%@include file="global_notifications.jsp" %>