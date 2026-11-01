package com.hms.doctor.servlet;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.AppointmentDAO;
import com.hms.dao.CartDAO;
import com.hms.dao.DoctorDAO;
import com.hms.dao.MedicineDAO;
import com.hms.dao.PrescriptionDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.Medicine;
import com.hms.entity.Prescription;
import com.hms.entity.PrescriptionMedicine;
import com.hms.pharmacy.CalculationResult;
import com.hms.pharmacy.PrescriptionQuantityCalculator;
import com.hms.util.EmailUtil;
import com.hms.websocket.QueueWebSocketServer;

@WebServlet("/updateStatus")
public class UpdateStatusServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession();
        try {
            int id = Integer.parseInt(req.getParameter("id")); // appointment id
            int doctorId = Integer.parseInt(req.getParameter("doctorId"));
            String comment = req.getParameter("comment");

            AppointmentDAO appDAO = new AppointmentDAO(DBConnection.getConn());
            Appointment appointment = appDAO.getAppointmentById(id);
            if (appointment == null) {
                session.setAttribute("errorMsg", "Appointment not found.");
                resp.sendRedirect("doctor/patient.jsp");
                return;
            }
            String appointmentDate = appointment.getAppointmentDate();

            // Parse prescribed medicines if submitted from comment.jsp
            String[] medicineIds = req.getParameterValues("medicineId");
            String[] unitsPerDoseArr = req.getParameterValues("unitsPerDose");
            String[] frequencies = req.getParameterValues("frequency");
            String[] durations = req.getParameterValues("durationDays");
            String[] routes = req.getParameterValues("route");
            String[] instructions = req.getParameterValues("specialInstructions");
            String[] explicitQuantities = req.getParameterValues("quantity");
            String[] dosagesLegacy = req.getParameterValues("dosage");

            MedicineDAO medDAO = new MedicineDAO(DBConnection.getConn());
            List<PrescriptionMedicine> items = new ArrayList<>();

            if (medicineIds != null && medicineIds.length > 0) {
                for (int i = 0; i < medicineIds.length; i++) {
                    if (medicineIds[i] == null || medicineIds[i].trim().isEmpty()) {
                        continue;
                    }

                    int medId = Integer.parseInt(medicineIds[i].trim());
                    Medicine med = medDAO.getMedicineById(medId);
                    if (med == null) {
                        session.setAttribute("errorMsg", "Invalid medicine selected (ID #" + medId + ").");
                        resp.sendRedirect("doctor/comment.jsp?id=" + id);
                        return;
                    }

                    String form = med.getDosageForm() != null ? med.getDosageForm() : "Tablet";
                    Double unitsPerDose = 1.0;
                    if (unitsPerDoseArr != null && i < unitsPerDoseArr.length && !unitsPerDoseArr[i].trim().isEmpty()) {
                        try {
                            unitsPerDose = Double.parseDouble(unitsPerDoseArr[i].trim());
                        } catch (Exception ex) {
                            unitsPerDose = 1.0;
                        }
                    }

                    String freq = (frequencies != null && i < frequencies.length && !frequencies[i].trim().isEmpty())
                            ? frequencies[i].trim()
                            : (dosagesLegacy != null && i < dosagesLegacy.length ? dosagesLegacy[i].trim() : "Once daily");

                    Integer duration = 1;
                    if (durations != null && i < durations.length && !durations[i].trim().isEmpty()) {
                        try {
                            duration = Integer.parseInt(durations[i].trim());
                        } catch (Exception ex) {
                            duration = 1;
                        }
                    }

                    String route = (routes != null && i < routes.length && !routes[i].trim().isEmpty())
                            ? routes[i].trim() : "Oral";

                    String specialInstr = (instructions != null && i < instructions.length)
                            ? instructions[i].trim() : "";

                    Integer explicitQty = null;
                    if (explicitQuantities != null && i < explicitQuantities.length && !explicitQuantities[i].trim().isEmpty()) {
                        try {
                            explicitQty = Integer.parseInt(explicitQuantities[i].trim());
                        } catch (Exception ignored) {}
                    }

                    // 1. Run Deterministic Calculation Engine
                    CalculationResult calcResult = PrescriptionQuantityCalculator.calculate(
                            form,
                            unitsPerDose,
                            freq,
                            duration,
                            route,
                            specialInstr,
                            explicitQty
                    );

                    // 2. Safeguard Enforcement: Stop and request clarification if instructions are ambiguous
                    if (calcResult.isClarificationRequired()) {
                        session.setAttribute("errorMsg", calcResult.getClarificationMessage());
                        resp.sendRedirect("doctor/comment.jsp?id=" + id);
                        return;
                    }

                    PrescriptionMedicine pm = new PrescriptionMedicine();
                    pm.setMedicineId(medId);
                    pm.setMedicine(med);
                    pm.setMedicineName(med.getName());
                    pm.setDosageForm(form);
                    pm.setUnitsPerDose(unitsPerDose);
                    pm.setFrequency(freq);
                    Double dosesPerDay = PrescriptionQuantityCalculator.resolveDosesPerDay(freq);
                    pm.setDosesPerDay(dosesPerDay != null ? dosesPerDay : 1.0);
                    pm.setDurationDays(duration);
                    pm.setRoute(route);
                    pm.setSpecialInstructions(specialInstr);

                    String instructionSummary = String.format("%s - %s for %d days (%s)",
                            freq, (unitsPerDose == 1.0 ? "1 unit" : unitsPerDose + " units"), duration, route);
                    if (!specialInstr.isEmpty()) {
                        instructionSummary += " [" + specialInstr + "]";
                    }
                    pm.setDosageInstructions(instructionSummary);

                    pm.setCalculatedQuantity(calcResult.getCalculatedQuantity());
                    pm.setQuantity(calcResult.getCalculatedQuantity());
                    pm.setCalculationBreakdown(calcResult.getCalculationBreakdown());
                    pm.setStatus("PENDING");

                    items.add(pm);
                }
            }

            // Update Doctor appointment comment and status
            boolean f = appDAO.updateDrAppointmentCommentStatus(id, doctorId, comment);

            if (f) {
                int prescriptionId = -1;
                int autoAddedCartCount = 0;

                if (!items.isEmpty()) {
                    Prescription rx = new Prescription();
                    rx.setAppointmentId(id);
                    rx.setUserId(appointment.getUserId());
                    rx.setDoctorId(doctorId);
                    rx.setRemarks(comment);
                    rx.setStatus("APPROVED");

                    PrescriptionDAO rxDAO = new PrescriptionDAO(DBConnection.getConn());
                    prescriptionId = rxDAO.createPrescription(rx, items);

                    if (prescriptionId > 0) {
                        CartDAO cartDAO = new CartDAO(DBConnection.getConn());
                        autoAddedCartCount = cartDAO.autoPopulateFromPrescription(appointment.getUserId(), prescriptionId);
                    }
                }

                if (appointmentDate != null) {
                    try {
                        QueueWebSocketServer.notifyUpdate(doctorId, appointmentDate);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                // Send itemized prescription email to patient
                if (appointment.getEmail() != null && !appointment.getEmail().isEmpty()) {
                    try {
                        DoctorDAO docDAO = new DoctorDAO(DBConnection.getConn());
                        Doctor doctor = docDAO.getDoctorById(doctorId);
                        String docName = doctor != null ? doctor.getFullName() : "your doctor";

                        StringBuilder medTable = new StringBuilder();
                        if (!items.isEmpty()) {
                            medTable.append("<table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>")
                                    .append("<tr style='background: #0077b6; color: white; text-align: left;'>")
                                    .append("<th style='padding: 8px;'>Medicine</th>")
                                    .append("<th style='padding: 8px;'>Schedule</th>")
                                    .append("<th style='padding: 8px;'>Duration</th>")
                                    .append("<th style='padding: 8px;'>Dispense Qty</th>")
                                    .append("</tr>");
                            for (PrescriptionMedicine pm : items) {
                                medTable.append("<tr style='border-bottom: 1px solid #e2e8f0;'>")
                                        .append("<td style='padding: 8px;'><strong>").append(pm.getMedicineName()).append("</strong> (").append(pm.getDosageForm()).append(")</td>")
                                        .append("<td style='padding: 8px;'>").append(pm.getFrequency()).append("</td>")
                                        .append("<td style='padding: 8px;'>").append(pm.getDurationDays()).append(" days</td>")
                                        .append("<td style='padding: 8px; font-weight: bold; color: #0284c7;'>").append(pm.getCalculatedQuantity()).append(" (").append(pm.getCalculationBreakdown()).append(")</td>")
                                        .append("</tr>");
                            }
                            medTable.append("</table>");
                        }

                        String emailBody = "<div style='font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px;'>"
                                         + "<h2 style='color: #0077b6;'>Iryotek Smart Prescription & Consultation Summary</h2>"
                                         + "<p>Dear <strong>" + appointment.getFullName() + "</strong>,</p>"
                                         + "<p>Dr. <strong>" + docName + "</strong> has approved and finalized your clinical prescription (Token #" + appointment.getTokenNo() + ").</p>"
                                         + "<div style='background: #f8fafc; border-left: 4px solid #0077b6; padding: 15px; margin: 15px 0;'>"
                                         + "<p style='margin: 5px 0;'><strong>Consultation Date:</strong> " + appointmentDate + "</p>"
                                         + "<p style='margin: 5px 0;'><strong>Clinical Notes:</strong> <i>" + comment + "</i></p>"
                                         + "</div>"
                                         + medTable.toString()
                                         + (prescriptionId > 0 ? "<p style='margin: 15px 0; color: #16a34a;'><strong>Pharmacy Dispatch:</strong> Prescribed items have been sent to the Hospital Pharmacy Dispensing Queue and added to your Medicine Cart.</p>" : "")
                                         + "<p style='margin-top: 20px;'>Best regards,<br><strong>Iryotek Healthcare Team</strong></p>"
                                         + "</div>";
                        EmailUtil.sendEmail(appointment.getEmail(), "Iryotek Approved Prescription - Token #" + appointment.getTokenNo(), emailBody);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                session.setAttribute("successMsg", "Prescription finalized and verified successfully! Dispensing request dispatched to Hospital Pharmacy.");
                resp.sendRedirect("doctor/patient.jsp");

            } else {
                session.setAttribute("errorMsg", "Failed to update appointment status on server.");
                resp.sendRedirect("doctor/patient.jsp");
            }

        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorMsg", "Error finalizing prescription: " + e.getMessage());
            resp.sendRedirect("doctor/patient.jsp");
        }
    }
}
