<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<%
	String footerUri = request.getRequestURI();
	boolean isFrontPage = footerUri.endsWith("/index.jsp") || footerUri.endsWith("/Iryotek/") || footerUri.endsWith("/Iryotek");
%>

<c:if test="<%= isFrontPage %>">
  <!-- Main Iryotek Footer -->
  <footer class="oreo-main-footer" id="contact">
    <div class="container">
      <div class="row g-4">
        <!-- Col 1: About Hospitals -->
        <div class="col-lg-6 col-md-6">
          <h5 class="footer-heading">About Iryotek Hospital</h5>
          <p class="mb-3" style="line-height: 1.6; max-width: 480px;">
            The relentless service of Iryotek Hospital in the past 25 years taken health care to the most modern levels in the region catering to urban & rural.
          </p>
          <p style="line-height: 1.6; max-width: 480px;">
            A Health Care Provider of Western Approach, Iryotek is the most trusted multispecialty hospital.
          </p>
        </div>

        <!-- Col 2: Useful Links -->
        <div class="col-lg-6 col-md-6">
          <h5 class="footer-heading">Useful Links</h5>
          <div class="row">
            <div class="col-6">
              <ul class="footer-links-list">
                <li><a href="index.jsp"><i class="fa-solid fa-chevron-right me-1 fs-7"></i> About Us</a></li>
                <li><a href="doctor_login.jsp"><i class="fa-solid fa-chevron-right me-1 fs-7"></i> Consultants</a></li>
                <li><a href="find_hospitals.jsp"><i class="fa-solid fa-chevron-right me-1 fs-7"></i> Working Hours</a></li>
                <li><a href="find_hospitals.jsp"><i class="fa-solid fa-chevron-right me-1 fs-7"></i> Procedures</a></li>
                <li><a href="user_appointment.jsp"><i class="fa-solid fa-chevron-right me-1 fs-7"></i> Special Offers</a></li>
              </ul>
            </div>
            <div class="col-6">
              <ul class="footer-links-list">
                <li><a href="find_hospitals.jsp"><i class="fa-solid fa-chevron-right me-1 fs-7"></i> Services</a></li>
                <li><a href="symptom_checker.jsp"><i class="fa-solid fa-chevron-right me-1 fs-7"></i> Healthy Foods</a></li>
                <li><a href="user_appointment.jsp"><i class="fa-solid fa-chevron-right me-1 fs-7"></i> Appointments</a></li>
                <li><a href="index.jsp#blog"><i class="fa-solid fa-chevron-right me-1 fs-7"></i> Latest News</a></li>
                <li><a href="index.jsp#blog"><i class="fa-solid fa-chevron-right me-1 fs-7"></i> Certificates</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>

  <!-- Sub Footer Bar -->
  <div class="oreo-sub-footer">
    <div class="container d-flex justify-content-between align-items-center">
      <div>
        Copyright © 2026 <span class="text-primary fw-bold">Iryotek Healthcare System</span> | All Rights Reserved
      </div>
      <div>
        <a href="#" class="scroll-top-btn" title="Scroll to top">
          <i class="fa-solid fa-caret-up"></i>
        </a>
      </div>
      <div class="d-flex gap-3 text-secondary fs-6">
        <a href="https://facebook.com" target="_blank" class="text-secondary"><i class="fa-brands fa-facebook-f"></i></a>
        <a href="https://twitter.com" target="_blank" class="text-secondary"><i class="fa-brands fa-twitter"></i></a>
        <a href="https://dribbble.com" target="_blank" class="text-secondary"><i class="fa-brands fa-dribbble"></i></a>
        <a href="https://behance.net" target="_blank" class="text-secondary"><i class="fa-brands fa-behance"></i></a>
      </div>
    </div>
  </div>
</c:if>