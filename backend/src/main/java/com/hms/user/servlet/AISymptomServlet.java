package com.hms.user.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.hms.ai.ChatSessionManager;
import com.hms.ai.EmergencyDetector;
import com.hms.ai.EmergencyDetector.DetectionResult;
import com.hms.ai.HospitalKnowledgeBase;
import com.hms.ai.HospitalKnowledgeBase.DoctorInfo;
import com.hms.dao.AIDiagnosisDAO;
import com.hms.db.DBConnection;
import com.hms.entity.AIDiagnosis;
import com.hms.entity.User;

@WebServlet("/aiSymptomCheck")
public class AISymptomServlet extends HttpServlet {

    private static final String DEFAULT_OPENROUTER_API_KEY = "";
    private static final String OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
    private static final String OPENROUTER_MODEL_NEMOTRON = "nvidia/nemotron-3.5-lightning:free";
    private static final String OPENROUTER_MODEL_GEMMA = "google/gemma-4-31b-it:free";
    private static final String OPENROUTER_MODEL_LFM = "liquid/lfm-2.5-2.6b:free";

    private static final String DEFAULT_API_KEY = "";
    private static final String PRIMARY_MODEL = "gemini-3.5-flash-lite";
    private static final String BACKUP_MODEL = "gemini-3.6-flash";

    public static final String CLINICAL_DISCLAIMER =
        "FOR INFORMATIONAL AND PREPARATORY PURPOSES ONLY: This AI-generated differential diagnosis list and triage assessment "
        + "are provided solely to assist patients and doctors prior to consultation. It is NOT a confirmed medical diagnosis. "
        + "Final diagnosis and treatment plans require in-person evaluation by a licensed healthcare professional.";

    private static final String IRYO_SYSTEM_PROMPT =
        "You are Iryo, the dedicated AI Healthcare, Clinical, and Hospital Assistant at Iryotek Hospital.\n"
        + "Your purpose is to provide safe, clear, empathetic healthcare triage, symptom guidance, and differential diagnosis preparation for patients and consulting doctors.\n\n"
        + "==================================================\n"
        + "PATIENT GREETINGS & RAPPORT PROTOCOL:\n"
        + "==================================================\n"
        + "When a patient greets you (e.g., \"hi\", \"hello\", \"hey\", \"good morning\", \"namaste\", \"how are you\"):\n"
        + "1. ALWAYS greet them back warmly, politely, and reassuringly as Iryo! (e.g. \"Hello! Welcome to Iryotek Hospital. I'm Iryo, your AI clinical assistant. How are you feeling today? What symptoms or health-related questions can I help you with?\")\n"
        + "2. Never treat a friendly greeting or hello as a domain violation or off-topic error.\n"
        + "3. Reassure the patient that you are ready to listen and answer their health-related questions or evaluate any symptoms they may experience.\n"
        + "4. For pure greetings or polite conversation where no illness or symptoms have been shared yet, DO NOT invent or display any differential diagnoses.\n"
        + "Always append at the end:\n"
        + "[TRIAGE: MONITOR]\n"
        + "[SPECIALTY: General Medicine]\n"
        + "[DIFFERENTIAL_DIAGNOSES: []]\n\n"
        + "==================================================\n"
        + "STRICT DOMAIN BOUNDARY & GUARDRAILS (CRITICAL RULE):\n"
        + "==================================================\n"
        + "You are EXCLUSIVELY authorized to reply to HEALTHCARE, MEDICAL, CLINICAL, WELLNESS, SYMPTOM, TRIAGE, MEDICATION, DOCTOR APPOINTMENT, AND HOSPITAL-RELATED queries.\n"
        + "Polite conversation and greetings from patients (\"hi\", \"hello\", \"thanks\", \"bye\") ARE allowed and encouraged.\n"
        + "You MUST STRICTLY REFUSE any query completely outside of medicine, healthcare, or hospital care (such as movies, fictional characters like Harry Potter, programming code, politics, gaming, finance, creative writing).\n\n"
        + "If the user asks an off-topic non-medical question, respond politely:\n"
        + "\"I am Iryo, a specialized healthcare clinical assistant at Iryotek Hospital. I can only assist with healthcare, symptoms, medical triage, appointments, and wellness queries. Please feel free to describe any symptoms or health concerns you may have.\"\n"
        + "followed by the tags:\n"
        + "[TRIAGE: MONITOR]\n"
        + "[SPECIALTY: General Medicine]\n"
        + "[DIFFERENTIAL_DIAGNOSES: []]\n\n"
        + "==================================================\n"
        + "CLINICAL TRIAGE PROTOCOL FOR HEALTHCARE QUERIES:\n"
        + "==================================================\n"
        + "1. Analyze patient-reported symptoms systematically and empathetically.\n"
        + "2. Identify urgency levels (Emergency, Urgent, Routine, Monitor).\n"
        + "3. Generate a clinically reasoned list of potential differential diagnoses with realistic confidence scores (e.g. 10% to 95%).\n"
        + "4. Explain supporting symptom evidence and recommended next medical steps.\n"
        + "5. Connect patients to appropriate Iryotek Hospital medical specialties.\n"
        + "6. Maintain a calm, empathetic, and professional tone in English, Hindi, or Hinglish as chosen by user.\n"
        + "7. You are NOT a replacement for a licensed doctor or emergency service. Never state that a diagnosis is confirmed.\n\n"
        + "==================================================\n"
        + "MANDATORY MACHINE TAGS (ALWAYS APPEND AT THE VERY END ON NEW LINES)\n"
        + "==================================================\n"
        + "[TRIAGE: EMERGENCY | URGENT | ROUTINE | MONITOR]\n"
        + "[SPECIALTY: Cardiology | Orthopedics | Dermatology | Neurology | ENT | Ophthalmology | Gastroenterology | Pulmonology | Pediatrics | Urology | Oncology | General Medicine | Psychiatry | Gynecology]\n"
        + "[DIFFERENTIAL_DIAGNOSES: [\n"
        + "  {\"condition\": \"Condition Name 1\", \"confidence\": 80, \"reasoning\": \"Key symptom alignment\", \"recommendations\": \"Recommended tests/actions\"},\n"
        + "  {\"condition\": \"Condition Name 2\", \"confidence\": 60, \"reasoning\": \"Secondary possibility rationale\", \"recommendations\": \"Clinical observation\"}\n"
        + "]]";

    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();

