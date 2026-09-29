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
<title>Admin Login</title>

<!-- boostrap css -->
<%@include file="component/allcss.jsp"%>
<!-- end of boostrap css -->




</head>
<body>
	<!-- navbar -->
	<%@include file="component/navbar.jsp"%>
	<!-- end navbar -->
	<!-- <h1>Admin Login</h1> -->


	<!-- Admin Login -->
	<div class="auth-page-wrapper">
		<div class="container">
			<div class="row justify-content-center">
				<div class="col-lg-5 col-md-7">
					<div class="card my-card">
						<div class="card-header text-center text-white my-bg-color py-4">
							<h4 class="mb-0 fw-bold"><i class="fa-solid fa-user-shield me-2"></i> Admin Login</h4>
						</div>
						
						<div class="card-body p-4 p-md-5">
							<c:if test="${not empty successMsg}">
								<div class="alert alert-success alert-dismissible fade show text-center" role="alert">
									<i class="fa-solid fa-circle-check me-2"></i> ${successMsg}
									<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
								</div>
								<c:remove var="successMsg" scope="session" />
							</c:if>

							<c:if test="${not empty errorMsg}">
								<div class="alert alert-danger alert-dismissible fade show text-center" role="alert">
									<i class="fa-solid fa-triangle-exclamation me-2"></i> ${errorMsg}
									<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
								</div>
								<c:remove var="errorMsg" scope="session" />
							</c:if>

							<form action="adminLogin" method="post" class="mt-2">
								<div class="mb-4">
									<label class="form-label fw-semibold text-dark">Email Address</label>
									<input name="email" type="email" placeholder="Enter Email" class="form-control oreo-input-pill" required>
									<div id="emailHelp" class="form-text mt-1 text-muted fs-7">We'll never share your email with anyone else.</div>
								</div>
								<div class="mb-4">
									<label class="form-label fw-semibold text-dark">Password</label>
									<input name="password" type="password" placeholder="Enter password" class="form-control oreo-input-pill" required>
								</div>

								<button type="submit" class="btn-oreo-coral-submit mt-2">Submit</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!-- End of Admin Login -->




</body>
</html>