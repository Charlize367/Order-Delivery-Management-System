package org.example.PromoCode;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.example.Orders.Orders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class PromoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long promoCodeId;

    @NotBlank(message = "Code cannot be blank")
    @Size(min = 1, max = 50, message = "Code must have at least 1-50 characters")
    private String code;


    @Enumerated(EnumType.STRING)
    @NotNull(message = "Discount type cannot be blank")
    private DiscountType discountType;

    @Column(nullable = false, precision = 10, scale = 2)
    @DecimalMin(value = "0.00", message = "Discount value must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Discount value must not exceed 1,000,000")
    private BigDecimal discountValue;

    @NotNull
    private LocalDateTime expiryDate;


    @NotNull
    private LocalDateTime startDate;

    @NotNull(message = "Usage limit is required")
    @Min(value = 1, message = "Usage limit must be at least 1")
    @Max(value = 1000, message = "Usage limit is too large")
    private Integer usageLimit;

    @NotNull
    @Min(0)
    private Integer usedCount;

    private boolean active;

    @Column(nullable = false, precision = 10, scale = 2)
    @DecimalMin(value = "0.00", message = "Minimum order amount must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Minimum order amount must not exceed 1,000,000")
    private BigDecimal minimumOrderAmount;


    @Column(nullable = false, precision = 10, scale = 2)
    @DecimalMin(value = "0.00", message = "Maximum Discount Amount must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Maximum Discount Amount must not exceed 1,000,000")
    private BigDecimal maximumDiscountAmount;

    private String description;

    @OneToMany(mappedBy = "promoCode", fetch=FetchType.LAZY)
    private List<Orders> orders;



    public PromoCode(){}

    public PromoCode(Long promoCodeId, String code, DiscountType discountType, BigDecimal discountValue, LocalDateTime expiryDate, LocalDateTime startDate, Integer usageLimit, Integer usedCount, boolean active, BigDecimal minimumOrderAmount, BigDecimal maximumDiscountAmount, String description) {
        this.promoCodeId = promoCodeId;
        this.code = code;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.expiryDate = expiryDate;
        this.startDate = startDate;
        this.usageLimit = usageLimit;
        this.usedCount = usedCount;
        this.active = active;
        this.minimumOrderAmount = minimumOrderAmount;
        this.maximumDiscountAmount = maximumDiscountAmount;
        this.description = description;
    }


    public Long getPromoCodeId() {
        return promoCodeId;
    }

    public void setPromoCodeId(Long promoCodeId) {
        this.promoCodeId = promoCodeId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public Integer getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }

    public Integer getUsedCount() {
        return usedCount;
    }

    public void setUsedCount(Integer usedCount) {
        this.usedCount = usedCount;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public BigDecimal getMinimumOrderAmount() {
        return minimumOrderAmount;
    }

    public void setMinimumOrderAmount(BigDecimal minimumOrderAmount) {
        this.minimumOrderAmount = minimumOrderAmount;
    }

    public BigDecimal getMaximumDiscountAmount() {
        return maximumDiscountAmount;
    }

    public void setMaximumDiscountAmount(BigDecimal maximumDiscountAmount) {
        this.maximumDiscountAmount = maximumDiscountAmount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

}
