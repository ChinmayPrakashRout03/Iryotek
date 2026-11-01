package com.hms.pharmacy;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Deterministic Prescription Quantity Calculation Engine.
 *
 * Implements strict clinical dispensing arithmetic with safety safeguards:
 * - Distinguishes medicine strength (e.g. 500 mg) from units per dose (e.g. 1 tablet).
 * - Applies formulation-specific dispensing rules (liquids in mL, inhalers in canisters, creams in tubes, drops in bottles).
 * - Handles PRN (as-needed) medicines safely using authorized maximum daily frequency.
 * - Flags ambiguous, missing, or contradictory inputs with mandatory clarification message.
 * - Detects discrepancies between calculated quantities and explicitly prescribed quantities.
 */
public class PrescriptionQuantityCalculator {

    public static final String CLARIFICATION_MSG =
            "Prescription clarification required. The medicine quantity cannot be calculated safely from the available instructions.";
    public static final String CLARIFICATION_REQUIRED_MESSAGE = CLARIFICATION_MSG;

    public static CalculationResult calculate(String medicineName,
                                              String strength,
                                              String dosageForm,
                                              Double unitsPerDose,
                                              String frequencyStr,
                                              Integer durationDays,
                                              String route,
                                              String specialInstructions,
                                              Integer explicitPrescribedQty) {
        return calculate(dosageForm, unitsPerDose, frequencyStr, durationDays, route, specialInstructions, explicitPrescribedQty);
    }

