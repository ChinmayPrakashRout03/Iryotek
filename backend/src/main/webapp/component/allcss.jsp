<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!-- Google Fonts & Font Awesome -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.min.js"></script>

<!-- Favicon and Brand Icons -->
<link rel="shortcut icon" href="<%= request.getContextPath() %>/img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="<%= request.getContextPath() %>/img/logo-emblem.png">

<!-- ThreeUI Animated Top Dock (Sable) Integration -->
<link rel="stylesheet" href="<%= request.getContextPath() %>/css/threeui-dock.css?v=3.0">
<script src="<%= request.getContextPath() %>/js/threeui-dock.js?v=3.0"></script>

<!-- Customs CSS for project -->
<style type="text/css">
.my-card {
	box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
	border-radius: 20px;
	border: 1px solid #f0f3f6;
	background: #ffffff;
}

.my-bg-color {
	background: linear-gradient(135deg, var(--oreo-cyan) 0%, var(--oreo-cyan-dark) 100%) !important;
	color: #ffffff;
}

.myP-color {
	color: var(--oreo-cyan) !important;
}

.btn-uiverse {
	position: relative;
	background: var(--oreo-coral);
	color: white;
	padding: 12px 30px;
	border: none;
	border-radius: 30px;
	font-weight: 700;
	letter-spacing: 0.5px;
	box-shadow: 0 6px 20px rgba(255, 94, 58, 0.35);
	transition: all 0.3s ease;
	cursor: pointer;
	text-transform: uppercase;
	font-size: 0.9rem;
}

.btn-uiverse:hover {
	background: var(--oreo-coral-hover);
	transform: translateY(-2px);
	box-shadow: 0 10px 25px rgba(255, 94, 58, 0.5);
	color: white;
}

.auth-page-wrapper {
	background-color: var(--oreo-light-bg);
	min-height: 82vh;
	padding: 60px 0;
}

/* ==========================================
   Oreo Hospital Premium Design System
   ========================================== */
:root {
	--oreo-cyan: #00c2cb;
	--oreo-cyan-dark: #00a8b0;
	--oreo-coral: #ff5e3a;
	--oreo-coral-hover: #e04b28;
	--oreo-purple: #9b89b3;
	--oreo-dark-bg: #2d3436;
	--oreo-light-bg: #f4f6f9;
	--oreo-text-dark: #2c3e50;
	--oreo-text-muted: #7f8c8d;
	--oreo-footer-bg: #eef2f5;

	/* Medipro Theme Tokens */
	--medipro-dark-green: #0b3c36;
	--medipro-dark-card: #104841;
	--medipro-cream-bg: #f4f7f6;
	--medipro-coral: #ff5e3a;
	--medipro-cyan: #00c2cb;
	--accent-teal: #00c2cb;
	--card-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
	--hover-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
	--transition: all 0.3s ease;
}

/* Force 100% Full Viewport Screen Fill */
html, body {
	margin: 0 !important;
	padding: 0 !important;
	width: 100% !important;
	max-width: 100% !important;
	overflow-x: hidden !important;
	background-color: var(--oreo-light-bg);
	font-family: 'Outfit', 'Rubik', sans-serif;
	color: var(--oreo-text-dark);
}

.container, .container-fluid, .container-lg, .container-md, .container-sm, .container-xl, .container-xxl {
	max-width: 100% !important;
	width: 100% !important;
	padding-left: 4% !important;
	padding-right: 4% !important;
}

/* Super Top Bar */
.super-top-bar {
	width: 100% !important;
	background-color: #ffffff;
	border-bottom: 1px solid #eef2f7;
	padding: 10px 0;
	font-size: 0.88rem;
	color: #666666;
}

.super-top-bar a {
	color: #666666;
	text-decoration: none;
	transition: color 0.2s ease;
}

.super-top-bar a:hover {
	color: var(--oreo-cyan);
}

