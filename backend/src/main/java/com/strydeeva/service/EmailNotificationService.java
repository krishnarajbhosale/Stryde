package com.strydeeva.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.notification.admin-email:support@strydeeva.com}")
    private String adminEmail;

    @Value("${app.notification.support-email:support@strydeeva.com}")
    private String supportEmail;

    @Value("${app.notification.contact-email:Contact@strydeeva.com}")
    private String contactEmail;

    @Value("${app.notification.team-email:team@strydeeva.com}")
    private String teamEmail;

    public EmailNotificationService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

    public void sendReturnRequestEmails(String customerEmail, String customerName, String orderId, String issueText) {
        String userBody = "Hi " + customerName + ",\n\n"
                + "Your return/exchange request has been received.\n"
                + "Order: " + orderId + "\n"
                + "Issue: " + issueText + "\n\n"
                + "Our team will contact you shortly.\n\n"
                + "Team Strydeeva";
        // Single email to user; keep support team in BCC.
        sendEmailSafe(customerEmail, "Return/Exchange Request Received", userBody, supportEmail, null, supportEmail);
    }

    public void sendWalletCreditEmails(String customerEmail, String orderNumber, String amount) {
        String userBody = "Hi,\n\n"
                + "An amount of Rs. " + amount + " has been credited to your Strydeeva wallet"
                + (orderNumber != null && !orderNumber.isBlank() ? " for order " + orderNumber : "")
                + ".\n\n"
                + "Team Strydeeva";
        sendEmailSafe(customerEmail, "Wallet Credited", userBody, supportEmail);

        String adminBody = "Wallet credit processed.\n\n"
                + "Customer: " + customerEmail + "\n"
                + "Order: " + (orderNumber == null ? "-" : orderNumber) + "\n"
                + "Amount: Rs. " + amount;
        sendEmailSafe(adminEmail, "Wallet Credit Processed", adminBody, supportEmail);
    }

    public boolean sendOrderConfirmedEmail(String customerEmail, String customerName, String orderNumber) {
        String to = safe(customerEmail).toLowerCase();
        if (to.isBlank() || !to.contains("@")) {
            log.warn("Order confirmation email skipped: invalid recipient email='{}' order={}", to, orderNumber);
            return false;
        }
        String name = (customerName == null || customerName.isBlank()) ? "Customer" : customerName.trim();
        String ord = (orderNumber == null || orderNumber.isBlank()) ? "" : orderNumber.trim();
        String subject = ord.isBlank() ? "Order Confirmed" : ("Order Confirmed - " + ord);
        String body = "Hi " + name + ",\n\n"
                + "Your order has been confirmed"
                + (ord.isBlank() ? "" : (" (" + ord + ")"))
                + ".\n\n"
                + "You can track your order anytime on our website.\n\n"
                + "Team Strydeeva";
        boolean sent = sendEmailSafe(to, subject, body, teamEmail);
        if (sent) {
            log.info("Order confirmation email sent: to={} order={}", to, ord);
        } else {
            log.warn("Order confirmation email failed: to={} order={}", to, ord);
        }
        return sent;
    }

    public boolean sendAwbUpdatedEmail(String customerEmail, String customerName, String orderNumber, String awbNumber) {
        String to = safe(customerEmail).toLowerCase();
        if (to.isBlank() || !to.contains("@")) {
            log.warn("AWB email skipped: invalid recipient email='{}' order={} awb={}", to, orderNumber, awbNumber);
            return false;
        }
        String name = (customerName == null || customerName.isBlank()) ? "Customer" : customerName.trim();
        String ord = (orderNumber == null || orderNumber.isBlank()) ? "-" : orderNumber.trim();
        String awb = (awbNumber == null || awbNumber.isBlank()) ? "-" : awbNumber.trim();
        String subject = "AWB Updated - " + ord;
        String body = "Hi " + name + ",\n\n"
                + "Your AWB has been updated against your order.\n"
                + "Order: " + ord + "\n"
                + "AWB: " + awb + "\n\n"
                + "Please track it with the help of TDDC.\n\n"
                + "Team Strydeeva";
        boolean sent = sendEmailSafe(to, subject, body, teamEmail);
        if (sent) {
            log.info("AWB updated email sent: to={} order={} awb={}", to, ord, awb);
        } else {
            log.warn("AWB updated email failed: to={} order={} awb={}", to, ord, awb);
        }
        return sent;
    }

    public boolean sendOtpEmail(String to, String otp) {
        String body = "Hi,\n\n"
                + "Your Strydeeva login code is: " + otp + "\n\n"
                + "This code expires in 5 minutes.\n\n"
                + "If you did not request this code, please ignore this email.\n\n"
                + "Team Strydeeva";
        return sendEmailSafe(to, "Your Strydeeva OTP", body, supportEmail);
    }

    public boolean sendContactFormEmail(String fromName, String fromUserEmail, String subject, String message) {
        String sub = (subject == null || subject.isBlank()) ? "New Contact Form Message" : subject.trim();
        // Prefix so inbox rules can filter; delivery uses same From as other app mail
        // (relay often allows only certain senders).
        if (!sub.toLowerCase().startsWith("[contact]")) {
            sub = "[Contact] " + sub;
        }
        String body = "New message from Contact Form (reply goes to the visitor if your client uses Reply-To).\n\n"
                + "Name: " + safe(fromName) + "\n"
                + "User Email: " + safe(fromUserEmail) + "\n\n"
                + "Message:\n" + safe(message) + "\n";
        // To: Contact inbox. From: support (works with SMTP relay). Reply-To: visitor
        // so you can reply in one click.
        return sendEmailSafe(contactEmail, sub, body, supportEmail, safe(fromUserEmail));
    }

    private boolean sendEmailSafe(String to, String subject, String body, String fromOverride) {
        return sendEmailSafe(to, subject, body, fromOverride, null, null);
    }

    private boolean sendEmailSafe(String to, String subject, String body, String fromOverride, String replyTo) {
        return sendEmailSafe(to, subject, body, fromOverride, replyTo, null);
    }

    private boolean sendEmailSafe(String to, String subject, String body, String fromOverride, String replyTo,
            String bcc) {
        if (to == null || to.isBlank() || mailSender == null)
            return false;
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            String from = (fromOverride != null && !fromOverride.isBlank()) ? fromOverride.trim()
                    : (fromEmail == null ? "" : fromEmail.trim());
            if (!from.isBlank())
                msg.setFrom(from);
            msg.setTo(to);
            if (replyTo != null && !replyTo.isBlank()) {
                msg.setReplyTo(replyTo.trim());
            }
            if (bcc != null && !bcc.isBlank()) {
                msg.setBcc(bcc.trim());
            }
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            return true;
        } catch (Exception e) {
            log.warn("Mail send failed: to={} subject={} — {}", to, subject, e.getMessage());
            return false;
        }
    }

    private String safe(String s) {
        return s == null ? "" : s.replaceAll("[\\r\\n\\t]+", " ").trim();
    }
}
