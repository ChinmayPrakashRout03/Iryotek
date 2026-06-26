<%@page import="com.hms.db.DBConnection"%>
<%@page import="java.sql.Connection"%>
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
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0 ">

<title>Home Page | Iryotek</title>
<%@include file="component/allcss.jsp"%>


<!-- customs css for this page -->
<!-- end of customs css for this page -->

</head>
<body>
	<%@include file="component/navbar.jsp"%>


	<!-- carousel code -->

	<div id="carouselExampleIndicators" class="carousel slide"
		data-bs-ride="carousel">
		<div class="carousel-indicators">
			<button type="button" data-bs-target="#carouselExampleIndicators"
				data-bs-slide-to="0" class="active" aria-current="true"
				aria-label="Slide 1"></button>
			<button type="button" data-bs-target="#carouselExampleIndicators"
				data-bs-slide-to="1" aria-label="Slide 2"></button>
			<button type="button" data-bs-target="#carouselExampleIndicators"
				data-bs-slide-to="2" aria-label="Slide 3"></button>
			<button type="button" data-bs-target="#carouselExampleIndicators"
				data-bs-slide-to="3" aria-label="Slide 4"></button>
			<!-- <button type="button" data-bs-target="#carouselExampleIndicators"
				data-bs-slide-to="4" aria-label="Slide 5"></button>
			<button type="button" data-bs-target="#carouselExampleIndicators"
				data-bs-slide-to="5" aria-label="Slide 6"></button>
			<button type="button" data-bs-target="#carouselExampleIndicators"
				data-bs-slide-to="6" aria-label="Slide 7"></button> -->
		</div>
		<div class="carousel-inner">
			<div class="carousel-item active">
				<img src="img/doctor_2.jpg" class="d-block w-100" alt="..."
					style="height: 500px; object-fit: cover;">
			</div>
			<div class="carousel-item">
				<img src="img/doctor_1.jpg" class="d-block w-100" alt="..."
					style="height: 500px; object-fit: cover;">
			</div>
			<div class="carousel-item">
				<img src="img/hospital4.jpg" class="d-block w-100" alt="..."
					style="height: 500px; object-fit: cover;">
			</div>
			<div class="carousel-item">
				<img src="img/doctor_3.jpg" class="d-block w-100" alt="..."
					style="height: 500px; object-fit: cover;">
			</div>
			<!-- <div class="carousel-item">
				<img src="img/hospital1.jpg" class="d-block w-100" alt="...">
			</div>
			<div class="carousel-item">
				<img src="img/hospital2.jpg" class="d-block w-100" alt="...">
			</div>
			<div class="carousel-item">
				<img src="img/hospital3.jpg" class="d-block w-100" alt="...">
			</div> -->

		</div>
		<button class="carousel-control-prev" type="button"
			data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
			<span class="carousel-control-prev-icon" aria-hidden="true"></span> <span
				class="visually-hidden">Previous</span>
		</button>
		<button class="carousel-control-next" type="button"
			data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
			<span class="carousel-control-next-icon" aria-hidden="true"></span> <span
				class="visually-hidden">Next</span>
		</button>
	</div>

	<!-- end of carousel code -->



	<!-- First Div Container -->
	<div class="container p-3">
		<p class="text-center mt-2 mb-5 fs-2 myP-color">Some key Features of our
			Iryotek Portal</p>
		<div class="row">
			<!-- 1st col -->
			<div class="col-md-8 p-5">

				<div class="row">
					<div class="col-md-6">
						<div class="card my-card">
							<div class="card-body">
								<p class="fs-5 myP-color">🚀 Smart Appointment Scheduling</p>
								<p>Book appointments effortlessly with an intelligent scheduling engine that automatically assigns queue tokens and consultation time slots, ensuring a fast, organized, and conflict-free booking experience.</p>
							</div>
						</div>
					</div>

					<div class="col-md-6">
						<div class="card my-card">
							<div class="card-body">
								<p class="fs-5 myP-color">⚡ Intelligent Queue Management</p>
								<p>Our automated queue management system generates unique patient tokens, optimizes consultation flow, and prevents duplicate bookings through synchronized scheduling.</p>
							</div>
						</div>
					</div>

					<div class="col-md-6 mt-2">
						<div class="card my-card">
							<div class="card-body">
								<p class="fs-5 myP-color">🔒 Secure Multi-Role Access</p>
								<p>Dedicated dashboards for Patients, Doctors, and Administrators provide secure authentication, role-based access control, and seamless management of appointments, prescriptions, and healthcare records.</p>
							</div>
						</div>
					</div>

					<div class="col-md-6 mt-2">
						<div class="card my-card">
							<div class="card-body">
								<p class="fs-5 myP-color">📊 Centralized Hospital Management</p>
								<p>A comprehensive admin dashboard enables efficient management of hospitals, doctors, specialists, appointments, and real-time healthcare operations from a single unified platform.</p>
							</div>
						</div>
					</div>
				</div>


			</div>
			<!-- End of 1st col -->

				<div class="col-md-4 mt-2 mys-card">
					<img class="mt-3 img-fluid" alt="" src="img/doctor_1.jpg" style="height: 380px; width: 100%; object-fit: cover; border-radius: 16px; box-shadow: var(--card-shadow);">
				</div>
			
			<!-- End of 2nd col -->

		</div>
	</div>
	<!-- End of First Div Container -->

	<hr>

	<!-- Second Div Container -->

	<div class="container p-2">
		<p class="text-center fs-2 myP-color">Our Team</p>
		<div class="row">
			<div class="col-md-3">
				<div class="card my-card">
					<div class="card-body text-center">
						<img alt="" src="img/doc1.jpg" class="img-fluid rounded-circle mb-3" style="width: 150px; height: 150px; object-fit: cover; border: 3px solid var(--accent-teal);">
						<p class="fw-bold fs-5">Dr. John</p>
						<p class="fs-7">(CEO & Chairman)</p>
					</div>
				</div>
			</div>
			<div class="col-md-3">
				<div class="card my-card">
					<div class="card-body text-center">
						<img alt="" src="img/doc2.jpg" class="img-fluid rounded-circle mb-3" style="width: 150px; height: 150px; object-fit: cover; border: 3px solid var(--accent-teal);">
						<p class="fw-bold fs-5">Dr. Brad</p>
						<p class="fs-7">(Chief Doctor)</p>
					</div>
				</div>
			</div>
			<div class="col-md-3">
				<div class="card my-card">
					<div class="card-body text-center">
						<img alt="" src="img/doc3.jpg" class="img-fluid rounded-circle mb-3" style="width: 150px; height: 150px; object-fit: cover; border: 3px solid var(--accent-teal);">
						<p class="fw-bold fs-5">Dr. Jennifer</p>
						<p class="fs-7">(Chief Doctor)</p>
					</div>
				</div>
			</div>

			<div class="col-md-3">
				<div class="card my-card">
					<div class="card-body text-center">
						<img alt="" src="img/doc4.jpg" class="img-fluid rounded-circle mb-3" style="width: 150px; height: 150px; object-fit: cover; border: 3px solid var(--accent-teal);">
						<p class="fw-bold fs-5">Dr. Maria</p>
						<p class="fs-7">(Dean)</p>
					</div>
				</div>
			</div>

		</div>

	</div>

	<!-- Second Div Container -->





	<!-- footer -->
	<%@include file="component/footer.jsp"%>
	<!-- end footer -->
</body>
</html>