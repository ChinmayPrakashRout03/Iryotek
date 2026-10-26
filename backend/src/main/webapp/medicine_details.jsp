<%@page import="com.hms.dao.MedicineDAO"%>
<%@page import="com.hms.entity.Medicine"%>
<%@page import="com.hms.db.DBConnection"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Medicine Details | Iryotek Pharmacy</title>
<%@include file="component/allcss.jsp"%>
</head>
<body class="bg-light">
	<%@include file="component/navbar.jsp"%>

	<%
		int id = 0;
		try {
			id = Integer.parseInt(request.getParameter("id"));
		} catch (Exception e) { }

		MedicineDAO medDAO = new MedicineDAO(DBConnection.getConn());
		Medicine m = medDAO.getMedicineById(id);
		if (m == null) {
			response.sendRedirect("medicines.jsp");
			return;
		}
	%>

	<div class="container py-5">
		<!-- Breadcrumb -->
		<nav aria-label="breadcrumb" class="mb-4">
			<ol class="breadcrumb">
				<li class="breadcrumb-item"><a href="index.jsp" class="text-decoration-none text-muted">Home</a></li>
				<li class="breadcrumb-item"><a href="medicines.jsp" class="text-decoration-none text-muted">Medicine Shop</a></li>
				<li class="breadcrumb-item active text-cyan fw-bold" aria-current="page"><%= m.getName() %></li>
			</ol>
		</nav>

		<div class="card border-0 shadow-sm rounded-4 overflow-hidden">
			<div class="card-body p-4 p-md-5">
				<div class="row g-5 align-items-center">
					<div class="col-md-5 text-center">
						<div class="bg-light p-4 rounded-4 border d-flex flex-column align-items-center justify-content-center" style="min-height: 300px;">
							<%
								String detailDosageFormKey = "default";
								String ddf = (m.getDosageForm() != null) ? m.getDosageForm().trim().toLowerCase() : "";
								if (ddf.contains("tablet")) detailDosageFormKey = "tablet";
								else if (ddf.contains("capsule")) detailDosageFormKey = "capsule";
								else if (ddf.contains("syrup") || ddf.contains("liquid") || ddf.contains("solution") || ddf.contains("suspension")) detailDosageFormKey = "syrup";
								else if (ddf.contains("inject")) detailDosageFormKey = "injection";
								else if (ddf.contains("oint") || ddf.contains("gel") || ddf.contains("cream")) detailDosageFormKey = "ointment";
								else if (ddf.contains("drop")) detailDosageFormKey = "drops";
								else if (ddf.contains("inhal")) detailDosageFormKey = "inhaler";
								else if (ddf.contains("powder")) detailDosageFormKey = "powder";

								String detailFallbackSvg = "img/medicines/" + detailDosageFormKey + ".svg";
								String detailImgUrl = m.getImageUrl();
								boolean isDetailRealPhoto = (detailImgUrl != null && (detailImgUrl.startsWith("http://") || detailImgUrl.startsWith("https://")));
								if (detailImgUrl == null || detailImgUrl.trim().isEmpty()) {
									detailImgUrl = detailFallbackSvg;
								}
							%>
							<img src="<%= detailImgUrl %>" 
							     referrerpolicy="no-referrer"
							     alt="<%= m.getName() %>" 
							     onerror="this.onerror=null; this.src='<%= detailFallbackSvg %>';"
							     class="img-fluid my-3 shadow-sm rounded-4" 
							     style="max-height: 220px; max-width: 220px; object-fit: contain; background: #ffffff; padding: 12px;">
							<div class="mt-2">
								<span class="badge bg-secondary-subtle text-dark px-3 py-2 rounded-pill fs-7">
									Form: <%= m.getDosageForm() %>
								</span>
							</div>
						</div>
					</div>

					<div class="col-md-7">
						<span class="badge bg-cyan-subtle text-cyan px-3 py-2 rounded-pill fw-semibold mb-3 fs-7">
							<%= m.getCategory() %>
						</span>

						<h2 class="display-6 fw-bold text-dark mb-2"><%= m.getName() %></h2>
						
						<div class="d-flex align-items-center gap-3 mb-4">
							<span class="display-6 fw-bold text-coral">₹<%= String.format("%.2f", m.getPrice()) %></span>
							
							<% if (m.getStock() > 0) { %>
								<span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill fs-7">
									<i class="fa-solid fa-circle-check me-1"></i> In Stock (<%= m.getStock() %> available)
								</span>
							<% } else { %>
								<span class="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fs-7">
									<i class="fa-solid fa-circle-xmark me-1"></i> Out of Stock
								</span>
							<% } %>
						</div>

						<h6 class="fw-bold text-uppercase text-muted fs-8 tracking-wider mb-2">Description & Usage</h6>
						<p class="text-secondary leading-relaxed mb-4 fs-6">
							<%= m.getDescription() %>
						</p>

						<div class="border-top border-bottom py-4 mb-4">
							<div class="row g-3 text-center text-md-start">
								<div class="col-6 col-sm-4">
									<div class="fs-8 text-muted text-uppercase fw-semibold">Category</div>
									<div class="fw-bold text-dark"><%= m.getCategory() %></div>
								</div>
								<div class="col-6 col-sm-4">
									<div class="fs-8 text-muted text-uppercase fw-semibold">Dosage Form</div>
									<div class="fw-bold text-dark"><%= m.getDosageForm() %></div>
								</div>
								<div class="col-6 col-sm-4">
									<div class="fs-8 text-muted text-uppercase fw-semibold">Prescription</div>
									<div class="fw-bold text-success"><i class="fa-solid fa-shield-halved me-1"></i> Verified Safe</div>
								</div>
							</div>
						</div>

						<% if (m.getStock() > 0) { %>
							<form action="cartAction" method="post" class="row g-3 align-items-center">
								<input type="hidden" name="action" value="add">
								<input type="hidden" name="medicineId" value="<%= m.getId() %>">
								<input type="hidden" name="source" value="MANUAL">
								<input type="hidden" name="redirectUrl" value="cart.jsp">

								<div class="col-auto">
									<label class="form-label mb-0 fw-semibold text-muted">Qty:</label>
								</div>
								<div class="col-auto">
									<input type="number" name="quantity" class="form-control rounded-pill text-center fw-bold" style="width: 90px;" min="1" max="<%= m.getStock() %>" value="1">
								</div>
								<div class="col-auto">
									<button type="submit" class="btn btn-coral rounded-pill px-5 py-3 fw-bold">
										<i class="fa-solid fa-cart-shopping me-2"></i> Add To Cart
									</button>
								</div>
							</form>
						<% } else { %>
							<div class="alert alert-warning border-0 rounded-4">
								<i class="fa-solid fa-triangle-exclamation me-2 text-warning"></i> This medicine is currently out of stock in pharmacy inventory. Check back soon or contact your consulting doctor for alternatives.
							</div>
						<% } %>
					</div>
				</div>
			</div>
		</div>
	</div>

	<%@include file="component/footer.jsp"%>
</body>
</html>
