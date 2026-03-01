package com.strydeeva.dto;

public class CustomSizeRequestDto {

    private String bust;
    private String waist;
    private String hip;
    private String shoulder;
    private String armhole;
    private String sleeveLength;
    private String sleeveRoundBicep;
    private String height;

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

    public static String trim(String s) {
        return s != null ? s.trim() : "";
    }
}
