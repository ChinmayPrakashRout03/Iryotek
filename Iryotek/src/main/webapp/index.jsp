<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.hms.dao.DoctorDAO"%>
<%@page import="com.hms.dao.BlogDAO"%>
<%@page import="com.hms.entity.Doctor"%>
<%@page import="com.hms.entity.Blog"%>
<%@page import="java.util.List"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@page isELIgnored="false"%>

<%
DoctorDAO indexDocDAO = new DoctorDAO(DBConnection.getConn());
List<Doctor> indexDoctorList = indexDocDAO.getAllDoctor();
List<String> indexDiseaseList = indexDocDAO.getAllDiseases();

BlogDAO indexBlogDAO = new BlogDAO(DBConnection.getConn());
List<Blog> indexBlogList = indexBlogDAO.getAllBlogs();
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Home Page | Iryotek Healthcare</title>
<%@include file="component/allcss.jsp"%>

</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<!-- 1. Hero Section -->
	<section class="oreo-hero-section">
		<div class="container">
			<div class="row align-items-center">
				<div class="col-lg-6 mb-4 mb-lg-0">
					<p class="oreo-hero-sub">Welcome to</p>
					<h1 class="oreo-hero-main">Iryotek <strong>Hospital</strong></h1>
					<p class="oreo-hero-text">
						Experience collision-free queue allocation, secure medical records, and smart appointment scheduling with top-tier healthcare providers.
					</p>
					<a href="user_appointment.jsp" class="btn-oreo-coral">Book Appointment <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
				</div>
				<div class="col-lg-6 text-center d-none d-lg-block">
					<img src="img/hero_doctors.png" alt="Iryotek Doctors Banner" class="img-fluid" style="max-height: 400px;">
				</div>
			</div>
		</div>
	</section>

	<!-- 2. Overlapping "Make an Appointment" Form Card -->
	<div class="container">
		<div class="floating-appointment-card">
			<h5>Make an Appointment</h5>
			
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

			<form action="addAppointment" method="post" class="row g-4 align-items-center">
				<c:if test="${not empty userObj}">
					<input type="hidden" name="userId" value="${userObj.id}">
				</c:if>
				<c:if test="${empty userObj}">
					<input type="hidden" name="userId" value="1">
				</c:if>

				<!-- Row 1: Name, Mobile, Date -->
				<div class="col-lg-4 col-md-4">
					<input type="text" name="fullName" class="form-control oreo-input-pill" placeholder="Enter Name" value="${userObj != null ? userObj.fullName : ''}" required>
				</div>
				<div class="col-lg-4 col-md-4">
					<input type="text" name="phone" class="form-control oreo-input-pill" placeholder="Enter Mobile" required>
				</div>
				<div class="col-lg-4 col-md-4">
					<input type="date" name="appointmentDate" id="heroApptDate" class="form-control oreo-input-pill" required>
				</div>

				<!-- Row 2: Select Doctor, Select Department, Submit Button -->
				<div class="col-lg-4 col-md-4">
					<select name="doctorNameSelect" class="form-select oreo-input-pill" required>
						<option value="" selected disabled>Select Doctor</option>
						<%
						if (indexDoctorList != null && !indexDoctorList.isEmpty()) {
							int count = 0;
							for (Doctor d : indexDoctorList) {
								if (count++ > 30) break;
						%>
						<option value="<%= d.getId() %>">Dr. <%= d.getFullName() %> (<%= d.getSpecialist() %>)</option>
						<%
							}
						}
						%>
					</select>
				</div>

				<div class="col-lg-4 col-md-4">
					<select name="diseases" class="form-select oreo-input-pill" required>
						<option value="" selected disabled>Select Department</option>
						<%
						if (indexDiseaseList != null && !indexDiseaseList.isEmpty()) {
							for (String dis : indexDiseaseList) {
						%>
						<option value="<%= dis %>"><%= dis %></option>
						<%
							}
						} else {
						%>
						<option value="Cardiology">Cardiology</option>
						<option value="Orthopedics">Orthopedics</option>
						<option value="Neurology">Neurology</option>
						<option value="Dermatology">Dermatology</option>
						<%
						}
						%>
					</select>
				</div>

				<!-- Hidden fallbacks for address/gender/age if submitted from quick form -->
				<input type="hidden" name="gender" value="male">
				<input type="hidden" name="age" value="25">
				<input type="hidden" name="email" value="${userObj != null ? userObj.email : 'patient@example.com'}">
				<input type="hidden" name="address" value="Online Appointment Request">

				<div class="col-lg-4 col-md-4">
					<c:if test="${empty userObj}">
						<a href="user_login.jsp" class="btn-oreo-coral-submit text-decoration-none">Submit</a>
					</c:if>
					<c:if test="${not empty userObj}">
						<button type="submit" class="btn-oreo-coral-submit">Submit</button>
					</c:if>
				</div>
			</form>
		</div>
	</div>

	<!-- 3. Services Section ("Our Best Services") -->
	<section class="py-5 mt-4" id="departments">
		<div class="container py-4">
			<div class="section-accent-header">
				<span class="section-accent-bar">|</span>
				<h2 class="section-accent-title"><span class="section-cyan-text">Our</span> Best Services</h2>
			</div>
			<p class="section-subtitle">Delivering high-precision clinical diagnosis & comprehensive patient care.</p>

			<div class="row g-4 mt-2">
				<!-- Service 1 -->
				<div class="col-md-4">
					<div class="service-item-card">
						<div class="service-item-icon">
							<i class="fa-solid fa-heart-pulse"></i>
						</div>
						<h4 class="service-item-title">Cardio Monitoring</h4>
						<p class="service-item-desc">
							Advanced 24/7 ECG monitoring and non-invasive cardiovascular diagnostics for optimal heart health.
						</p>
						<a href="find_hospitals.jsp" class="service-item-link">View More <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
					</div>
				</div>

				<!-- Service 2 -->
				<div class="col-md-4">
					<div class="service-item-card">
						<div class="service-item-icon">
							<i class="fa-solid fa-microscope"></i>
						</div>
						<h4 class="service-item-title">Orthodontics</h4>
						<p class="service-item-desc">
							Comprehensive dental alignment, structural corrections, and modern cosmetic dentistry procedures.
						</p>
						<a href="find_hospitals.jsp" class="service-item-link">View More <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
					</div>
				</div>

				<!-- Service 3 -->
				<div class="col-md-4">
					<div class="service-item-card">
						<div class="service-item-icon">
							<i class="fa-solid fa-stethoscope"></i>
						</div>
						<h4 class="service-item-title">Traumatology</h4>
						<p class="service-item-desc">
							Emergency trauma care, acute wound management, and rapid surgical response for critical injuries.
						</p>
						<a href="find_hospitals.jsp" class="service-item-link">View More <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
					</div>
				</div>

				<!-- Service 4 -->
				<div class="col-md-4">
					<div class="service-item-card">
						<div class="service-item-icon">
							<i class="fa-solid fa-bandage"></i>
						</div>
						<h4 class="service-item-title">Cardiology</h4>
						<p class="service-item-desc">
							Specialized heart failure management, coronary care unit interventions, and rehabilitation plans.
						</p>
						<a href="find_hospitals.jsp" class="service-item-link">View More <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
					</div>
				</div>

				<!-- Service 5 -->
				<div class="col-md-4">
					<div class="service-item-card">
						<div class="service-item-icon">
							<i class="fa-solid fa-pills"></i>
						</div>
						<h4 class="service-item-title">Prostheses</h4>
						<p class="service-item-desc">
							Custom prosthetic fitting, joint replacement implants, and specialized physical rehabilitation therapies.
						</p>
						<a href="find_hospitals.jsp" class="service-item-link">View More <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
					</div>
				</div>

				<!-- Service 6 -->
				<div class="col-md-4">
					<div class="service-item-card">
						<div class="service-item-icon">
							<i class="fa-solid fa-hand-holding-droplet"></i>
						</div>
						<h4 class="service-item-title">Pulmonary</h4>
						<p class="service-item-desc">
							Respiratory therapy, asthma management, lung capacity testing, and intensive pulmonary care.
						</p>
						<a href="find_hospitals.jsp" class="service-item-link">View More <i class="fa-solid fa-chevron-right ms-1 fs-7"></i></a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- 4. Purple Counter / Statistics Section -->
	<section class="oreo-purple-stats-band">
		<div class="container">
			<div class="row g-4">
				<div class="col-md-3 col-6">
					<div class="stat-box">
						<i class="fa-regular fa-user"></i>
						<div class="stat-number">652</div>
						<div class="stat-label">Happy Clients</div>
					</div>
				</div>
				<div class="col-md-3 col-6">
					<div class="stat-box">
						<i class="fa-regular fa-heart"></i>
						<div class="stat-number">7652</div>
						<div class="stat-label">Heart Transplant</div>
					</div>
				</div>
				<div class="col-md-3 col-6">
					<div class="stat-box">
						<i class="fa-regular fa-thumbs-up"></i>
						<div class="stat-number">52</div>
						<div class="stat-label">Years Of Experience</div>
					</div>
				</div>
				<div class="col-md-3 col-6">
					<div class="stat-box">
						<i class="fa-regular fa-face-smile"></i>
						<div class="stat-number">7652</div>
						<div class="stat-label">Well Smiley Faces</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- 5. Team Section ("Meet Our Team") -->
	<section class="py-5 mt-3" id="team">
		<div class="container py-4">
			<div class="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4">
				<div>
					<div class="section-accent-header">
						<span class="section-accent-bar">|</span>
						<h2 class="section-accent-title"><span class="section-cyan-text">Meet</span> Our Team</h2>
					</div>
					<p class="section-subtitle">Dedicated medical leaders driving clinical excellence across all departments.</p>
				</div>
				<div class="text-secondary fs-7" style="max-width: 420px; line-height: 1.5;">
					<strong>Iryotek Hospital</strong> Our board-certified specialists bring decades of medical expertise and compassionate patient care.
				</div>
			</div>

			<div class="row g-4 mt-2">
				<!-- Doctor 1 -->
				<div class="col-lg-3 col-md-6">
					<div class="doctor-team-card">
						<div class="doctor-img-wrap">
							<img src="img/doc1.jpg" alt="Dr. John">
						</div>
						<div class="doctor-name">Dr. John</div>
						<div class="doctor-specialty">Dentist</div>
						<div class="doctor-socials">
							<a href="https://facebook.com" target="_blank"><i class="fa-brands fa-facebook-f"></i></a>
							<a href="https://twitter.com" target="_blank"><i class="fa-brands fa-twitter"></i></a>
							<a href="https://instagram.com" target="_blank"><i class="fa-brands fa-instagram"></i></a>
						</div>
						<a href="user_appointment.jsp" class="btn-coral-outline">View More</a>
					</div>
				</div>

				<!-- Doctor 2 -->
				<div class="col-lg-3 col-md-6">
					<div class="doctor-team-card">
						<div class="doctor-img-wrap">
							<img src="img/doc2.jpg" alt="Dr. Amelia">
						</div>
						<div class="doctor-name">Dr. Amelia</div>
						<div class="doctor-specialty">Gynecologist</div>
						<div class="doctor-socials">
							<a href="https://twitter.com" target="_blank"><i class="fa-brands fa-twitter"></i></a>
							<a href="https://instagram.com" target="_blank"><i class="fa-brands fa-instagram"></i></a>
						</div>
						<a href="user_appointment.jsp" class="btn-coral-outline">View More</a>
					</div>
				</div>

				<!-- Doctor 3 -->
				<div class="col-lg-3 col-md-6">
					<div class="doctor-team-card">
						<div class="doctor-img-wrap">
							<img src="img/doc3.jpg" alt="Dr. Jack">
						</div>
						<div class="doctor-name">Dr. Jack</div>
						<div class="doctor-specialty">Audiology</div>
						<div class="doctor-socials">
							<a href="https://facebook.com" target="_blank"><i class="fa-brands fa-facebook-f"></i></a>
							<a href="https://twitter.com" target="_blank"><i class="fa-brands fa-twitter"></i></a>
							<a href="https://instagram.com" target="_blank"><i class="fa-brands fa-instagram"></i></a>
							<a href="https://google.com" target="_blank"><i class="fa-brands fa-google-plus-g"></i></a>
						</div>
						<a href="user_appointment.jsp" class="btn-coral-outline">View More</a>
					</div>
				</div>

				<!-- Doctor 4 -->
				<div class="col-lg-3 col-md-6">
					<div class="doctor-team-card">
						<div class="doctor-img-wrap">
							<img src="img/doc4.jpg" alt="Dr. Charlie">
						</div>
						<div class="doctor-name">Dr. Charlie</div>
						<div class="doctor-specialty">Dentist</div>
						<div class="doctor-socials">
							<a href="https://facebook.com" target="_blank"><i class="fa-brands fa-facebook-f"></i></a>
							<a href="https://twitter.com" target="_blank"><i class="fa-brands fa-twitter"></i></a>
							<a href="https://instagram.com" target="_blank"><i class="fa-brands fa-instagram"></i></a>
						</div>
						<a href="user_appointment.jsp" class="btn-coral-outline">View More</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- 6. "Why Choose Us" Section (Dark Charcoal) -->
	<section class="why-choose-us-section">
		<div class="container">
			<div class="row align-items-center g-5">
				<div class="col-lg-6">
					<div class="section-accent-header mb-1">
						<span class="section-accent-bar">|</span>
						<h3 class="text-white fw-bold mb-0"><span class="section-cyan-text">Why</span> Choose Us</h3>
					</div>
					<p class="text-muted fs-7 mb-4">Leading medical innovation & patient-centric scheduling.</p>

					<h2>Our goal is to make sure with advances in technology</h2>
					<p>
						Iryotek Hospital offers the whole range of multispecialty health services: treatment of chronic diseases, emergency trauma response, AI-driven symptom analysis, automated clinic queue allocation, and 24/7 care.
					</p>
					<a href="find_hospitals.jsp" class="btn-oreo-coral">More about practice</a>
				</div>
				<div class="col-lg-6 text-center">
					<img src="img/doctor_1.jpg" alt="Why Choose Us Medical Team" class="img-fluid" style="border-radius: 12px; box-shadow: 0 15px 40px rgba(0,0,0,0.4); max-height: 380px; width: 100%; object-fit: cover;">
				</div>
			</div>
		</div>
	</section>

	<!-- 7. Emergency Support Section -->
	<section class="emergency-support-banner">
		<div class="container">
			<h3 class="fw-bold text-dark mb-2" style="font-size: 1.8rem;">We provide 24/7 customer support.</h3>
			<p class="text-secondary mb-4" style="font-size: 0.95rem;">Please feel free to contact us at (01) 234 5678 for emergency case.</p>
			<a href="find_hospitals.jsp" class="btn-coral-outline px-4 py-2">Read More</a>
		</div>
	</section>

	<!-- 8. "Latest From Blog" Section (Dynamic Blog Loading) -->
	<section class="py-5" id="blog">
		<div class="container py-4">
			<div class="section-accent-header">
				<span class="section-accent-bar">|</span>
				<h2 class="section-accent-title"><span class="section-cyan-text">Latest</span> From Blog</h2>
			</div>
			<p class="section-subtitle">Stay informed with latest health articles & medical guidelines.</p>

			<div class="row g-4 mt-2 mb-4">
				<%
				if (indexBlogList != null && !indexBlogList.isEmpty()) {
					int bCount = 0;
					for (Blog blog : indexBlogList) {
						if (bCount++ >= 3) break;
				%>
				<div class="col-md-4">
					<div class="blog-item-card h-100 d-flex flex-column">
						<a href="blog_detail.jsp?id=<%= blog.getId() %>">
							<img src="<%= (blog.getImagePath() != null && !blog.getImagePath().trim().isEmpty()) ? blog.getImagePath() : "img/hospital1.jpg" %>" 
							     alt="<%= blog.getTitle() %>" 
							     onerror="this.onerror=null; this.src='img/hospital1.jpg';" 
							     class="blog-img">
						</a>
						<div class="blog-content d-flex flex-column justify-content-between flex-grow-1">
							<div>
								<h4 class="blog-title">
									<a href="blog_detail.jsp?id=<%= blog.getId() %>" class="text-decoration-none text-dark hover-cyan">
										<%= blog.getTitle() %>
									</a>
								</h4>
								<p class="blog-desc">
									<%= blog.getExcerpt() %>
								</p>
							</div>
							<div class="blog-footer mt-3">
								<span><i class="fa-regular fa-calendar me-1"></i> <%= blog.getCreatedAt() != null ? blog.getCreatedAt().toString().substring(0, 10) : "02 Feb 2018" %></span>
								<a href="blog_detail.jsp?id=<%= blog.getId() %>" class="comments text-decoration-none">
									<i class="fa-regular fa-comment me-1"></i> Comment ( <%= blog.getCommentCount() %> )
								</a>
							</div>
						</div>
					</div>
				</div>
				<%
					}
				} else {
				%>
				<div class="col-12 text-center text-muted py-4">
					<p>No blogs published yet. Add new blogs from the admin dashboard!</p>
				</div>
				<%
				}
				%>
			</div>
		</div>
	</section>

	<!-- 9. AI Live Support Widget & Footer -->
	<%@include file="component/support_widget.jsp"%>
	<%@include file="component/footer.jsp"%>

	<script type="text/javascript">
		document.addEventListener("DOMContentLoaded", function() {
			var heroDateInput = document.getElementById("heroApptDate");
			if (heroDateInput) {
				var todayStr = new Date().toISOString().split('T')[0];
				heroDateInput.min = todayStr;
				if (!heroDateInput.value) {
					heroDateInput.value = todayStr;
				}
			}
		});
	</script>
</body>
</html>