package com.hms.pharmacy;

import static org.junit.Assert.*;

import org.junit.Test;

public class PrescriptionQuantityCalculatorTest {

    // -------------------------------------------------------------------------
    // 1. Regular Schedules (Formula: Units × DosesPerDay × Duration)
    // -------------------------------------------------------------------------

    @Test
    public void testParacetamolThreeTimesDailyFiveDays() {
        // Paracetamol 500 mg: 1 tablet, 3 times daily, 5 days -> 1 * 3 * 5 = 15 tablets
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Paracetamol", "500 mg", "Tablet", 1.0, "Three times daily", 5, null, null, null);

        assertTrue("Calculation should be valid", res.isValid());
        assertEquals("Calculated quantity must be 15 tablets", 15, res.getCalculatedQuantity());
        assertEquals("Unit label should be tablets", "tablets", res.getUnitLabel());
        assertTrue("Formula breakdown must record inputs", res.getFormulaBreakdown().contains("1.0 tablet × 3.0 doses/day × 5 days = 15 tablets"));
    }

    @Test
    public void testTwiceDailyCapsulesSevenDays() {
        // Example Medicine 250 mg: 2 capsules, Twice daily, 7 days -> 2 * 2 * 7 = 28 capsules
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Example Medicine", "250 mg", "Capsule", 2.0, "Twice daily", 7, null, null, null);

        assertTrue(res.isValid());
        assertEquals("Calculated quantity must be 28 capsules", 28, res.getCalculatedQuantity());
        assertEquals("capsules", res.getUnitLabel());
        assertTrue(res.getFormulaBreakdown().contains("2.0 capsules × 2.0 doses/day × 7 days = 28 capsules"));
    }

    @Test
    public void testOnceDailySevenDays() {
        // 1 tablet, Once daily, 7 days -> 7 tablets
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Amlodipine", "5 mg", "Tablet", 1.0, "Once daily", 7, null, null, null);

        assertTrue(res.isValid());
        assertEquals(7, res.getCalculatedQuantity());
    }

    @Test
    public void testFourTimesDailyThreeDays() {
        // 1 tablet, Four times daily (QID), 3 days -> 12 tablets
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Amoxicillin", "500 mg", "Tablet", 1.0, "Four times daily", 3, null, null, null);

        assertTrue(res.isValid());
        assertEquals(12, res.getCalculatedQuantity());
    }

    @Test
    public void testHourlyIntervalsEvery8Hours() {
        // 1 tablet every 8 hours (3 doses/day) for 5 days -> 15 tablets
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Metronidazole", "400 mg", "Tablet", 1.0, "Every 8 hours", 5, null, null, null);

        assertTrue(res.isValid());
        assertEquals(15, res.getCalculatedQuantity());
    }

    // -------------------------------------------------------------------------
    // 2. Strength vs Dose Distinction Safeguard
    // -------------------------------------------------------------------------

    @Test
    public void testNeverConfuseStrengthWithQuantityToDispense() {
        // Strength: 500 mg, Dose: 1 tablet, Frequency: 3 times daily, Duration: 5 days.
        // Quantity should be 15 tablets, NOT 500 or 1500.
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Paracetamol", "500 mg", "Tablet", 1.0, "Three times daily", 5, null, null, null);

        assertTrue(res.isValid());
        assertNotEquals("Must not confuse strength with dispense quantity", 500, res.getCalculatedQuantity());
        assertNotEquals("Must not confuse strength * duration with quantity", 2500, res.getCalculatedQuantity());
        assertEquals(15, res.getCalculatedQuantity());
    }

    // -------------------------------------------------------------------------
    // 3. Liquid Formulations (Volume in mL)
    // -------------------------------------------------------------------------

