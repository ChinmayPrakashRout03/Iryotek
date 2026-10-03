package com.hms.util;

import java.util.Properties;
import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

public class EmailUtil {

    private static final String SMTP_HOST = System.getenv("SMTP_HOST") != null ? System.getenv("SMTP_HOST") : "smtp.gmail.com";
    private static final String SMTP_PORT = System.getenv("SMTP_PORT") != null ? System.getenv("SMTP_PORT") : "587";
    private static final String SMTP_EMAIL = (System.getenv("SMTP_USER") != null && !System.getenv("SMTP_USER").trim().isEmpty())
            ? System.getenv("SMTP_USER")
            : ((System.getenv("SMTP_EMAIL") != null && !System.getenv("SMTP_EMAIL").trim().isEmpty()) ? System.getenv("SMTP_EMAIL") : "Iryotek@gmail.com");
    private static final String SMTP_PASSWORD = System.getenv("SMTP_PASSWORD") != null && !System.getenv("SMTP_PASSWORD").trim().isEmpty() ? System.getenv("SMTP_PASSWORD") : "golhbyumzymlhsfp";

    public static void sendEmail(String toEmail, String subject, String body) {
        if (SMTP_EMAIL == null || SMTP_PASSWORD == null || SMTP_EMAIL.isEmpty() || SMTP_PASSWORD.isEmpty() || "your-email@example.com".equals(SMTP_EMAIL)) {
            System.out.println("[WARN] SMTP credentials not set. Skipping sending email to: " + toEmail);
            return;
        }

        Properties props = new Properties();
        props.put("mail.smtp.host", SMTP_HOST);
        props.put("mail.smtp.port", SMTP_PORT);
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(SMTP_EMAIL, SMTP_PASSWORD);
            }
        });

        // Run in a background thread to prevent blocking HTTP requests
        new Thread(() -> {
            try {
                MimeMessage message = new MimeMessage(session);
                message.setFrom(new InternetAddress(SMTP_EMAIL, "Iryotek"));
                message.setRecipient(Message.RecipientType.TO, new InternetAddress(toEmail));
                message.setSubject(subject);
                message.setContent(body, "text/html; charset=utf-8");

                Transport.send(message);
                System.out.println("[INFO] Email sent successfully to: " + toEmail);
            } catch (Exception e) {
                System.err.println("[ERROR] Failed to send email to " + toEmail + ": " + e.getMessage());
                e.printStackTrace();
            }
        }).start();
    }
}
