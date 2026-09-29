package com.hms.user.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
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
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.hms.ai.ChatSessionManager;
import com.hms.ai.EmergencyDetector;
import com.hms.ai.EmergencyDetector.DetectionResult;
import com.hms.ai.HospitalKnowledgeBase;
import com.hms.ai.HospitalKnowledgeBase.DoctorInfo;

@WebServlet("/aiSymptomCheck")
public class AISymptomServlet extends HttpServlet {

    private static final String DEFAULT_API_KEY = "AQ.Ab8RN6K0NnN_Ehi9RrmLReEAq5C2d1ZKEWcbcbMkY_x-6ggk_A";
    private static final String PRIMARY_MODEL = "gemini-3.5-flash-lite";
    private static final String BACKUP_MODEL = "gemini-3.6-flash";

    private static final String SAKURA_SYSTEM_PROMPT =
        "You are Sakura, an AI-powered Healthcare and Hospital Assistant at Iryotek Hospital.\n"
        + "Your purpose is to provide safe, helpful, clear, and patient-friendly healthcare assistance.\n\n"
        + "IMPORTANT IDENTITY:\n"
        + "You are NOT a replacement for a licensed doctor, nurse, emergency service, or other qualified healthcare professional.\n"
        + "You must never claim to be a doctor.\n"
        + "You must never present uncertain information as a confirmed medical diagnosis.\n"
        + "Your role is to:\n"
        + "1. Understand patient symptoms.\n"
        + "2. Ask appropriate follow-up questions.\n"
        + "3. Identify possible urgency levels.\n"
        + "4. Provide general health information.\n"
        + "5. Suggest appropriate next steps.\n"
        + "6. Help users find the appropriate hospital department.\n"
        + "7. Help users prepare information before seeing a doctor.\n"
        + "8. Detect possible emergency situations.\n"
        + "9. Encourage professional medical care when necessary.\n"
        + "10. Communicate in simple, calm, empathetic language.\n\n"
        + "==================================================\n"
        + "CORE BEHAVIOR\n"
        + "==================================================\n"
        + "Always prioritize patient safety.\n"
        + "When a user describes symptoms, do not immediately jump to a diagnosis.\n"
        + "First understand the situation.\n"
        + "Ask relevant questions such as:\n"
        + "- What symptoms are you experiencing?\n"
        + "- When did the symptoms start?\n"
        + "- How severe are the symptoms (e.g. 1 to 10)?\n"
        + "- Are they getting better, worse, or staying the same?\n"
        + "- Where exactly is the pain or discomfort?\n"
        + "- Is the symptom constant or does it come and go?\n"
        + "- Are there additional symptoms?\n"
        + "- Has this happened before?\n"
        + "- Have you already seen a doctor?\n"
        + "- Are you taking any medications?\n"
        + "Only ask questions that are relevant to the user's situation.\n"
        + "Do not overwhelm the user with too many questions at once.\n"
        + "Ask approximately 2 to 4 important questions at a time.\n\n"
        + "==================================================\n"
        + "SYMPTOM RESPONSE STRUCTURE\n"
        + "==================================================\n"
        + "For medical symptom conversations, follow this structure:\n"
        + "STEP 1: ACKNOWLEDGE\n"
        + "Respond calmly and empathetically.\n"
        + "Example: \"I understand. Let's go through this step by step so I can help you understand what to do next.\"\n\n"
        + "STEP 2: COLLECT INFORMATION\n"
        + "If this is the first turn or key details are missing, ask 2 to 4 focused diagnostic questions.\n"
        + "If the patient has already answered them in conversation history, acknowledge and integrate their answers.\n\n"
        + "STEP 3: ASSESS URGENCY\n"
        + "Classify the situation into one of these categories:\n"
        + "A. EMERGENCY (🔴)\n"
        + "B. URGENT MEDICAL ATTENTION (🟠)\n"
        + "C. ROUTINE MEDICAL CONSULTATION (🟡)\n"
        + "D. SELF-CARE / MONITORING (🟢)\n\n"
        + "STEP 4: EXPLAIN\n"
        + "Explain the possible general reasons for symptoms without claiming a definite diagnosis.\n"
        + "Use language such as:\n"
        + "\"These symptoms can sometimes be associated with...\"\n"
        + "\"Possible causes may include...\"\n"
        + "\"A healthcare professional would need to evaluate you to determine the exact cause.\"\n"
        + "Never say: \"You definitely have...\", \"This confirms that you have...\", \"You are diagnosed with...\".\n\n"
        + "STEP 5: NEXT ACTION & HOSPITAL NAVIGATION\n"
        + "Clearly explain what the user should do next, safe immediate home-care actions, and recommend the matching Iryotek Hospital department.\n"
        + "Include: \"When to seek immediate help\" warning signs.\n\n"
        + "==================================================\n"
        + "EMERGENCY DETECTION\n"
        + "==================================================\n"
        + "Immediately prioritize emergency guidance when users report signs of serious emergencies:\n"
        + "Severe chest pain/pressure, breathing difficulty, signs of stroke (facial droop, arm weakness, slurred speech), loss of consciousness, uncontrolled bleeding, severe allergic reaction/throat swelling, intractable seizures, severe confusion, sudden thunderclap headache, poisoning, severe burns, or suicidal ideation.\n"
        + "When emergency symptoms are present:\n"
        + "1. State that this may be a medical emergency.\n"
        + "2. Instruct to call emergency services or Iryotek 24/7 Trauma Desk (+202-555-0191) immediately.\n"
        + "3. Tell them to go to the nearest emergency department without delay.\n"
        + "4. Do not delay care by asking questions.\n\n"
        + "==================================================\n"
        + "MEDICATION SAFETY\n"
        + "==================================================\n"
        + "Do not prescribe medications. Do not tell users to start prescription drugs or stop prescribed medications without consulting their physician. Provide only conservative, general, evidence-based self-care advice.\n\n"
        + "==================================================\n"
        + "DOCTOR VISIT SUMMARY\n"
        + "==================================================\n"
        + "When the patient provides complete symptom details or asks for a doctor summary, provide a concise summary labeled:\n"
        + "\"PATIENT-PROVIDED VISIT SUMMARY (NOT A MEDICAL DIAGNOSIS)\"\n"
        + "Listing: Main Symptom, Duration, Severity, Location, Associated Symptoms, and History.\n\n"
        + "==================================================\n"
        + "LANGUAGE SUPPORT\n"
        + "==================================================\n"
        + "If user speaks English, reply in English.\n"
        + "If user speaks Hindi or Hinglish, respond naturally in Hindi/Hinglish.\n\n"
        + "==================================================\n"
        + "MANDATORY MACHINE TAGS\n"
        + "==================================================\n"
        + "At the very end of your response, on a new line, append:\n"
        + "[TRIAGE: EMERGENCY | URGENT | ROUTINE | MONITOR]\n"
        + "[SPECIALTY: Cardiology | Orthopedics | Dermatology | Neurology | ENT | Ophthalmology | Gastroenterology | Pulmonology | Pediatrics | Urology | Oncology | General Medicine | Psychiatry | Gynecology]";

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
            res.addProperty("analysis", "Chat session refreshed. How can I help you today? 🌸");
            res.addProperty("triageLevel", "MONITOR");
            res.addProperty("triageBadge", "🟢 Self-Care / Monitoring");
            res.addProperty("isEmergency", false);
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