    @Test
    public void testLiquidVolumeCalculationInML() {
        // 5 mL, Three times daily, 4 days -> 5 * 3 * 4 = 60 mL
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Cough Syrup", "100 mg/5 mL", "Syrup", 5.0, "Three times daily", 4, null, null, null);

        assertTrue(res.isValid());
        assertEquals("Calculated volume must be 60 mL", 60, res.getCalculatedQuantity());
        assertEquals("mL", res.getUnitLabel());
    }

    // -------------------------------------------------------------------------
    // 4. Special Formulations (Inhalers, Ointments, Eye Drops, Fractional Tablets)
    // -------------------------------------------------------------------------

    @Test
    public void testInhalerCanisterDispensingRules() {
        // 2 puffs twice daily for 30 days = 120 puffs. Standard canister = 200 puffs -> 1 canister.
        CalculationResult res1 = PrescriptionQuantityCalculator.calculate(
                "Salbutamol Inhaler", "100 mcg", "Inhaler", 2.0, "Twice daily", 30, null, null, null);

        assertTrue(res1.isValid());
        assertEquals(1, res1.getCalculatedQuantity());
        assertEquals("canister", res1.getUnitLabel());

        // 4 puffs 4 times daily for 30 days = 480 puffs -> 3 canisters
        CalculationResult res2 = PrescriptionQuantityCalculator.calculate(
                "Salbutamol Inhaler", "100 mcg", "Inhaler", 4.0, "Four times daily", 30, null, null, null);

        assertTrue(res2.isValid());
        assertEquals(3, res2.getCalculatedQuantity());
        assertEquals("canisters", res2.getUnitLabel());
    }

    @Test
    public void testTopicalOintmentDispensingRules() {
        // Applied twice daily for 14 days -> 1 tube
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Hydrocortisone Cream", "1%", "Ointment", 1.0, "Twice daily", 14, null, null, null);

        assertTrue(res.isValid());
        assertEquals(1, res.getCalculatedQuantity());
        assertEquals("tube", res.getUnitLabel());
    }

    @Test
    public void testEyeDropsDispensingRules() {
        // 1 drop twice daily for 14 days -> 1 bottle
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Ciprofloxacin Eye Drops", "0.3%", "Drops", 1.0, "Twice daily", 14, null, null, null);

        assertTrue(res.isValid());
        assertEquals(1, res.getCalculatedQuantity());
        assertEquals("bottle", res.getUnitLabel());
    }

    @Test
    public void testFractionalTabletDispensing() {
        // 0.5 tablet once daily for 14 days -> 7 tablets
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Thyroxine", "50 mcg", "Tablet", 0.5, "Once daily", 14, null, null, null);

        assertTrue(res.isValid());
        assertEquals(7, res.getCalculatedQuantity());
    }

    // -------------------------------------------------------------------------
    // 5. PRN and Alternating Schedules
    // -------------------------------------------------------------------------

    @Test
    public void testPrnWithAuthorizedMaximumFrequency() {
        // PRN max 3 times daily for 5 days, 1 tablet per dose -> 15 tablets
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Ibuprofen", "400 mg", "Tablet", 1.0, "PRN max 3 times daily", 5, null, null, null);

        assertTrue(res.isValid());
        assertEquals(15, res.getCalculatedQuantity());
    }

    @Test
    public void testAlternatingDaySchedule() {
        // 1 tablet every other day for 10 days -> 1 * 0.5 * 10 = 5 tablets
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Warfarin", "2 mg", "Tablet", 1.0, "Every other day", 10, null, null, null);

        assertTrue(res.isValid());
        assertEquals(5, res.getCalculatedQuantity());
    }

    // -------------------------------------------------------------------------
    // 6. Safeguards: Missing Information & Ambiguity Handling
    // -------------------------------------------------------------------------

    @Test
    public void testMissingDurationTriggersClarificationRequired() {
        // Missing treatment duration (0 days) must NOT be inferred or guessed
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Paracetamol", "500 mg", "Tablet", 1.0, "Three times daily", 0, null, null, null);

        assertFalse("Must not calculate without duration", res.isValid());
        assertEquals("Must display exact clinical clarification message",
                PrescriptionQuantityCalculator.CLARIFICATION_REQUIRED_MESSAGE,
                res.getClarificationReason());
    }

