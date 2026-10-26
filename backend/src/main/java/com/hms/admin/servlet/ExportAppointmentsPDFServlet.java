package com.hms.admin.servlet;

import java.io.IOException;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.hms.dao.AppointmentDAO;
import com.hms.db.DBConnection;
import com.hms.entity.Appointment;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.Color;

@WebServlet("/admin/exportPDF")
public class ExportAppointmentsPDFServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            AppointmentDAO dao = new AppointmentDAO(DBConnection.getConn());
            List<Appointment> list = dao.getAllAppointment();

            resp.setContentType("application/pdf");
            resp.setHeader("Content-Disposition", "attachment; filename=appointments_report.pdf");

            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, resp.getOutputStream());
            document.open();

            // Header/Title
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(91, 126, 60));
            Paragraph title = new Paragraph("Iryotek Clinic Portal - Appointments Report", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            // Sub-Header
            Font subHeaderFont = new Font(Font.HELVETICA, 10, Font.ITALIC, Color.GRAY);
            Paragraph datePara = new Paragraph("Generated On: " + new Date().toString(), subHeaderFont);
            datePara.setAlignment(Paragraph.ALIGN_RIGHT);
            datePara.setSpacingAfter(20);
            document.add(datePara);

            // Table Structure
            PdfPTable table = new PdfPTable(9);
            table.setWidthPercentage(100f);
            table.setWidths(new float[]{1.0f, 2.5f, 1.2f, 1.0f, 2.0f, 1.2f, 1.8f, 2.0f, 2.3f});

            // Table Header Style
            Font headerFont = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
            Color headerBg = new Color(91, 126, 60);

            String[] tableHeaders = {
                "ID", "Patient Name", "Gender", "Age", "Date", "Token", "Time Slot", "Diseases", "Status"
            };

            for (String th : tableHeaders) {
                PdfPCell cell = new PdfPCell(new Paragraph(th, headerFont));
                cell.setBackgroundColor(headerBg);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            // Populate Rows
            Font cellFont = new Font(Font.HELVETICA, 8);
            for (Appointment app : list) {
                table.addCell(new PdfPCell(new Paragraph(String.valueOf(app.getId()), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(app.getFullName() != null ? app.getFullName() : "", cellFont)));
                table.addCell(new PdfPCell(new Paragraph(app.getGender() != null ? app.getGender() : "", cellFont)));
                table.addCell(new PdfPCell(new Paragraph(app.getAge() != null ? app.getAge() : "", cellFont)));
                table.addCell(new PdfPCell(new Paragraph(app.getAppointmentDate() != null ? app.getAppointmentDate() : "", cellFont)));
                table.addCell(new PdfPCell(new Paragraph(String.valueOf(app.getTokenNo()), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(app.getAppointmentTime() != null ? app.getAppointmentTime() : "", cellFont)));
                table.addCell(new PdfPCell(new Paragraph(app.getDiseases() != null ? app.getDiseases() : "", cellFont)));
                table.addCell(new PdfPCell(new Paragraph(app.getStatus() != null ? app.getStatus() : "", cellFont)));
            }

            document.add(table);
            document.close();

        } catch (Exception e) {
            e.printStackTrace();
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error generating PDF report");
        }
    }
}
