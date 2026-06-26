<!-- Boostrap CSS -->
<link
	href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
	rel="stylesheet"
	integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
	crossorigin="anonymous">
<!-- End Boostrap CSS -->

<!-- Font awesome css -->
<link rel="stylesheet"
	href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
	integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w=="
	crossorigin="anonymous" referrerpolicy="no-referrer" />
<!-- End Font awesome css -->

<!--font awesome css-->
<link rel="stylesheet"
	href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

<!-- Boostrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
<!-- End Boostrap JS -->

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

:root {
	--primary-dark: #5B7E3C;
	--secondary-dark: #A2CB8B;
	--accent-teal: #5B7E3C;
	--light-gray: #E8F5BD;
	
	--accent-red: #C44545;
	--text-primary: #2d3e20;
	--text-secondary: #5a6e4d;
	--bg-light: #F8FAF6;
	--accent-hover: #48652f;
	
	--card-shadow: 0 10px 30px rgba(91, 126, 60, 0.05);
	--hover-shadow: 0 15px 35px rgba(91, 126, 60, 0.15);
	--transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body {
	margin: 0;
	padding: 0;
	width: 100%;
	overflow-x: hidden;
	font-family: 'Outfit', sans-serif;
	background-color: var(--bg-light);
	color: var(--text-primary);
}

/* Global Navbar Styles override */
.navbar, .navbar.bg-danger, .navbar.bg-success, .navbar.bg-primary {
	background-color: var(--primary-dark) !important;
	border-bottom: 3px solid var(--secondary-dark);
	padding: 12px 0;
	box-shadow: 0 4px 20px rgba(91, 126, 60, 0.15);
}

.navbar-brand {
	color: var(--light-gray) !important;
	font-weight: 700;
	font-size: 1.4rem;
	letter-spacing: 0.5px;
}

.navbar-brand i {
	color: var(--light-gray) !important;
	margin-right: 6px;
}

.navbar-nav .nav-link {
	color: var(--light-gray) !important;
	font-weight: 500;
	font-size: 0.95rem;
	padding: 8px 16px !important;
	transition: var(--transition);
}

.navbar-nav .nav-link:hover, 
.navbar-nav .nav-link.active {
	color: var(--secondary-dark) !important;
	transform: translateY(-1px);
}

/* Global Button Styles override */
.my-bg-color,
.btn-primary,
.btn-info {
	background-color: var(--primary-dark) !important;
	background-image: linear-gradient(135deg, var(--primary-dark), #48652f) !important;
	border: none !important;
	color: #ffffff !important;
	font-weight: 600 !important;
	padding: 10px 24px !important;
	border-radius: 8px !important;
	transition: var(--transition) !important;
	box-shadow: 0 4px 12px rgba(91, 126, 60, 0.2) !important;
}

.btn-primary:hover,
.btn-info:hover,
.my-bg-color:hover {
	transform: translateY(-2px) !important;
	box-shadow: 0 8px 20px rgba(91, 126, 60, 0.4) !important;
	background-image: linear-gradient(135deg, #48652f, #364b23) !important;
	color: #ffffff !important;
}

.btn-danger {
	background-color: var(--accent-red) !important;
	background-image: linear-gradient(135deg, var(--accent-red), #a13636) !important;
	border: none !important;
	color: #ffffff !important;
	font-weight: 600 !important;
	padding: 10px 24px !important;
	border-radius: 8px !important;
	transition: var(--transition) !important;
	box-shadow: 0 4px 12px rgba(196, 69, 69, 0.2) !important;
}

.btn-danger:hover {
	transform: translateY(-2px) !important;
	box-shadow: 0 8px 20px rgba(196, 69, 69, 0.4) !important;
	background-image: linear-gradient(135deg, #a13636, #7d2a2a) !important;
	color: #ffffff !important;
}

.btn-outline-light {
	border: 2px solid var(--secondary-dark) !important;
	color: var(--secondary-dark) !important;
	background-color: transparent !important;
	transition: var(--transition);
}

.btn-outline-light:hover {
	background-color: var(--secondary-dark) !important;
	color: var(--primary-dark) !important;
	box-shadow: 0 8px 20px rgba(162, 203, 139, 0.3) !important;
}

.btn-outline-danger {
	border: 2px solid var(--accent-red) !important;
	color: var(--accent-red) !important;
	transition: var(--transition);
}

.btn-outline-danger:hover {
	background-color: var(--accent-red) !important;
	color: #ffffff !important;
	border-color: var(--accent-red) !important;
}

/* Accent texts */
.myP-color {
	color: var(--primary-dark) !important;
}

/* Form Styles */
.form-control, .form-select {
	border: 2px solid #e2e8f0;
	border-radius: 8px;
	padding: 12px 16px;
	font-size: 0.95rem;
	transition: var(--transition);
}

.form-control:focus, .form-select:focus {
	border-color: var(--primary-dark);
	box-shadow: 0 0 0 4px rgba(91, 126, 60, 0.15);
	outline: none;
}

/* Card Styles */
.card, .my-card {
	border: 1px solid rgba(91, 126, 60, 0.08) !important;
	border-radius: 16px !important;
	box-shadow: var(--card-shadow) !important;
	transition: var(--transition) !important;
	background-color: #ffffff !important;
	overflow: hidden;
}

.card:hover, .my-card:hover {
	transform: translateY(-5px) !important;
	box-shadow: var(--hover-shadow) !important;
	border-color: rgba(91, 126, 60, 0.3) !important;
}

.card-body {
	padding: 1.8rem;
}

/* Table styles */
.table {
	background-color: #ffffff;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: var(--card-shadow);
	border: none;
}

.table thead th {
	background-color: var(--primary-dark) !important;
	color: var(--light-gray) !important;
	border: none;
	padding: 16px;
	font-weight: 600;
	text-transform: uppercase;
	font-size: 0.85rem;
	letter-spacing: 0.5px;
}

.table tbody td, .table tbody th {
	padding: 16px;
	vertical-align: middle;
	border-bottom: 1px solid rgba(91, 126, 60, 0.05);
}

.table-striped tbody tr:nth-of-type(odd) {
	background-color: rgba(232, 245, 189, 0.25);
}

/* Modal style */
.modal-content {
	border: none;
	border-radius: 20px;
	box-shadow: 0 15px 50px rgba(91, 126, 60, 0.15);
}

.modal-header {
	background-color: var(--primary-dark);
	color: var(--light-gray);
	border-bottom: 2px solid var(--secondary-dark);
	padding: 20px 24px;
}

.modal-header .modal-title {
	font-weight: 700;
	color: var(--light-gray) !important;
}

.modal-footer {
	border-top: 1px solid rgba(91, 126, 60, 0.08);
	padding: 16px 24px;
}

/* Card & Header Text overrides */
.card-body.text-danger,
.card-body .text-danger,
.my-card .text-danger,
.text-danger.fs-2,
.text-danger.fs-3,
.text-danger.fs-4,
.text-danger.fs-5 {
	color: var(--accent-red) !important;
}

.card-body.text-success,
.card-body .text-success,
.my-card .text-success,
.text-success.fs-2,
.text-success.fs-3,
.text-success.fs-4,
.text-success.fs-5 {
	color: var(--primary-dark) !important;
}

/* Specific button styles override to support Bootstrap styles with Outfit design */
.btn-close {
	filter: invert(1);
}
</style>