        String userMessage = req.getParameter("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            out.print("{\"error\":\"Message is required\"}");
            out.flush();
            return;
        }

        userMessage = userMessage.trim();
        HttpSession session = req.getSession(true);

        // Check for session reset command
        if (userMessage.equalsIgnoreCase("__reset__") || userMessage.equalsIgnoreCase("reset chat")) {
            ChatSessionManager.clearHistory(session);
            JsonObject res = new JsonObject();
            res.addProperty("analysis", "Chat session refreshed. How can I assist you with your health today? 🌿");
            res.addProperty("triageLevel", "MONITOR");
            res.addProperty("triageBadge", "🟢 Self-Care / Monitoring");
            res.addProperty("isEmergency", false);
            res.addProperty("assistantName", "Iryo");
            res.addProperty("disclaimer", CLINICAL_DISCLAIMER);
            res.add("differentialDiagnoses", new JsonArray());
            out.print(gson.toJson(res));
            out.flush();
            return;
        }

        // Fast-path for friendly patient greetings and introductory conversation
        if (isGreeting(userMessage)) {
            String greetingReply = "Hello! Welcome to Iryotek Hospital. I'm Iryo, your AI clinical health companion. 🌿\n\nHow are you feeling today? Please feel free to describe any symptoms, health concerns, or medical questions you have. I'm here to listen, answer your questions, and guide you to the right care.";
            ChatSessionManager.addTurn(session, "user", userMessage);
            ChatSessionManager.addTurn(session, "model", greetingReply);

            JsonObject res = new JsonObject();
            res.addProperty("analysis", greetingReply);
            res.addProperty("specialty", "General Medicine");
            res.addProperty("triageLevel", "MONITOR");
            res.addProperty("triageBadge", "🟢 Welcoming Patient");
            res.addProperty("isEmergency", false);
            res.addProperty("assistantName", "Iryo");
            res.addProperty("disclaimer", CLINICAL_DISCLAIMER);
            res.add("differentialDiagnoses", new JsonArray());
            res.add("suggestedDoctors", new JsonArray());
            out.print(gson.toJson(res));
            out.flush();
            return;
        }

        // Layer 1 & 5: High-Priority Emergency Pre-Screen Detection
        DetectionResult emergencyResult = EmergencyDetector.checkEmergency(userMessage);

        String triageLevel = "ROUTINE";
        String triageBadge = "🟡 Routine Consultation";
        boolean isEmergency = false;
        String detectedSpecialty = "General Medicine";
        String aiResponseText = "";
        JsonArray differentialArray = new JsonArray();