    @Test
    public void testMissingFrequencyTriggersClarificationRequired() {
        // Missing frequency must NOT be invented
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Paracetamol", "500 mg", "Tablet", 1.0, null, 5, null, null, null);

        assertFalse("Must not calculate without frequency", res.isValid());
        assertEquals(PrescriptionQuantityCalculator.CLARIFICATION_REQUIRED_MESSAGE, res.getClarificationReason());
    }

    @Test
    public void testMissingUnitsPerDoseTriggersClarificationRequired() {
        // Zero or missing units per dose must NOT default blindly to 1 tablet
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Paracetamol", "500 mg", "Tablet", 0.0, "Three times daily", 5, null, null, null);

        assertFalse("Must not assume dose without specification", res.isValid());
        assertEquals(PrescriptionQuantityCalculator.CLARIFICATION_REQUIRED_MESSAGE, res.getClarificationReason());
    }

    @Test
    public void testUnstructuredPrnWithoutMaxFrequencyTriggersClarification() {
        // Generic PRN without daily limit cannot safely calculate dispensing quantity
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Tramadol", "50 mg", "Tablet", 1.0, "As needed", 7, null, null, null);

        assertFalse(res.isValid());
        assertEquals(PrescriptionQuantityCalculator.CLARIFICATION_REQUIRED_MESSAGE, res.getClarificationReason());
    }

    @Test
    public void testInconsistencyBetweenCalculatedAndExplicitQuantity() {
        // Doctor explicitly writes 10 tablets, but formula calculates 1 * 3 * 5 = 15 tablets
        CalculationResult res = PrescriptionQuantityCalculator.calculate(
                "Paracetamol", "500 mg", "Tablet", 1.0, "Three times daily", 5, null, null, 10);

        assertTrue(res.isValid());
        assertTrue("Inconsistency flag must be set", res.isInconsistencyDetected());
        assertTrue("Must alert inconsistency", res.getInconsistencyMessage().contains("Discrepancy detected"));
    }

    // -------------------------------------------------------------------------
    // 7. NLP Natural Language Clinical Extraction
    // -------------------------------------------------------------------------

    @Test
    public void testNLPParserExtractsParacetamolRegimen() {
        String text = "Paracetamol 500 mg\nDose: 1 tablet\nFrequency: 3 times daily\nDuration: 5 days";
        PrescriptionNLPParser.ParsedPrescriptionItem parsed = PrescriptionNLPParser.parse(text);

        assertTrue("Parsed item must be valid", parsed.isValid());
        assertEquals("Paracetamol", parsed.getMedicineName());
        assertEquals("500 mg", parsed.getStrength());
        assertEquals(1.0, parsed.getUnitsPerDose(), 0.001);
        assertEquals(5, parsed.getDurationDays());
        assertEquals(15, parsed.getCalculatedQuantity());
        assertEquals("tablets", parsed.getUnitLabel());
    }

    @Test
    public void testNLPParserExtractsCapsuleRegimen() {
        String text = "Medicine: Example Medicine 250 mg\nDose: 2 capsules\nFrequency: Twice daily\nDuration: 7 days";
        PrescriptionNLPParser.ParsedPrescriptionItem parsed = PrescriptionNLPParser.parse(text);

        assertTrue(parsed.isValid());
        assertEquals("Example Medicine", parsed.getMedicineName());
        assertEquals("250 mg", parsed.getStrength());
        assertEquals(2.0, parsed.getUnitsPerDose(), 0.001);
        assertEquals(7, parsed.getDurationDays());
        assertEquals(28, parsed.getCalculatedQuantity());
        assertEquals("capsules", parsed.getUnitLabel());
    }
}
