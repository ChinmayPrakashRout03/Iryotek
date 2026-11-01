package com.hms.pharmacy;

public class CalculationResult {

    private final boolean success;
    private final int calculatedQuantity;
    private final double exactUnits;
    private final String unitOfMeasure;
    private final String calculationBreakdown;
    private final boolean clarificationRequired;
    private final String clarificationMessage;
    private final boolean warning;
    private final String warningMessage;

    public static final String CLARIFICATION_REQUIRED_MSG =
            "Prescription clarification required. The medicine quantity cannot be calculated safely from the available instructions.";

    private CalculationResult(boolean success, int calculatedQuantity, double exactUnits,
                              String unitOfMeasure, String calculationBreakdown,
                              boolean clarificationRequired, String clarificationMessage,
                              boolean warning, String warningMessage) {
        this.success = success;
        this.calculatedQuantity = calculatedQuantity;
        this.exactUnits = exactUnits;
        this.unitOfMeasure = unitOfMeasure != null ? unitOfMeasure : "units";
        this.calculationBreakdown = calculationBreakdown != null ? calculationBreakdown : "";
        this.clarificationRequired = clarificationRequired;
        this.clarificationMessage = clarificationMessage != null ? clarificationMessage : "";
        this.warning = warning;
        this.warningMessage = warningMessage != null ? warningMessage : "";
    }

    public static CalculationResult success(int calculatedQuantity, double exactUnits, String unitOfMeasure, String breakdown) {
        return new CalculationResult(true, calculatedQuantity, exactUnits, unitOfMeasure, breakdown, false, null, false, null);
    }

    public static CalculationResult successWithWarning(int calculatedQuantity, double exactUnits, String unitOfMeasure, String breakdown, String warning) {
        return new CalculationResult(true, calculatedQuantity, exactUnits, unitOfMeasure, breakdown, false, null, true, warning);
    }

    public static CalculationResult clarification(String specificReason) {
        return new CalculationResult(false, 0, 0.0, "units", "", true, CLARIFICATION_REQUIRED_MSG, true, specificReason);
    }

    public static final String CLARIFICATION_REQUIRED_MESSAGE = CLARIFICATION_REQUIRED_MSG;

    public boolean isSuccess() {
        return success;
    }

    public boolean isValid() {
        return success;
    }

    public String getFormulaBreakdown() {
        return calculationBreakdown;
    }

    public String getUnitLabel() {
        return unitOfMeasure;
    }

    public String getClarificationReason() {
        return clarificationMessage;
    }

    public boolean isInconsistencyDetected() {
        return warning && warningMessage != null && warningMessage.toLowerCase().contains("discrepancy");
    }

    public String getInconsistencyMessage() {
        return warningMessage;
    }

    public int getCalculatedQuantity() {
        return calculatedQuantity;
    }

    public double getExactUnits() {
        return exactUnits;
    }

    public String getUnitOfMeasure() {
        return unitOfMeasure;
    }

    public String getCalculationBreakdown() {
        return calculationBreakdown;
    }

    public boolean isClarificationRequired() {
        return clarificationRequired;
    }

    public String getClarificationMessage() {
        return clarificationMessage;
    }

    public boolean hasWarning() {
        return warning;
    }

    public String getWarningMessage() {
        return warningMessage;
    }

    @Override
    public String toString() {
        if (!success) {
            return "CalculationResult{FAILED: " + clarificationMessage + "}";
        }
        return "CalculationResult{" + calculatedQuantity + " " + unitOfMeasure + " (" + calculationBreakdown + ")}";
    }
}
