<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Pathology Clinic | Iryotek Healthcare</title>
<%@include file="component/allcss.jsp"%>
</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<!-- Page Breadcrumb Header Banner (Dark Green #0b3c36) -->
	<section class="medipro-page-header text-center py-5 text-white" style="background-color: var(--medipro-dark-green);">
		<div class="container py-4">
			<h1 class="display-4 fw-extrabold text-coral mb-2">Pathology Clinic</h1>
			<p class="fs-6 text-white-50">Home &raquo; Services &raquo; Pathology Clinic</p>
		</div>
	</section>

	<!-- Main Service Content Area -->
	<section class="py-5" style="background-color: var(--medipro-cream-bg);">
		<div class="container py-4">
			<div class="row g-5">
				<!-- Left Column: Main Service Content -->
				<div class="col-lg-8">
					<img src="img/hero_doctors.png" alt="Pathology Surgery" class="img-fluid rounded-4 shadow-sm mb-4" style="max-height: 400px; width: 100%; object-fit: cover;">

					<p class="text-muted leading-relaxed mb-4">
						At our Pathology Clinic, we are dedicated to providing accurate and timely diagnostic services to support your healthcare needs. Our team of highly skilled pathologists and laboratory technicians work diligently to deliver reliable results that aid in early detection and diagnosis.
					</p>

					<h3 class="fw-bold text-dark mb-3">Health Care Plans.</h3>
					<div class="row g-3 mb-5">
						<div class="col-md-6 text-muted fs-7"><i class="fa-solid fa-circle-check text-coral me-2"></i> Mental Health Solutions</div>
						<div class="col-md-6 text-muted fs-7"><i class="fa-solid fa-circle-check text-coral me-2"></i> Rapid Patient Improvement</div>
						<div class="col-md-6 text-muted fs-7"><i class="fa-solid fa-circle-check text-coral me-2"></i> World Class Treatment</div>
						<div class="col-md-6 text-muted fs-7"><i class="fa-solid fa-circle-check text-coral me-2"></i> Medical Research Professionals</div>
						<div class="col-md-6 text-muted fs-7"><i class="fa-solid fa-circle-check text-coral me-2"></i> Medical Advices & Check Ups</div>
						<div class="col-md-6 text-muted fs-7"><i class="fa-solid fa-circle-check text-coral me-2"></i> Trusted Medical Treatment</div>
					</div>

					<!-- Key Benefits FAQ Accordion -->
					<h3 class="fw-bold text-dark mb-4">Key Benefits.</h3>
					<div class="accordion medipro-accordion" id="serviceFaqAccordion">
						<div class="accordion-item">
							<h2 class="accordion-header">
								<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#sc1" aria-expanded="true">
									<i class="fa-solid fa-minus me-3 text-secondary fs-6 icon-toggle"></i> How to schedule an appointment?
								</button>
							</h2>
							<div id="sc1" class="accordion-collapse collapse show" data-bs-parent="#serviceFaqAccordion">
								<div class="accordion-body">
									We provide a wide range of medical services. You can schedule directly through our online appointment booking portal or by phone.
								</div>
							</div>
						</div>
						<div class="accordion-item">
							<h2 class="accordion-header">
								<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sc2">
									<i class="fa-solid fa-plus me-3 text-secondary fs-6 icon-toggle"></i> What are your clinic hours?
								</button>
							</h2>
							<div id="sc2" class="accordion-collapse collapse" data-bs-parent="#serviceFaqAccordion">
								<div class="accordion-body">
									Our pathology clinic is operational Monday to Saturday from 8:00 AM to 6:00 PM, with emergency trauma diagnostic services available 24/7.
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Right Column: Sidebar Navigation Widget -->
				<div class="col-lg-4">
					<div class="p-4 rounded-4 text-white shadow-lg mb-4" style="background-color: var(--medipro-dark-card);">
						<h4 class="fw-bold mb-4">Medical Service</h4>
						<div class="d-flex flex-column gap-3">
							<a href="service_detail.jsp" class="btn btn-coral text-start py-3 px-4 rounded-pill fw-bold text-white d-flex align-items-center justify-content-between">
								<span><i class="fa-solid fa-eye me-2"></i> Eye Care</span>
								<i class="fa-solid fa-arrow-right"></i>
							</a>
							<a href="service_detail.jsp" class="btn btn-coral text-start py-3 px-4 rounded-pill fw-bold text-white d-flex align-items-center justify-content-between">
								<span><i class="fa-solid fa-tooth me-2"></i> Dental Care</span>
								<i class="fa-solid fa-arrow-right"></i>
							</a>
							<a href="service_detail.jsp" class="btn btn-coral text-start py-3 px-4 rounded-pill fw-bold text-white d-flex align-items-center justify-content-between">
								<span><i class="fa-solid fa-stethoscope me-2"></i> Medical Checkup</span>
								<i class="fa-solid fa-arrow-right"></i>
							</a>
							<a href="service_detail.jsp" class="btn btn-coral text-start py-3 px-4 rounded-pill fw-bold text-white d-flex align-items-center justify-content-between">
								<span><i class="fa-solid fa-vial me-2"></i> Laboratory Service</span>
								<i class="fa-solid fa-arrow-right"></i>
							</a>
						</div>
					</div>
				</div>
			</div>

			<!-- Working Process Section 2x2 Grid -->
			<div class="mt-5 pt-4">
				<div class="text-coral fw-bold fs-7 tracking-wider uppercase mb-2">OUR STEP</div>
				<h2 class="faq-main-heading mb-4">Our Best Working Process.</h2>

				<div class="row g-4">
					<div class="col-md-6 col-lg-3">
						<div class="p-4 rounded-4 text-white shadow-sm h-100 position-relative" style="background-color: var(--medipro-coral);">
							<div class="fs-2 mb-3"><i class="fa-regular fa-comments"></i></div>
							<h5 class="fw-bold">Free Consultation</h5>
							<p class="fs-7 text-white-50">Expert advice for your health concerns, no cost involved.</p>
							<span class="position-absolute bottom-0 end-0 p-3 fs-3 fw-bold opacity-25">01</span>
						</div>
					</div>
					<div class="col-md-6 col-lg-3">
						<div class="p-4 rounded-4 text-white shadow-sm h-100 position-relative" style="background-color: var(--medipro-dark-card);">
							<div class="fs-2 mb-3"><i class="fa-regular fa-calendar-check"></i></div>
							<h5 class="fw-bold">Schedule Date & Time</h5>
							<p class="fs-7 text-white-50">Book your appointment online and choose your preferred date.</p>
							<span class="position-absolute bottom-0 end-0 p-3 fs-3 fw-bold opacity-25">02</span>
						</div>
					</div>
					<div class="col-md-6 col-lg-3">
						<div class="p-4 rounded-4 text-white shadow-sm h-100 position-relative" style="background-color: var(--medipro-dark-card);">
							<div class="fs-2 mb-3"><i class="fa-solid fa-hospital-user"></i></div>
							<h5 class="fw-bold">Arrival To Clinic</h5>
							<p class="fs-7 text-white-50">Your premier destination for comprehensive healthcare diagnosis.</p>
							<span class="position-absolute bottom-0 end-0 p-3 fs-3 fw-bold opacity-25">03</span>
						</div>
					</div>
					<div class="col-md-6 col-lg-3">
						<div class="p-4 rounded-4 text-white shadow-sm h-100 position-relative" style="background-color: var(--medipro-coral);">
							<div class="fs-2 mb-3"><i class="fa-solid fa-file-medical-step"></i></div>
							<h5 class="fw-bold">Follow Up Check</h5>
							<p class="fs-7 text-white-50">Ensure your health progress with our comprehensive checkups.</p>
							<span class="position-absolute bottom-0 end-0 p-3 fs-3 fw-bold opacity-25">04</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<%@include file="component/footer.jsp"%>
</body>
</html>
