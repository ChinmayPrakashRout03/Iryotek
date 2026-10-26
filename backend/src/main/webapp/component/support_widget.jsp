<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<!-- Floating Circular AI Support Assistant Icon (FAB) -->
<div class="floating-ai-support-trigger">
	<button type="button" class="btn-ai-support-fab" onclick="toggleSupportWidget()" title="Sakura AI Support Assistant">
		<i class="fa-solid fa-headset"></i>
	</button>
</div>

<!-- Support Chat Widget Overlay -->
<div id="supportWidgetPopup" class="support-widget-popup">

	<!-- 1. HOME VIEW (Screenshot 1 Match) -->
	<div id="supportHomeView" class="support-view-container active">
		<div class="support-blue-banner">
			<button type="button" class="support-close-btn" onclick="toggleSupportWidget()">
				<i class="fa-solid fa-xmark"></i>
			</button>
			<div class="mt-4 text-center">
				<h5 class="fw-bold text-white px-3 mt-3 mb-4" style="line-height: 1.4; font-size: 1.15rem;">
					Iryotek Support is online and ready to assist you right away. 🌸
				</h5>
			</div>
			
			<div class="support-new-card" onclick="openChatThread()">
				<div>
					<div class="fw-bold text-dark fs-6 mb-1">Iryotek Support</div>
					<div class="text-secondary fs-7">Powered by Sakura Agent</div>
				</div>
				<div class="support-send-icon">
					<i class="fa-solid fa-paper-plane" style="color: #0288d1;"></i>
				</div>
			</div>
		</div>
	</div>

	<!-- 2. MESSAGES VIEW (Screenshot 2 Match) -->
	<div id="supportMessagesView" class="support-view-container d-none">
		<div class="support-header-band">
			<div class="d-flex align-items-center gap-2">
				<i class="fa-solid fa-chevron-left cursor-pointer me-1" onclick="switchSupportTab('home')"></i>
				<span class="fw-bold fs-5 text-white">Messages</span>
			</div>
			<i class="fa-solid fa-xmark cursor-pointer fs-5" onclick="toggleSupportWidget()"></i>
		</div>

		<div class="support-body-content">
			<h6 class="fw-bold text-dark mb-3">Start a new chat</h6>
			<div class="support-new-card-bordered" onclick="openChatThread()">
				<div>
					<div class="fw-bold text-dark fs-6 mb-1">Iryotek Support</div>
					<div class="text-muted fs-7">Powered by Sakura Agent</div>
				</div>
				<div class="support-send-icon">
					<i class="fa-solid fa-paper-plane" style="color: #0288d1;"></i>
				</div>
			</div>

			<h6 class="fw-bold text-dark mb-3">Recent</h6>
			<div class="support-recent-item" onclick="openChatThread()">
				<div class="w-100">
					<div class="d-flex justify-content-between align-items-center mb-1">
						<span class="text-muted fs-7 fw-semibold">Iryotek Support</span>
						<span class="text-muted fs-7">now</span>
					</div>
					<div class="d-flex justify-content-between align-items-center">
						<span class="fw-bold text-dark fs-7">Have symptoms or healthcare questions? Let's chat!</span>
						<i class="fa-solid fa-chevron-right text-muted fs-7 ms-2"></i>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 3. LIVE CHAT CONVERSATION THREAD -->
	<div id="supportChatThreadView" class="support-view-container d-none">
		<div class="support-header-band">
			<div class="d-flex align-items-center gap-2">
				<i class="fa-solid fa-chevron-left cursor-pointer me-1" onclick="switchSupportTab('messages')"></i>
				<div>
					<div class="fw-bold fs-6 text-white leading-tight">Iryotek Support</div>
					<div class="fs-8 text-white-50"><i class="fa-solid fa-circle text-success fs-9 me-1"></i> Powered by Sakura Agent</div>
				</div>
			</div>
			<i class="fa-solid fa-xmark cursor-pointer fs-5" onclick="toggleSupportWidget()"></i>
		</div>

		<div class="support-ai-disclaimer">
			<i class="fa-solid fa-shield-halved text-primary"></i>
			<span>AI Healthcare Assistant &bull; Not a substitute for a licensed doctor or ER</span>
		</div>

		<div id="chatMessagesBox" class="support-chat-messages">
			<div class="chat-bubble bot-bubble">
				Hello! I am <strong>Sakura</strong>, your AI Healthcare Support Assistant. 🌸 How can I help you today?
			</div>
			<div class="chat-options-group" id="chatInitialOptions">
				<button type="button" class="chat-opt-btn" onclick="sendQuickMsg('Book an Appointment')">📅 Book Appointment</button>
				<button type="button" class="chat-opt-btn" onclick="sendQuickMsg('AI Symptom Checker')">🤖 AI Symptom Checker</button>
				<button type="button" class="chat-opt-btn" onclick="sendQuickMsg('Hospital Working Hours')">🕒 Hospital Hours</button>
				<button type="button" class="chat-opt-btn" onclick="selectOthersOption()">💬 Others</button>
			</div>
		</div>

		<div class="support-chat-input-bar">
			<input type="text" id="chatInputText" placeholder="Select an option above, or tap 'Others' to type..." disabled onkeypress="if(event.key === 'Enter') sendChatMessage()">
			<button type="button" id="chatSendBtn" disabled onclick="sendChatMessage()" title="Send Message">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff" style="display: block; margin-left: 1px;">
					<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
				</svg>
			</button>
		</div>
	</div>

	<!-- BOTTOM TAB NAVIGATION BAR -->
	<div class="support-bottom-tabs">
		<button type="button" id="tabHomeBtn" class="support-tab-btn active" onclick="switchSupportTab('home')">
			<div class="tab-icon-box">
				<i class="fa-solid fa-house"></i>
			</div>
		</button>
		<button type="button" id="tabMsgBtn" class="support-tab-btn" onclick="switchSupportTab('messages')">
			<div class="tab-icon-box">
				<i class="fa-regular fa-comment-dots"></i>
			</div>
		</button>
	</div>
