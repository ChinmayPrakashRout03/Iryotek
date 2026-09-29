<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>About Us | Iryotek Healthcare</title>
<%@include file="component/allcss.jsp"%>
</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<!-- Page Breadcrumb Header Banner (Dark Green #0b3c36) -->
	<section class="medipro-page-header text-center py-5 text-white" style="background-color: var(--medipro-dark-green);">
		<div class="container py-4">
			<h1 class="display-4 fw-extrabold text-coral mb-2">About Us</h1>
			<p class="fs-6 text-white-50">Home &raquo; About Us</p>
		</div>
	</section>

	<!-- Section 1: Caring For The Health & Well Being Of Family -->
	<section class="py-5" style="background-color: var(--medipro-cream-bg);">
		<div class="container py-4">
			<div class="row align-items-center g-5">
				<!-- Left Text & Doctor Profile Quote -->
				<div class="col-lg-6">
					<div class="faq-accent-tag">ABOUT US</div>
					<h2 class="faq-main-heading mb-4">Caring For The Health & Well Being Of Family.</h2>
					<p class="text-muted leading-relaxed mb-4">
						Our family-centered approach to healthcare ensures that each member of your family receives personalized attention and care tailored to their unique needs. We believe in building strong relationships with our patients, fostering trust.
					</p>

					<div class="d-flex align-items-center gap-3 p-3 bg-white rounded-4 shadow-sm border border-light" style="max-width: 420px;">
						<img src="img/doc2.jpg" alt="Dr. Elizabeth Foster" class="rounded-circle" style="width: 65px; height: 65px; object-fit: cover;">
						<div>
							<h6 class="fw-bold text-dark mb-0">Dr. Elizabeth Foster</h6>
							<span class="text-coral fs-7 fw-semibold">Family Physician</span>
							<div class="fst-italic text-muted fs-7 mt-1">Compassionate care for all ages.</div>
						</div>
					</div>
				</div>

				<!-- Right Oval Doctor Arch Images -->
				<div class="col-lg-6 text-center">
					<div class="position-relative d-inline-block">
						<img src="img/doctor_1.jpg" alt="Iryotek Female Surgeons" class="img-fluid shadow-lg" style="border-radius: 120px 120px 20px 20px; max-height: 440px; width: 100%; object-fit: cover;">
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Section 2: Who We Are / Laboratory Video Banner (Dark Green #0b3c36) -->
	<section class="py-5 text-white" style="background-color: var(--medipro-dark-green);">
		<div class="container py-4">
			<div class="row align-items-center g-5">
				<div class="col-lg-6">
					<img src="img/doc3.jpg" alt="Laboratory Research" class="img-fluid rounded-4 shadow-lg" style="max-height: 380px; width: 100%; object-fit: cover;">
				</div>
				<div class="col-lg-6">
					<div class="text-coral fw-bold fs-7 tracking-wider uppercase mb-2">WHO WE ARE</div>
					<h2 class="display-6 fw-bold text-white mb-4">Improving The Quality Of Your Life Through Better Health.</h2>
					<p class="text-white-50 leading-relaxed mb-4">
						We offer a wide range of comprehensive healthcare services to address all aspects of your health. From preventive care and health screenings to specialized treatments and chronic disease management.
					</p>
					<a href="find_hospitals.jsp" class="btn btn-outline-light rounded-pill px-4 py-2">
						<i class="fa-solid fa-play me-2 text-coral"></i> Play Video Overview
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Section 3: Top Services Progressive Medical Clinic -->
	<section class="py-5" style="background-color: var(--medipro-cream-bg);">
		<div class="container py-4">
			<div class="text-coral fw-bold fs-7 tracking-wider uppercase mb-2">TOP SERVICES</div>
			<h2 class="faq-main-heading mb-4">We Are a Progressive Medical Clinic.</h2>

			<div class="row g-4">
				<div class="col-lg-4 col-md-6">
					<div class="bg-white p-4 rounded-4 shadow-sm border border-light h-100">
						<div class="medipro-logo-icon mb-3 fs-2 text-coral"><i class="fa-solid fa-flask"></i></div>
						<h5 class="fw-bold text-dark">Modern Laboratory</h5>
						<p class="text-muted fs-7">Our laboratory is equipped with the latest diagnostic equipment and automation for accurate testing.</p>
					</div>
				</div>
				<div class="col-lg-4 col-md-6">
					<div class="bg-white p-4 rounded-4 shadow-sm border border-light h-100">
						<div class="medipro-logo-icon mb-3 fs-2 text-coral"><i class="fa-solid fa-microscope"></i></div>
						<h5 class="fw-bold text-dark">Diagnostics Center</h5>
						<p class="text-muted fs-7">Comprehensive imaging and diagnostic scanning facilities operated by expert radiologists.</p>
					</div>
				</div>
				<div class="col-lg-4 col-md-6">
					<div class="bg-white p-4 rounded-4 shadow-sm border border-light h-100">
						<div class="medipro-logo-icon mb-3 fs-2 text-coral"><i class="fa-solid fa-user-doctor"></i></div>
						<h5 class="fw-bold text-dark">Experienced Doctors</h5>
						<p class="text-muted fs-7">Board-certified senior physicians and surgeons delivering compassionate clinical care.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Section 4: Open For Appointments Banner -->
	<section class="py-4 text-white" style="background-color: var(--medipro-dark-card);">
		<div class="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
			<div class="d-flex align-items-center gap-3">
				<i class="fa-solid fa-stethoscope fs-2 text-coral"></i>
				<div>
					<h5 class="fw-bold mb-1 text-white">Open For Appointments</h5>
					<p class="text-white-50 mb-0 fs-7">We are delighted to announce that our doors are open, and we are now accepting appointments.</p>
				</div>
			</div>
			<a href="user_appointment.jsp" class="btn-medipro-coral text-nowrap">
				Make Appointment <i class="fa-solid fa-calendar-days ms-1"></i>
			</a>
		</div>
	</section>

	<%@include file="component/footer.jsp"%>
</body>
</html>
