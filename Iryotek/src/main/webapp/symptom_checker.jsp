<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page isELIgnored="false"%>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sakura AI Support | Iryotek Healthcare</title>
<%@include file="component/allcss.jsp"%>

<style type="text/css">
:root {
	--chat-theme-blue: #0284c7;
	--chat-theme-blue-dark: #0369a1;
	--chat-theme-coral: #ff5e3a;
	--chat-theme-coral-dark: #e04b28;
	--chat-bg-canvas: #f1f5f9;
	--chat-window-bg: #ffffff;
	--chat-border: #e2e8f0;
	--chat-text-main: #1e293b;
	--chat-text-muted: #64748b;
}

body {
	background-color: var(--chat-bg-canvas) !important;
	font-family: 'Rubik', 'Outfit', system-ui, -apple-system, sans-serif;
	margin: 0;
	padding: 0;
	overflow-x: hidden;
}

/* Chat Support Main Container */
.chat-support-layout {
	max-width: 920px;
	margin: 18px auto 25px auto;
	padding: 0 16px;
	height: calc(100vh - 175px);
	min-height: 540px;
	display: flex;
	flex-direction: column;
}

@media (max-width: 768px) {
	.chat-support-layout {
		margin: 8px auto;
		padding: 0 8px;
		height: calc(100vh - 140px);
	}
}