    /**
     * Core deterministic calculation entry point.
     *
     * @param dosageForm           Formulation type (Tablet, Capsule, Syrup, Inhaler, Ointment, Drop, Injection, etc.)
     * @param unitsPerDose         Units prescribed per individual administration (e.g., 1.0 tablet, 2.0 capsules, 5.0 mL, 2 puffs)
     * @param frequencyStr         Frequency string or abbreviation (e.g., "Three times daily", "BID", "TID", "PRN max 3 times daily")
     * @param durationDays         Treatment duration in whole days (must be > 0)
     * @param route                Route of administration (Oral, Inhalation, Topical, Ophthalmic, etc.)
     * @param specialInstructions  Additional clinician instructions (e.g. "after meals", "taper by 1 tab", "PRN for pain")
     * @param explicitPrescribedQty Explicit quantity if doctor specified one manually (0 if unstated)
     * @return CalculationResult with exact calculation, unit of measure, breakdown, or clarification requirement
     */
    public static CalculationResult calculate(String dosageForm,
                                              Double unitsPerDose,
                                              String frequencyStr,
                                              Integer durationDays,
                                              String route,
                                              String specialInstructions,
                                              Integer explicitPrescribedQty) {

        // 1. Safeguard: Validate Treatment Duration (Never infer missing duration)
        if (durationDays == null || durationDays <= 0) {
            return CalculationResult.clarification("Treatment duration is missing or non-positive");
        }

        // 2. Safeguard: Validate Units Per Dose (Never assume 1 tablet per dose unless explicitly authorized)
        if (unitsPerDose == null || unitsPerDose <= 0.0) {
            return CalculationResult.clarification("Units per dose is missing or non-positive");
        }

        // 3. Safeguard: Validate Frequency (Never invent missing frequency)
        if (frequencyStr == null || frequencyStr.trim().isEmpty()) {
            return CalculationResult.clarification("Administration frequency is missing");
        }

        String normalizedFreq = frequencyStr.trim().toLowerCase(Locale.ROOT);
        String normalizedForm = (dosageForm != null ? dosageForm.trim().toLowerCase(Locale.ROOT) : "tablet");
        String normalizedInstr = (specialInstructions != null ? specialInstructions.trim().toLowerCase(Locale.ROOT) : "");

        // 4. Safeguard: Detect Tapering or Variable Dosing schedules
        if (normalizedInstr.contains("taper") || normalizedInstr.contains("step down") ||
            normalizedInstr.contains("titrat") || normalizedInstr.contains("variable dose") ||
            normalizedFreq.contains("taper")) {
            return CalculationResult.clarification("Variable or tapering dosing schedule requires clinical pharmacist review");
        }

        // 5. Evaluate Doses Per Day (handling regular vs PRN)
        boolean isPrn = normalizedFreq.contains("prn") || normalizedFreq.contains("as needed") ||
                        normalizedInstr.contains("prn") || normalizedInstr.contains("as needed");

        Double dosesPerDay = resolveDosesPerDay(normalizedFreq);

        if (isPrn) {
            if (dosesPerDay == null || dosesPerDay <= 0) {
                return CalculationResult.clarification("PRN medicine lacks specified maximum daily frequency limit");
            }
        } else {
            if (dosesPerDay == null || dosesPerDay <= 0) {
                return CalculationResult.clarification("Ambiguous or unrecognized frequency abbreviation: '" + frequencyStr + "'");
            }
        }

        // 6. Formulation-Specific Dispensing Logic
        String unitOfMeasure = resolveUnitOfMeasure(normalizedForm);
        double totalUnits = unitsPerDose * dosesPerDay * durationDays;

        int finalDispenseQuantity;
        String breakdown;

        if (isLiquidFormulation(normalizedForm)) {
            // Liquids: Total volume in mL
            finalDispenseQuantity = (int) Math.ceil(totalUnits);
            unitOfMeasure = "mL";
            breakdown = String.format(Locale.ROOT, "%.1f mL × %.1f doses/day × %d days = %d mL",
                    unitsPerDose, dosesPerDay, durationDays, finalDispenseQuantity);

        } else if (isInhalerFormulation(normalizedForm)) {
            // Inhalers: Dispense in whole canisters (Standard canister delivers ~200 actuations)
            int totalActuations = (int) Math.ceil(totalUnits);
            int actuationsPerCanister = 200;
            finalDispenseQuantity = Math.max(1, (int) Math.ceil((double) totalActuations / actuationsPerCanister));
            unitOfMeasure = finalDispenseQuantity == 1 ? "canister" : "canisters";
            breakdown = String.format(Locale.ROOT, "%.0f puffs × %.1f doses/day × %d days = %d puffs (~%d %s)",
                    unitsPerDose, dosesPerDay, durationDays, totalActuations, finalDispenseQuantity, unitOfMeasure);

        } else if (isTopicalFormulation(normalizedForm)) {
            // Creams / Ointments: Dispense by unit tube / pack
            finalDispenseQuantity = Math.max(1, (int) Math.ceil((double) durationDays / 14.0)); // standard 1 tube per 14 days course
            unitOfMeasure = finalDispenseQuantity == 1 ? "tube" : "tubes";
            breakdown = String.format(Locale.ROOT, "Topical application × %d days duration = %d %s",
                    durationDays, finalDispenseQuantity, unitOfMeasure);

        } else if (isDropFormulation(normalizedForm)) {
            // Eye/Ear/Nasal Drops: Dispense by unit bottle (standard bottle lasts ~15-30 days)
            finalDispenseQuantity = Math.max(1, (int) Math.ceil((double) durationDays / 28.0));
            unitOfMeasure = finalDispenseQuantity == 1 ? "bottle" : "bottles";
            breakdown = String.format(Locale.ROOT, "%.0f drops × %.1f doses/day × %d days = %d %s",
                    unitsPerDose, dosesPerDay, durationDays, finalDispenseQuantity, unitOfMeasure);

        } else if (isInjectionFormulation(normalizedForm)) {
            // Injections: Single-use vials or ampoules
            finalDispenseQuantity = (int) Math.ceil(totalUnits);
            unitOfMeasure = finalDispenseQuantity == 1 ? "vial" : "vials";
            breakdown = String.format(Locale.ROOT, "%.1f units × %.1f doses/day × %d days = %d %s",
                    unitsPerDose, dosesPerDay, durationDays, finalDispenseQuantity, unitOfMeasure);

        } else {
            // Solid Oral Dose (Tablets, Capsules):
            // Fractional tablets (e.g. 0.5 tablet) round up to nearest whole tablet for dispensing
            finalDispenseQuantity = (int) Math.ceil(totalUnits);
            if (unitsPerDose == 1.0) {
                breakdown = String.format(Locale.ROOT, "1.0 %s × %.1f doses/day × %d days = %d %s",
                        unitOfMeasure, dosesPerDay, durationDays, finalDispenseQuantity,
                        pluralize(unitOfMeasure, finalDispenseQuantity));
            } else {
                breakdown = String.format(Locale.ROOT, "%.1f %s × %.1f doses/day × %d days = %d %s",
                        unitsPerDose, pluralize(unitOfMeasure, 2), dosesPerDay, durationDays, finalDispenseQuantity,
                        pluralize(unitOfMeasure, finalDispenseQuantity));
            }
            unitOfMeasure = pluralize(unitOfMeasure, finalDispenseQuantity);
        }

        if (isPrn) {
            breakdown = "[PRN Max] " + breakdown;
        }

        // 7. Safeguard: Inconsistency detection with explicitly entered quantities
        if (explicitPrescribedQty != null && explicitPrescribedQty > 0) {
            if (explicitPrescribedQty != finalDispenseQuantity) {
                String warn = String.format(Locale.ROOT,
                        "Discrepancy detected: Explicit quantity (%d) differs from calculated requirement (%d). Doctor override recorded.",
                        explicitPrescribedQty, finalDispenseQuantity);
                return CalculationResult.successWithWarning(explicitPrescribedQty, totalUnits, unitOfMeasure, breakdown, warn);
            }
        }

        return CalculationResult.success(finalDispenseQuantity, totalUnits, unitOfMeasure, breakdown);
    }

