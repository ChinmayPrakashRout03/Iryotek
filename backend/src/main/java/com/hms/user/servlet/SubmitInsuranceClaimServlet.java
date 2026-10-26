package com.hms.user.servlet;

import java.io.IOException;
import java.sql.Connection;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Random;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.InsuranceDAO;
import com.hms.db.DBConnection;
import com.hms.entity.InsuranceClaim;
import com.hms.entity.PatientInsurance;
import com.hms.entity.User;

@WebServlet("/submitInsuranceClaim")
public class SubmitInsuranceClaimServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession();
        User user = (User) session.getAttribute("userObj");

        if (user == null) {
            session.setAttribute("errorMsg", "Please login to submit insurance claims.");
            resp.sendRedirect("user_login.jsp");
            return;
        }

        try {
            String hospitalOrClinic = req.getParameter("hospitalOrClinic");
            String treatmentDescription = req.getParameter("treatmentDescription");
            String serviceDate = req.getParameter("serviceDate");
            String billedAmountStr = req.getParameter("totalBilledAmount");
            String remarks = req.getParameter("remarks");

            if (hospitalOrClinic == null || hospitalOrClinic.trim().isEmpty() ||
                treatmentDescription == null || treatmentDescription.trim().isEmpty() ||
                billedAmountStr == null || billedAmountStr.trim().isEmpty()) {
                session.setAttribute("errorMsg", "Please provide Hospital Name, Treatment Description, and Total Billed Amount.");
                resp.sendRedirect("patient_profile.jsp?tab=insurance");
                return;
            }

            double totalBilled = 0.0;
            try {
                totalBilled = Double.parseDouble(billedAmountStr.trim());
            } catch (Exception e) {
                session.setAttribute("errorMsg", "Invalid billed amount format.");
                resp.sendRedirect("patient_profile.jsp?tab=insurance");
                return;
            }

            Connection conn = DBConnection.getConn();
            InsuranceDAO dao = new InsuranceDAO(conn);
            PatientInsurance ins = dao.getInsuranceByUserId(user.getId());

            InsuranceClaim claim = new InsuranceClaim();
            int randSuffix = 1000 + new Random().nextInt(9000);
            int currentYear = java.util.Calendar.getInstance().get(java.util.Calendar.YEAR);
            String claimNumber = "CLM-" + currentYear + "-" + randSuffix;
            claim.setClaimNumber(claimNumber);
            claim.setUserId(user.getId());

            if (ins != null) {
                claim.setInsuranceId(ins.getId());
                claim.setProviderName(ins.getProviderName());
            } else {
                claim.setInsuranceId(0);
                claim.setProviderName("Direct Hospital Claim");
            }

            if (serviceDate != null && !serviceDate.trim().isEmpty()) {
                claim.setServiceDate(serviceDate.trim());
            } else {
                claim.setServiceDate(new SimpleDateFormat("yyyy-MM-dd").format(new Date()));
            }

            claim.setHospitalOrClinic(hospitalOrClinic.trim());
            claim.setTreatmentDescription(treatmentDescription.trim());
            claim.setTotalBilledAmount(totalBilled);
            claim.setInsuranceCoveredAmount(0.0); // starts pending review
            claim.setPatientResponsibility(totalBilled);
            claim.setClaimStatus("PENDING_REVIEW");
            claim.setRemarks(remarks != null ? remarks.trim() : "Claim submitted by patient via portal.");

            boolean ok = dao.addClaim(claim);
            if (ok) {
                session.setAttribute("succMsg", "Claim " + claimNumber + " submitted successfully! You can track its status below.");
            } else {
                session.setAttribute("errorMsg", "Failed to submit insurance claim. Please try again.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorMsg", "An error occurred: " + e.getMessage());
        }

        resp.sendRedirect("patient_profile.jsp?tab=insurance");
    }
}
