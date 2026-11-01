package com.hms.doctor.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.hms.pharmacy.CalculationResult;
import com.hms.pharmacy.PrescriptionNLPParser;
import com.hms.pharmacy.PrescriptionNLPParser.ParsedPrescriptionItem;
import com.hms.pharmacy.PrescriptionQuantityCalculator;

@WebServlet("/parsePrescription")
public class PrescriptionParseServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        process(req, resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        process(req, resp);
    }

    private void process(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();
        JsonObject responseJson = new JsonObject();

        String rawText = req.getParameter("rawText");
        String dosageForm = req.getParameter("dosageForm");
        String unitsStr = req.getParameter("unitsPerDose");
        String frequency = req.getParameter("frequency");
        String durationStr = req.getParameter("durationDays");
        String route = req.getParameter("route");
        String instructions = req.getParameter("specialInstructions");
        String explicitQtyStr = req.getParameter("explicitQuantity");

        try {
            if (rawText != null && !rawText.trim().isEmpty()) {
                // Natural text parsing mode
                ParsedPrescriptionItem parsed = PrescriptionNLPParser.parse(rawText);
                responseJson.addProperty("mode", "nlp");
                responseJson.addProperty("medicineName", parsed.medicineName);
                responseJson.addProperty("strength", parsed.strength);
                responseJson.addProperty("dosageForm", parsed.dosageForm);
                responseJson.addProperty("unitsPerDose", parsed.unitsPerDose);
                responseJson.addProperty("frequency", parsed.frequency);
                responseJson.addProperty("durationDays", parsed.durationDays);
                responseJson.addProperty("route", parsed.route);
                responseJson.addProperty("specialInstructions", parsed.specialInstructions);
                responseJson.addProperty("calculatedQuantity", parsed.calculatedQuantity);
                responseJson.addProperty("calculationBreakdown", parsed.calculationBreakdown);
                responseJson.addProperty("valid", parsed.valid);
                responseJson.addProperty("clarificationMessage", parsed.clarificationMessage);
                responseJson.addProperty("confidenceScore", parsed.confidenceScore);

            } else {
                // Structured parameter calculation mode
                Double units = (unitsStr != null && !unitsStr.trim().isEmpty()) ? Double.parseDouble(unitsStr.trim()) : null;
                Integer duration = (durationStr != null && !durationStr.trim().isEmpty()) ? Integer.parseInt(durationStr.trim()) : null;
                Integer explicitQty = (explicitQtyStr != null && !explicitQtyStr.trim().isEmpty()) ? Integer.parseInt(explicitQtyStr.trim()) : null;

                CalculationResult res = PrescriptionQuantityCalculator.calculate(
                        dosageForm,
                        units,
                        frequency,
                        duration,
                        route,
                        instructions,
                        explicitQty
                );

                responseJson.addProperty("mode", "structured");
                responseJson.addProperty("success", res.isSuccess());
                responseJson.addProperty("calculatedQuantity", res.getCalculatedQuantity());
                responseJson.addProperty("exactUnits", res.getExactUnits());
                responseJson.addProperty("unitOfMeasure", res.getUnitOfMeasure());
                responseJson.addProperty("calculationBreakdown", res.getCalculationBreakdown());
                responseJson.addProperty("clarificationRequired", res.isClarificationRequired());
                responseJson.addProperty("clarificationMessage", res.getClarificationMessage());
                responseJson.addProperty("hasWarning", res.hasWarning());
                responseJson.addProperty("warningMessage", res.getWarningMessage());
            }

        } catch (Exception e) {
            responseJson.addProperty("success", false);
            responseJson.addProperty("clarificationRequired", true);
            responseJson.addProperty("clarificationMessage", PrescriptionQuantityCalculator.CLARIFICATION_MSG);
            responseJson.addProperty("error", e.getMessage());
        }

        out.print(gson.toJson(responseJson));
        out.flush();
    }
}