/* Cyan Header Band */
.cyan-header-band {
	width: 100% !important;
	background-color: var(--oreo-cyan);
	color: #ffffff;
	padding: 24px 0 60px 0;
}

.cyan-header-band .brand-logo {
	display: flex;
	align-items: center;
	gap: 12px;
	color: #ffffff;
	text-decoration: none;
}

.cyan-header-band .brand-logo-icon {
	width: 44px;
	height: 44px;
	border: 3px solid #ffffff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.4rem;
	background: rgba(255, 255, 255, 0.18);
}

.cyan-header-band .brand-title {
	font-size: 1.7rem;
	font-weight: 800;
	letter-spacing: 0.5px;
	line-height: 1.1;
}

.cyan-header-band .brand-subtitle {
	font-size: 0.75rem;
	letter-spacing: 0.5px;
	opacity: 0.95;
}

/* Floating Navbar Container */
.floating-navbar-container {
	margin-top: -32px;
	position: relative;
	z-index: 1000;
}

.floating-navbar-card {
	background: #ffffff;
	border-radius: 12px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
	padding: 6px 24px;
	border: 1px solid #f0f3f6;
}

.floating-navbar-card .nav-link {
	color: #333333 !important;
	font-weight: 600;
	font-size: 0.92rem;
	padding: 10px 16px !important;
	transition: all 0.2s ease;
}

.floating-navbar-card .nav-link:hover,
.floating-navbar-card .nav-link.active {
	color: var(--oreo-cyan) !important;
}

.nav-search-box {
	background-color: #f8f9fa;
	border: 1px solid #e9ecef;
	border-radius: 20px;
	padding: 6px 16px;
	font-size: 0.85rem;
	width: 170px;
	transition: all 0.3s ease;
}

.nav-search-box:focus {
	width: 220px;
	background-color: #ffffff;
	outline: none;
	border-color: var(--oreo-cyan);
}

/* Oreo Hero Section */
.oreo-hero-section {
	width: 100% !important;
	background-color: var(--oreo-light-bg);
	padding: 80px 0 130px 0;
	position: relative;
}

.oreo-hero-sub {
	font-size: 1.6rem;
	color: #444444;
	font-weight: 300;
	margin-bottom: 4px;
}

.oreo-hero-main {
	font-size: 3.8rem;
	font-weight: 800;
	color: #2c3e50;
	margin-bottom: 24px;
	line-height: 1.15;
}

.oreo-hero-text {
	color: #7f8c8d;
	font-size: 1.08rem;
	margin-bottom: 35px;
	max-width: 680px;
	line-height: 1.65;
}

.btn-oreo-coral {
	background-color: var(--oreo-coral) !important;
	color: #ffffff !important;
	font-weight: 700 !important;
	padding: 12px 34px !important;
	border-radius: 30px !important;
	border: none !important;
	box-shadow: 0 6px 18px rgba(255, 94, 58, 0.35) !important;
	text-decoration: none !important;
	display: inline-block;
	transition: all 0.3s ease !important;
}

.btn-oreo-coral:hover {
	background-color: var(--oreo-coral-hover) !important;
	transform: translateY(-2px) !important;
	box-shadow: 0 10px 25px rgba(255, 94, 58, 0.5) !important;
	color: #ffffff !important;
}

.btn-coral-outline {
	background-color: transparent !important;
	color: var(--oreo-coral) !important;
	border: 2px solid var(--oreo-coral) !important;
	font-weight: 700 !important;
	padding: 10px 30px !important;
	border-radius: 30px !important;
	text-decoration: none !important;
	display: inline-block;
	transition: all 0.3s ease !important;
}

.btn-coral-outline:hover {
	background-color: var(--oreo-coral) !important;
	color: #ffffff !important;
}

/* Floating Appointment Card */
.floating-appointment-card {
	margin-top: -70px;
	position: relative;
	z-index: 100;
	background: #ffffff;
	border-radius: 16px;
	box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
	padding: 35px 40px;
	border: 1px solid #f0f3f6;
	width: 100%;
}

