package com.strydeeva.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "return_request")
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", length = 255, nullable = false)
    private String customerName;

    @Column(name = "contact_number", length = 50, nullable = false)
    private String contactNumber;

    @Column(name = "email", length = 255, nullable = false)
    private String email;

    @Column(name = "order_id_text", length = 100, nullable = false)
    private String orderId;

    @Column(name = "issue_text", columnDefinition = "TEXT", nullable = false)
    private String issueText;

    @Column(name = "video_content_type", length = 120)
    private String videoContentType;

    @Column(name = "video_path", length = 500)
    private String videoPath;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public String getIssueText() { return issueText; }
    public void setIssueText(String issueText) { this.issueText = issueText; }
    public String getVideoContentType() { return videoContentType; }
    public void setVideoContentType(String videoContentType) { this.videoContentType = videoContentType; }
    public String getVideoPath() { return videoPath; }
    public void setVideoPath(String videoPath) { this.videoPath = videoPath; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

