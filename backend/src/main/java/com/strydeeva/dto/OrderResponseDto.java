package com.strydeeva.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class OrderResponseDto {
    private Long id;
    private String orderNumber;
    private String customerEmail;
    private String customerMobile;
    private String customerName;
    private String shippingAddress;
    private String city;
    private String pinCode;
    private String gstNumber;
    private String promoCode;
    private BigDecimal promoDiscount;
    private BigDecimal shippingFee;
    private BigDecimal codCharge;
    private BigDecimal gstAmount;
    private BigDecimal walletDiscount;
    private BigDecimal totalAmount;
    private String awbNumber;
    private String invoiceToken;
    private String status;
    /** Checkout / tender type, e.g. {@code cod}, {@code wallet}, {@code upi}. */
    private String paymentMethod;
    /** Gateway when prepaid, e.g. {@code easebuzz}. */
    private String paymentProvider;
    private Instant createdAt;
    private List<OrderItemDto> items = new ArrayList<>();

    public static class OrderItemDto {
        private String productName;
        private String sizeName;
        private int quantity;
        private BigDecimal unitPrice;
        private Long customSizeId;
        /** Set when the line item is linked to a catalog product (for thumbnail URL). */
        private Long productId;
        /** First catalog image, e.g. {@code /api/products/12/image/0}; null if no product id. */
        private String productImageUrl;

        public OrderItemDto() {}

        public OrderItemDto(
                String productName,
                String sizeName,
                int quantity,
                BigDecimal unitPrice,
                Long customSizeId,
                Long productId,
                String productImageUrl) {
            this.productName = productName;
            this.sizeName = sizeName;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.customSizeId = customSizeId;
            this.productId = productId;
            this.productImageUrl = productImageUrl;
        }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public String getSizeName() { return sizeName; }
        public void setSizeName(String sizeName) { this.sizeName = sizeName; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public Long getCustomSizeId() { return customSizeId; }
        public void setCustomSizeId(Long customSizeId) { this.customSizeId = customSizeId; }
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getProductImageUrl() { return productImageUrl; }
        public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getCustomerMobile() { return customerMobile; }
    public void setCustomerMobile(String customerMobile) { this.customerMobile = customerMobile; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPinCode() { return pinCode; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }
    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }
    public String getPromoCode() { return promoCode; }
    public void setPromoCode(String promoCode) { this.promoCode = promoCode; }
    public BigDecimal getPromoDiscount() { return promoDiscount; }
    public void setPromoDiscount(BigDecimal promoDiscount) { this.promoDiscount = promoDiscount; }
    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }
    public BigDecimal getCodCharge() { return codCharge; }
    public void setCodCharge(BigDecimal codCharge) { this.codCharge = codCharge; }
    public BigDecimal getGstAmount() { return gstAmount; }
    public void setGstAmount(BigDecimal gstAmount) { this.gstAmount = gstAmount; }
    public BigDecimal getWalletDiscount() { return walletDiscount; }
    public void setWalletDiscount(BigDecimal walletDiscount) { this.walletDiscount = walletDiscount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getAwbNumber() { return awbNumber; }
    public void setAwbNumber(String awbNumber) { this.awbNumber = awbNumber; }
    public String getInvoiceToken() { return invoiceToken; }
    public void setInvoiceToken(String invoiceToken) { this.invoiceToken = invoiceToken; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentProvider() { return paymentProvider; }
    public void setPaymentProvider(String paymentProvider) { this.paymentProvider = paymentProvider; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items != null ? items : new ArrayList<>(); }
}
