package com.strydeeva.dto;

import jakarta.validation.constraints.NotBlank;

public class CustomSizeRequestDto {

    @NotBlank(message = "Bust is required")
    private String bust;

    @NotBlank(message = "Waist is required")
    private String waist;

    @NotBlank(message = "Hip is required")
    private String hip;

    @NotBlank(message = "Shoulder is required")
    private String shoulder;

    @NotBlank(message = "Armhole is required")
    private String armhole;

    @NotBlank(message = "Sleeve length is required")
    private String sleeveLength;

    @NotBlank(message = "Sleeve round (bicep) is required")
    private String sleeveRoundBicep;

    @NotBlank(message = "Height is required")
    private String height;

    @NotBlank(message = "Remark is required")
    private String remark;

    public String getBust() { return bust; }
    public void setBust(String bust) { this.bust = bust; }
    public String getWaist() { return waist; }
    public void setWaist(String waist) { this.waist = waist; }
    public String getHip() { return hip; }
    public void setHip(String hip) { this.hip = hip; }
    public String getShoulder() { return shoulder; }
    public void setShoulder(String shoulder) { this.shoulder = shoulder; }
    public String getArmhole() { return armhole; }
    public void setArmhole(String armhole) { this.armhole = armhole; }
    public String getSleeveLength() { return sleeveLength; }
    public void setSleeveLength(String sleeveLength) { this.sleeveLength = sleeveLength; }
    public String getSleeveRoundBicep() { return sleeveRoundBicep; }
    public void setSleeveRoundBicep(String sleeveRoundBicep) { this.sleeveRoundBicep = sleeveRoundBicep; }
    public String getHeight() { return height; }
    public void setHeight(String height) { this.height = height; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    public static String trim(String s) {
        return s != null ? s.trim() : "";
    }
}
