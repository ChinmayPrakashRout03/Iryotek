<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>404 Page Not Found | Iryotek Healthcare</title>
<%@include file="component/allcss.jsp"%>
</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<!-- Page Breadcrumb Header Banner (Dark Green #0b3c36) -->
	<section class="medipro-page-header text-center py-5 text-white" style="background-color: var(--medipro-dark-green);">
		<div class="container py-4">
			<h1 class="display-4 fw-extrabold text-coral mb-2">Page Not Found</h1>
			<p class="fs-6 text-white-50">Home &raquo; 404 Error</p>
		</div>
	</section>

	<!-- Main 404 Area -->
	<section class="py-5 text-center" style="background-color: var(--medipro-cream-bg);">
		<div class="container py-5">
			<div class="mb-4">
				<!-- 404 Rocket Graphic -->
				<div class="d-inline-flex align-items-center justify-content-center bg-white rounded-4 shadow-sm p-4" style="border: 1px solid #e2e8f0;">
					<span class="display-1 fw-extrabold text-dark me-2" style="font-size: 6rem; letter-spacing: -2px;">4</span>
					<i class="fa-solid fa-rocket text-coral display-3 mx-2" style="transform: rotate(-45deg);"></i>
					<span class="display-1 fw-extrabold text-dark ms-2" style="font-size: 6rem; letter-spacing: -2px;">4</span>
				</div>
			</div>

			<h2 class="faq-main-heading mb-4">Sorry, This page is not found.</h2>
			<a href="index.jsp" class="btn btn-outline-coral rounded-pill px-5 py-3 text-coral border-coral fw-bold hover-coral-bg text-white">
				Back To Home <i class="fa-solid fa-house ms-1"></i>
			</a>
		</div>
	</section>

	<%@include file="component/footer.jsp"%>
</body>
</html>
