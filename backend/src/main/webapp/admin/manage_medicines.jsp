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
<title>Manage Pharmacy Inventory | Admin Portal</title>
<%@include file="../component/allcss.jsp"%>
</head>
<body class="bg-light">
	<%@include file="navbar.jsp"%>

	<c:if test="${empty adminObj}">
		<c:redirect url="../admin_login.jsp"></c:redirect>
	</c:if>

	<%
		MedicineDAO medDAO = new MedicineDAO(DBConnection.getConn());
		List<Medicine> medicines = medDAO.getAllMedicines();
		String[] categories = {
			"Pain Relief", "Antibiotics", "Vitamins & Supplements", 
			"Cold & Cough", "Diabetes", "Heart & Blood Pressure", 
			"Digestive Health", "Allergy", "Skin Care", "First Aid", "Other Medicines"
		};
	%>

	<div class="container py-5">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<div>
				<h2 class="fw-bold text-dark mb-1">
					<i class="fa-solid fa-pills text-danger me-2"></i> Pharmacy Inventory Management
				</h2>
				<p class="text-muted mb-0">Add, edit prices, update stock levels, and organize pharmacy categories.</p>
			</div>

			<button class="btn btn-primary rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#addMedicineModal">
				<i class="fa-solid fa-plus me-1"></i> Add New Medicine
			</button>
		</div>

		<c:if test="${not empty successMsg}">
			<div class="alert alert-success alert-dismissible fade show rounded-4" role="alert">
				<i class="fa-solid fa-circle-check me-2"></i> ${successMsg}
				<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
			</div>
			<c:remove var="successMsg" scope="session" />
		</c:if>

		<c:if test="${not empty errorMsg}">
			<div class="alert alert-danger alert-dismissible fade show rounded-4" role="alert">
				<i class="fa-solid fa-circle-exclamation me-2"></i> ${errorMsg}
				<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
			</div>
			<c:remove var="errorMsg" scope="session" />
		</c:if>

		<!-- Medicines Table -->
		<div class="card border-0 shadow-sm rounded-4 overflow-hidden">
			<div class="card-body p-0">
				<div class="table-responsive">
					<table class="table align-middle mb-0 text-center">
						<thead class="bg-danger text-white">
							<tr class="fs-8 text-uppercase">
								<th class="py-3">ID</th>
								<th class="py-3 text-start ps-4">Medicine Name</th>
								<th class="py-3">Category</th>
								<th class="py-3">Form</th>
								<th class="py-3">Price</th>
								<th class="py-3">Stock Level</th>
								<th class="py-3">Action</th>
							</tr>
						</thead>
						<tbody>
							<% if (medicines != null && !medicines.isEmpty()) { %>
								<% for (Medicine m : medicines) { %>
									<tr>
										<td class="fw-bold font-monospace">#<%= m.getId() %></td>
										<td class="text-start ps-4">
											<div class="d-flex align-items-center gap-3">
												<%
													String adminDosageKey = (m.getDosageForm() != null && !m.getDosageForm().trim().isEmpty()) ? m.getDosageForm().trim().toLowerCase() : "default";
													String adminFallbackSvg = "../img/medicines/" + adminDosageKey + ".svg";
													String adminImgUrl = m.getImageUrl();
													if (adminImgUrl == null || adminImgUrl.trim().isEmpty() || adminImgUrl.contains("netmeds.com")) {
														adminImgUrl = adminFallbackSvg;
													} else if (adminImgUrl.startsWith("img/")) {
														adminImgUrl = "../" + adminImgUrl;
													}
												%>
												<img src="<%= adminImgUrl %>" 
												     alt="<%= m.getName() %>" 
												     onerror="this.onerror=null; this.src='<%= adminFallbackSvg %>';" 
												     style="width: 40px; height: 40px; object-fit: contain; border-radius: 8px; background: #f8fafc; padding: 4px; border: 1px solid #e2e8f0;">
												<div>
													<div class="fw-bold text-dark"><%= m.getName() %></div>
													<div class="fs-8 text-muted line-clamp-1"><%= m.getDescription() %></div>
												</div>
											</div>
										</td>
										<td>
											<span class="badge bg-secondary-subtle text-dark px-3 py-1 rounded-pill fs-8">
												<%= m.getCategory() %>
											</span>
										</td>
										<td class="fs-7 text-muted"><%= m.getDosageForm() %></td>
										<td class="font-monospace fw-bold text-danger">₹<%= String.format("%.2f", m.getPrice()) %></td>
										<td>
											<% if (m.getStock() > 20) { %>
												<span class="badge bg-success-subtle text-success px-3 py-1 rounded-pill"><%= m.getStock() %> available</span>
											<% } else if (m.getStock() > 0) { %>
												<span class="badge bg-warning-subtle text-warning-emphasis px-3 py-1 rounded-pill"><%= m.getStock() %> low stock</span>
											<% } else { %>
												<span class="badge bg-danger-subtle text-danger px-3 py-1 rounded-pill">0 out of stock</span>
											<% } %>
										</td>
										<td>
											<button class="btn btn-sm btn-outline-primary rounded-pill px-3 me-1" 
												data-bs-toggle="modal" data-bs-target="#editModal<%= m.getId() %>">
												<i class="fa-solid fa-pen"></i> Edit
											</button>

											<a href="../adminPharmacy?action=deleteMedicine&id=<%= m.getId() %>" 
												class="btn btn-sm btn-outline-danger rounded-pill px-3"
												onclick="return confirm('Are you sure you want to delete <%= m.getName() %>?');">
												<i class="fa-solid fa-trash-can"></i> Delete
											</a>
										</td>
									</tr>

									<!-- Edit Medicine Modal -->
									<div class="modal fade text-start" id="editModal<%= m.getId() %>" tabindex="-1" aria-hidden="true">
										<div class="modal-dialog modal-dialog-centered">
											<div class="modal-content rounded-4 border-0">
												<div class="modal-header border-0 pb-0">
													<h5 class="modal-title fw-bold">Edit Medicine #<%= m.getId() %></h5>
													<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
												</div>
												<form action="../adminPharmacy" method="post">
													<input type="hidden" name="action" value="editMedicine">
													<input type="hidden" name="id" value="<%= m.getId() %>">
													<div class="modal-body p-4">
														<div class="row g-3">
															<div class="col-md-6">
																<label class="form-label fs-7 fw-semibold">Medicine Name</label>
																<input type="text" name="name" class="form-control rounded-pill" required value="<%= m.getName() %>">
															</div>
															<div class="col-md-6">
																<label class="form-label fs-7 fw-semibold">Category</label>
																<select name="category" class="form-select rounded-pill" required>
																	<% for (String cat : categories) { %>
																		<option value="<%= cat %>" <%= cat.equalsIgnoreCase(m.getCategory()) ? "selected" : "" %>><%= cat %></option>
																	<% } %>
																</select>
															</div>
															<div class="col-md-6">
																<label class="form-label fs-7 fw-semibold">Unit Price (₹)</label>
																<input type="number" step="0.01" name="price" class="form-control rounded-pill" required value="<%= m.getPrice() %>">
															</div>
															<div class="col-md-6">
																<label class="form-label fs-7 fw-semibold">Inventory Stock</label>
																<input type="number" name="stock" class="form-control rounded-pill" required value="<%= m.getStock() %>">
															</div>
															<div class="col-md-6">
																<label class="form-label fs-7 fw-semibold">Dosage Form</label>
																<input type="text" name="dosageForm" class="form-control rounded-pill" required value="<%= m.getDosageForm() %>">
															</div>
															<div class="col-md-6">
																<label class="form-label fs-7 fw-semibold">Image Asset</label>
																<input type="text" name="imageUrl" class="form-control rounded-pill" value="<%= m.getImageUrl() %>">
															</div>
															<div class="col-12">
																<label class="form-label fs-7 fw-semibold">Description</label>
																<textarea name="description" class="form-control rounded-3" rows="3" required><%= m.getDescription() %></textarea>
															</div>
														</div>
													</div>
													<div class="modal-footer border-0 pt-0">
														<button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
														<button type="submit" class="btn btn-primary rounded-pill px-4">Update Medicine</button>
													</div>
												</form>
											</div>
										</div>
									</div>
								<% } %>
							<% } else { %>
								<tr>
									<td colspan="7" class="py-5 text-muted">No medicines in inventory. Click "Add New Medicine" to populate.</td>
								</tr>
							<% } %>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>

	<!-- Add Medicine Modal -->
	<div class="modal fade" id="addMedicineModal" tabindex="-1" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content rounded-4 border-0">
				<div class="modal-header border-0 pb-0">
					<h5 class="modal-title fw-bold">Add New Pharmacy Medicine</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<form action="../adminPharmacy" method="post">
					<input type="hidden" name="action" value="addMedicine">
					<div class="modal-body p-4">
						<div class="row g-3">
							<div class="col-md-6">
								<label class="form-label fs-7 fw-semibold">Medicine Name</label>
								<input type="text" name="name" class="form-control rounded-pill" required placeholder="e.g. Paracetamol 650mg">
							</div>
							<div class="col-md-6">
								<label class="form-label fs-7 fw-semibold">Category</label>
								<select name="category" class="form-select rounded-pill" required>
									<% for (String cat : categories) { %>
										<option value="<%= cat %>"><%= cat %></option>
									<% } %>
								</select>
							</div>
							<div class="col-md-6">
								<label class="form-label fs-7 fw-semibold">Unit Price (₹)</label>
								<input type="number" step="0.01" name="price" class="form-control rounded-pill" required placeholder="30.00">
							</div>
							<div class="col-md-6">
								<label class="form-label fs-7 fw-semibold">Stock Quantity</label>
								<input type="number" name="stock" class="form-control rounded-pill" required placeholder="100" value="100">
							</div>
							<div class="col-md-6">
								<label class="form-label fs-7 fw-semibold">Dosage Form</label>
								<input type="text" name="dosageForm" class="form-control rounded-pill" required placeholder="Tablet, Capsule, Syrup">
							</div>
							<div class="col-md-6">
								<label class="form-label fs-7 fw-semibold">Image URL</label>
								<input type="text" name="imageUrl" class="form-control rounded-pill" placeholder="img/med_paracetamol.png">
							</div>
							<div class="col-12">
								<label class="form-label fs-7 fw-semibold">Description</label>
								<textarea name="description" class="form-control rounded-3" rows="3" required placeholder="Enter medicine therapeutic usage and indications..."></textarea>
							</div>
						</div>
					</div>
					<div class="modal-footer border-0 pt-0">
						<button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
						<button type="submit" class="btn btn-primary rounded-pill px-4">Save Medicine</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<%@include file="../component/footer.jsp"%>
</body>
</html>
