package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.hms.entity.InsuranceClaim;
import com.hms.entity.PatientInsurance;

public class InsuranceDAO {
    private Connection conn;

    public InsuranceDAO(Connection conn) {
        this.conn = conn;
        createTableIfNotExists();
    }

    private void createTableIfNotExists() {
        try {
            Statement stmt = conn.createStatement();
            String sqlInsurance = "CREATE TABLE IF NOT EXISTS patient_insurance ("
                    + "id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "user_id INT NOT NULL, "
                    + "provider_name VARCHAR(150) NOT NULL, "
                    + "policy_number VARCHAR(100) NOT NULL, "
                    + "group_number VARCHAR(100), "
                    + "policy_holder_name VARCHAR(150), "
                    + "relationship VARCHAR(50) DEFAULT 'Self', "
                    + "start_date VARCHAR(50), "
                    + "expiry_date VARCHAR(50), "
                    + "network_type VARCHAR(50) DEFAULT 'In-Network PPO', "
                    + "coverage_type VARCHAR(100) DEFAULT 'Comprehensive Health', "
                    + "sum_insured DOUBLE DEFAULT 500000.0, "
                    + "copay_percent INT DEFAULT 10, "
                    + "deductible_total DOUBLE DEFAULT 1500.0, "
                    + "deductible_met DOUBLE DEFAULT 450.0, "
                    + "out_of_pocket_max DOUBLE DEFAULT 4000.0, "
                    + "status VARCHAR(50) DEFAULT 'ACTIVE', "
                    + "insurance_card_url VARCHAR(255), "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, "
                    + "UNIQUE KEY uq_user_insurance (user_id)"
                    + ")";
            stmt.execute(sqlInsurance);

            String sqlClaim = "CREATE TABLE IF NOT EXISTS insurance_claim ("
                    + "id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "claim_number VARCHAR(50) NOT NULL UNIQUE, "
                    + "user_id INT NOT NULL, "
                    + "insurance_id INT, "
                    + "provider_name VARCHAR(150), "
                    + "service_date VARCHAR(50), "
                    + "hospital_or_clinic VARCHAR(200), "
                    + "treatment_description VARCHAR(500), "
                    + "total_billed_amount DOUBLE NOT NULL, "
                    + "insurance_covered_amount DOUBLE DEFAULT 0.0, "
                    + "patient_responsibility DOUBLE DEFAULT 0.0, "
                    + "claim_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW', "
                    + "remarks TEXT, "
                    + "document_url VARCHAR(255), "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, "
                    + "INDEX idx_claim_user (user_id)"
                    + ")";
            stmt.execute(sqlClaim);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public PatientInsurance getInsuranceByUserId(int userId) {
        PatientInsurance ins = null;
        try {
            String sql = "SELECT * FROM patient_insurance WHERE user_id = ?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                ins = new PatientInsurance();
                ins.setId(rs.getInt("id"));
                ins.setUserId(rs.getInt("user_id"));
                ins.setProviderName(rs.getString("provider_name"));
                ins.setPolicyNumber(rs.getString("policy_number"));
                ins.setGroupNumber(rs.getString("group_number"));
                ins.setPolicyHolderName(rs.getString("policy_holder_name"));
                ins.setRelationship(rs.getString("relationship"));
                ins.setStartDate(rs.getString("start_date"));
                ins.setExpiryDate(rs.getString("expiry_date"));
                ins.setNetworkType(rs.getString("network_type"));
                ins.setCoverageType(rs.getString("coverage_type"));
                ins.setSumInsured(rs.getDouble("sum_insured"));
                ins.setCopayPercent(rs.getInt("copay_percent"));
                ins.setDeductibleTotal(rs.getDouble("deductible_total"));
                ins.setDeductibleMet(rs.getDouble("deductible_met"));
                ins.setOutOfPocketMax(rs.getDouble("out_of_pocket_max"));
                ins.setStatus(rs.getString("status"));
                ins.setInsuranceCardUrl(rs.getString("insurance_card_url"));
                ins.setCreatedAt(rs.getTimestamp("created_at"));
                ins.setUpdatedAt(rs.getTimestamp("updated_at"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ins;
    }

    public boolean saveOrUpdateInsurance(PatientInsurance ins) {
        boolean success = false;
        try {
            String sql = "INSERT INTO patient_insurance "
                    + "(user_id, provider_name, policy_number, group_number, policy_holder_name, relationship, "
                    + "start_date, expiry_date, network_type, coverage_type, sum_insured, copay_percent, "
                    + "deductible_total, deductible_met, out_of_pocket_max, status, insurance_card_url) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) "
                    + "ON DUPLICATE KEY UPDATE "
                    + "provider_name = VALUES(provider_name), "
                    + "policy_number = VALUES(policy_number), "
                    + "group_number = VALUES(group_number), "
                    + "policy_holder_name = VALUES(policy_holder_name), "
                    + "relationship = VALUES(relationship), "
                    + "start_date = VALUES(start_date), "
                    + "expiry_date = VALUES(expiry_date), "
                    + "network_type = VALUES(network_type), "
                    + "coverage_type = VALUES(coverage_type), "
                    + "sum_insured = VALUES(sum_insured), "
                    + "copay_percent = VALUES(copay_percent), "
                    + "deductible_total = VALUES(deductible_total), "
                    + "deductible_met = VALUES(deductible_met), "
                    + "out_of_pocket_max = VALUES(out_of_pocket_max), "
                    + "status = VALUES(status), "
                    + "insurance_card_url = VALUES(insurance_card_url), "
                    + "updated_at = CURRENT_TIMESTAMP";

            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, ins.getUserId());
            pstmt.setString(2, ins.getProviderName());
            pstmt.setString(3, ins.getPolicyNumber());
            pstmt.setString(4, ins.getGroupNumber());
            pstmt.setString(5, ins.getPolicyHolderName());
            pstmt.setString(6, ins.getRelationship());
            pstmt.setString(7, ins.getStartDate());
            pstmt.setString(8, ins.getExpiryDate());
            pstmt.setString(9, ins.getNetworkType());
            pstmt.setString(10, ins.getCoverageType());
            pstmt.setDouble(11, ins.getSumInsured());
            pstmt.setInt(12, ins.getCopayPercent());
            pstmt.setDouble(13, ins.getDeductibleTotal());
            pstmt.setDouble(14, ins.getDeductibleMet());
            pstmt.setDouble(15, ins.getOutOfPocketMax());
            pstmt.setString(16, ins.getStatus());
            pstmt.setString(17, ins.getInsuranceCardUrl());

            int count = pstmt.executeUpdate();
            if (count > 0) {
                success = true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return success;
    }

    public List<InsuranceClaim> getClaimsByUserId(int userId) {
        List<InsuranceClaim> list = new ArrayList<>();
        try {
            String sql = "SELECT * FROM insurance_claim WHERE user_id = ? ORDER BY created_at DESC";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                InsuranceClaim claim = new InsuranceClaim();
                claim.setId(rs.getInt("id"));
                claim.setClaimNumber(rs.getString("claim_number"));
                claim.setUserId(rs.getInt("user_id"));
                claim.setInsuranceId(rs.getInt("insurance_id"));
                claim.setProviderName(rs.getString("provider_name"));
                claim.setServiceDate(rs.getString("service_date"));
                claim.setHospitalOrClinic(rs.getString("hospital_or_clinic"));
                claim.setTreatmentDescription(rs.getString("treatment_description"));
                claim.setTotalBilledAmount(rs.getDouble("total_billed_amount"));
                claim.setInsuranceCoveredAmount(rs.getDouble("insurance_covered_amount"));
                claim.setPatientResponsibility(rs.getDouble("patient_responsibility"));
                claim.setClaimStatus(rs.getString("claim_status"));
                claim.setRemarks(rs.getString("remarks"));
                claim.setDocumentUrl(rs.getString("document_url"));
                claim.setCreatedAt(rs.getTimestamp("created_at"));
                claim.setUpdatedAt(rs.getTimestamp("updated_at"));
                list.add(claim);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean addClaim(InsuranceClaim claim) {
        boolean success = false;
        try {
            String sql = "INSERT INTO insurance_claim "
                    + "(claim_number, user_id, insurance_id, provider_name, service_date, hospital_or_clinic, "
                    + "treatment_description, total_billed_amount, insurance_covered_amount, patient_responsibility, "
                    + "claim_status, remarks, document_url) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, claim.getClaimNumber());
            pstmt.setInt(2, claim.getUserId());
            pstmt.setInt(3, claim.getInsuranceId());
            pstmt.setString(4, claim.getProviderName());
            pstmt.setString(5, claim.getServiceDate());
            pstmt.setString(6, claim.getHospitalOrClinic());
            pstmt.setString(7, claim.getTreatmentDescription());
            pstmt.setDouble(8, claim.getTotalBilledAmount());
            pstmt.setDouble(9, claim.getInsuranceCoveredAmount());
            pstmt.setDouble(10, claim.getPatientResponsibility());
            pstmt.setString(11, claim.getClaimStatus() != null ? claim.getClaimStatus() : "PENDING_REVIEW");
            pstmt.setString(12, claim.getRemarks());
            pstmt.setString(13, claim.getDocumentUrl());

            int count = pstmt.executeUpdate();
            if (count > 0) {
                success = true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return success;
    }

    public void seedSampleInsuranceIfEmpty(int userId, String userName) {
        try {
            PatientInsurance existing = getInsuranceByUserId(userId);
            if (existing == null) {
                PatientInsurance ins = new PatientInsurance();
                ins.setUserId(userId);
                ins.setProviderName("BlueCross BlueShield Premier Health");
                ins.setPolicyNumber("BCBS-84920412");
                ins.setGroupNumber("GRP-77402");
                ins.setPolicyHolderName(userName != null && !userName.isEmpty() ? userName : "Primary Patient");
                ins.setRelationship("Self");
                ins.setStartDate("2026-01-01");
                ins.setExpiryDate("2026-12-31");
                ins.setNetworkType("In-Network PPO");
                ins.setCoverageType("Comprehensive Health & Trauma");
                ins.setSumInsured(500000.0);
                ins.setCopayPercent(10);
                ins.setDeductibleTotal(1500.0);
                ins.setDeductibleMet(620.0);
                ins.setOutOfPocketMax(4000.0);
                ins.setStatus("ACTIVE");
                saveOrUpdateInsurance(ins);
            }

            List<InsuranceClaim> claims = getClaimsByUserId(userId);
            if (claims == null || claims.isEmpty()) {
                InsuranceClaim c1 = new InsuranceClaim();
                c1.setClaimNumber("CLM-2026-1042");
                c1.setUserId(userId);
                c1.setProviderName("BlueCross BlueShield Premier Health");
                c1.setServiceDate("2026-09-18");
                c1.setHospitalOrClinic("Iryotek Multi-Specialty Hospital - Cardiology Unit");
                c1.setTreatmentDescription("Comprehensive Cardiac Stress Test, Echocardiogram & Specialist Consultation");
                c1.setTotalBilledAmount(1450.0);
                c1.setInsuranceCoveredAmount(1305.0);
                c1.setPatientResponsibility(145.0);
                c1.setClaimStatus("SETTLED");
                c1.setRemarks("Pre-authorization verified. 90% in-network benefit disbursed to provider.");
                addClaim(c1);

                InsuranceClaim c2 = new InsuranceClaim();
                c2.setClaimNumber("CLM-2026-1088");
                c2.setUserId(userId);
                c2.setProviderName("BlueCross BlueShield Premier Health");
                c2.setServiceDate("2026-09-28");
                c2.setHospitalOrClinic("Iryotek Central Laboratory");
                c2.setTreatmentDescription("Advanced Metabolic Blood Profile, Lipid Panel & HbA1c screening");
                c2.setTotalBilledAmount(380.0);
                c2.setInsuranceCoveredAmount(342.0);
                c2.setPatientResponsibility(38.0);
                c2.setClaimStatus("APPROVED");
                c2.setRemarks("Diagnostic claim approved under preventive wellness schedule.");
                addClaim(c2);

                InsuranceClaim c3 = new InsuranceClaim();
                c3.setClaimNumber("CLM-2026-1120");
                c3.setUserId(userId);
                c3.setProviderName("BlueCross BlueShield Premier Health");
                c3.setServiceDate("2026-10-02");
                c3.setHospitalOrClinic("Iryotek Telehealth Urgent Care Desk");
                c3.setTreatmentDescription("Virtual WebRTC Video Consultation & Acute Bronchial Prescription Delivery");
                c3.setTotalBilledAmount(175.0);
                c3.setInsuranceCoveredAmount(157.5);
                c3.setPatientResponsibility(17.5);
                c3.setClaimStatus("PENDING_REVIEW");
                c3.setRemarks("Claim submitted electronically by billing desk. Pending final adjudication.");
                addClaim(c3);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