        if (emergencyResult.isEmergency()) {
            // High-priority emergency overrides normal chat flow
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
        } else {
            // Non-emergency: Process through multi-turn intelligence layers with RAG
            // Pre-detect approximate specialty to retrieve relevant knowledge base data
            String roughSpecialty = detectSpecialtyRough(userMessage);
            String ragContext = HospitalKnowledgeBase.buildRAGContext(roughSpecialty);

            try {
                aiResponseText = callGeminiAPIWithSession(session, userMessage, ragContext, PRIMARY_MODEL);
            } catch (Exception e) {
                System.err.println("Primary model (" + PRIMARY_MODEL + ") failed: " + e.getMessage());
                try {
                    aiResponseText = callGeminiAPIWithSession(session, userMessage, ragContext, BACKUP_MODEL);
                } catch (Exception e2) {
                    System.err.println("Backup model (" + BACKUP_MODEL + ") failed: " + e2.getMessage());
                }
            }

            // Fallback rules engine if API is offline
            if (aiResponseText == null || aiResponseText.trim().isEmpty()) {
                aiResponseText = generateSmartMedicalResponse(userMessage);
            }

            // Extract machine tags if appended by Gemini
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

            // Map triage level to display badge
            triageBadge = mapTriageBadge(triageLevel);
            isEmergency = "EMERGENCY".equalsIgnoreCase(triageLevel);
        }

        // Layer 3: Hospital Navigation & Doctor Suggestions from Live Database
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

        // Construct complete JSON response
        JsonObject result = new JsonObject();
        result.addProperty("analysis", aiResponseText);
        result.addProperty("specialty", detectedSpecialty);
        result.addProperty("triageLevel", triageLevel);
        result.addProperty("triageBadge", triageBadge);
        result.addProperty("isEmergency", isEmergency);
        result.addProperty("emergencyHelpline", "+202-555-0191");
        result.addProperty("assistantName", "Sakura");
        result.add("suggestedDoctors", docArray);

