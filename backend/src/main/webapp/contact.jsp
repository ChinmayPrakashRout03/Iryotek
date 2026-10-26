<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Contact Us | Iryotek Healthcare</title>
<%@include file="component/allcss.jsp"%>
</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<!-- Page Breadcrumb Header Banner (Dark Green #0b3c36) -->
	<section class="medipro-page-header text-center py-5 text-white" style="background-color: var(--medipro-dark-green);">
		<div class="container py-4">
			<h1 class="display-4 fw-extrabold text-coral mb-2">Contact Us</h1>
			<p class="fs-6 text-white-50">Home &raquo; Contact Us</p>
		</div>
	</section>

	<!-- Section 1: Embedded Map & Contact Info Bar -->
	<section class="position-relative">
		<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976397304603!3d40.69767011270275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1689254821034!5m2!1sen!2s" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
		
		<!-- Overlapping Info Bar -->
		<div class="container position-relative" style="margin-top: -60px; z-index: 10;">
			<div class="row g-0 rounded-4 overflow-hidden shadow-lg text-white" style="background-color: var(--medipro-dark-card);">
				<div class="col-md-4 p-4 border-end border-secondary text-center text-md-start d-flex align-items-center gap-3">
					<i class="fa-solid fa-phone-volume fs-2 text-coral"></i>
					<div>
						<div class="text-coral fw-bold fs-7 uppercase">Help Line</div>
						<div class="fs-6 fw-semibold text-white">(+0) 123 456 789</div>
					</div>
				</div>
				<div class="col-md-4 p-4 border-end border-secondary text-center text-md-start d-flex align-items-center gap-3">
					<i class="fa-solid fa-location-dot fs-2 text-coral"></i>
					<div>
						<div class="text-coral fw-bold fs-7 uppercase">Location</div>
						<div class="fs-6 fw-semibold text-white">Jl. Raya Kuta No.70, Kuta</div>
					</div>
				</div>
				<div class="col-md-4 p-4 text-center text-md-start d-flex align-items-center gap-3">
					<i class="fa-regular fa-envelope fs-2 text-coral"></i>
					<div>
						<div class="text-coral fw-bold fs-7 uppercase">Email Address</div>
						<div class="fs-6 fw-semibold text-white">healthcare@gmail.com</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Section 2: Contact Form Section -->
	<section class="py-5" style="background-color: var(--medipro-cream-bg);">
		<div class="container py-4 text-center">
			<div class="text-coral fw-bold fs-7 tracking-wider uppercase mb-2">FILL THE FORM</div>
			<h2 class="faq-main-heading mb-5">Contact Form</h2>

			<div class="mx-auto rounded-4 p-4 p-md-5 text-white shadow-lg" style="max-width: 840px; background-color: var(--medipro-dark-card);">
				<form id="contactForm" onsubmit="event.preventDefault(); alert('Thank you for contacting Iryotek Healthcare! We will get back to you shortly.');">
					<div class="row g-4">
						<div class="col-md-6">
							<input type="text" class="form-control bg-transparent text-white border-0 border-bottom rounded-0 px-0 shadow-none fs-7" placeholder="Enter Your Full Name" required>
						</div>
						<div class="col-md-6">
							<input type="email" class="form-control bg-transparent text-white border-0 border-bottom rounded-0 px-0 shadow-none fs-7" placeholder="Enter Your Email" required>
						</div>
						<div class="col-md-6">
							<input type="text" class="form-control bg-transparent text-white border-0 border-bottom rounded-0 px-0 shadow-none fs-7" placeholder="Enter Your Phone Number" required>
						</div>
						<div class="col-md-6">
							<input type="text" class="form-control bg-transparent text-white border-0 border-bottom rounded-0 px-0 shadow-none fs-7" placeholder="Your Subject" required>
						</div>
						<div class="col-12">
							<textarea rows="4" class="form-control bg-transparent text-white border-0 border-bottom rounded-0 px-0 shadow-none fs-7" placeholder="Typer Your Message" required></textarea>
						</div>
						<div class="col-12 mt-4 text-center">
							<button type="submit" class="btn btn-outline-coral rounded-pill px-5 py-3 text-coral border-coral fw-bold hover-coral-bg text-white">
								Book Now <i class="fa-solid fa-paper-plane ms-1"></i>
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</section>

	<%@include file="component/footer.jsp"%>
</body>
</html>