/* Chat Window Frame */
.chat-window {
	flex: 1;
	background: var(--chat-window-bg);
	border-radius: 18px;
	border: 1px solid var(--chat-border);
	box-shadow: 0 10px 35px rgba(15, 23, 42, 0.08);
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

/* 1. Header (Simple Chat Support Header) */
.chat-top-header {
	background: #0f172a;
	color: #ffffff;
	padding: 14px 20px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	flex-shrink: 0;
}

.chat-agent-profile {
	display: flex;
	align-items: center;
	gap: 12px;
}

.chat-avatar-frame {
	position: relative;
	width: 44px;
	height: 44px;
	border-radius: 50%;
	background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.35rem;
	box-shadow: 0 3px 10px rgba(255, 117, 140, 0.4);
	flex-shrink: 0;
}

.online-pulse-dot {
	position: absolute;
	bottom: 1px;
	right: 1px;
	width: 11px;
	height: 11px;
	background-color: #22c55e;
	border: 2px solid #0f172a;
	border-radius: 50%;
}

.agent-meta-name {
	margin: 0;
	font-size: 1.05rem;
	font-weight: 700;
	color: #ffffff;
	line-height: 1.2;
}

.agent-meta-status {
	font-size: 0.78rem;
	color: #94a3b8;
	margin: 0;
	display: flex;
	align-items: center;
	gap: 5px;
}

.chat-header-btns {
	display: flex;
	align-items: center;
	gap: 10px;
}

.header-action-btn {
	background: rgba(255, 255, 255, 0.1);
	color: #ffffff;
	border: 1px solid rgba(255, 255, 255, 0.15);
	padding: 6px 14px;
	border-radius: 20px;
	font-size: 0.82rem;
	font-weight: 600;
	cursor: pointer;
	text-decoration: none;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	transition: all 0.2s ease;
}

.header-action-btn:hover {
	background: rgba(255, 255, 255, 0.2);
	color: #ffffff;
}

.header-action-btn.book {
	background: #ff5e3a;
	border-color: #ff5e3a;
}

.header-action-btn.book:hover {
	background: #e04b28;
	border-color: #e04b28;
}

/* 2. Messages Body */
.chat-messages-scroll {
	flex: 1;
	overflow-y: auto;
	padding: 20px;
	background-color: #f8fafc;
	background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px);
	background-size: 22px 22px;
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.chat-date-tag {
	text-align: center;
	margin: 2px 0 10px 0;
}

.chat-date-tag span {
	background: #e2e8f0;
	color: #475569;
	font-size: 0.72rem;
	font-weight: 700;
	padding: 4px 14px;
	border-radius: 12px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.message-row {
	display: flex;
	align-items: flex-end;
	gap: 10px;
	margin-bottom: 2px;
}

.message-row.user {
	justify-content: flex-end;
}

.message-row.bot {
	justify-content: flex-start;
}

.bot-avatar-mini {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.95rem;
	flex-shrink: 0;
	box-shadow: 0 2px 6px rgba(255, 117, 140, 0.3);
}

/* Message Bubbles */
.chat-bubble {
	max-width: 82%;
	padding: 12px 18px;
	font-size: 0.94rem;
	line-height: 1.6;
	word-wrap: break-word;
	position: relative;
}

/* Bot Message Bubble (Clean White, crisp dark text) */
.chat-bubble.bot {
	background: #ffffff;
	color: #1e293b;
	border-radius: 18px 18px 18px 4px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	border: 1px solid #e2e8f0;
}

/* User Message Bubble (Vibrant High-Contrast Blue with PURE WHITE text) */
.chat-bubble.user {
	background: #0284c7 !important;
	color: #ffffff !important;
	border-radius: 18px 18px 4px 18px;
	box-shadow: 0 3px 10px rgba(2, 132, 199, 0.3);
	font-weight: 500;
}

.chat-bubble.user * {
	color: #ffffff !important;
}

.chat-bubble-time {
	display: block;
	font-size: 0.7rem;
	margin-top: 6px;
	text-align: right;
	opacity: 0.75;
}

.chat-bubble.user .chat-bubble-time {
	color: #e0f2fe;
}

.chat-bubble.bot .chat-bubble-time {
	color: #94a3b8;
}

/* Recommended Specialist Card (inside bot reply) */
.specialist-recommend-card {
	background: #f0fdf4;
	border: 1.5px solid #86efac;
	border-radius: 12px;
	padding: 12px 16px;
	margin-top: 12px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 10px;
}

.specialist-info-text {
	font-size: 0.85rem;
	color: #166534;
}

.specialist-info-text strong {
	font-size: 0.95rem;
	color: #14532d;
	display: block;
}

.btn-book-dept {
	background: #16a34a;
	color: #ffffff !important;
	padding: 6px 14px;
	border-radius: 20px;
	font-size: 0.8rem;
	font-weight: 700;
	text-decoration: none;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	transition: background 0.2s;
}

.btn-book-dept:hover {
	background: #15803d;
	color: #ffffff !important;
}

/* Triage Urgency Badges */
.triage-badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 4px 12px;
	border-radius: 14px;
	font-size: 0.8rem;
	font-weight: 700;
	margin-bottom: 10px;
}

.triage-emergency {
	background-color: #fee2e2;
	color: #b91c1c;
	border: 1px solid #fca5a5;
}

.triage-urgent {
	background-color: #ffedd5;
	color: #c2410c;
	border: 1px solid #fdba74;
}

.triage-routine {
	background-color: #fef9c3;
	color: #854d0e;
	border: 1px solid #fde047;
}

.triage-monitor {
	background-color: #dcfce7;
	color: #15803d;
	border: 1px solid #86efac;
}

/* Emergency Alert Banner */
.emergency-alert-card {
	background: linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%);
	border: 2px solid #ef4444;
	border-radius: 14px;
	padding: 14px 16px;
	margin-top: 12px;
	text-align: center;
}

.emergency-alert-card .btn-emergency-call {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	background: #dc2626;
	color: #ffffff !important;
	font-size: 0.88rem;
	font-weight: 700;
	padding: 8px 18px;
	border-radius: 24px;
	text-decoration: none;
	margin-top: 8px;
	box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);
	transition: transform 0.2s ease;
}

.emergency-alert-card .btn-emergency-call:hover {
	transform: scale(1.03);
	background: #b91c1c;
}

/* Doctor Recommendations Box */
.suggested-doctors-container {
	background: #f8fafc;
	border: 1.5px solid #e2e8f0;
	border-radius: 14px;
	padding: 12px 14px;
	margin-top: 12px;
}