</div>

<style>
/* Floating Circular AI Support Assistant Icon (FAB) */
.floating-ai-support-trigger {
	position: fixed;
	bottom: 25px;
	right: 25px;
	z-index: 10400;
}

.btn-ai-support-fab {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	background: linear-gradient(135deg, #0288d1 0%, #0277bd 100%);
	color: #ffffff;
	border: none;
	outline: none;
	box-shadow: 0 8px 25px rgba(2, 136, 209, 0.45);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.5rem;
	cursor: pointer;
	position: relative;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-ai-support-fab:hover {
	transform: scale(1.08) translateY(-2px);
	box-shadow: 0 12px 30px rgba(2, 136, 209, 0.6);
	background: linear-gradient(135deg, #039be5 0%, #0288d1 100%);
}

.ai-badge-pulse {
	position: absolute;
	top: -3px;
	right: -3px;
	width: 22px;
	height: 22px;
	background-color: #ff5e3a;
	color: #ffffff;
	border-radius: 50%;
	font-size: 0.72rem;
	font-weight: 800;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px solid #ffffff;
	box-shadow: 0 2px 8px rgba(255, 94, 58, 0.5);
	animation: badgePulse 1.8s infinite;
}

@keyframes badgePulse {
	0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 94, 58, 0.7); }
	70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 94, 58, 0); }
	100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 94, 58, 0); }
}

/* Floating Support Widget Styles */
.support-widget-popup {
	position: fixed;
	bottom: 80px;
	right: 20px;
	width: 370px;
	max-width: calc(100vw - 30px);
	height: 530px;
	max-height: 82vh;
	background: #ffffff;
	border-radius: 20px;
	box-shadow: 0 15px 45px rgba(0, 0, 0, 0.25);
	z-index: 10500;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	opacity: 0;
	transform: translateY(20px) scale(0.95);
	pointer-events: none;
}

@media (max-width: 576px) {
	.support-widget-popup {
		right: 12px !important;
		left: 12px !important;
		width: auto !important;
		max-width: none !important;
		bottom: 75px !important;
		height: 80vh !important;
		max-height: 580px !important;
		border-radius: 16px !important;
	}
	.floating-ai-support-trigger {
		bottom: 18px !important;
		right: 18px !important;
	}
	.btn-ai-support-fab {
		width: 52px !important;
		height: 52px !important;
		font-size: 1.3rem !important;
	}
}

