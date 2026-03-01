package com.strydeeva.dto;

public class SizeQuantityDto {
    private String sizeName;
    private int quantity;

    public SizeQuantityDto() {}

    public SizeQuantityDto(String sizeName, int quantity) {
        this.sizeName = sizeName;
        this.quantity = quantity;
    }

    public String getSizeName() { return sizeName; }
    public void setSizeName(String sizeName) { this.sizeName = sizeName; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
