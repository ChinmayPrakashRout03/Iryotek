<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.hms.dao.BlogDAO"%>
<%@page import="com.hms.entity.Blog"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<!-- for jstl tag -->
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@page isELIgnored="false"%>

<%
String blogIdStr = request.getParameter("id");
int blogId = 1;
if (blogIdStr != null && !blogIdStr.trim().isEmpty()) {
	try {
		blogId = Integer.parseInt(blogIdStr);
	} catch(Exception e) {}
}

BlogDAO blogDAO = new BlogDAO(DBConnection.getConn());
Blog b = blogDAO.getBlogById(blogId);

if (b == null) {
	// Fallback to first available blog if ID not found
	b = blogDAO.getBlogById(1);
}
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title><%= (b != null ? b.getTitle() : "Medical Article") %> | Iryotek Health Blog</title>
<%@include file="component/allcss.jsp"%>
</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<div class="container py-5 mt-4">
		<div class="row justify-content-center">
			<div class="col-lg-9">
				<a href="index.jsp#blog" class="btn btn-outline-secondary mb-4 rounded-pill px-3">
					<i class="fa-solid fa-arrow-left me-1"></i> Back to Home
				</a>

				<% if (b != null) { %>
					<div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
						<img src="<%= b.getImagePath() %>" alt="<%= b.getTitle() %>" class="img-fluid w-100" style="max-height: 420px; object-fit: cover;">
						<div class="card-body p-4 p-md-5">
							<div class="d-flex flex-wrap align-items-center gap-3 text-muted mb-3 fs-7">
								<span class="badge bg-cyan text-white px-3 py-2 rounded-pill" style="background-color: var(--oreo-cyan);"><%= b.getCategory() %></span>
								<span><i class="fa-regular fa-user me-1"></i> <%= b.getAuthor() %></span>
								<span><i class="fa-regular fa-calendar me-1"></i> <%= b.getCreatedAt() != null ? b.getCreatedAt().toString().substring(0, 10) : "2026-07-23" %></span>
								<span><i class="fa-regular fa-comment me-1 text-danger"></i> <%= b.getCommentCount() %> Comments</span>
							</div>

							<h1 class="fw-bold text-dark mb-3"><%= b.getTitle() %></h1>
							
							<p class="lead text-secondary fw-semibold mb-4" style="line-height: 1.6;">
								<%= b.getExcerpt() %>
							</p>
							
							<hr class="my-4">

							<div class="text-secondary fs-6" style="line-height: 1.8; white-space: pre-line;">
								<%= b.getContent() %>
							</div>

							<div class="mt-5 p-4 rounded-4 bg-light d-flex align-items-center gap-3">
								<div class="dept-icon-container m-0" style="width: 55px; height: 55px; min-width: 55px;">
									<i class="fa-solid fa-user-doctor"></i>
								</div>
								<div>
									<h6 class="fw-bold mb-1 text-dark">Reviewed by Iryotek Medical Board</h6>
									<p class="fs-7 text-muted mb-0">All articles are verified by certified healthcare professionals to ensure clinical accuracy.</p>
								</div>
							</div>
						</div>
					</div>
				<% } else { %>
					<div class="alert alert-warning text-center py-5">
						<h4>Article Not Found</h4>
						<p>The requested blog article could not be loaded.</p>
						<a href="index.jsp" class="btn btn-primary">Return to Homepage</a>
					</div>
				<% } %>
			</div>
		</div>
	</div>

	<%@include file="component/footer.jsp"%>
</body>
</html>
