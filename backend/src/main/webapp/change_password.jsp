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
<title>Change Password</title>
<%@include file="component/allcss.jsp"%>



</head>
<body>
	<%@include file="component/navbar.jsp"%>
	
	
	<!-- if not login then log in first -->
	<c:if test="${empty userObj }">

		<c:redirect url="/user_login.jsp"></c:redirect>

	</c:if>

	<div class="auth-page-wrapper">
		<div class="container">
			<div class="row justify-content-center">
				<div class="col-lg-5 col-md-7">
					<div class="card my-card">
						<div class="card-header text-center text-white my-bg-color py-4">
							<h4 class="mb-0 fw-bold"><i class="fa-solid fa-key me-2"></i> Change Password</h4>
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

							<form action="userChangePassword" method="post" class="mt-2">
								<div class="mb-4">
									<label class="form-label fw-semibold text-dark">Old Password</label>
									<input name="oldPassword" type="password" placeholder="Enter old password" class="form-control oreo-input-pill" required>
								</div>

								<div class="mb-4">
									<label class="form-label fw-semibold text-dark">New Password</label>
									<input name="newPassword" type="password" placeholder="Enter new password" class="form-control oreo-input-pill" required>
								</div>

								<input type="hidden" value="${userObj.id}" name="userId">

								<button type="submit" class="btn-oreo-coral-submit mt-2">Change Password</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>


</body>
</html>