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
import com.hms.dao.PrescriptionDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.Prescription;
import com.hms.entity.PrescriptionMedicine;
import com.hms.util.EmailUtil;
import com.hms.websocket.QueueWebSocketServer;

@WebServlet("/updateStatus")
public class UpdateStatus extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            int id = Integer.parseInt(req.getParameter("id")); // appointment id
            int doctorId = Integer.parseInt(req.getParameter("doctorId"));
            String comment = req.getParameter("comment");

            AppointmentDAO appDAO = new AppointmentDAO(DBConnection.getConn());
            Appointment appointment = appDAO.getAppointmentById(id);
            String appointmentDate = appointment != null ? appointment.getAppointmentDate() : null;

            boolean f = appDAO.updateDrAppointmentCommentStatus(id, doctorId, comment);

            HttpSession session = req.getSession();

            if (f) {
                // Parse prescribed medicines if submitted from comment.jsp
                String[] medicineIds = req.getParameterValues("medicineId");
                String[] dosages = req.getParameterValues("dosage");
                String[] quantities = req.getParameterValues("quantity");

                int prescriptionId = -1;
                int autoAddedCartCount = 0;

                if (medicineIds != null && medicineIds.length > 0 && appointment != null) {
                    List<PrescriptionMedicine> items = new ArrayList<>();
                    for (int i = 0; i < medicineIds.length; i++) {
                        if (medicineIds[i] != null && !medicineIds[i].trim().isEmpty()) {
                            try {
                                int medId = Integer.parseInt(medicineIds[i]);
                                String dosage = (dosages != null && i < dosages.length) ? dosages[i] : "As directed";
                                int qty = (quantities != null && i < quantities.length && !quantities[i].trim().isEmpty()) ? Integer.parseInt(quantities[i]) : 1;

                                PrescriptionMedicine pm = new PrescriptionMedicine();
                                pm.setMedicineId(medId);
                                pm.setDosageInstructions(dosage);
                                pm.setQuantity(qty);
                                items.add(pm);
                            } catch (Exception ex) {
                                ex.printStackTrace();
                            }
                        }
                    }

                    if (!items.isEmpty()) {
                        Prescription rx = new Prescription();
                        rx.setAppointmentId(id);
                        rx.setUserId(appointment.getUserId());
                        rx.setDoctorId(doctorId);
                        rx.setRemarks(comment);

                        PrescriptionDAO rxDAO = new PrescriptionDAO(DBConnection.getConn());
                        prescriptionId = rxDAO.createPrescription(rx, items);

                        if (prescriptionId > 0) {
                            CartDAO cartDAO = new CartDAO(DBConnection.getConn());
                            autoAddedCartCount = cartDAO.autoPopulateFromPrescription(appointment.getUserId(), prescriptionId);
                        }
                    }
                }

                if (appointmentDate != null) {
                    try {
                        QueueWebSocketServer.notifyUpdate(doctorId, appointmentDate);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                if (appointment != null && appointment.getEmail() != null && !appointment.getEmail().isEmpty()) {
                    try {
                        DoctorDAO docDAO = new DoctorDAO(DBConnection.getConn());
                        Doctor doctor = docDAO.getDoctorById(doctorId);
                        String docName = doctor != null ? doctor.getFullName() : "your doctor";
                        String emailBody = "<div style='font-family: Arial, sans-serif; padding: 20px; color: #1e293b;'>"
                                         + "<h2 style='color: #0077b6;'>Iryotek Prescription & Status Update</h2>"
                                         + "<p>Dear <strong>" + appointment.getFullName() + "</strong>,</p>"
                                         + "<p>Dr. <strong>" + docName + "</strong> has finalized your prescription and consultation record (Token #" + appointment.getTokenNo() + ").</p>"
                                         + "<div style='background: #f8fafc; border-left: 4px solid #0077b6; padding: 15px; margin: 15px 0;'>"
                                         + "<p style='margin: 5px 0;'><strong>Date:</strong> " + appointmentDate + "</p>"
                                         + "<p style='margin: 5px 0;'><strong>Doctor Remarks:</strong> <i>" + comment + "</i></p>"
                                         + (prescriptionId > 0 ? "<p style='margin: 5px 0; color: #16a34a;'><strong>Prescription status:</strong> " + autoAddedCartCount + " prescribed medicine(s) automatically added to your Medicine Cart.</p>" : "")
                                         + "</div>"
                                         + "<p>You can view your prescription details and review your medicine cart by logging into your Iryotek patient portal.</p>"
                                         + "<p>Best regards,<br><strong>Iryotek Healthcare Team</strong></p>"
                                         + "</div>";
                        EmailUtil.sendEmail(appointment.getEmail(), "Iryotek Prescription Update - Token #" + appointment.getTokenNo(), emailBody);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                session.setAttribute("successMsg", "Prescription finalized successfully!" + (autoAddedCartCount > 0 ? " Prescribed medicines auto-added to patient's cart." : ""));
                resp.sendRedirect("doctor/patient.jsp");

            } else {
                session.setAttribute("errorMsg", "Something went wrong on server!");
                resp.sendRedirect("doctor/patient.jsp");
            }

        } catch (Exception e) {
            e.printStackTrace();
            resp.sendRedirect("doctor/patient.jsp");
        }
    }
}