    /**
     * Resolves doses per day from standard medical schedules, frequencies, and abbreviations.
     */
    public static Double resolveDosesPerDay(String frequency) {
        if (frequency == null) return null;
        String f = frequency.trim().toLowerCase(Locale.ROOT);

        // Explicit numerical patterns: "3 times daily", "2 times a day", "every 8 hours"
        Matcher timesMatcher = Pattern.compile("(\\d+)\\s*(times?|x)\\s*(a|per|daily|day)?").matcher(f);
        if (timesMatcher.find()) {
            try {
                return Double.parseDouble(timesMatcher.group(1));
            } catch (NumberFormatException ignored) {}
        }

        Matcher everyHoursMatcher = Pattern.compile("every\\s*(\\d+)\\s*(hours?|hrs?|h)").matcher(f);
        if (everyHoursMatcher.find()) {
            try {
                double hours = Double.parseDouble(everyHoursMatcher.group(1));
                if (hours > 0 && hours <= 24) {
                    return 24.0 / hours;
                }
            } catch (NumberFormatException ignored) {}
        }

        // Standard medical abbreviations
        if (f.equals("once daily") || f.equals("once a day") || f.equals("daily") ||
            f.equals("od") || f.equals("q24h") || f.equals("q.d.") || f.equals("qd")) {
            return 1.0;
        }
        if (f.equals("twice daily") || f.equals("twice a day") || f.equals("bid") ||
            f.equals("b.i.d.") || f.equals("q12h") || f.equals("morning and night")) {
            return 2.0;
        }
        if (f.equals("three times daily") || f.equals("three times a day") || f.equals("tid") ||
            f.equals("t.i.d.") || f.equals("thrice daily") || f.equals("q8h")) {
            return 3.0;
        }
        if (f.equals("four times daily") || f.equals("four times a day") || f.equals("qid") ||
            f.equals("q.i.d.") || f.equals("q6h")) {
            return 4.0;
        }
        if (f.equals("every 4 hours") || f.equals("q4h")) {
            return 6.0;
        }
        if (f.equals("every other day") || f.equals("qod") || f.equals("q.o.d.")) {
            return 0.5;
        }

        // PRN with max limit: e.g. "PRN max 3 times daily", "max 2 doses/day"
        Matcher prnMaxMatcher = Pattern.compile("max\\s*(\\d+)\\s*(doses?|times?)?").matcher(f);
        if (prnMaxMatcher.find()) {
            try {
                return Double.parseDouble(prnMaxMatcher.group(1));
            } catch (NumberFormatException ignored) {}
        }

        return null;
    }

    private static boolean isLiquidFormulation(String form) {
        return form.contains("syrup") || form.contains("liquid") || form.contains("suspension") ||
               form.contains("solution") || form.contains("elixir");
    }

    private static boolean isInhalerFormulation(String form) {
        return form.contains("inhaler") || form.contains("aerosol") || form.contains("mdi") ||
               form.contains("puff") || form.contains("rotacap") || form.contains("diskus");
    }

    private static boolean isTopicalFormulation(String form) {
        return form.contains("cream") || form.contains("ointment") || form.contains("gel") ||
               form.contains("lotion") || form.contains("topical");
    }

    private static boolean isDropFormulation(String form) {
        return form.contains("drop") || form.contains("eye") || form.contains("ear") ||
               form.contains("nasal") || form.contains("ophthalmic");
    }

    private static boolean isInjectionFormulation(String form) {
        return form.contains("inject") || form.contains("vial") || form.contains("ampoule") ||
               form.contains("iv") || form.contains("infusion");
    }

    private static String resolveUnitOfMeasure(String form) {
        if (form.contains("capsule") || form.contains("cap")) return "capsule";
        if (form.contains("tablet") || form.contains("tab")) return "tablet";
        if (isLiquidFormulation(form)) return "mL";
        if (isInhalerFormulation(form)) return "canister";
        if (isTopicalFormulation(form)) return "tube";
        if (isDropFormulation(form)) return "bottle";
        if (isInjectionFormulation(form)) return "vial";
        return "unit";
    }

    private static String pluralize(String unit, int qty) {
        if (qty <= 1) return unit;
        if (unit.endsWith("s")) return unit;
        return unit + "s";
    }
}
