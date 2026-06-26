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
<title>Add Hospital</title>
<%@include file="../component/allcss.jsp"%>

<!-- customs css for this page -->
<style type="text/css">
.my-card {
	box-shadow: 0px 0px 10px 1px maroon;
}
</style>
<!-- end of customs css for this page -->

</head>
<body>
	<%@include file="navbar.jsp"%>


	<div class="container-fluid p-3">
		<div class="row">
			<div class="col-md-5 offset-4">
				<div class="card my-card">
					<div class="card-body">
						<p class="fs-3 text-center text-danger">Add Hospital</p>

						<!-- message print -->
						<!-- for success msg -->
						<c:if test="${not empty successMsg }">
							<p class="text-center text-success fs-3">${successMsg}</p>
							<c:remove var="successMsg" scope="session" />
						</c:if>

						<!-- for error msg -->
						<c:if test="${not empty errorMsg }">
							<p class="text-center text-danger fs-3">${errorMsg}</p>
							<c:remove var="errorMsg" scope="session" />
						</c:if>
						<!-- End of message print -->

						<!-- bootstrap form -->
						<form action="../addHospital" method="post">
							<div class="mb-3">
								<label class="form-label">Hospital Name</label> <input
									name="name" type="text" placeholder="Enter hospital name"
									class="form-control" required="required">
							</div>
							<div class="mb-3">
								<label class="form-label">Address</label>
								<textarea name="address" class="form-control" rows="2"
									placeholder="Enter full address" required="required"></textarea>
							</div>
							<div class="mb-3">
								<label class="form-label">City</label> <input
									name="city" type="text" placeholder="Enter city"
									class="form-control" required="required">
							</div>
							<div class="mb-3">
								<label class="form-label">State</label> <input
									name="state" type="text" placeholder="Enter state"
									class="form-control" required="required">
							</div>
							<div class="mb-3">
								<label class="form-label">Phone</label> <input name="phone"
									type="text" placeholder="Enter phone number"
									class="form-control">
							</div>

							<button type="submit" class="btn btn-danger text-white col-md-12">Add Hospital</button>
						</form>
						<!-- end of bootstrap form -->

					</div>

				</div>
			</div>
			
		</div>
	</div>


</body>
</html>
