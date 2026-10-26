<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.hms.dao.BlogDAO"%>
<%@ page import="com.hms.entity.Blog"%>
<%@ page import="com.hms.db.DBConnection"%>
<%@ page import="java.util.List"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Blog & News | Iryotek Healthcare</title>
<%@include file="component/allcss.jsp"%>
</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<!-- Page Breadcrumb Header Banner (Dark Green #0b3c36) -->
	<section class="medipro-page-header text-center py-5 text-white" style="background-color: var(--medipro-dark-green);">
		<div class="container py-4">
			<h1 class="display-4 fw-extrabold text-coral mb-2">Blog & News</h1>
			<p class="fs-6 text-white-50">Home &raquo; Blog</p>
		</div>
	</section>

	<!-- Main Blog Grid Section -->
	<section class="py-5" style="background-color: var(--medipro-cream-bg);">
		<div class="container py-4">
			<div class="row g-4">
				<%
				BlogDAO blogDAO = new BlogDAO(DBConnection.getConn());
				List<Blog> blogList = blogDAO.getAllBlogs();
				if (blogList != null && !blogList.isEmpty()) {
					for (Blog b : blogList) {
				%>
				<div class="col-lg-4 col-md-6">
					<div class="bg-white rounded-4 shadow-sm overflow-hidden border border-light h-100 d-flex flex-column">
						<a href="blog_detail.jsp?id=<%= b.getId() %>">
							<img src="<%= (b.getImagePath() != null && !b.getImagePath().trim().isEmpty()) ? b.getImagePath() : "img/hospital1.jpg" %>" 
							     alt="<%= b.getTitle() %>" 
							     onerror="this.onerror=null; this.src='img/hospital1.jpg';" 
							     class="w-100" 
							     style="height: 240px; object-fit: cover;">
						</a>
						<div class="p-4 d-flex flex-column justify-content-between flex-grow-1">
							<div>
								<h5 class="fw-bold mb-2">
									<a href="blog_detail.jsp?id=<%= b.getId() %>" class="text-dark text-decoration-none hover-coral">
										<%= b.getTitle() %>
									</a>
								</h5>
								<p class="text-muted fs-7 mb-3"><%= b.getExcerpt() %></p>
							</div>
							<div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-light">
								<span class="fs-8 text-muted"><i class="fa-regular fa-calendar me-1"></i> <%= b.getCreatedAt() != null ? b.getCreatedAt().toString().substring(0, 10) : "Feb 26, 2024" %></span>
								<a href="blog_detail.jsp?id=<%= b.getId() %>" class="text-coral fw-bold text-decoration-none fs-7">
									Read More <i class="fa-solid fa-arrow-right ms-1"></i>
								</a>
							</div>
						</div>
					</div>
				</div>
				<%
					}
				} else {
				%>
				<div class="col-12 text-center text-muted py-5">
					<p class="fs-5">No news or articles published yet.</p>
				</div>
				<%
				}
				%>
			</div>
		</div>
	</section>

	<%@include file="component/footer.jsp"%>
</body>
</html>