        if (emergencyResult.isEmergency()) {
            isEmergency = true;
            triageLevel = "EMERGENCY";
            triageBadge = "🔴 Emergency";
            aiResponseText = emergencyResult.getGuidance();

            if ("CARDIAC".equals(emergencyResult.getEmergencyType())) {
                detectedSpecialty = "Cardiology";
            } else if ("RESPIRATORY".equals(emergencyResult.getEmergencyType())) {
                detectedSpecialty = "Pulmonology";
            } else if ("STROKE".equals(emergencyResult.getEmergencyType()) || "SEIZURE".equals(emergencyResult.getEmergencyType())) {
                detectedSpecialty = "Neurology";
            } else if ("TRAUMA".equals(emergencyResult.getEmergencyType())) {
                detectedSpecialty = "Orthopedics";
            } else {
                detectedSpecialty = "General Medicine";
            }

            differentialArray = generateDifferentialDiagnoses(userMessage, aiResponseText, detectedSpecialty, true);
        } else {
            // Non-emergency: Multi-turn clinical intelligence with RAG
            String roughSpecialty = detectSpecialtyRough(userMessage);
            String ragContext = HospitalKnowledgeBase.buildRAGContext(roughSpecialty);

            // Primary Engine: OpenRouter NVIDIA Nemotron 3.5 Lightning (User's provided configuration)
            try {
                aiResponseText = callOpenRouterAPIWithSession(session, userMessage, ragContext, OPENROUTER_MODEL_NEMOTRON);
            } catch (Exception eOpenRouter1) {
                System.err.println("OpenRouter Nemotron primary model failed: " + eOpenRouter1.getMessage());
                // Fallback 1: OpenRouter Gemma 4 31B
                try {
                    aiResponseText = callOpenRouterAPIWithSession(session, userMessage, ragContext, OPENROUTER_MODEL_GEMMA);
                } catch (Exception eOpenRouter2) {
                    System.err.println("OpenRouter Gemma fallback model failed: " + eOpenRouter2.getMessage());
                    // Fallback 2: OpenRouter LFM 2.5
                    try {
                        aiResponseText = callOpenRouterAPIWithSession(session, userMessage, ragContext, OPENROUTER_MODEL_LFM);
                    } catch (Exception eOpenRouter3) {
                        System.err.println("OpenRouter LFM fallback model failed: " + eOpenRouter3.getMessage());
                        // Fallback 3: Gemini Primary
                        try {
                            aiResponseText = callGeminiAPIWithSession(session, userMessage, ragContext, PRIMARY_MODEL);
                        } catch (Exception eGemini) {
                            System.err.println("Gemini Primary model (" + PRIMARY_MODEL + ") failed: " + eGemini.getMessage());
                            // Fallback 4: Gemini Backup
                            try {
                                aiResponseText = callGeminiAPIWithSession(session, userMessage, ragContext, BACKUP_MODEL);
                            } catch (Exception eBackup) {
                                System.err.println("Gemini Backup model (" + BACKUP_MODEL + ") failed: " + eBackup.getMessage());
                            }
                        }
                    }
                }
            }

            // Fallback rules engine if external APIs are offline
            if (aiResponseText == null || aiResponseText.trim().isEmpty()) {
                aiResponseText = generateSmartMedicalResponse(userMessage);
            }

            // Extract machine tags (triage, specialty, differential diagnoses)
            TagExtraction tagExt = extractAndCleanTags(aiResponseText);
            aiResponseText = tagExt.cleanText;

            if (tagExt.triageLevel != null) {
                triageLevel = tagExt.triageLevel;
            } else {
                triageLevel = inferTriageLevel(userMessage, aiResponseText);
            }

            if (tagExt.specialty != null) {
                detectedSpecialty = tagExt.specialty;
            } else {
                detectedSpecialty = detectSpecialtyRough(aiResponseText + " " + userMessage);
            }

            if (tagExt.differentialDiagnoses != null && tagExt.differentialDiagnoses.size() > 0) {
                differentialArray = tagExt.differentialDiagnoses;
            } else if (tagExt.differentialDiagnoses != null && tagExt.differentialDiagnoses.size() == 0) {
                differentialArray = new JsonArray();
            } else if (hasClinicalSymptoms(userMessage, aiResponseText)) {
                differentialArray = generateDifferentialDiagnoses(userMessage, aiResponseText, detectedSpecialty, false);
            } else {
                differentialArray = new JsonArray();
            }

            triageBadge = mapTriageBadge(triageLevel);
            isEmergency = "EMERGENCY".equalsIgnoreCase(triageLevel);
        }

        // Layer 3: Doctor suggestions from hospital knowledge base
        List<DoctorInfo> docs = HospitalKnowledgeBase.getDoctorsByDepartment(detectedSpecialty, 2);
        JsonArray docArray = new JsonArray();
        for (DoctorInfo doc : docs) {
            JsonObject dObj = new JsonObject();
            dObj.addProperty("id", doc.getId());
            dObj.addProperty("name", doc.getName());
            dObj.addProperty("qualification", doc.getQualification());
            dObj.addProperty("specialist", doc.getSpecialist());
            dObj.addProperty("timing", doc.getTiming());
            docArray.add(dObj);
        }

        // Save turns into Session Memory
        ChatSessionManager.addTurn(session, "user", userMessage);
        ChatSessionManager.addTurn(session, "model", aiResponseText);

        // Store Differential Diagnosis in Database for Doctor Pre-Consultation Review
        Integer loggedInUserId = null;
        User userObj = (User) session.getAttribute("userObj");
        if (userObj != null) {
            loggedInUserId = userObj.getId();
        } else {
            String uidParam = req.getParameter("userId");
            if (uidParam != null && !uidParam.trim().isEmpty()) {
                try {
                    loggedInUserId = Integer.parseInt(uidParam.trim());
                } catch (Exception ignored) {}
            }
        }

