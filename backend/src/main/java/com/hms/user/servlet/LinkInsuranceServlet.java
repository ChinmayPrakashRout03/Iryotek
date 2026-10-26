package com.hms.user.servlet;

import java.io.IOException;
import java.sql.Connection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.hms.dao.InsuranceDAO;
import com.hms.db.DBConnection;
import com.hms.entity.PatientInsurance;
import com.hms.entity.User;

@WebServlet("/linkInsurance")
public class LinkInsuranceServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession();
        User user = (User) session.getAttribute("userObj");

        if (user == null) {
            session.setAttribute("errorMsg", "Please login to manage your health insurance.");
            resp.sendRedirect("user_login.jsp");
            return;
        }

        try {
            String providerName = req.getParameter("providerName");
            String policyNumber = req.getParameter("policyNumber");
            String groupNumber = req.getParameter("groupNumber");
            String policyHolderName = req.getParameter("policyHolderName");
            String relationship = req.getParameter("relationship");
            String startDate = req.getParameter("startDate");
            String expiryDate = req.getParameter("expiryDate");
            String networkType = req.getParameter("networkType");
            String coverageType = req.getParameter("coverageType");
            String sumInsuredStr = req.getParameter("sumInsured");
            String copayPercentStr = req.getParameter("copayPercent");
            String deductibleTotalStr = req.getParameter("deductibleTotal");
            String deductibleMetStr = req.getParameter("deductibleMet");
            String outOfPocketMaxStr = req.getParameter("outOfPocketMax");
            String status = req.getParameter("status");

            if (providerName == null || providerName.trim().isEmpty() ||
                policyNumber == null || policyNumber.trim().isEmpty()) {
                session.setAttribute("errorMsg", "Provider Name and Policy Number are required fields.");
                resp.sendRedirect("patient_profile.jsp?tab=insurance");
                return;
            }

            PatientInsurance ins = new PatientInsurance();
            ins.setUserId(user.getId());
            ins.setProviderName(providerName.trim());
            ins.setPolicyNumber(policyNumber.trim());
            ins.setGroupNumber(groupNumber != null ? groupNumber.trim() : "");
            ins.setPolicyHolderName(policyHolderName != null && !policyHolderName.trim().isEmpty() ? policyHolderName.trim() : user.getFullName());
            ins.setRelationship(relationship != null && !relationship.trim().isEmpty() ? relationship.trim() : "Self");
            ins.setStartDate(startDate != null ? startDate.trim() : "");
            ins.setExpiryDate(expiryDate != null ? expiryDate.trim() : "");
            ins.setNetworkType(networkType != null && !networkType.trim().isEmpty() ? networkType.trim() : "In-Network PPO");
            ins.setCoverageType(coverageType != null && !coverageType.trim().isEmpty() ? coverageType.trim() : "Comprehensive Health Cover");

            double sumInsured = 500000.0;
            if (sumInsuredStr != null && !sumInsuredStr.trim().isEmpty()) {
                try { sumInsured = Double.parseDouble(sumInsuredStr.trim()); } catch (Exception ignored) {}
            }
            ins.setSumInsured(sumInsured);

            int copayPercent = 10;
            if (copayPercentStr != null && !copayPercentStr.trim().isEmpty()) {
                try { copayPercent = Integer.parseInt(copayPercentStr.trim()); } catch (Exception ignored) {}
            }
            ins.setCopayPercent(copayPercent);

            double deductibleTotal = 1500.0;
            if (deductibleTotalStr != null && !deductibleTotalStr.trim().isEmpty()) {
                try { deductibleTotal = Double.parseDouble(deductibleTotalStr.trim()); } catch (Exception ignored) {}
            }
            ins.setDeductibleTotal(deductibleTotal);

            double deductibleMet = 450.0;
            if (deductibleMetStr != null && !deductibleMetStr.trim().isEmpty()) {
                try { deductibleMet = Double.parseDouble(deductibleMetStr.trim()); } catch (Exception ignored) {}
            }
            ins.setDeductibleMet(deductibleMet);

            double outOfPocketMax = 4000.0;
            if (outOfPocketMaxStr != null && !outOfPocketMaxStr.trim().isEmpty()) {
                try { outOfPocketMax = Double.parseDouble(outOfPocketMaxStr.trim()); } catch (Exception ignored) {}
            }
            ins.setOutOfPocketMax(outOfPocketMax);

            ins.setStatus(status != null && !status.trim().isEmpty() ? status.trim().toUpperCase() : "ACTIVE");

            Connection conn = DBConnection.getConn();
            InsuranceDAO dao = new InsuranceDAO(conn);
            boolean ok = dao.saveOrUpdateInsurance(ins);

            if (ok) {
                session.setAttribute("succMsg", "Health insurance provider & policy details linked successfully!");
            } else {
                session.setAttribute("errorMsg", "Failed to link insurance details. Please try again.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            session.setAttribute("errorMsg", "An error occurred: " + e.getMessage());
        }

        resp.sendRedirect("patient_profile.jsp?tab=insurance");
    }
}
