<%@page import="com.hms.dao.MedicineDAO"%>
<%@page import="com.hms.entity.Medicine"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="java.util.List"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Online Pharmacy & Medicine Shop | Iryotek</title>
<%@include file="component/allcss.jsp"%>
</head>
<body class="bg-light">
	<%@include file="component/navbar.jsp"%>

	<!-- Header Banner -->
	<div class="bg-dark text-white py-5 mb-4 position-relative overflow-hidden" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
		<div class="container py-3">
			<div class="row align-items-center">
				<div class="col-lg-7">
					<span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold mb-3 fs-7">
						<i class="fa-solid fa-truck-medical me-1"></i> Genuine Online Pharmacy
					</span>
					<h1 class="fw-bold display-5 mb-3">Order Prescribed & OTC Medicines</h1>
					<p class="lead text-white-80 mb-4">Doctor prescriptions are automatically synced to your cart. Easily order medicines online with fast home delivery.</p>
					<div class="d-flex gap-2">
						<a href="cart.jsp" class="btn btn-coral rounded-pill px-4 py-2 fw-semibold">
							<i class="fa-solid fa-cart-shopping me-2"></i> View Medicine Cart
						</a>
						<c:if test="${not empty userObj}">
							<a href="view_appointment.jsp" class="btn btn-outline-light rounded-pill px-4 py-2">
								<i class="fa-solid fa-file-prescription me-2"></i> My Prescriptions
							</a>
						</c:if>
					</div>
				</div>
				<div class="col-lg-5 d-none d-lg-block text-end">
					<i class="fa-solid fa-pills display-1 text-cyan opacity-25"></i>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Pharmacy Container -->
	<div class="container pb-5">
		<%
			String search = request.getParameter("search");
			String category = request.getParameter("category");
			if (category == null) category = "All";

			int pageNo = 1;
			try {
				pageNo = Integer.parseInt(request.getParameter("page"));
				if (pageNo < 1) pageNo = 1;
			} catch (Exception e) { pageNo = 1; }

			int pageSize = 24;

			MedicineDAO medDAO = new MedicineDAO(DBConnection.getConn());
			int totalMedicines = medDAO.getTotalMedicineCount(search, category);
			int totalPages = (int) Math.ceil((double) totalMedicines / pageSize);
			if (totalPages < 1) totalPages = 1;
			if (pageNo > totalPages) pageNo = totalPages;

			List<Medicine> medList = medDAO.searchMedicinesPaginated(search, category, pageNo, pageSize);
			List<String> dbCategories = medDAO.getAllCategories();
		%>

		<!-- Category Pills & Search Filter -->
		<div class="card border-0 shadow-sm rounded-4 mb-4">
			<div class="card-body p-4">
				<form action="medicines.jsp" method="get" class="row g-3 align-items-center">
					<div class="col-md-7">
						<div class="input-group">
							<span class="input-group-text bg-white border-end-0 rounded-start-pill ps-3 text-muted">
								<i class="fa-solid fa-magnifying-glass"></i>
							</span>
							<input type="text" name="search" class="form-control border-start-0 rounded-end-pill py-2" placeholder="Search 23,900+ medicines by name or condition (e.g. Atrest, Capnea, Paracetamol)..." value="<%= search != null ? search : "" %>">
						</div>
					</div>
					<div class="col-md-3">
						<select name="category" class="form-select rounded-pill py-2" onchange="this.form.submit()">
							<option value="All" <%= "All".equalsIgnoreCase(category) ? "selected" : "" %>>All Categories (<%= dbCategories.size() %>)</option>
							<% for (String cat : dbCategories) { %>
								<option value="<%= cat %>" <%= cat.equalsIgnoreCase(category) ? "selected" : "" %>><%= cat %></option>
							<% } %>
						</select>
					</div>
					<div class="col-md-2">
						<button type="submit" class="btn btn-primary w-100 rounded-pill py-2 fw-semibold">
							Filter
						</button>
					</div>
				</form>

				<!-- Category Tags Scroll -->
				<div class="d-flex flex-wrap gap-2 mt-4 pt-2 border-top max-h-48 overflow-auto">
					<a href="medicines.jsp?category=All" class="btn btn-sm <%= "All".equalsIgnoreCase(category) ? "btn-primary" : "btn-outline-secondary" %> rounded-pill px-3 py-1 fs-7">
						All
					</a>
					<% int catLimit = 0; for (String cat : dbCategories) { if (catLimit++ > 25) break; %>
						<a href="medicines.jsp?category=<%= java.net.URLEncoder.encode(cat, "UTF-8") %>" class="btn btn-sm <%= cat.equalsIgnoreCase(category) ? "btn-primary" : "btn-outline-secondary" %> rounded-pill px-3 py-1 fs-7">
							<%= cat %>
						</a>
					<% } %>
				</div>
			</div>
		</div>

		<!-- Medicines Grid Header -->
		<div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
			<h4 class="fw-bold mb-0 text-dark">
				Available Medicines 
				<span class="fs-6 text-muted font-normal">(Showing <%= (pageNo - 1) * pageSize + 1 %> - <%= Math.min(pageNo * pageSize, totalMedicines) %> of <%= totalMedicines %> items)</span>
			</h4>

			<div class="fs-7 text-secondary">
				Page <strong><%= pageNo %></strong> of <strong><%= totalPages %></strong>
			</div>
		</div>

		<div class="row g-4">
			<%
				if (medList != null && !medList.isEmpty()) {
					for (Medicine m : medList) {
			%>
				<div class="col-md-6 col-lg-4 col-xl-3">
					<div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-shadow transition">
						<div class="position-relative bg-light p-4 text-center border-bottom d-flex flex-column justify-content-center align-items-center" style="height: 180px;">
							<span class="position-absolute top-0 start-0 m-3 badge bg-cyan-subtle text-cyan rounded-pill px-3 py-1 fs-8">
								<%= m.getCategory() %>
							</span>
							<% if (m.getStock() > 0) { %>
								<span class="position-absolute top-0 end-0 m-3 badge bg-success-subtle text-success rounded-pill px-2 py-1 fs-8">
									<i class="fa-solid fa-check me-1"></i> In Stock
								</span>
							<% } else { %>
								<span class="position-absolute top-0 end-0 m-3 badge bg-danger-subtle text-danger rounded-pill px-2 py-1 fs-8">
									<i class="fa-solid fa-circle-xmark me-1"></i> Out of Stock
								</span>
							<% } %>
							
							<div class="my-2 text-center d-flex align-items-center justify-content-center" style="height: 100px;">
								<%
									String dosageFormKey = "default";
									String df = (m.getDosageForm() != null) ? m.getDosageForm().trim().toLowerCase() : "";
									if (df.contains("tablet")) dosageFormKey = "tablet";
									else if (df.contains("capsule")) dosageFormKey = "capsule";
									else if (df.contains("syrup") || df.contains("liquid") || df.contains("solution") || df.contains("suspension")) dosageFormKey = "syrup";
									else if (df.contains("inject")) dosageFormKey = "injection";
									else if (df.contains("oint") || df.contains("gel") || df.contains("cream")) dosageFormKey = "ointment";
									else if (df.contains("drop")) dosageFormKey = "drops";
									else if (df.contains("inhal")) dosageFormKey = "inhaler";
									else if (df.contains("powder")) dosageFormKey = "powder";

									String fallbackSvg = "img/medicines/" + dosageFormKey + ".svg";
									String imgUrl = m.getImageUrl();
									boolean isRealPhoto = (imgUrl != null && (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")));
									if (imgUrl == null || imgUrl.trim().isEmpty()) {
										imgUrl = fallbackSvg;
									}
								%>
								<img src="<%= imgUrl %>" 
								     referrerpolicy="no-referrer"
								     alt="<%= m.getName() %>" 
								     onerror="this.onerror=null; this.src='<%= fallbackSvg %>';"
								     style="max-height: 95px; max-width: 100px; object-fit: contain; border-radius: 10px; transition: transform 0.2s; <%= isRealPhoto ? "background:#fff; padding:3px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" : "" %>"
								     class="medicine-thumb">
							</div>
							<div class="text-muted fs-8 text-uppercase fw-semibold"><%= m.getDosageForm() %></div>
						</div>

						<div class="card-body p-4 d-flex flex-column">
							<h5 class="fw-bold text-dark mb-1">
								<a href="medicine_details.jsp?id=<%= m.getId() %>" class="text-decoration-none text-dark hover-cyan">
									<%= m.getName() %>
								</a>
							</h5>
							<p class="text-muted fs-7 line-clamp-2 mb-3 flex-grow-1">
								<%= m.getDescription() %>
							</p>

							<div class="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
								<div>
									<div class="fs-8 text-muted">Price</div>
									<div class="fs-4 fw-bold text-coral">₹<%= String.format("%.2f", m.getPrice()) %></div>
								</div>

								<% if (m.getStock() > 0) { %>
									<form action="cartAction" method="post">
										<input type="hidden" name="action" value="add">
										<input type="hidden" name="medicineId" value="<%= m.getId() %>">
										<input type="hidden" name="quantity" value="1">
										<input type="hidden" name="source" value="MANUAL">
										<input type="hidden" name="redirectUrl" value="medicines.jsp?page=<%= pageNo %>">
										<button type="submit" class="btn btn-outline-coral rounded-pill px-3 py-2 fs-7 fw-semibold">
											<i class="fa-solid fa-cart-plus me-1"></i> Add
										</button>
									</form>
								<% } else { %>
									<button disabled class="btn btn-secondary rounded-pill px-3 py-2 fs-7 disabled">
										Unavailable
									</button>
								<% } %>
							</div>
						</div>
					</div>
				</div>
			<%
					}
				} else {
			%>
				<div class="col-12 text-center py-5">
					<div class="card border-0 shadow-sm rounded-4 p-5">
						<i class="fa-solid fa-capsules display-1 text-muted opacity-25 mb-3"></i>
						<h4 class="fw-bold text-secondary">No Medicines Found</h4>
						<p class="text-muted">No medicines matched your filter or search criteria. Try searching for another name or selecting another category.</p>
						<div class="mt-3">
							<a href="medicines.jsp" class="btn btn-primary rounded-pill px-4">Reset Filters</a>
						</div>
					</div>
				</div>
			<%
				}
			%>
		</div>

		<!-- Pagination Navigation -->
		<% if (totalPages > 1) { 
			String searchParam = search != null ? "&search=" + java.net.URLEncoder.encode(search, "UTF-8") : "";
			String catParam = category != null ? "&category=" + java.net.URLEncoder.encode(category, "UTF-8") : "";
		%>
			<div class="d-flex justify-content-center mt-5">
				<nav aria-label="Medicine Page Navigation">
					<ul class="pagination pagination-rounded shadow-sm">
						<li class="page-item <%= pageNo <= 1 ? "disabled" : "" %>">
							<a class="page-item-link" href="medicines.jsp?page=<%= pageNo - 1 %><%= searchParam %><%= catParam %>" aria-label="Previous">
								<i class="fa-solid fa-chevron-left me-1"></i> Previous
							</a>
						</li>

						<%
							int startPage = Math.max(1, pageNo - 2);
							int endPage = Math.min(totalPages, pageNo + 2);
							for (int i = startPage; i <= endPage; i++) {
						%>
							<li class="page-item <%= i == pageNo ? "active" : "" %>">
								<a class="page-item-link" href="medicines.jsp?page=<%= i %><%= searchParam %><%= catParam %>"><%= i %></a>
							</li>
						<% } %>

						<li class="page-item <%= pageNo >= totalPages ? "disabled" : "" %>">
							<a class="page-item-link" href="medicines.jsp?page=<%= pageNo + 1 %><%= searchParam %><%= catParam %>" aria-label="Next">
								Next <i class="fa-solid fa-chevron-right ms-1"></i>
							</a>
						</li>
					</ul>
				</nav>
			</div>
		<% } %>
	</div>

	<%@include file="component/footer.jsp"%>
</body>
</html>