        Integer apptId = null;
        String apptParam = req.getParameter("appointmentId");
        if (apptParam != null && !apptParam.trim().isEmpty()) {
            try {
                apptId = Integer.parseInt(apptParam.trim());
            } catch (Exception ignored) {}
        }

        // Persist to ai_differential_diagnosis table
        try {
            Connection conn = DBConnection.getConn();
            AIDiagnosisDAO diagDao = new AIDiagnosisDAO(conn);
            AIDiagnosis diagRecord = new AIDiagnosis(
                loggedInUserId,
                apptId,
                userMessage,
                triageLevel,
                gson.toJson(differentialArray),
                aiResponseText,
                CLINICAL_DISCLAIMER
            );
            diagDao.saveDiagnosis(diagRecord);
        } catch (Exception e) {
            System.err.println("Error saving AI diagnosis to database: " + e.getMessage());
        }

        // Construct complete JSON response
        JsonObject result = new JsonObject();
        result.addProperty("analysis", aiResponseText);
        result.addProperty("specialty", detectedSpecialty);
        result.addProperty("triageLevel", triageLevel);
        result.addProperty("triageBadge", triageBadge);
        result.addProperty("isEmergency", isEmergency);
        result.addProperty("emergencyHelpline", "+202-555-0191");
        result.addProperty("assistantName", "Iryo");
        result.addProperty("disclaimer", CLINICAL_DISCLAIMER);
        result.add("differentialDiagnoses", differentialArray);
        result.add("suggestedDoctors", docArray);

