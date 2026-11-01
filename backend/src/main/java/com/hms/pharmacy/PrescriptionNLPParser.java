package com.hms.pharmacy;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Intelligent Natural Language Prescription Parser.
 *
 * Extracts structured medicine name, strength, dosage form, units per dose,
 * frequency, duration, route, and special instructions from free-text clinical instructions.
 *
 * Always feeds extracted parameters into the deterministic PrescriptionQuantityCalculator
 * to validate and compute dispensing quantities safely.
 */
public class PrescriptionNLPParser {

    public static class ParsedPrescriptionItem {
        public String rawText;
        public String medicineName = "";
        public String strength = "";
        public String dosageForm = "Tablet";
        public double unitsPerDose = 1.0;
        public String frequency = "Once daily";
        public int durationDays = 1;
        public String route = "Oral";
        public String specialInstructions = "";
        public int calculatedQuantity = 0;
        public String calculationBreakdown = "";
        public boolean valid = false;
        public String clarificationMessage = "";
        public double confidenceScore = 1.0;

        public boolean isValid() { return valid; }
        public String getMedicineName() { return medicineName; }
        public String getStrength() { return strength; }
        public String getDosageForm() { return dosageForm; }
        public double getUnitsPerDose() { return unitsPerDose; }
        public String getFrequency() { return frequency; }
        public int getDurationDays() { return durationDays; }
        public String getRoute() { return route; }
        public String getSpecialInstructions() { return specialInstructions; }
        public int getCalculatedQuantity() { return calculatedQuantity; }
        public String getCalculationBreakdown() { return calculationBreakdown; }
        public String getClarificationMessage() { return clarificationMessage; }
        public String getUnitLabel() {
            if (dosageForm == null) return "tablets";
            String f = dosageForm.toLowerCase();
            if (f.contains("capsule")) return "capsules";
            if (f.contains("syrup")) return "mL";
            if (f.contains("inhaler")) return calculatedQuantity == 1 ? "canister" : "canisters";
            if (f.contains("ointment") || f.contains("cream")) return calculatedQuantity == 1 ? "tube" : "tubes";
            if (f.contains("drop")) return calculatedQuantity == 1 ? "bottle" : "bottles";
            return "tablets";
        }
    }

