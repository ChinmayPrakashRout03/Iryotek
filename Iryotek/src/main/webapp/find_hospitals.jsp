<%@page import="java.util.List"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="com.hms.dao.HospitalDAO"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<!-- for jstl tag -->
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!-- end of jstl tag -->

<%@page isELIgnored="false"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Find Hospitals | Iryotek</title>
<%@include file="component/allcss.jsp"%>

<!-- customs css for this page -->
<style type="text/css">
.my-bg-img {
	background: linear-gradient(rgba(91, 126, 60, 0.6), rgba(91, 126, 60, 0.6)), url("img/hospital1.jpg");
	height: 25vh;
	width: 100%;
	background-size: cover;
	background-repeat: no-repeat;
}

.hospital-card {
	border-left: 4px solid var(--accent-teal);
	transition: var(--transition);
}

.hospital-card:hover {
	transform: translateY(-5px);
	box-shadow: var(--hover-shadow);
}

.filter-section {
	background-color: #ffffff;
	border: 1px solid rgba(91, 126, 60, 0.08);
	box-shadow: var(--card-shadow);
	border-radius: 16px;
	padding: 25px;
}

#hospitalResults {
	min-height: 200px;
}

.no-results {
	color: var(--text-secondary);
	font-size: 1.1rem;
}
</style>
<!-- end of customs css for this page -->

</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<!-- Hero Section -->
	<div class="container-fluid my-bg-img p-5">
		<p class="text-center fs-2 text-white fw-bold mt-3">
			<i class="fa-solid fa-hospital"></i> Find Hospitals Near You
		</p>
	</div>

	<!-- Filter Section -->
	<div class="container mt-4">
		<div class="filter-section">
			<p class="fs-4 text-center myP-color mb-3">
				<i class="fa-solid fa-filter"></i> Select Your Location
			</p>
			<div class="row justify-content-center">
				<div class="col-md-4">
					<label class="form-label fw-bold">State</label>
					<select class="form-control" id="stateSelect" onchange="loadCities()">
						<option selected="selected" disabled="disabled">---Select State---</option>
						<%
						HospitalDAO hospDAO = new HospitalDAO(DBConnection.getConn());
						List<String> states = hospDAO.getAllStates();
						for (String st : states) {
						%>
						<option value="<%=st%>"><%=st%></option>
						<%
						}
						%>
					</select>
				</div>
				<div class="col-md-4">
					<label class="form-label fw-bold">City</label>
					<select class="form-control" id="citySelect" onchange="loadHospitals()" disabled="disabled">
						<option selected="selected" disabled="disabled">---Select City---</option>
					</select>
				</div>
			</div>
		</div>
	</div>

	<!-- Hospital Results Section -->
	<div class="container mt-4 mb-5">
		<div id="hospitalResults">
			<p class="text-center no-results mt-5">
				<i class="fa-solid fa-arrow-up"></i> Please select a State and City to find hospitals
			</p>
		</div>
	</div>

	<!-- footer -->
	<%@include file="component/footer.jsp"%>
	<!-- end footer -->

	<!-- AJAX JavaScript -->
	<script type="text/javascript">
		// Load cities when state is selected
		function loadCities() {
			var state = document.getElementById("stateSelect").value;
			var citySelect = document.getElementById("citySelect");

			// Reset city dropdown
			citySelect.innerHTML = '<option selected="selected" disabled="disabled">---Loading...---</option>';
			citySelect.disabled = true;

			// Clear hospitals
			document.getElementById("hospitalResults").innerHTML = '<p class="text-center no-results mt-5"><i class="fa-solid fa-arrow-up"></i> Please select a City</p>';

			// AJAX call to get cities
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "getCitiesByState?state=" + encodeURIComponent(state), true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4 && xhr.status === 200) {
					var cities = JSON.parse(xhr.responseText);
					citySelect.innerHTML = '<option selected="selected" disabled="disabled">---Select City---</option>';
					for (var i = 0; i < cities.length; i++) {
						var option = document.createElement("option");
						option.value = cities[i];
						option.text = cities[i];
						citySelect.appendChild(option);
					}
					citySelect.disabled = false;
				}
			};
			xhr.send();
		}

		// Load hospitals when city is selected
		function loadHospitals() {
			var city = document.getElementById("citySelect").value;
			var resultsDiv = document.getElementById("hospitalResults");

			resultsDiv.innerHTML = '<p class="text-center mt-5"><i class="fa-solid fa-spinner fa-spin"></i> Loading hospitals...</p>';

			// AJAX call to get hospitals
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "getHospitalsByCity?city=" + encodeURIComponent(city), true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4 && xhr.status === 200) {
					var hospitals = JSON.parse(xhr.responseText);

					if (hospitals.length === 0) {
						resultsDiv.innerHTML = '<p class="text-center no-results mt-5"><i class="fa-solid fa-circle-exclamation"></i> No hospitals found in ' + city + '</p>';
						return;
					}

					var html = '<p class="fs-4 myP-color mb-3"><i class="fa-solid fa-hospital"></i> Hospitals in ' + city + ' (' + hospitals.length + ' found)</p>';
					html += '<div class="row">';

					for (var i = 0; i < hospitals.length; i++) {
						var h = hospitals[i];
						html += '<div class="col-md-6 mb-3">';
						html += '  <div class="card hospital-card h-100">';
						html += '    <div class="card-body">';
						html += '      <h5 class="card-title myP-color"><i class="fa-solid fa-hospital"></i> ' + h.name + '</h5>';
						html += '      <p class="card-text mb-1"><i class="fa-solid fa-location-dot text-danger"></i> ' + h.address + '</p>';
						html += '      <p class="card-text mb-1"><i class="fa-solid fa-city text-primary"></i> ' + h.city + ', ' + h.state + '</p>';
						html += '      <p class="card-text mb-2"><i class="fa-solid fa-phone text-success"></i> ' + h.phone + '</p>';
						html += '      <a href="user_appointment.jsp?hospitalId=' + h.id + '" class="btn btn-sm btn-primary">'; 
						html += '        <i class="fa-solid fa-user-doctor"></i> View Doctors & Book';
						html += '      </a>';
						html += '    </div>';
						html += '  </div>';
						html += '</div>';
					}

					html += '</div>';
					resultsDiv.innerHTML = html;
				}
			};
			xhr.send();
		}
	</script>

</body>
</html>