.suggested-doctor-card {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 10px;
	padding: 10px 14px;
	margin-top: 8px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.suggested-doctor-card .doc-title {
	font-weight: 700;
	color: #0f172a;
	font-size: 0.9rem;
}

.suggested-doctor-card .doc-detail {
	font-size: 0.78rem;
	color: #64748b;
}

.btn-doc-book-card {
	background: #0284c7;
	color: #ffffff !important;
	font-size: 0.8rem;
	font-weight: 600;
	padding: 6px 14px;
	border-radius: 18px;
	text-decoration: none;
	white-space: nowrap;
	transition: background-color 0.2s;
}

.btn-doc-book-card:hover {
	background: #0369a1;
}

/* Typing Indicator */
.typing-indicator-box {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: #ffffff;
	padding: 10px 16px;
	border-radius: 18px 18px 18px 4px;
	border: 1px solid #e2e8f0;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.typing-dot {
	width: 7px;
	height: 7px;
	background: #94a3b8;
	border-radius: 50%;
	animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
	0%, 60%, 100% { transform: translateY(0); }
	30% { transform: translateY(-6px); background: #0284c7; }
}

/* 3. Quick Chips Row */
.chat-suggestions-bar {
	background: #ffffff;
	padding: 8px 16px;
	border-top: 1px solid #f1f5f9;
	display: flex;
	gap: 8px;
	overflow-x: auto;
	scrollbar-width: none;
	flex-shrink: 0;
}

.chat-suggestions-bar::-webkit-scrollbar {
	display: none;
}

.suggestion-chip {
	background: #f8fafc;
	color: #334155;
	border: 1px solid #cbd5e1;
	border-radius: 20px;
	padding: 6px 14px;
	font-size: 0.82rem;
	font-weight: 500;
	cursor: pointer;
	white-space: nowrap;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	transition: all 0.2s ease;
}

.suggestion-chip:hover {
	background: #0284c7;
	color: #ffffff;
	border-color: #0284c7;
	transform: translateY(-1px);
}

/* 4. Chat Input Dock (Clean WhatsApp / Crisp Messenger style) */
.chat-input-dock {
	background: #ffffff;
	padding: 12px 18px;
	border-top: 1px solid #e2e8f0;
	flex-shrink: 0;
}

.chat-input-group {
	display: flex;
	align-items: center;
	gap: 10px;
	background: #f8fafc;
	border: 1.5px solid #cbd5e1;
	border-radius: 28px;
	padding: 4px 6px 4px 18px;
	transition: all 0.2s ease;
}

.chat-input-group:focus-within {
	background: #ffffff;
	border-color: #0284c7;
	box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}

.chat-input-field {
	flex: 1;
	border: none;
	background: transparent;
	font-size: 0.95rem;
	color: #0f172a;
	outline: none;
	padding: 10px 0;
}

.chat-input-field::placeholder {
	color: #94a3b8;
}

/* Guaranteed Visible Send Button with High Contrast */
.chat-send-btn {
	width: 44px !important;
	height: 44px !important;
	min-width: 44px !important;
	border-radius: 50% !important;
	background: #0284c7 !important;
	border: none !important;
	color: #ffffff !important;
	display: flex !important;
	align-items: center !important;
	justify-content: center !important;
	cursor: pointer !important;
	box-shadow: 0 3px 10px rgba(2, 132, 199, 0.35) !important;
	transition: all 0.2s ease !important;
}

.chat-send-btn:hover {
	background: #0369a1 !important;
	transform: scale(1.06) !important;
}

.chat-send-btn:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none;
}

.chat-disclaimer {
	text-align: center;
	font-size: 0.72rem;
	color: #94a3b8;
	margin-top: 8px;
	margin-bottom: 0;
}
</style>
</head>
<body>
	<%@include file="component/navbar.jsp"%>

	<div class="chat-support-layout">
		<div class="chat-window">
			<!-- Header -->
			<div class="chat-top-header">
				<div class="chat-agent-profile">
					<div class="chat-avatar-frame">
						🌸
						<div class="online-pulse-dot"></div>
					</div>
					<div>
						<div class="agent-meta-name">Iryotek Support</div>
						<div class="agent-meta-status">
							<i class="fa-solid fa-circle text-success" style="font-size: 7px;"></i> Powered by Sakura Agent
						</div>
					</div>
				</div>

				<div class="chat-header-btns">
					<a href="user_appointment.jsp" class="header-action-btn book">
						<i class="fa-solid fa-calendar-check"></i> Book Doctor
					</a>
					<button type="button" class="header-action-btn" onclick="resetChat()" title="Clear Chat">
						<i class="fa-solid fa-trash-can"></i>
					</button>
				</div>
			</div>

			<!-- Messages Scroll Body -->
			<div class="chat-messages-scroll" id="chatStream">
				<div class="chat-date-tag">
					<span>Today</span>
				</div>

				<!-- Sakura Welcome Message -->
				<div class="message-row bot">
					<div class="bot-avatar-mini">🌸</div>
					<div class="chat-bubble bot">
						Hello! I am <strong>Sakura</strong>, your AI Healthcare Support Assistant. 🌸<br><br>
						How are you feeling today? You can describe any symptoms, pain, or health concerns you have. I'll provide a helpful clinical triage assessment and connect you with the right doctor or department.
						<span class="chat-bubble-time" id="greetingTime">Just now</span>
					</div>
				</div>
			</div>

			<!-- Quick Suggestions Bar -->
			<div class="chat-suggestions-bar">
				<button type="button" class="suggestion-chip" onclick="sendSuggestion('I have mild fever, sore throat and cold')">
					<span>🤒</span> Fever & Sore Throat
				</button>
				<button type="button" class="suggestion-chip" onclick="sendSuggestion('I have severe left knee pain and swelling after running')">
					<span>🦵</span> Knee Pain & Swelling
				</button>
				<button type="button" class="suggestion-chip" onclick="sendSuggestion('I have severe chest tightness and rapid pulse')">
					<span>❤️</span> Chest Tightness
				</button>
				<button type="button" class="suggestion-chip" onclick="sendSuggestion('I have throbbing headache on right side with nausea')">
					<span>🤕</span> Migraine & Headache
				</button>
				<button type="button" class="suggestion-chip" onclick="sendSuggestion('I have itchy red skin rashes on my arms')">
					<span>✨</span> Skin Allergy
				</button>
				<button type="button" class="suggestion-chip" onclick="sendSuggestion('I want to consult a doctor at Iryotek')">
					<span>📅</span> Book Consultation
				</button>
			</div>

			<!-- Footer Input Dock -->
			<div class="chat-input-dock">
				<div class="chat-input-group">
					<input type="text" id="chatInput" class="chat-input-field" placeholder="Type your message or symptoms here..." onkeypress="onInputKeyPress(event)" autocomplete="off" autofocus>
					<button type="button" id="sendBtn" class="chat-send-btn" onclick="sendUserMessage()" title="Send Message">
						<!-- Material Design Solid Paper Plane SVG (100% Guaranteed Visibility) -->
						<svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" style="display: block; margin-left: 2px;">
							<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
						</svg>
					</button>
				</div>
				<p class="chat-disclaimer">
					<i class="fa-solid fa-shield-halved me-1"></i> Sakura provides AI healthcare triage guidance. In life-threatening emergencies, call emergency services immediately.
				</p>
			</div>
		</div>
	</div>

	<script type="text/javascript">
		var chatStream = document.getElementById("chatStream");
		var chatInput = document.getElementById("chatInput");
		var sendBtn = document.getElementById("sendBtn");

		function getFormattedTime() {
			var now = new Date();
			return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		}

		document.getElementById("greetingTime").innerText = getFormattedTime();

		function onInputKeyPress(e) {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				sendUserMessage();
			}
		}

		function sendSuggestion(text) {
			chatInput.value = text;
			sendUserMessage();
		}

		function resetChat() {
			// Notify backend to clear session conversation memory
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "aiSymptomCheck", true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.send("message=__reset__");

			chatStream.innerHTML = 
				'<div class="chat-date-tag"><span>Today</span></div>' +
				'<div class="message-row bot">' +
				'  <div class="bot-avatar-mini">🌸</div>' +
				'  <div class="chat-bubble bot">' +
				'    Hello! I am <strong>Sakura</strong>, your AI Healthcare Support Assistant at Iryotek Hospital. 🌸 How can I help you today?' +
				'    <span class="chat-bubble-time">' + getFormattedTime() + '</span>' +
				'  </div>' +
				'</div>';
			chatInput.focus();
		}

		function formatMarkdown(text) {
			if (!text) return "";
			return text
				.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
				.replace(/### (.*?)(?:\n|$)/g, '<div class="fw-bold text-dark mt-2 mb-1" style="font-size: 0.98rem;">$1</div>')
				.replace(/## (.*?)(?:\n|$)/g, '<div class="fw-bold text-dark mt-2 mb-1" style="font-size: 1.05rem;">$1</div>')
				.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
				.replace(/\*(.*?)\*/g, '<em>$1</em>')
				.replace(/^\* (.*?)(?:\n|$)/gm, '<div class="ms-2 mb-1">• $1</div>')
				.replace(/^• (.*?)(?:\n|$)/gm, '<div class="ms-2 mb-1">• $1</div>')
				.replace(/STEP (\d+):\s*(.*?)(?:\n|$)/g, '<div class="fw-bold text-primary mt-2 mb-1" style="font-size: 0.92rem;"><i class="fa-solid fa-angle-right me-1"></i> STEP $1: $2</div>')
				.replace(/\n\n/g, '<div class="my-2"></div>')
				.replace(/\n/g, '<br>');
		}

		function sendUserMessage() {
			var text = chatInput.value.trim();
			if (!text) return;

			// Append User Bubble
			appendUserMessageBubble(text);
			chatInput.value = "";
			chatInput.disabled = true;
			sendBtn.disabled = true;

			// Append Typing Indicator
			var typingEl = appendTypingIndicator();
			scrollChatToBottom();

			// AJAX call to servlet
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "aiSymptomCheck", true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (typingEl) typingEl.remove();

					chatInput.disabled = false;
					sendBtn.disabled = false;
					chatInput.focus();

					if (xhr.status === 200) {
						try {
							var res = JSON.parse(xhr.responseText);
							appendBotMessageBubble(res);
						} catch (e) {
							console.error(e);
							appendPlainBotMessage("Sorry, I had trouble processing that response. Please try again.");
						}
					} else {
						appendPlainBotMessage("Sorry, I am unable to connect to the server right now. Please check your network connection.");
					}
					scrollChatToBottom();
				}
			};
			xhr.send("message=" + encodeURIComponent(text));
		}

		function appendUserMessageBubble(text) {
			var row = document.createElement("div");
			row.className = "message-row user";

			var bubble = document.createElement("div");
			bubble.className = "chat-bubble user";

			var safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
			bubble.innerHTML = safeText + '<span class="chat-bubble-time">' + getFormattedTime() + ' ✓✓</span>';

			row.appendChild(bubble);
			chatStream.appendChild(row);
			scrollChatToBottom();
		}

		function appendPlainBotMessage(text) {
			var row = document.createElement("div");
			row.className = "message-row bot";

			var avatar = document.createElement("div");
			avatar.className = "bot-avatar-mini";
			avatar.innerText = "🌸";

			var bubble = document.createElement("div");
			bubble.className = "chat-bubble bot";
			bubble.innerHTML = text + '<span class="chat-bubble-time">' + getFormattedTime() + '</span>';

			row.appendChild(avatar);
			row.appendChild(bubble);
			chatStream.appendChild(row);
			scrollChatToBottom();
		}

		function appendBotMessageBubble(res) {
			var row = document.createElement("div");
			row.className = "message-row bot";

			var avatar = document.createElement("div");
			avatar.className = "bot-avatar-mini";
			avatar.innerText = "🌸";

			var bubble = document.createElement("div");
			bubble.className = "chat-bubble bot";

			var contentHtml = "";

			// 1. Triage Urgency Badge
			if (res.triageBadge && res.triageLevel) {
				var lvlClass = "triage-" + res.triageLevel.toLowerCase();
				contentHtml += '<div class="triage-badge ' + lvlClass + '">' + res.triageBadge + '</div>';
			}

			// 2. Formatted Markdown Body
			contentHtml += formatMarkdown(res.analysis);

			// 3. Emergency Alert Card
			if (res.isEmergency) {
				contentHtml += 
					'<div class="emergency-alert-card">' +
					'  <div class="fw-bold text-danger fs-6"><i class="fa-solid fa-triangle-exclamation me-1"></i> Immediate Medical Attention Needed</div>' +
					'  <div class="text-secondary small mt-1">Please call our 24/7 Trauma Desk or local emergency services right away:</div>' +
					'  <a href="tel:' + (res.emergencyHelpline || '+2025550191') + '" class="btn-emergency-call">' +
					'    <i class="fa-solid fa-phone me-1"></i> Call Emergency Desk (' + (res.emergencyHelpline || '+202-555-0191') + ')' +
					'  </a>' +
					'</div>';
			}

			// 4. Suggested Doctors from Live Database
			if (res.suggestedDoctors && res.suggestedDoctors.length > 0 && !res.isEmergency) {
				contentHtml += '<div class="suggested-doctors-container">';
				contentHtml += '  <div class="small fw-bold text-dark mb-2"><i class="fa-solid fa-user-doctor text-primary me-1"></i> Recommended ' + (res.specialty || '') + ' Doctors at Iryotek Hospital:</div>';
				for (var i = 0; i < res.suggestedDoctors.length; i++) {
					var doc = res.suggestedDoctors[i];
					contentHtml += 
						'<div class="suggested-doctor-card">' +
						'  <div>' +
						'    <div class="doc-title">' + doc.name + '</div>' +
						'    <div class="doc-detail">' + doc.qualification + ' &bull; OPD: ' + doc.timing + '</div>' +
						'  </div>' +
						'  <a href="user_appointment.jsp" class="btn-doc-book-card"><i class="fa-solid fa-calendar-plus me-1"></i> Book Appointment</a>' +
						'</div>';
				}
				contentHtml += '</div>';
			} else if (res.specialty && !res.isEmergency) {
				contentHtml += 
					'<div class="specialist-recommend-card">' +
					'  <div class="specialist-info-text">' +
					'    <span>Recommended Medical Department</span>' +
					'    <strong><i class="fa-solid fa-stethoscope me-1 text-success"></i> ' + res.specialty + '</strong>' +
					'  </div>' +
					'  <a href="user_appointment.jsp" class="btn-book-dept">' +
					'    <i class="fa-solid fa-calendar-plus"></i> Book Appointment' +
					'  </a>' +
					'</div>';
			}

			contentHtml += '<span class="chat-bubble-time">' + getFormattedTime() + '</span>';
			bubble.innerHTML = contentHtml;

			row.appendChild(avatar);
			row.appendChild(bubble);
			chatStream.appendChild(row);
			scrollChatToBottom();
		}

		function appendTypingIndicator() {
			var row = document.createElement("div");
			row.className = "message-row bot";
			row.id = "typingIndicatorRow";

			var avatar = document.createElement("div");
			avatar.className = "bot-avatar-mini";
			avatar.innerText = "🌸";

			var bubble = document.createElement("div");
			bubble.className = "typing-indicator-box";
			bubble.innerHTML = '<span style="font-size: 0.8rem; color: #64748b; margin-right: 6px;">Sakura is typing</span><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

			row.appendChild(avatar);
			row.appendChild(bubble);
			chatStream.appendChild(row);
			return row;
		}

		function scrollChatToBottom() {
			chatStream.scrollTop = chatStream.scrollHeight;
		}
	</script>
</body>
</html>