    /**
     * Parses a single clinical prescription instruction line.
     * Example: "Paracetamol 500mg 1 tab tid for 5 days after meals"
     * Example: "Amoxicillin 250 mg 2 capsules twice daily for 7 days"
     */
    public static ParsedPrescriptionItem parse(String rawText) {
        ParsedPrescriptionItem item = new ParsedPrescriptionItem();
        item.rawText = rawText != null ? rawText.trim() : "";

        if (item.rawText.isEmpty()) {
            item.valid = false;
            item.clarificationMessage = PrescriptionQuantityCalculator.CLARIFICATION_MSG;
            return item;
        }

        String text = item.rawText;

        // 1. Extract Strength: e.g. "500 mg", "250mg", "100 mcg", "10 mg/5ml", "50.000 I.U."
        Pattern strengthPattern = Pattern.compile("(?i)\\b(\\d+(?:\\.\\d+)?(?:\\s*(?:mg|g|mcg|ml|iu|i\\.u\\.|%)))\\b");
        Matcher strengthMatcher = strengthPattern.matcher(text);
        if (strengthMatcher.find()) {
            item.strength = strengthMatcher.group(1).trim();
        }

        // 2. Extract Duration: e.g. "for 5 days", "7 days", "2 weeks", "1 month"
        Pattern durationPattern = Pattern.compile("(?i)(?:for\\s+)?(\\d+)\\s*(days?|weeks?|months?|d)\\b");
        Matcher durationMatcher = durationPattern.matcher(text);
        if (durationMatcher.find()) {
            int num = Integer.parseInt(durationMatcher.group(1));
            String unit = durationMatcher.group(2).toLowerCase(Locale.ROOT);
            if (unit.startsWith("w")) {
                item.durationDays = num * 7;
            } else if (unit.startsWith("m")) {
                item.durationDays = num * 30;
            } else {
                item.durationDays = num;
            }
        } else {
            // Missing duration
            item.durationDays = 0;
        }

        // 3. Extract Units per dose & Dosage Form: e.g. "1 tablet", "2 capsules", "5 ml", "1 puff"
        Pattern unitsPattern = Pattern.compile("(?i)\\b(\\d+(?:\\.\\d+)?)\\s*(tablets?|tabs?|capsules?|caps?|ml|puffs?|drops?|vials?|ampoules?|sachets?)\\b");
        Matcher unitsMatcher = unitsPattern.matcher(text);
        if (unitsMatcher.find()) {
            try {
                item.unitsPerDose = Double.parseDouble(unitsMatcher.group(1));
            } catch (Exception ignored) {}
            String formStr = unitsMatcher.group(2).toLowerCase(Locale.ROOT);
            if (formStr.startsWith("tab")) item.dosageForm = "Tablet";
            else if (formStr.startsWith("cap")) item.dosageForm = "Capsule";
            else if (formStr.equals("ml")) item.dosageForm = "Syrup";
            else if (formStr.startsWith("puff")) item.dosageForm = "Inhaler";
            else if (formStr.startsWith("drop")) item.dosageForm = "Drop";
            else if (formStr.startsWith("vial") || formStr.startsWith("amp")) item.dosageForm = "Injection";
        } else {
            // Detect implied form from keywords
            if (text.toLowerCase().contains("syrup")) item.dosageForm = "Syrup";
            else if (text.toLowerCase().contains("cream") || text.toLowerCase().contains("ointment")) item.dosageForm = "Ointment";
            else if (text.toLowerCase().contains("inhaler")) item.dosageForm = "Inhaler";
            else if (text.toLowerCase().contains("drop")) item.dosageForm = "Drop";
            else if (text.toLowerCase().contains("capsule")) item.dosageForm = "Capsule";
            else item.dosageForm = "Tablet";
        }

        // 4. Extract Frequency: e.g. "twice daily", "3 times daily", "tid", "bid", "od", "qid"
        Pattern freqPattern = Pattern.compile("(?i)\\b(once\\s+daily|twice\\s+daily|three\\s+times\\s+daily|four\\s+times\\s+daily|thrice\\s+daily|\\d+\\s+times\\s+daily|\\d+\\s+times\\s+a\\s+day|bid|tid|qid|od|q8h|q12h|q6h|q4h|qod|every\\s+\\d+\\s+hours?|prn(?:\\s+max\\s+\\d+\\s+times?)?)\\b");
        Matcher freqMatcher = freqPattern.matcher(text);
        if (freqMatcher.find()) {
            item.frequency = freqMatcher.group(1).trim();
        } else {
            item.frequency = "";
        }

        // 5. Route of Administration
        if (text.toLowerCase().contains("topical") || item.dosageForm.equalsIgnoreCase("Ointment")) {
            item.route = "Topical";
        } else if (text.toLowerCase().contains("inhal") || item.dosageForm.equalsIgnoreCase("Inhaler")) {
            item.route = "Inhalation";
        } else if (text.toLowerCase().contains("ophthalmic") || text.toLowerCase().contains("eye")) {
            item.route = "Ophthalmic";
        } else if (text.toLowerCase().contains("iv") || text.toLowerCase().contains("im") || item.dosageForm.equalsIgnoreCase("Injection")) {
            item.route = "Injection";
        } else {
            item.route = "Oral";
        }

        // 6. Special instructions: e.g. "after food", "before sleep", "with water", "empty stomach"
        Pattern instrPattern = Pattern.compile("(?i)\\b(after\\s+(?:food|meals?)|before\\s+(?:food|meals?|sleep)|with\\s+(?:water|milk)|empty\\s+stomach|at\\s+bedtime|as\\s+needed\\s+for\\s+\\w+)\\b");
        Matcher instrMatcher = instrPattern.matcher(text);
        if (instrMatcher.find()) {
            item.specialInstructions = instrMatcher.group(1).trim();
        }

        // 7. Estimate medicine name by removing parsed components
        String cleaned = text;
        if (!item.strength.isEmpty()) cleaned = cleaned.replace(item.strength, "");
        cleaned = cleaned.replaceAll("(?i)\\b(?:for\\s+)?\\d+\\s*(?:days?|weeks?|months?)\\b", "");
        cleaned = cleaned.replaceAll("(?i)\\b\\d+(?:\\.\\d+)?\\s*(?:tablets?|tabs?|capsules?|caps?|ml|puffs?|drops?)\\b", "");
        if (!item.frequency.isEmpty()) cleaned = cleaned.replaceAll("(?i)\\b" + Pattern.quote(item.frequency) + "\\b", "");
        if (!item.specialInstructions.isEmpty()) cleaned = cleaned.replaceAll("(?i)\\b" + Pattern.quote(item.specialInstructions) + "\\b", "");
        cleaned = cleaned.replaceAll("(?i)(?:^|\\b)(?:medicine|medication|dose|frequency|duration|route)\\s*:\\s*", " ");
        cleaned = cleaned.replaceAll("(?i)\\b(take|po|oral)\\b", " ");
        cleaned = cleaned.replaceAll("[\\r\\n]+", " ");
        cleaned = cleaned.replaceAll("[,;\\-\\:]+", " ").trim();
        item.medicineName = cleaned.replaceAll("\\s{2,}", " ").trim();

        // 8. Run through Deterministic Quantity Calculator
        CalculationResult calc = PrescriptionQuantityCalculator.calculate(
                item.dosageForm,
                item.unitsPerDose,
                item.frequency,
                item.durationDays,
                item.route,
                item.specialInstructions,
                null
        );

        if (calc.isSuccess()) {
            item.valid = true;
            item.calculatedQuantity = calc.getCalculatedQuantity();
            item.calculationBreakdown = calc.getCalculationBreakdown();
            item.clarificationMessage = "";
            item.confidenceScore = 0.95;
        } else {
            item.valid = false;
            item.calculatedQuantity = 0;
            item.calculationBreakdown = "";
            item.clarificationMessage = calc.getClarificationMessage();
            item.confidenceScore = 0.40;
        }

        return item;
    }
}
