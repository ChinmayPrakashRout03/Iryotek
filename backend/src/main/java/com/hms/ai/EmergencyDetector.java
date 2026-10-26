package com.hms.ai;

import java.util.regex.Pattern;

public class EmergencyDetector {

    // Regex patterns for critical life-threatening medical emergencies
    private static final Pattern CHEST_PAIN_PATTERN = Pattern.compile(
        "\\b(chest pain|chest pressure|heart attack|crushing pain in chest|pain radiating to (left arm|jaw|neck)|cardiac arrest)\\b",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern STROKE_PATTERN = Pattern.compile(
        "\\b(stroke|facial droop|face drooping|slurred speech|speech difficulty|weakness on one side|paralysis on one side|loss of balance and speech)\\b",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern BREATHING_PATTERN = Pattern.compile(
        "\\b(can'?t breathe|cannot breathe|severe breathing difficulty|severe shortness of breath|gasping for air|suffocating|choking|blue lips)\\b",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern UNCONSCIOUS_PATTERN = Pattern.compile(
        "\\b(unconscious|passed out|loss of consciousness|fainted and not waking|unresponsive|blackout)\\b",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern BLEEDING_TRAUMA_PATTERN = Pattern.compile(
        "\\b(uncontrolled bleeding|bleeding profusely|severe bleeding|gushing blood|deep stab|gunshot|severe burn|major accident)\\b",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ANAPHYLAXIS_POISON_PATTERN = Pattern.compile(
        "\\b(throat swelling|anaphylaxis|severe allergic reaction|poisoning|drank poison|overdose|snake bite)\\b",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern SEIZURE_PATTERN = Pattern.compile(
        "\\b(continuous seizure|status epilepticus|seizures not stopping|violent convulsion)\\b",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern CRISIS_PATTERN = Pattern.compile(
        "\\b(suicid|kill myself|end my life|want to die|self harm|hurt myself)\\b",
        Pattern.CASE_INSENSITIVE
    );

    public static class DetectionResult {
        private final boolean isEmergency;
        private final String emergencyType;
        private final String guidance;

        public DetectionResult(boolean isEmergency, String emergencyType, String guidance) {
            this.isEmergency = isEmergency;
            this.emergencyType = emergencyType;
            this.guidance = guidance;
        }

        public boolean isEmergency() {
            return isEmergency;
        }

        public String getEmergencyType() {
            return emergencyType;
        }

        public String getGuidance() {
            return guidance;
        }
    }

    public static DetectionResult checkEmergency(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new DetectionResult(false, null, null);
        }

        String input = text.trim();

        // 1. Mental health safety / Crisis
        if (CRISIS_PATTERN.matcher(input).find()) {
            String guidance = "🚨 **IMMEDIATE CRISIS ASSISTANCE REQUIRED**\n\n"
                    + "If you or someone you know is struggling or in crisis, please know that help is available right now. You are not alone.\n\n"
                    + "• **National Suicide & Crisis Lifeline:** Call or text **988** (available 24/7, free and confidential)\n"
                    + "• **Iryotek Hospital Emergency Support:** **+202-555-0191**\n"
                    + "• **Emergency Services:** Please call your local emergency number (such as 911 / 112) or go to the nearest emergency room immediately.\n\n"
                    + "Please reach out to emergency services or a trusted loved one near you right away.";
            return new DetectionResult(true, "CRISIS", guidance);
        }

        // 2. Chest pain / Cardiac
        if (CHEST_PAIN_PATTERN.matcher(input).find()) {
            String guidance = "🚨 **MEDICAL EMERGENCY ALERT (CARDIOVASCULAR)**\n\n"
                    + "**Your symptoms could indicate a serious cardiovascular emergency.** Please do not wait for an online assessment.\n\n"
                    + "1. **Call Emergency Services immediately** (911 / 112) or our 24/7 Trauma Desk at **+202-555-0191**.\n"
                    + "2. Go to the nearest Hospital Emergency Room right away.\n"
                    + "3. Sit comfortably, loosen tight clothing, and remain calm while help arrives.\n"
                    + "4. Do not attempt to drive yourself to the hospital.";
            return new DetectionResult(true, "CARDIAC", guidance);
        }

        // 3. Stroke (FAST)
        if (STROKE_PATTERN.matcher(input).find()) {
            String guidance = "🚨 **POTENTIAL MEDICAL EMERGENCY (STROKE SIGNS)**\n\n"
                    + "**Sudden facial drooping, arm weakness, or slurred speech are critical stroke warning signs (F.A.S.T.).** Every minute matters.\n\n"
                    + "1. **Call Emergency Services immediately** (911 / 112) or Iryotek Emergency Desk: **+202-555-0191**.\n"
                    + "2. Transport the patient to the nearest acute stroke/emergency center without delay.\n"
                    + "3. Note the exact time symptoms started.\n"
                    + "4. Do not administer food, liquids, or oral medications.";
            return new DetectionResult(true, "STROKE", guidance);
        }

        // 4. Severe Breathing
        if (BREATHING_PATTERN.matcher(input).find()) {
            String guidance = "🚨 **MEDICAL EMERGENCY ALERT (ACUTE RESPIRATORY DISTRESS)**\n\n"
                    + "**Severe difficulty breathing or gasping for air is a medical emergency requiring immediate in-person attention.**\n\n"
                    + "1. **Call Emergency Services immediately** or contact Iryotek 24/7 Trauma Desk at **+202-555-0191**.\n"
                    + "2. Sit upright in a comfortable position to ease airway flow.\n"
                    + "3. Loosen restrictive clothing around your neck and chest.\n"
                    + "4. If you have prescribed rescue medication (e.g. asthma inhaler), use it as directed while awaiting emergency personnel.";
            return new DetectionResult(true, "RESPIRATORY", guidance);
        }

        // 5. Unconscious / Unresponsive
        if (UNCONSCIOUS_PATTERN.matcher(input).find()) {
            String guidance = "🚨 **CRITICAL MEDICAL EMERGENCY (LOSS OF CONSCIOUSNESS)**\n\n"
                    + "**An unresponsive or unconscious person requires immediate emergency medical evaluation.**\n\n"
                    + "1. **Call Emergency Services immediately** (911 / 112 / +202-555-0191).\n"
                    + "2. Check if the person is breathing normally.\n"
                    + "3. If breathing, place them in the recovery position (on their side) to keep the airway clear.\n"
                    + "4. If not breathing, begin CPR immediately if trained, or follow dispatcher instructions.";
            return new DetectionResult(true, "UNCONSCIOUS", guidance);
        }

        // 6. Severe Bleeding / Trauma
        if (BLEEDING_TRAUMA_PATTERN.matcher(input).find()) {
            String guidance = "🚨 **MEDICAL EMERGENCY ALERT (TRAUMA / SEVERE BLEEDING)**\n\n"
                    + "**Uncontrolled bleeding or severe physical trauma requires urgent medical intervention.**\n\n"
                    + "1. **Call Emergency Services immediately** (+202-555-0191 or local emergency).\n"
                    + "2. Apply firm, direct pressure to the wound with a clean cloth or sterile bandage.\n"
                    + "3. Keep the injured area elevated above heart level if possible and safe to do so.\n"
                    + "4. Do not remove large impaled objects; stabilize them and await paramedics.";
            return new DetectionResult(true, "TRAUMA", guidance);
        }

        // 7. Anaphylaxis / Poison
        if (ANAPHYLAXIS_POISON_PATTERN.matcher(input).find()) {
            String guidance = "🚨 **MEDICAL EMERGENCY ALERT (ANAPHYLAXIS / TOXICITY)**\n\n"
                    + "**Throat swelling, severe allergic reactions, or suspected poisoning can rapidly become life-threatening.**\n\n"
                    + "1. **Call Emergency Services immediately** or Poison Control / Iryotek Trauma Desk (**+202-555-0191**).\n"
                    + "2. If you have an epinephrine auto-injector (EpiPen) for severe allergies, use it as prescribed.\n"
                    + "3. For poisoning, have the substance or container ready to identify for emergency responders.\n"
                    + "4. Do not induce vomiting unless specifically instructed by Poison Control.";
            return new DetectionResult(true, "ANAPHYLAXIS", guidance);
        }

        // 8. Seizures
        if (SEIZURE_PATTERN.matcher(input).find()) {
            String guidance = "🚨 **MEDICAL EMERGENCY ALERT (PROLONGED SEIZURE)**\n\n"
                    + "**Continuous or non-stopping seizures (Status Epilepticus) require rapid emergency medical intervention.**\n\n"
                    + "1. **Call Emergency Services immediately** (+202-555-0191).\n"
                    + "2. Clear the area of sharp or hard objects to prevent physical injury.\n"
                    + "3. Gently roll the person onto one side once safe.\n"
                    + "4. **Never** place any object or finger inside their mouth during a seizure.";
            return new DetectionResult(true, "SEIZURE", guidance);
        }

        return new DetectionResult(false, null, null);
    }
}
