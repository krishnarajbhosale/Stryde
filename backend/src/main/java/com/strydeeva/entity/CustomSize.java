package com.strydeeva.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "custom_size")
public class CustomSize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bust", length = 20)
    private String bust;

    @Column(name = "waist", length = 20)
    private String waist;

    @Column(name = "hip", length = 20)
    private String hip;

    @Column(name = "shoulder", length = 20)
    private String shoulder;

    @Column(name = "armhole", length = 20)
    private String armhole;

    @Column(name = "sleeve_length", length = 20)
    private String sleeveLength;

    @Column(name = "sleeve_round_bicep", length = 20)
    private String sleeveRoundBicep;

    @Column(name = "height", length = 20)
    private String height;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public CustomSize() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
