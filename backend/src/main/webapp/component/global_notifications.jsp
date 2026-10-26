<%@page import="com.hms.entity.User"%>
<%@page import="com.hms.entity.Appointment"%>
<%@page import="com.hms.dao.AppointmentDAO"%>
<%@page import="com.hms.db.DBConnection"%>
<%@page import="java.util.List"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<c:if test="${not empty userObj}">
<%
User globalUser = (User) session.getAttribute("userObj");
StringBuilder globalPendingJson = new StringBuilder("[");
if (globalUser != null) {
	try {
		AppointmentDAO globalApptDAO = new AppointmentDAO(DBConnection.getConn());
		List<Appointment> globalPendingList = globalApptDAO.getAllAppointmentByLoginUser(globalUser.getId());
		boolean gFirst = true;
		if (globalPendingList != null) {
			for (Appointment appt : globalPendingList) {
				if ("Pending".equals(appt.getStatus())) {
					if (!gFirst) globalPendingJson.append(",");
					globalPendingJson.append("{");
					globalPendingJson.append("\"id\":").append(appt.getId()).append(",");
					globalPendingJson.append("\"doctorId\":").append(appt.getDoctorId()).append(",");
					globalPendingJson.append("\"tokenNo\":").append(appt.getTokenNo()).append(",");
					globalPendingJson.append("\"appointmentDate\":\"").append(appt.getAppointmentDate()).append("\"");
					globalPendingJson.append("}");
					gFirst = false;
				}
			}
		}
	} catch(Exception e) {
		e.printStackTrace();
	}
}
globalPendingJson.append("]");
%>

<input type="hidden" id="globalPendingAppointmentsData" value='<%= globalPendingJson.toString() %>'>

<!-- Toast Container for Notifications -->
<div class="position-fixed p-3" style="top: 75px; right: 20px; z-index: 10900;">
  <div id="queueCallToast" class="toast align-items-center text-white bg-danger border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="d-flex">
      <div class="toast-body fs-6 fw-bold">
        <i class="fa-solid fa-bell fa-bounce me-2"></i> <span id="queueToastText">YOUR TURN! Your token is now being served!</span>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  </div>
</div>

<script type="text/javascript">
(function() {
	var gPending = [];
	try {
		var rawData = document.getElementById("globalPendingAppointmentsData").value;
		if (rawData) gPending = JSON.parse(rawData);
	} catch(e) {}

	if (!gPending || gPending.length === 0) return;

	document.addEventListener("DOMContentLoaded", function() {
		if ("Notification" in window && Notification.permission === "default") {
			Notification.requestPermission();
		}
	});

	var protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
	var host = window.location.host;
	var socketUrl = protocol + host + "/Iryotek/queueStatus";
	var ws = null;

	function connectWebSocket() {
		ws = new WebSocket(socketUrl);
		ws.onopen = function() {
			console.log("[Global WS] Connected. Registering appointments:", gPending);
			gPending.forEach(function(appt) {
				ws.send(JSON.stringify({
					type: "register",
					doctorId: appt.doctorId,
					appointmentDate: appt.appointmentDate
				}));
			});
		};

		ws.onmessage = function(event) {
			try {
				var data = JSON.parse(event.data);
				if (data.type === "update") {
					handleGlobalQueueUpdate(data);
				}
			} catch(e) {
				console.error("[Global WS] Error:", e);
			}
		};

		ws.onclose = function() {
			console.log("[Global WS] Reconnecting in 5s...");
			setTimeout(connectWebSocket, 5000);
		};
	}

	connectWebSocket();

	var notifiedSet = {};

	function playNotificationChime() {
		try {
			var AudioCtx = window.AudioContext || window.webkitAudioContext;
			if (!AudioCtx) return;
			var ctx = new AudioCtx();
			var now = ctx.currentTime;

			var osc1 = ctx.createOscillator();
			var gain1 = ctx.createGain();
			osc1.type = 'sine';
			osc1.frequency.setValueAtTime(587.33, now); // D5
			gain1.gain.setValueAtTime(0.3, now);
			gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
			osc1.connect(gain1);
			gain1.connect(ctx.destination);
			osc1.start(now);
			osc1.stop(now + 0.4);

			var osc2 = ctx.createOscillator();
			var gain2 = ctx.createGain();
			osc2.type = 'sine';
			osc2.frequency.setValueAtTime(880, now + 0.25); // A5
			gain2.gain.setValueAtTime(0.4, now + 0.25);
			gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
			osc2.connect(gain2);
			gain2.connect(ctx.destination);
			osc2.start(now + 0.25);
			osc2.stop(now + 0.8);
		} catch(e) {
			console.error("Audio error:", e);
		}
	}

	function handleGlobalQueueUpdate(data) {
		gPending.forEach(function(appt) {
			if (appt.doctorId == data.doctorId && appt.appointmentDate === data.appointmentDate) {
				if (data.currentServingToken === appt.tokenNo) {
					var nKey = appt.doctorId + "-" + appt.tokenNo;
					if (!notifiedSet[nKey]) {
						notifiedSet[nKey] = true;

						// Play chime sound
						playNotificationChime();

						// Show Bootstrap Toast
						var toastEl = document.getElementById("queueCallToast");
						var toastMsg = document.getElementById("queueToastText");
						if (toastEl && toastMsg) {
							toastMsg.innerText = "YOUR TURN! Token #" + appt.tokenNo + " is now being served!";
							var bsToast = new bootstrap.Toast(toastEl, { delay: 15000 });
							bsToast.show();
						}

						// Native Browser Notification
						if ("Notification" in window && Notification.permission === "granted") {
							new Notification("Iryotek Appointment Call", {
								body: "Token #" + appt.tokenNo + " is now being served! Please proceed to the doctor's room.",
								icon: "img/favicon.png"
							});
						}
					}
				}
			}
		});

		if (typeof updateLiveTrackers === "function") {
			updateLiveTrackers(data);
		}
	}
})();
</script>
</c:if>