        out.print(gson.toJson(result));
        out.flush();
    }

    private String callOpenRouterAPIWithSession(HttpSession session, String userMessage, String ragContext, String modelName) throws Exception {
        String apiKey = System.getenv("OPENROUTER_API_KEY");
        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = DEFAULT_OPENROUTER_API_KEY;
        }

        String url = OPENROUTER_BASE_URL + "/chat/completions";
        String fullSystemPrompt = IRYO_SYSTEM_PROMPT + "\n\n" + ragContext;

        JsonObject payload = new JsonObject();
        payload.addProperty("model", modelName);
        payload.add("messages", ChatSessionManager.buildOpenAIMessages(session, userMessage, fullSystemPrompt));
        payload.addProperty("temperature", 0.7);
        payload.addProperty("top_p", 0.95);
        payload.addProperty("max_tokens", 4096);

        String jsonPayload = gson.toJson(payload);

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("HTTP-Referer", "https://iryotek.hospital")
                .header("X-Title", "Iryotek Hospital AI Companion")
                .timeout(Duration.ofSeconds(60))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        String responseBody = response.body();

        if (response.statusCode() == 200 && responseBody != null && !responseBody.trim().isEmpty()) {
            JsonObject root = JsonParser.parseString(responseBody).getAsJsonObject();
            if (root.has("choices")) {
                JsonArray choices = root.getAsJsonArray("choices");
                if (choices.size() > 0) {
                    JsonObject choice = choices.get(0).getAsJsonObject();
                    if (choice.has("message")) {
                        JsonObject msgObj = choice.getAsJsonObject("message");
                        if (msgObj.has("content") && !msgObj.get("content").isJsonNull() && !msgObj.get("content").getAsString().trim().isEmpty()) {
                            return msgObj.get("content").getAsString();
                        } else if (msgObj.has("reasoning") && !msgObj.get("reasoning").isJsonNull() && !msgObj.get("reasoning").getAsString().trim().isEmpty()) {
                            return msgObj.get("reasoning").getAsString();
                        } else if (msgObj.has("reasoning_content") && !msgObj.get("reasoning_content").isJsonNull() && !msgObj.get("reasoning_content").getAsString().trim().isEmpty()) {
                            return msgObj.get("reasoning_content").getAsString();
                        }
                    }
                }
            }
        } else {
            throw new RuntimeException("OpenRouter API returned status " + response.statusCode() + ": " + responseBody);
        }

        return "";
    }

    private String callGeminiAPIWithSession(HttpSession session, String userMessage, String ragContext, String modelName) throws Exception {
        String apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = DEFAULT_API_KEY;
        }

        String fullUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

        JsonObject payload = new JsonObject();
        JsonArray contents = ChatSessionManager.buildGeminiContents(session, userMessage);
        payload.add("contents", contents);

        JsonObject systemInstruction = new JsonObject();
        JsonArray sysParts = new JsonArray();
        JsonObject sysPart = new JsonObject();
        String fullSystemPrompt = IRYO_SYSTEM_PROMPT + "\n\n" + ragContext;
        sysPart.addProperty("text", fullSystemPrompt);
        sysParts.add(sysPart);
        systemInstruction.add("parts", sysParts);
        payload.add("systemInstruction", systemInstruction);

        String jsonPayload = gson.toJson(payload);

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(6))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(fullUrl))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .timeout(Duration.ofSeconds(12))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        String responseBody = response.body();

        if (response.statusCode() == 200 && responseBody != null && !responseBody.trim().isEmpty()) {
            JsonObject root = JsonParser.parseString(responseBody).getAsJsonObject();
            if (root.has("candidates")) {
                JsonArray candidates = root.getAsJsonArray("candidates");
                if (candidates.size() > 0) {
                    JsonObject candidate = candidates.get(0).getAsJsonObject();
                    if (candidate.has("content")) {
                        JsonObject content = candidate.getAsJsonObject("content");
                        if (content.has("parts")) {
                            JsonArray resParts = content.getAsJsonArray("parts");
                            if (resParts.size() > 0) {
                                return resParts.get(0).getAsJsonObject().get("text").getAsString();
                            }
                        }
                    }
                }
            }
        } else {
            throw new RuntimeException("Gemini API returned status " + response.statusCode() + ": " + responseBody);
        }

        return "";
    }

    private static class TagExtraction {
        String cleanText;
        String triageLevel;
        String specialty;
        JsonArray differentialDiagnoses;
    }

    private TagExtraction extractAndCleanTags(String text) {
        TagExtraction ext = new TagExtraction();
        if (text == null) {
            ext.cleanText = "";
            return ext;
        }

        String cleaned = text;

        // 1. Extract [DIFFERENTIAL_DIAGNOSES: [...]]
        Pattern diffPat = Pattern.compile("\\[DIFFERENTIAL_DIAGNOSES:\\s*(\\[.*?\\])\\]", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
        Matcher diffMat = diffPat.matcher(cleaned);
        if (diffMat.find()) {
            String rawJson = diffMat.group(1);
            try {
                JsonElement elem = JsonParser.parseString(rawJson);
                if (elem.isJsonArray()) {
                    ext.differentialDiagnoses = elem.getAsJsonArray();
                }
            } catch (Exception e) {
                System.err.println("Could not parse differential diagnoses json: " + e.getMessage());
            }
            cleaned = diffMat.replaceAll("");
        }

        // 2. Extract [TRIAGE: ...]
        Pattern triagePat = Pattern.compile("\\[TRIAGE:\\s*(EMERGENCY|URGENT|ROUTINE|MONITOR)\\]", Pattern.CASE_INSENSITIVE);
        Matcher triageMat = triagePat.matcher(cleaned);
        if (triageMat.find()) {
            ext.triageLevel = triageMat.group(1).toUpperCase();
            cleaned = triageMat.replaceAll("");
        }

        // 3. Extract [SPECIALTY: ...]
        Pattern specPat = Pattern.compile("\\[SPECIALTY:\\s*([^\\]]+)\\]", Pattern.CASE_INSENSITIVE);
        Matcher specMat = specPat.matcher(cleaned);
        if (specMat.find()) {
            ext.specialty = specMat.group(1).trim();
            cleaned = specMat.replaceAll("");
        }

        ext.cleanText = cleaned.trim();
        return ext;
    }

    /**
     * Fallback and enhancement engine for realistic, clinically-reasoned differential diagnoses with confidence scores
     */
    private JsonArray generateDifferentialDiagnoses(String userMsg, String aiText, String specialty, boolean isEmergency) {
        JsonArray array = new JsonArray();
        String combined = (userMsg + " " + aiText).toLowerCase();

        if (isEmergency) {
            if (combined.contains("chest") || combined.contains("heart") || combined.contains("arm")) {
                addDiagnosis(array, "Acute Coronary Syndrome (ACS) / Myocardial Infarction", 88, 
                    "Severe chest pressure/radiation to arm, emergency triage indicator", "Immediate emergency ECG, cardiac troponin, catheterization prep");
                addDiagnosis(array, "Aortic Dissection", 45, 
                    "Severe tearing chest pain radiating to back", "Urgent contrast CT aortogram, blood pressure stabilization");
                addDiagnosis(array, "Pulmonary Embolism", 38, 
                    "Acute onset dyspnea, tachycardia, pleuritic chest pain", "CT pulmonary angiography, D-dimer, oxygenation");
            } else if (combined.contains("stroke") || combined.contains("droop") || combined.contains("slur") || combined.contains("weak")) {
                addDiagnosis(array, "Acute Ischemic Stroke", 90, 
                    "F.A.S.T. signs present (facial asymmetry, unilateral weakness, dysarthria)", "Immediate non-contrast head CT, thrombolysis window assessment");
                addDiagnosis(array, "Transient Ischemic Attack (TIA)", 55, 
                    "Neurological deficit pattern with potential fluctuating recovery", "Neurovascular MRI, telemetry, antiplatelet evaluation");
                addDiagnosis(array, "Intracerebral Hemorrhage", 35, 
                    "Acute focal deficit, elevated intracranial pressure risk", "Urgent neurosurgical consult, blood pressure control");
            } else {
                addDiagnosis(array, "Acute Clinical Emergency", 85, 
                    "High-acuity red-flag indicators detected in patient description", "Immediate 24/7 Trauma Desk admission and vital stabilization");
                addDiagnosis(array, "Secondary Systemic Crisis", 50, 
                    "Severe autonomic or respiratory decompensation", "Comprehensive metabolic panel, intensive telemetry");
            }
            return array;
        }

        // Headache / Neurology
        if (combined.contains("headache") || combined.contains("migraine") || combined.contains("head pain") || "Neurology".equalsIgnoreCase(specialty)) {
            addDiagnosis(array, "Tension-Type Headache", 80, 
                "Bilateral band-like pressing discomfort, stress/screen fatigue", "Hydration, ergonomic posture correction, stress management");
            addDiagnosis(array, "Migraine without Aura", 68, 
                "Throbbing moderate-to-severe pain, photophobia, nausea susceptibility", "Dark quiet room rest, hydration, prophylactic migraine assessment");
            addDiagnosis(array, "Cervicogenic / Sinus Headache", 42, 
                "Pain referred from neck posture strain or paranasal sinus pressure", "Cervical stretching, warm compress, ENT sinus evaluation if congested");
            return array;
        }

        // Respiratory / Cough / Cold / Throat
        if (combined.contains("cough") || combined.contains("cold") || combined.contains("throat") || combined.contains("fever") || "Pulmonology".equalsIgnoreCase(specialty) || "ENT".equalsIgnoreCase(specialty)) {
            addDiagnosis(array, "Acute Viral Upper Respiratory Infection (URI)", 84, 
                "Rhinitis, pharyngitis, low-grade malaise, mild coughing", "Warm saline gargles, adequate fluid intake, symptomatic monitoring");
            addDiagnosis(array, "Acute Bronchitis", 62, 
                "Substernal chest tightness, cough persisting with bronchial irritation", "Rest, humidified air, pulmonary evaluation if wheezing develops");
            addDiagnosis(array, "Allergic Rhinosinusitis", 45, 
                "Clear rhinorrhea, nasal congestion, seasonal or environmental trigger", "Antihistamine evaluation, allergen avoidance, saline nasal spray");
            return array;
        }

        // Abdominal / Digestive
        if (combined.contains("stomach") || combined.contains("abdomen") || combined.contains("nausea") || combined.contains("vomit") || combined.contains("acid") || "Gastroenterology".equalsIgnoreCase(specialty)) {
            addDiagnosis(array, "Acute Gastritis / Acid Peptic Disease", 82, 
                "Epigastric burning, post-meal discomfort, mild nausea", "Small frequent bland meals, avoid acidic/spicy foods, gastroenterology review");
            addDiagnosis(array, "Acute Viral / Bacterial Gastroenteritis", 65, 
                "Cramping abdominal pain, fluid loss, bowel motility changes", "Oral rehydration solution (ORS), gut rest, stool routine test if persistent");
            addDiagnosis(array, "Irritable Bowel Syndrome (IBS)", 40, 
                "Visceral discomfort associated with dietary sensitivity or stress", "Dietary fiber adjustments, hydration, clinical abdominal examination");
            return array;
        }

        // Skin / Dermatology
        if (combined.contains("skin") || combined.contains("rash") || combined.contains("itch") || combined.contains("allergy") || "Dermatology".equalsIgnoreCase(specialty)) {
            addDiagnosis(array, "Acute Contact Dermatitis", 82, 
                "Pruritic erythematous rash localized to allergen/irritant contact area", "Cool compress, hypoallergenic moisturizer, identify trigger agent");
            addDiagnosis(array, "Urticaria (Allergic Hives)", 68, 
                "Transient wheals with prominent pruritus and histamine response", "Non-sedating antihistamine review, monitor for airway symptoms");
            addDiagnosis(array, "Atopic Eczema / Xerosis", 48, 
                "Dry cracked skin patches with reactive itching", "Ceramide-based emollient barrier repair, avoid harsh soaps");
            return array;
        }

        // Orthopedic / Bone / Joint
        if (combined.contains("knee") || combined.contains("joint") || combined.contains("back") || combined.contains("bone") || "Orthopedics".equalsIgnoreCase(specialty)) {
            addDiagnosis(array, "Acute Musculotendinous Strain", 82, 
                "Localized muscular stiffness, pain provoked by physical motion or weight-bearing", "R.I.C.E. protocol (Rest, Ice, Compression, Elevation), gentle mobilization");
            addDiagnosis(array, "Degenerative Osteoarthritis / Spondylosis", 60, 
                "Joint crepitation, morning stiffness improving after warm-up", "Low-impact exercise, physiotherapy assessment, weight management");
            addDiagnosis(array, "Ligamentous Sprain / Disc Bulge", 42, 
                "Mechanical pain exacerbated by sudden flexion or loading", "Targeted physical therapy, diagnostic X-ray/MRI if neuro-deficit arises");
            return array;
        }

        // General Medicine Fallback
        addDiagnosis(array, "Acute Constitutional Presentation", 75, 
            "Reported symptom pattern aligns with early clinical prodrome", "Adequate rest, hydration, vital sign monitoring (temperature, BP)");
        addDiagnosis(array, "Secondary Systemic or Metabolic Reaction", 55, 
            "Physiological response potentially influenced by fatigue, dietary, or environmental factors", "Routine complete blood count (CBC) and doctor physical examination");
        addDiagnosis(array, "Functional / Stress-Related Exacerbation", 38, 
            "Physical manifestations aggravated by physical exertion or stress", "Lifestyle balancing, sleep hygiene, outpatient clinical consultation");

        return array;
    }

    private void addDiagnosis(JsonArray array, String condition, int confidence, String reasoning, String recommendations) {
        JsonObject obj = new JsonObject();
        obj.addProperty("condition", condition);
        obj.addProperty("confidence", confidence);
        obj.addProperty("reasoning", reasoning);
        obj.addProperty("recommendations", recommendations);
        array.add(obj);
    }

    private String inferTriageLevel(String userMsg, String aiText) {
        String combined = (userMsg + " " + aiText).toLowerCase();
        if (combined.contains("emergency") || combined.contains("life-threatening") || combined.contains("trauma desk")) {
            return "EMERGENCY";
        }
        if (combined.contains("urgent") || combined.contains("prompt medical attention") || combined.contains("within 24 hours")) {
            return "URGENT";
        }
        if (combined.contains("schedule an appointment") || combined.contains("consult") || combined.contains("routine medical")) {
            return "ROUTINE";
        }
        return "MONITOR";
    }

    private String mapTriageBadge(String level) {
        if ("EMERGENCY".equalsIgnoreCase(level)) {
            return "🔴 Emergency Attention Required";
        } else if ("URGENT".equalsIgnoreCase(level)) {
            return "🟠 Urgent Medical Attention";
        } else if ("ROUTINE".equalsIgnoreCase(level)) {
            return "🟡 Routine Consultation";
        } else {
            return "🟢 Self-Care / Monitoring";
        }
    }

    private String detectSpecialtyRough(String text) {
        if (text == null) return "General Medicine";
        String lower = text.toLowerCase();

        if (lower.contains("heart") || lower.contains("chest") || lower.contains("cardio") || lower.contains("palpitation")) return "Cardiology";
        if (lower.contains("bone") || lower.contains("joint") || lower.contains("knee") || lower.contains("fracture") || lower.contains("back pain") || lower.contains("ortho") || lower.contains("spine")) return "Orthopedics";
        if (lower.contains("skin") || lower.contains("rash") || lower.contains("derma") || lower.contains("acne") || lower.contains("itching") || lower.contains("allergy")) return "Dermatology";
        if (lower.contains("headache") || lower.contains("migraine") || lower.contains("seizure") || lower.contains("stroke") || lower.contains("dizzy") || lower.contains("brain") || lower.contains("vertigo")) return "Neurology";
        if (lower.contains("child") || lower.contains("baby") || lower.contains("pediatric") || lower.contains("infant") || lower.contains("kid")) return "Pediatrics";
        if (lower.contains("stomach") || lower.contains("liver") || lower.contains("digestion") || lower.contains("gastro") || lower.contains("abdomen") || lower.contains("vomit") || lower.contains("nausea") || lower.contains("acidity")) return "Gastroenterology";
        if (lower.contains("lung") || lower.contains("breath") || lower.contains("asthma") || lower.contains("cough") || lower.contains("pulmo") || lower.contains("congestion")) return "Pulmonology";
        if (lower.contains("eye") || lower.contains("vision") || lower.contains("cataract") || lower.contains("sight")) return "Ophthalmology";
        if (lower.contains("ear") || lower.contains("throat") || lower.contains("hearing") || lower.contains("sinus") || lower.contains("tonsil") || lower.contains("sore throat")) return "ENT";
        if (lower.contains("kidney") || lower.contains("urine") || lower.contains("urinary") || lower.contains("bladder")) return "Urology";
        if (lower.contains("cancer") || lower.contains("tumor") || lower.contains("chemo") || lower.contains("oncol")) return "Oncology";
        if (lower.contains("depress") || lower.contains("anxiety") || lower.contains("panic") || lower.contains("mental health")) return "Psychiatry";
        if (lower.contains("pregnancy") || lower.contains("period") || lower.contains("gynec") || lower.contains("menstrual")) return "Gynecology";

        return "General Medicine";
    }

    private String generateSmartMedicalResponse(String msg) {
        String lower = msg.toLowerCase();

        // Check for common non-medical queries to enforce strict domain guardrail even in fallback
        if (lower.contains("harry potter") || lower.contains("movie") || lower.contains("film")
                || lower.contains("song") || lower.contains("music") || lower.contains("game")
                || lower.contains("weather") || lower.contains("joke") || lower.contains("poem")
                || lower.contains("python") || lower.contains("java code") || lower.contains("politics")
                || lower.contains("president") || lower.contains("sports") || lower.contains("cricket")) {
            return "I am Iryo, a specialized healthcare clinical assistant at Iryotek Hospital. I can only assist with healthcare, symptoms, medical triage, appointments, and wellness queries. Please feel free to describe any symptoms or health concerns you may have.\n\n"
                 + "[TRIAGE: MONITOR]\n"
                 + "[SPECIALTY: General Medicine]\n"
                 + "[DIFFERENTIAL_DIAGNOSES: []]";
        }

        // 1. Greetings & Introductions
        if (lower.matches("^(hi|hello|hey|greetings|good morning|good afternoon|good evening)[!.]?$") || lower.equals("help")) {
            return "Hello! I am **Iryo**, your AI Healthcare & Hospital Assistant at Iryotek Hospital. 🌿\n\n"
                 + "I can assist you with:\n"
                 + "• Symptom analysis & differential diagnosis probability assessment\n"
                 + "• Pre-consultation clinical summary preparation for your doctor\n"
                 + "• Finding appropriate hospital departments & specialist booking\n"
                 + "• Emergency triage recognition & 24/7 care navigation\n\n"
                 + "*Notice: Information provided is for informational purposes only and does not constitute a definitive medical diagnosis.*\n\n"
                 + "Please describe what symptoms or discomfort you are experiencing.";
        }

        // 2. Who are you / Identity
        if (lower.contains("who are you") || lower.contains("what can you do") || lower.contains("your name")) {
            return "I am **Iryo**, Iryotek Hospital's AI Clinical Assistant. I analyze patient symptoms to provide prioritized differential diagnoses with confidence scores, prepare clinical summaries for our doctors, and guide you to the right department.";
        }

        // 3. Appointment Requests
        if (lower.contains("appointment") || lower.contains("book doctor") || lower.contains("consult")) {
            return "I would be glad to help you schedule a doctor consultation! 📅\n\n"
                 + "Our specialist doctors are available for in-person and telehealth consultations Monday through Saturday (8:00 AM - 8:00 PM). Would you like to proceed to our online booking desk?";
        }

        // 4. Hospital Hours & Emergency Info
        if (lower.contains("hour") || lower.contains("open") || lower.contains("timing") || lower.contains("emergency") || lower.contains("helpline")) {
            return "🏥 **Iryotek Healthcare Center Timings:**\n\n"
                 + "• **Emergency & Trauma Desk:** Open 24 Hours / 7 Days a week (Ground Floor, Room 101)\n"
                 + "• **OPD Doctor Consultations:** Monday - Saturday (8:00 AM - 8:00 PM)\n"
                 + "• **Pharmacy & Diagnostic Lab:** Open 24/7\n"
                 + "• **Emergency Helpline:** +202-555-0191\n"
                 + "• **Email:** info@iryotek.com";
        }

        // Default Structured Symptom Triage Fallback
        return "Thank you for describing your symptoms. Let's analyze this carefully so you and your consulting physician have complete information.\n\n"
             + "### 1. Clinical Analysis\n"
             + "Based on your reported discomfort, our preliminary evaluation has identified potential differential conditions detailed below with confidence scores.\n\n"
             + "### 2. Immediate Safe Measures\n"
             + "• Rest comfortably, maintain hydration, and avoid strenuous exertion.\n"
             + "• Do not self-administer unprescribed medications without medical supervision.\n\n"
             + "### 3. Recommended Next Step\n"
             + "We recommend booking a consultation with our hospital specialist for formal clinical evaluation and targeted diagnostic testing.\n\n"
             + "[TRIAGE: ROUTINE]\n"
             + "[SPECIALTY: General Medicine]";
    }

    private static boolean isGreeting(String msg) {
        if (msg == null) return false;
        String clean = msg.trim().toLowerCase().replaceAll("[!?,.]+$", "").trim();
        return clean.matches("^(hi|hello|hey|heyy|heya|hola|namaste|vanakkam|good morning|good afternoon|good evening|good day|howdy|sup|hi there|hello there|hi doctor|hello doctor|hi iryo|hello iryo|hey iryo|how are you|how are you doing|who are you|greetings|start|can you help me)$");
    }

    private static boolean hasClinicalSymptoms(String userMsg, String aiText) {
        String combined = ((userMsg != null ? userMsg : "") + " " + (aiText != null ? aiText : "")).toLowerCase();
        String[] keywords = {
            "pain", "ache", "fever", "cough", "cold", "sore", "vomit", "nausea",
            "dizzy", "dizziness", "rash", "itch", "swelling", "bleeding", "breath",
            "shortness", "headache", "stomach", "chest", "throat", "fatigue",
            "tired", "weak", "infection", "cramp", "pressure", "burn", "burning",
            "diarrhea", "constipation", "sneezing", "congestion", "sinus", "allergy",
            "injury", "sprain", "fracture", "cut", "wound", "palpitation"
        };
        for (String kw : keywords) {
            if (combined.contains(kw)) return true;
        }
        return false;
    }
}