.floating-appointment-card h5 {
	color: #555555;
	font-weight: 600;
	margin-bottom: 24px;
	font-size: 1.1rem;
}

.oreo-input-pill {
	border-radius: 30px !important;
	padding: 12px 24px !important;
	border: 1px solid #e0e0e0 !important;
	font-size: 0.92rem !important;
	color: #444444 !important;
	background-color: #ffffff;
	height: 50px !important;
	line-height: 1.5;
}

.oreo-input-pill:focus {
	border-color: var(--oreo-cyan) !important;
	box-shadow: 0 0 0 3px rgba(0, 194, 203, 0.15) !important;
	outline: none;
}

.btn-oreo-coral-submit {
	background-color: var(--oreo-coral) !important;
	color: #ffffff !important;
	font-weight: 700 !important;
	height: 50px !important;
	border-radius: 30px !important;
	border: none !important;
	box-shadow: 0 6px 18px rgba(255, 94, 58, 0.35) !important;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease !important;
	font-size: 1rem !important;
	width: 100%;
}

.btn-oreo-coral-submit:hover {
	background-color: var(--oreo-coral-hover) !important;
	transform: translateY(-2px) !important;
	box-shadow: 0 10px 25px rgba(255, 94, 58, 0.5) !important;
}

/* Services Section Cards */
.service-item-card {
	background: #ffffff;
	border-radius: 16px;
	padding: 35px 30px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
	border: 1px solid #f0f3f6;
	transition: all 0.3s ease;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.service-item-card:hover {
	transform: translateY(-6px);
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.service-item-icon {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	background-color: rgba(0, 194, 203, 0.1);
	color: var(--oreo-cyan);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.5rem;
	margin-bottom: 20px;
}

.service-item-title {
	font-size: 1.25rem;
	font-weight: 700;
	color: #2c3e50;
	margin-bottom: 12px;
}

.service-item-desc {
	color: #7f8c8d;
	font-size: 0.92rem;
	line-height: 1.6;
	margin-bottom: 20px;
}

.service-item-link {
	color: var(--oreo-cyan);
	font-weight: 700;
	text-decoration: none;
	font-size: 0.9rem;
	display: inline-flex;
	align-items: center;
}

.service-item-link:hover {
	color: var(--oreo-cyan-dark);
}

/* Section Title Accents */
.section-accent-header {
	display: flex;
	align-items: center;
	gap: 10px;
}

.section-accent-bar {
	color: var(--oreo-cyan);
	font-size: 2rem;
	font-weight: 800;
	line-height: 1;
}

.section-accent-title {
	font-size: 2.2rem;
	font-weight: 800;
	color: #2c3e50;
	margin-bottom: 0;
}

.section-cyan-text {
	color: var(--oreo-cyan);
}

.section-subtitle {
	color: #7f8c8d;
	font-size: 0.98rem;
	margin-top: 6px;
}

/* Purple Stats Band */
.oreo-purple-stats-band {
	width: 100% !important;
	background-color: var(--oreo-purple);
	color: #ffffff;
	padding: 60px 0;
}

.stat-box {
	text-align: center;
}

.stat-box i {
	font-size: 2.5rem;
	margin-bottom: 12px;
	opacity: 0.9;
}

.stat-box .stat-number {
	font-size: 2.8rem;
	font-weight: 800;
	line-height: 1.1;
	margin-bottom: 4px;
}

.stat-box .stat-label {
	font-size: 0.95rem;
	font-weight: 500;
	opacity: 0.85;
}

/* Doctor Team Cards */
.doctor-team-card {
	background: #ffffff;
	border-radius: 16px;
	padding: 24px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
	border: 1px solid #f0f3f6;
	text-align: center;
	transition: all 0.3s ease;
	height: 100%;
}

.doctor-team-card:hover {
	transform: translateY(-6px);
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.doctor-img-wrap {
	width: 100%;
	height: 240px;
	border-radius: 12px;
	overflow: hidden;
	margin-bottom: 18px;
}

.doctor-img-wrap img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.doctor-name {
	font-size: 1.2rem;
	font-weight: 700;
	color: #2c3e50;
	margin-bottom: 4px;
}

.doctor-specialty {
	color: var(--oreo-coral);
	font-weight: 600;
	font-size: 0.88rem;
	margin-bottom: 14px;
}

.doctor-socials {
	display: flex;
	justify-content: center;
	gap: 12px;
	margin-bottom: 18px;
}

.doctor-socials a {
	width: 34px;
	height: 34px;
	border-radius: 50%;
	background-color: #f4f6f9;
	color: #7f8c8d;
	display: flex;
	align-items: center;
	justify-content: center;
	text-decoration: none;
	font-size: 0.88rem;
	transition: all 0.2s ease;
}

.doctor-socials a:hover {
	background-color: var(--oreo-cyan);
	color: #ffffff;
}

/* Why Choose Us Section */
.why-choose-us-section {
	width: 100% !important;
	background-color: var(--oreo-dark-bg);
	color: #ffffff;
	padding: 90px 0;
}

.why-choose-us-section h2 {
	font-size: 2.4rem;
	font-weight: 800;
	line-height: 1.25;
	margin-bottom: 20px;
}

.why-choose-us-section p {
	color: #a0a8b0;
	font-size: 1.02rem;
	line-height: 1.7;
	margin-bottom: 30px;
}

/* Emergency Support Banner */
.emergency-support-banner {
	width: 100% !important;
	background-color: #ffffff;
	padding: 40px 0;
	border-bottom: 1px solid #eef2f7;
	text-align: center;
}

/* Blog Cards */
.blog-item-card {
	background: #ffffff;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
	border: 1px solid #f0f3f6;
	transition: all 0.3s ease;
}

.blog-item-card:hover {
	transform: translateY(-6px);
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.blog-img {
	width: 100%;
	height: 210px;
	object-fit: cover;
}

.blog-content {
	padding: 24px;
}

.blog-title {
	font-size: 1.1rem;
	font-weight: 700;
	color: #2c3e50;
	margin-bottom: 10px;
	line-height: 1.4;
}

.blog-desc {
	color: #7f8c8d;
	font-size: 0.88rem;
	line-height: 1.6;
	margin-bottom: 18px;
}

.blog-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-top: 1px solid #f0f3f6;
	padding-top: 14px;
	font-size: 0.82rem;
	color: #95a5a6;
}

.blog-footer .comments {
	color: var(--oreo-cyan);
	font-weight: 600;
}

/* Footer Section */
.oreo-main-footer {
	width: 100% !important;
	background-color: var(--oreo-footer-bg);
	padding: 70px 0 40px 0;
	color: #555555;
	font-size: 0.92rem;
}

.footer-heading {
	color: #2c3e50;
	font-weight: 800;
	font-size: 1.15rem;
	margin-bottom: 24px;
}

.footer-links-list {
	list-style: none;
	padding: 0;
	margin: 0;
}

.footer-links-list li {
	margin-bottom: 10px;
}

.footer-links-list a {
	color: #666666;
	text-decoration: none;
	transition: color 0.2s ease;
}

.footer-links-list a:hover {
	color: var(--oreo-cyan);
}

.oreo-sub-footer {
	width: 100% !important;
	background-color: #ffffff;
	border-top: 1px solid #eef2f7;
	padding: 20px 0;
	font-size: 0.88rem;
	color: #777777;
}

.scroll-top-btn {
	width: 38px;
	height: 38px;
	border-radius: 50%;
	background-color: var(--oreo-cyan);
	color: #ffffff;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	text-decoration: none;
	box-shadow: 0 4px 12px rgba(0, 194, 203, 0.3);
}

.scroll-top-btn:hover {
	background-color: var(--oreo-cyan-dark);
	color: #ffffff;
}
</style>
