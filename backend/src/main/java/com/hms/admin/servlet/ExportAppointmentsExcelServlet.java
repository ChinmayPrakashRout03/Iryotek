package com.hms.admin.servlet;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.hms.dao.AppointmentDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Appointment;

import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

@WebServlet("/admin/exportExcel")
public class ExportAppointmentsExcelServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            AppointmentDAO dao = new AppointmentDAO(DBConnection.getConn());
            List<Appointment> list = dao.getAllAppointment();

            XSSFWorkbook workbook = new XSSFWorkbook();
            XSSFSheet sheet = workbook.createSheet("Appointments");

            // Header Style
            XSSFCellStyle headerStyle = workbook.createCellStyle();
            XSSFFont font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            String[] headers = {
                "ID", "Patient Name", "Gender", "Age", "Appointment Date", 
                "Token No", "Time Slot", "Email", "Phone", "Diseases", 
                "Doctor ID", "Address", "Status"
            };

            XSSFRow headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                XSSFCell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (Appointment app : list) {
                XSSFRow row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(app.getId());
                row.createCell(1).setCellValue(app.getFullName() != null ? app.getFullName() : "");
                row.createCell(2).setCellValue(app.getGender() != null ? app.getGender() : "");
                row.createCell(3).setCellValue(app.getAge() != null ? app.getAge() : "");
                row.createCell(4).setCellValue(app.getAppointmentDate() != null ? app.getAppointmentDate() : "");
                row.createCell(5).setCellValue(app.getTokenNo());
                row.createCell(6).setCellValue(app.getAppointmentTime() != null ? app.getAppointmentTime() : "");
                row.createCell(7).setCellValue(app.getEmail() != null ? app.getEmail() : "");
                row.createCell(8).setCellValue(app.getPhone() != null ? app.getPhone() : "");
                row.createCell(9).setCellValue(app.getDiseases() != null ? app.getDiseases() : "");
                row.createCell(10).setCellValue(app.getDoctorId());
                row.createCell(11).setCellValue(app.getAddress() != null ? app.getAddress() : "");
                row.createCell(12).setCellValue(app.getStatus() != null ? app.getStatus() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            resp.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            resp.setHeader("Content-Disposition", "attachment; filename=appointments_report.xlsx");
            workbook.write(resp.getOutputStream());
            workbook.close();

        } catch (Exception e) {
            e.printStackTrace();
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error generating Excel report");
        }
    }
}
