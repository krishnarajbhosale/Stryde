package com.strydeeva.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.notification.admin-email:support@strydeeva.com}")
    private String adminEmail;

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
        sendEmailSafe(customerEmail, "Return/Exchange Request Received", userBody);

        String adminBody = "New return/exchange request submitted.\n\n"
                + "Customer: " + customerName + "\n"
                + "Email: " + customerEmail + "\n"
                + "Order: " + orderId + "\n"
                + "Issue: " + issueText + "\n";
        sendEmailSafe(adminEmail, "New Return/Exchange Request", adminBody);
    }

    public void sendWalletCreditEmails(String customerEmail, String orderNumber, String amount) {
        String userBody = "Hi,\n\n"
                + "An amount of Rs. " + amount + " has been credited to your Strydeeva wallet"
                + (orderNumber != null && !orderNumber.isBlank() ? " for order " + orderNumber : "")
                + ".\n\n"
                + "Team Strydeeva";
        sendEmailSafe(customerEmail, "Wallet Credited", userBody);

        String adminBody = "Wallet credit processed.\n\n"
                + "Customer: " + customerEmail + "\n"
                + "Order: " + (orderNumber == null ? "-" : orderNumber) + "\n"
                + "Amount: Rs. " + amount;
        sendEmailSafe(adminEmail, "Wallet Credit Processed", adminBody);
    }

    private void sendEmailSafe(String to, String subject, String body) {
        if (to == null || to.isBlank() || mailSender == null) return;
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception ignored) {
            // Keep primary flow working even if mail config is missing.
        }
    }
}

