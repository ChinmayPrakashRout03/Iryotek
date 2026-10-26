<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Help & FAQs | Iryotek Healthcare</title>
<%@include file="component/allcss.jsp"%>
</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<!-- Page Breadcrumb Header Banner (Dark Green #0b3c36) -->
	<section class="medipro-page-header text-center py-5 text-white" style="background-color: var(--medipro-dark-green);">
		<div class="container py-4">
			<h1 class="display-4 fw-extrabold text-coral mb-2">Help & FAQs</h1>
			<p class="fs-6 text-white-50">Home &raquo; FAQs</p>
		</div>
	</section>

	<!-- Main FAQs Accordion 2-Column Grid -->
	<section class="py-5" style="background-color: var(--medipro-cream-bg);">
		<div class="container py-4">
			<div class="text-center mb-5">
				<h2 class="faq-main-heading mb-2">FAQs.</h2>
				<p class="text-muted mx-auto" style="max-width: 620px; font-size: 0.95rem;">
					We have compiled a list of commonly asked questions related to various medical topics to provide you with quick and reliable information. Our goal is to address your queries.
				</p>
			</div>

			<div class="row g-4">
				<!-- Column 1 -->
				<div class="col-lg-6">
					<div class="accordion medipro-accordion" id="faqCol1">
						<div class="accordion-item">
							<h2 class="accordion-header">
								<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#fq1" aria-expanded="true">
									<i class="fa-solid fa-minus me-3 text-secondary fs-6 icon-toggle"></i> What services do you offer?
								</button>
							</h2>
							<div id="fq1" class="accordion-collapse collapse show" data-bs-parent="#faqCol1">
								<div class="accordion-body">
									We provide a wide range of medical services, including general check-ups, specialized consultations, diagnostic tests, vaccinations, and health screenings.
								</div>
							</div>
						</div>
						<div class="accordion-item">
							<h2 class="accordion-header">
								<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#fq2">
									<i class="fa-solid fa-plus me-3 text-secondary fs-6 icon-toggle"></i> How to book appointment?
								</button>
							</h2>
							<div id="fq2" class="accordion-collapse collapse" data-bs-parent="#faqCol1">
								<div class="accordion-body">
									You can select your preferred doctor, department, and appointment date directly using our online booking portal.
								</div>
							</div>
						</div>
						<div class="accordion-item">
							<h2 class="accordion-header">
								<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#fq3">
									<i class="fa-solid fa-plus me-3 text-secondary fs-6 icon-toggle"></i> What your working hours?
								</button>
							</h2>
							<div id="fq3" class="accordion-collapse collapse" data-bs-parent="#faqCol1">
								<div class="accordion-body">
									Our outpatient departments are open Monday to Saturday from 8:00 AM to 7:00 PM. Emergency services remain open 24/7.
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Column 2 -->
				<div class="col-lg-6">
					<div class="accordion medipro-accordion" id="faqCol2">
						<div class="accordion-item">
							<h2 class="accordion-header">
								<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#fq4" aria-expanded="true">
									<i class="fa-solid fa-minus me-3 text-secondary fs-6 icon-toggle"></i> Are you accepting new patients?
								</button>
							</h2>
							<div id="fq4" class="accordion-collapse collapse show" data-bs-parent="#faqCol2">
								<div class="accordion-body">
									Yes, we are always open to new patients. Feel free to contact us to schedule an appointment or for any inquiries you may have.
								</div>
							</div>
						</div>
						<div class="accordion-item">
							<h2 class="accordion-header">
								<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#fq5">
									<i class="fa-solid fa-plus me-3 text-secondary fs-6 icon-toggle"></i> What should I bring for my first appointment?
								</button>
							</h2>
							<div id="fq5" class="accordion-collapse collapse" data-bs-parent="#faqCol2">
								<div class="accordion-body">
									Please bring a valid photo ID, your insurance card, and any relevant prior medical history or prescription records.
								</div>
							</div>
						</div>
						<div class="accordion-item">
							<h2 class="accordion-header">
								<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#fq6">
									<i class="fa-solid fa-plus me-3 text-secondary fs-6 icon-toggle"></i> Do you offer telemedicine consultations?
								</button>
							</h2>
							<div id="fq6" class="accordion-collapse collapse" data-bs-parent="#faqCol2">
								<div class="accordion-body">
									Yes, we offer secure virtual consultations with senior specialists for general follow-ups and non-emergency triage.
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<%@include file="component/footer.jsp"%>
</body>
</html>