.support-widget-popup.active {
	opacity: 1;
	transform: translateY(0) scale(1);
	pointer-events: all;
}

.support-view-container {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

/* Home View Blue Banner */
.support-blue-banner {
	background: #0288d1;
	background: linear-gradient(180deg, #0288d1 0%, #0277bd 100%);
	padding: 24px 20px;
	color: #ffffff;
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	position: relative;
}

.support-close-btn {
	position: absolute;
	top: 15px;
	right: 18px;
	background: transparent;
	border: none;
	color: #ffffff;
	font-size: 1.2rem;
	cursor: pointer;
	opacity: 0.9;
	transition: opacity 0.2s;
}

.support-close-btn:hover {
	opacity: 1;
}

/* White New Conversation Card */
.support-new-card {
	background: #ffffff;
	border-radius: 16px;
	padding: 20px;
	color: #1e293b;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	margin-top: 10px;
	transition: transform 0.2s ease;
}

.support-new-card:hover {
	transform: translateY(-2px);
}

.support-new-card-bordered {
	background: #ffffff;
	border: 2px solid #0288d1;
	border-radius: 16px;
	padding: 18px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	margin-bottom: 25px;
	transition: background-color 0.2s;
}

.support-new-card-bordered:hover {
	background-color: #f0f9ff;
}

/* Header Band */
.support-header-band {
	background-color: #0288d1;
	color: #ffffff;
	padding: 16px 20px;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

/* Messages Body */
.support-body-content {
	padding: 22px 20px;
	flex-grow: 1;
	overflow-y: auto;
}

.support-recent-item {
	padding: 12px 0;
	border-bottom: 1px solid #f1f5f9;
	cursor: pointer;
	transition: opacity 0.2s;
}

.support-recent-item:hover {
	opacity: 0.85;
}

/* Chat Messages */
.support-chat-messages {
	flex-grow: 1;
	padding: 18px;
	overflow-y: auto;
	background-color: #f8fafc;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.chat-bubble {
	max-width: 82%;
	padding: 12px 16px;
	border-radius: 16px;
	font-size: 0.88rem;
	line-height: 1.5;
}

.bot-bubble {
	background-color: #ffffff;
	color: #1e293b;
	align-self: flex-start;
	border-bottom-left-radius: 4px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.user-bubble {
	background-color: #0288d1 !important;
	color: #ffffff !important;
	align-self: flex-end;
	border-bottom-right-radius: 4px;
	font-weight: 500;
	box-shadow: 0 3px 10px rgba(2, 136, 209, 0.25);
}

.user-bubble * {
	color: #ffffff !important;
}

.chat-options-group {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-top: 6px;
}

.chat-opt-btn {
	background-color: #ffffff;
	border: 1.5px solid #0288d1;
	color: #0288d1;
	border-radius: 20px;
	padding: 8px 16px;
	font-size: 0.85rem;
	font-weight: 600;
	text-align: left;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	gap: 8px;
}

.chat-opt-btn:hover {
	background-color: #0288d1;
	color: #ffffff;
}

/* Input Bar */
.support-chat-input-bar {
	display: flex;
	align-items: center;
	padding: 10px 14px;
	background: #ffffff;
	border-top: 1px solid #eef2f7;
	gap: 10px;
}

.support-chat-input-bar input {
	flex-grow: 1;
	border: 1px solid #cbd5e1;
	border-radius: 20px;
	padding: 8px 16px;
	font-size: 0.88rem;
	outline: none;
	transition: all 0.2s ease;
}

.support-chat-input-bar input:focus {
	border-color: #0288d1;
	box-shadow: 0 0 0 2px rgba(2, 136, 209, 0.15);
}

.support-chat-input-bar input:disabled {
	background-color: #f8fafc;
	color: #94a3b8;
	cursor: not-allowed;
	border-color: #e2e8f0;
}

.support-chat-input-bar button {
	background: #0288d1;
	color: #ffffff;
	border: none;
	width: 38px;
	height: 38px;
	min-width: 38px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
}

.support-chat-input-bar button:hover:not(:disabled) {
	background: #0277bd;
	transform: scale(1.05);
}

.support-chat-input-bar button:disabled {
	opacity: 0.45;
	cursor: not-allowed;
	background-color: #94a3b8;
	transform: none;
}

/* Bottom Navigation Tabs matching screenshots */
.support-bottom-tabs {
	background: #ffffff;
	border-top: 1px solid #e2e8f0;
	padding: 10px 0;
	display: flex;
	justify-content: space-around;
	align-items: center;
	height: 60px;
}

.support-tab-btn {
	background: transparent;
	border: none;
	cursor: pointer;
	padding: 0;
}

.tab-icon-box {
	width: 44px;
	height: 36px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.2rem;
	color: #64748b;
	transition: all 0.2s ease;
}

.support-tab-btn.active .tab-icon-box {
	border: 2px solid #0288d1;
	color: #0288d1;
}

.cursor-pointer {
	cursor: pointer;
}

.fs-8 { font-size: 0.78rem; }
.fs-9 { font-size: 0.65rem; }

/* AI Clinical Support Styles */
.support-ai-disclaimer {
	background: #f1f5f9;
	border-bottom: 1px solid #e2e8f0;
	padding: 5px 12px;
	font-size: 0.71rem;
	color: #64748b;
	display: flex;
	align-items: center;
	gap: 6px;
	line-height: 1.3;
	font-weight: 500;
}

.support-triage-badge {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	padding: 3px 10px;
	border-radius: 12px;
	font-size: 0.75rem;
	font-weight: 700;
	margin-bottom: 8px;
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

.support-emergency-banner {
	background: linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%);
	border: 1.5px solid #ef4444;
	border-radius: 12px;
	padding: 10px 12px;
	margin-top: 10px;
	text-align: center;
}

.support-emergency-banner .btn-emergency-call {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: #dc2626;
	color: #ffffff !important;
	font-size: 0.8rem;
	font-weight: 700;
	padding: 6px 14px;
	border-radius: 20px;
	text-decoration: none;
	margin-top: 6px;
	box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);
	transition: transform 0.2s ease;
}

.support-emergency-banner .btn-emergency-call:hover {
	transform: scale(1.03);
	background: #b91c1c;
}

.support-doctors-box {
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 10px 12px;
	margin-top: 10px;
}

.support-doc-card {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 10px;
	padding: 8px 10px;
	margin-top: 6px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}

.support-doc-card .doc-name {
	font-size: 0.82rem;
	font-weight: 700;
	color: #0f172a;
}

.support-doc-card .doc-meta {
	font-size: 0.72rem;
	color: #64748b;
}

.btn-doc-book-mini {
	background: #0288d1;
	color: #ffffff !important;
	font-size: 0.74rem;
	font-weight: 600;
	padding: 4px 10px;
	border-radius: 14px;
	text-decoration: none;
	white-space: nowrap;
	transition: background-color 0.2s;
}

.btn-doc-book-mini:hover {
	background: #0277bd;
}

.visit-summary-box {
	background: #f0fdf4;
	border: 1px solid #bbf7d0;
	border-radius: 10px;
	padding: 10px 12px;
	margin-top: 10px;
	font-size: 0.82rem;
}
</style>

<script type="text/javascript">
function toggleSupportWidget() {
	var popup = document.getElementById("supportWidgetPopup");
	if (popup) {
		popup.classList.toggle("active");
	}
}

function switchSupportTab(tab) {
	var homeView = document.getElementById("supportHomeView");
	var msgView = document.getElementById("supportMessagesView");
	var chatView = document.getElementById("supportChatThreadView");
	var tabHomeBtn = document.getElementById("tabHomeBtn");
	var tabMsgBtn = document.getElementById("tabMsgBtn");

	if (tab === 'home') {
		homeView.classList.remove("d-none");
		msgView.classList.add("d-none");
		chatView.classList.add("d-none");
		tabHomeBtn.classList.add("active");
		tabMsgBtn.classList.remove("active");
	} else if (tab === 'messages') {
		homeView.classList.add("d-none");
		msgView.classList.remove("d-none");
		chatView.classList.add("d-none");
		tabHomeBtn.classList.remove("active");
		tabMsgBtn.classList.add("active");
	}
}

function openChatThread() {
	var homeView = document.getElementById("supportHomeView");
	var msgView = document.getElementById("supportMessagesView");
	var chatView = document.getElementById("supportChatThreadView");
	var tabHomeBtn = document.getElementById("tabHomeBtn");
	var tabMsgBtn = document.getElementById("tabMsgBtn");

	homeView.classList.add("d-none");
	msgView.classList.add("d-none");
	chatView.classList.remove("d-none");
	tabHomeBtn.classList.remove("active");
	tabMsgBtn.classList.add("active");
}

function sendChatMessage() {
	var input = document.getElementById("chatInputText");
	if (!input || input.disabled || !input.value.trim()) return;

	var msgText = input.value.trim();
	input.value = "";

	appendUserMessage(msgText);
	appendBotResponse(msgText);
}

function sendQuickMsg(msgText) {
	appendUserMessage(msgText);

	if (msgText === 'Book an Appointment') {
		setTimeout(function() {
			var box = document.getElementById("chatMessagesBox");
			if (!box) return;
			var botDiv = document.createElement("div");
			botDiv.className = "chat-bubble bot-bubble";
			botDiv.innerHTML = "I would be glad to help you schedule a doctor consultation! Would you like to proceed to our online booking desk?";
			box.appendChild(botDiv);

			var promptDiv = document.createElement("div");
			promptDiv.className = "chat-options-group mt-2";
			promptDiv.innerHTML = 
				'<button type="button" class="chat-opt-btn fw-bold text-success border-success" onclick="handleBookingChoice(true)"><i class="fa-solid fa-circle-check me-1"></i> Yes, Book Appointment</button>' +
				'<button type="button" class="chat-opt-btn text-secondary" onclick="handleBookingChoice(false)"><i class="fa-solid fa-circle-xmark me-1"></i> No, Thanks</button>';
			box.appendChild(promptDiv);
			box.scrollTop = box.scrollHeight;
		}, 250);
	} else if (msgText === 'Hospital Working Hours') {
		setTimeout(function() {
			var box = document.getElementById("chatMessagesBox");
			if (!box) return;
			var botDiv = document.createElement("div");
			botDiv.className = "chat-bubble bot-bubble";
			botDiv.innerHTML = "🏥 <strong>Iryotek Hospital Timings:</strong><br><br>" +
				"• <strong>Emergency & Trauma:</strong> Open 24/7 (365 days)<br>" +
				"• <strong>OPD Consultations:</strong> Monday - Saturday: 8:00 AM - 8:00 PM<br>" +
				"• <strong>Pharmacy & Diagnostics:</strong> Open 24/7<br><br>" +
				"Need anything else? You can tap <strong>Others</strong> to ask any question!";
			box.appendChild(botDiv);

			var promptDiv = document.createElement("div");
			promptDiv.className = "chat-options-group mt-2";
			promptDiv.innerHTML = 
				'<button type="button" class="chat-opt-btn" onclick="sendQuickMsg(\'Book an Appointment\')">📅 Book Appointment</button>' +
				'<button type="button" class="chat-opt-btn" onclick="selectOthersOption()">💬 Others (Type your query)</button>';
			box.appendChild(promptDiv);
			box.scrollTop = box.scrollHeight;
		}, 250);
	} else if (msgText === 'AI Symptom Checker') {
		enableChatInput("Describe your symptoms to Sakura...");
		setTimeout(function() {
			var box = document.getElementById("chatMessagesBox");
			if (!box) return;
			var botDiv = document.createElement("div");
			botDiv.className = "chat-bubble bot-bubble";
			botDiv.innerHTML = "I'm ready to check your symptoms! Please describe what you are experiencing below (e.g., headache, fever, cough, joint pain), and I'll provide a clinical triage assessment. 🌸";
			box.appendChild(botDiv);
			box.scrollTop = box.scrollHeight;
		}, 250);
	} else {
		appendBotResponse(msgText);
	}
}

function selectOthersOption() {
	appendUserMessage("Others");
	enableChatInput("Type your message...");

	setTimeout(function() {
		var box = document.getElementById("chatMessagesBox");
		if (!box) return;
		var botDiv = document.createElement("div");
		botDiv.className = "chat-bubble bot-bubble";
		botDiv.innerHTML = "Sure! Please type your question, symptoms, or what you need help with below, and I'll assist you right away. 🌸";
		box.appendChild(botDiv);
		box.scrollTop = box.scrollHeight;
	}, 250);
}

function enableChatInput(placeholderText) {
	var input = document.getElementById("chatInputText");
	var sendBtn = document.getElementById("chatSendBtn");
	if (input) {
		input.disabled = false;
		input.placeholder = placeholderText || "Type your message...";
		input.focus();
	}
	if (sendBtn) {
		sendBtn.disabled = false;
	}
}

function appendUserMessage(text) {
	var box = document.getElementById("chatMessagesBox");
	if (!box) return;

	var userDiv = document.createElement("div");
	userDiv.className = "chat-bubble user-bubble";
	userDiv.innerText = text;
	box.appendChild(userDiv);
	box.scrollTop = box.scrollHeight;
}

function appendBotResponse(query) {
	var box = document.getElementById("chatMessagesBox");
	if (!box) return;

	// Append typing indicator
	var typingDiv = document.createElement("div");
	typingDiv.className = "chat-bubble bot-bubble text-muted fs-8";
	typingDiv.id = "supportTypingBubble";
	typingDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> 🌸 Sakura AI is analyzing...';
	box.appendChild(typingDiv);
	box.scrollTop = box.scrollHeight;

	var xhr = new XMLHttpRequest();
	xhr.open("POST", "aiSymptomCheck", true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.timeout = 25000;
	xhr.ontimeout = function() {
		var typing = document.getElementById("supportTypingBubble");
		if (typing) typing.remove();
		var botDiv = document.createElement("div");
		botDiv.className = "chat-bubble bot-bubble";
		botDiv.innerHTML = '<span class="text-warning"><i class="fa-solid fa-clock me-1"></i> The request timed out. Please try asking again.</span>';
		box.appendChild(botDiv);
		box.scrollTop = box.scrollHeight;
	};
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			var typing = document.getElementById("supportTypingBubble");
			if (typing) typing.remove();

			if (xhr.status === 200) {
				try {
					var res = JSON.parse(xhr.responseText);
					var replyText = res.analysis || "I am Sakura, your AI clinical assistant at Iryotek Hospital.";

					var botDiv = document.createElement("div");
					botDiv.className = "chat-bubble bot-bubble";

					var bubbleHtml = "";

					// 1. Triage Urgency Badge
					if (res.triageBadge && res.triageLevel) {
						var lvlClass = "triage-" + res.triageLevel.toLowerCase();
						bubbleHtml += '<div class="support-triage-badge ' + lvlClass + '">' + res.triageBadge + '</div>';
					}

					// 2. Formatted Markdown Content
					bubbleHtml += formatWidgetMarkdown(replyText);

					// 3. Emergency Card
					if (res.isEmergency) {
						bubbleHtml += 
							'<div class="support-emergency-banner">' +
							'  <div class="fw-bold text-danger fs-7"><i class="fa-solid fa-triangle-exclamation me-1"></i> Immediate Medical Attention Needed</div>' +
							'  <div class="fs-8 text-secondary mt-1">Please call our 24/7 Trauma Desk or local emergency services:</div>' +
							'  <a href="tel:' + (res.emergencyHelpline || '+2025550191') + '" class="btn-emergency-call">' +
							'    <i class="fa-solid fa-phone me-1"></i> Call ' + (res.emergencyHelpline || '+202-555-0191') +
							'  </a>' +
							'</div>';
					}

					// 4. Suggested Doctors from Live Database
					if (res.suggestedDoctors && res.suggestedDoctors.length > 0 && !res.isEmergency && !query.toLowerCase().match(/^(hi|hello|hey|help)$/)) {
						bubbleHtml += '<div class="support-doctors-box">';
						bubbleHtml += '  <div class="fs-8 fw-bold text-dark mb-1"><i class="fa-solid fa-user-doctor text-primary me-1"></i> Recommended ' + (res.specialty || '') + ' Doctors:</div>';
						for (var i = 0; i < res.suggestedDoctors.length; i++) {
							var doc = res.suggestedDoctors[i];
							bubbleHtml += 
								'<div class="support-doc-card">' +
								'  <div class="doc-info">' +
								'    <div class="doc-name">' + doc.name + '</div>' +
								'    <div class="doc-meta">' + doc.qualification + ' &bull; ' + doc.timing + '</div>' +
								'  </div>' +
								'  <a href="user_appointment.jsp" class="btn-doc-book-mini"><i class="fa-solid fa-calendar-plus me-1"></i> Book</a>' +
								'</div>';
						}
						bubbleHtml += '</div>';
					}

					botDiv.innerHTML = bubbleHtml;
					box.appendChild(botDiv);

					// Inject interactive appointment booking prompt choice buttons
					if (replyText.toLowerCase().includes("book an appointment") || replyText.toLowerCase().includes("schedule an appointment")) {
						var promptDiv = document.createElement("div");
						promptDiv.className = "chat-options-group mt-2";
						promptDiv.innerHTML = 
							'<button type="button" class="chat-opt-btn fw-bold text-success border-success" onclick="handleBookingChoice(true)"><i class="fa-solid fa-circle-check me-1"></i> Yes, Book Appointment</button>' +
							'<button type="button" class="chat-opt-btn text-secondary" onclick="handleBookingChoice(false)"><i class="fa-solid fa-circle-xmark me-1"></i> No, Thanks</button>';
						box.appendChild(promptDiv);
					}
				} catch (e) {
					console.error(e);
					var botDiv = document.createElement("div");
					botDiv.className = "chat-bubble bot-bubble";
					botDiv.innerText = "I encountered an error parsing the medical response. Please ask again.";
					box.appendChild(botDiv);
				}
			} else if (xhr.status !== 0) {
				var botDiv = document.createElement("div");
				botDiv.className = "chat-bubble bot-bubble";
				botDiv.innerHTML = '<span class="text-danger"><i class="fa-solid fa-triangle-exclamation me-1"></i> Medical triage service is momentarily busy. Please try again.</span>';
				box.appendChild(botDiv);
			}
			box.scrollTop = box.scrollHeight;
		}
	};
	xhr.send("message=" + encodeURIComponent(query));
}

function formatWidgetMarkdown(text) {
	if (!text) return "";
	return text
		.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
		.replace(/### (.*?)(?:\n|$)/g, '<div class="fw-bold text-dark mt-2 mb-1" style="font-size: 0.93rem;">$1</div>')
		.replace(/## (.*?)(?:\n|$)/g, '<div class="fw-bold text-dark mt-2 mb-1" style="font-size: 0.98rem;">$1</div>')
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/^\* (.*?)(?:\n|$)/gm, '• $1<br>')
		.replace(/^• (.*?)(?:\n|$)/gm, '• $1<br>')
		.replace(/STEP (\d+):\s*(.*?)(?:\n|$)/g, '<div class="fw-bold text-primary mt-2 mb-1" style="font-size: 0.85rem;"><i class="fa-solid fa-angle-right me-1"></i> STEP $1: $2</div>')
		.replace(/\n\n/g, '<div class="my-2"></div>')
		.replace(/\n/g, '<br>');
}

function handleBookingChoice(wantsBooking) {
	if (wantsBooking) {
		appendUserMessage("Yes, Book Appointment");
		var confirmDiv = document.createElement("div");
		confirmDiv.className = "chat-bubble bot-bubble text-success fw-bold";
		confirmDiv.innerHTML = '<i class="fa-solid fa-circle-check me-2"></i> Great! Redirecting you to our Appointment Desk... <a href="user_appointment.jsp" class="btn btn-sm btn-success text-white rounded-pill px-3 py-1 ms-2" style="font-size: 0.78rem;"><i class="fa-solid fa-calendar-check me-1"></i> Book Now</a>';
		var box = document.getElementById("chatMessagesBox");
		if (box) {
			box.appendChild(confirmDiv);
			box.scrollTop = box.scrollHeight;
		}
		setTimeout(function() {
			window.location.href = "user_appointment.jsp";
		}, 600);
	} else {
		appendUserMessage("No, Thanks");
		var cancelDiv = document.createElement("div");
		cancelDiv.className = "chat-bubble bot-bubble";
		cancelDiv.innerText = "No problem! Please let me know if you have any other health questions.";
		var box = document.getElementById("chatMessagesBox");
		if (box) {
			box.appendChild(cancelDiv);
			box.scrollTop = box.scrollHeight;
		}
	}
}
</script>