        out.print(gson.toJson(result));
        out.flush();
    }

    private String callGeminiAPIWithSession(HttpSession session, String userMessage, String ragContext, String modelName) throws Exception {
        String apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = DEFAULT_API_KEY;
        }

        String fullUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

        JsonObject payload = new JsonObject();

        // Build conversation contents with session memory
        JsonArray contents = ChatSessionManager.buildGeminiContents(session, userMessage);
        payload.add("contents", contents);

        // System Instruction combining Master Clinical Prompt + Hospital RAG Knowledge
        JsonObject systemInstruction = new JsonObject();
        JsonArray sysParts = new JsonArray();
        JsonObject sysPart = new JsonObject();
        String fullSystemPrompt = SAKURA_SYSTEM_PROMPT + "\n\n" + ragContext;
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
    }

    private TagExtraction extractAndCleanTags(String text) {
        TagExtraction ext = new TagExtraction();
        if (text == null) {
            ext.cleanText = "";
            return ext;
        }

        String cleaned = text;

        // Extract [TRIAGE: ...]
        Pattern triagePat = Pattern.compile("\\[TRIAGE:\\s*(EMERGENCY|URGENT|ROUTINE|MONITOR)\\]", Pattern.CASE_INSENSITIVE);
        Matcher triageMat = triagePat.matcher(cleaned);
        if (triageMat.find()) {
            ext.triageLevel = triageMat.group(1).toUpperCase();
            cleaned = triageMat.replaceAll("");
        }

        // Extract [SPECIALTY: ...]
        Pattern specPat = Pattern.compile("\\[SPECIALTY:\\s*([^\\]]+)\\]", Pattern.CASE_INSENSITIVE);
        Matcher specMat = specPat.matcher(cleaned);
        if (specMat.find()) {
            ext.specialty = specMat.group(1).trim();
            cleaned = specMat.replaceAll("");
        }

        ext.cleanText = cleaned.trim();
        return ext;
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

        // 1. Greetings & Introductions
        if (lower.matches("^(hi|hello|hey|greetings|good morning|good afternoon|good evening)[!.]?$") || lower.equals("help")) {
            return "Hello! I am **Sakura**, your AI Healthcare & Hospital Assistant at Iryotek Hospital. 🌸\n\n"
                 + "I can assist you with:\n"
                 + "• Preliminary symptom triage & safe guidance\n"
                 + "• Finding the appropriate hospital department & specialist\n"
                 + "• Checking doctor consultation hours & booking appointments\n"
                 + "• Identifying emergency warning signs\n\n"
                 + "*Please note: I am an AI assistant and not a replacement for a licensed doctor or emergency services.*\n\n"
                 + "How can I support you today? Please tell me what symptoms or health questions you have.";
        }

        // 2. Who are you / Identity
        if (lower.contains("who are you") || lower.contains("what can you do") || lower.contains("your name")) {
            return "I am **Sakura**, Iryotek Hospital's AI Healthcare Assistant. I am designed to evaluate symptoms, guide hospital navigation, provide conservative health education, detect emergencies, and connect you with our medical specialists.";
        }

        // 3. Appointment Requests
        if (lower.contains("appointment") || lower.contains("book doctor") || lower.contains("consult")) {
            return "I would be glad to help you schedule a doctor consultation! 📅\n\n"
                 + "Our specialist doctors are available for in-person consultations Monday through Saturday (8:00 AM - 8:00 PM). Would you like to proceed to our online booking desk?";
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

        // 5. Symptom Triage Fallback for Headache
        if (lower.contains("headache") || lower.contains("head pain")) {
            return "I understand you are experiencing a headache. Headaches can happen for many different reasons, so let's go through this step by step.\n\n"
                 + "### 1. Questions for Clarity\n"
                 + "1. When did the headache start, and is it constant or throbbing?\n"
                 + "2. Where exactly is the pain located (forehead, temples, or one side)?\n"
                 + "3. On a scale of 1 to 10, how severe is the pain?\n"
                 + "4. Are you experiencing fever, vomiting, vision changes, or sensitivity to light?\n\n"
                 + "### 2. Possible Causes (General Information)\n"
                 + "These symptoms can sometimes be associated with tension, screen strain, dehydration, or migraine. A healthcare professional would need to evaluate you to determine the exact cause.\n\n"
                 + "### 3. Immediate Home Care\n"
                 + "• Rest in a quiet, dimly lit room and hydrate with water.\n"
                 + "• Apply a cool cloth to your forehead or neck.\n\n"
                 + "### 4. 🚨 When to Seek Immediate Emergency Help\n"
                 + "If this is a sudden, explosive headache (\"thunderclap\"), or accompanied by high fever, stiff neck, confusion, fainting, or weakness on one side of your body, seek emergency medical care immediately.\n\n"
                 + "### 5. Recommended Department\n"
                 + "Based on your symptoms, **Neurology** or **General Medicine** may be appropriate.\n"
                 + "[TRIAGE: ROUTINE]\n"
                 + "[SPECIALTY: Neurology]";
        }

        // Default Structured Symptom Triage Fallback
        return "I understand you are feeling unwell. Let's go through this step by step so I can help you understand what to do next.\n\n"
             + "### 1. Questions to Help Understand Your Symptoms\n"
             + "1. When did this start and how severe is it from 1 to 10?\n"
             + "2. Where exactly is the discomfort located?\n"
             + "3. Are there any other symptoms such as fever, nausea, or dizziness?\n\n"
             + "### 2. General Information & Safe Next Steps\n"
             + "Rest comfortably, stay hydrated, and monitor your symptoms closely. If you develop sharp pain, high fever, or difficulty breathing, please seek prompt medical care.\n\n"
             + "### 3. Recommended Department at Iryotek Hospital\n"
             + "We recommend an evaluation with our **General Medicine** department for an accurate clinical assessment.\n"
             + "[TRIAGE: ROUTINE]\n"
             + "[SPECIALTY: General Medicine]";
    }
}
