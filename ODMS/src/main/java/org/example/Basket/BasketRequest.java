package org.example.Basket;

import jakarta.validation.constraints.*;
import org.example.ModifierOption.ModifierOption;

import java.math.BigDecimal;
import java.util.List;

public class BasketRequest {
    private Long userId;


    private Long catalogId;



    private Long comboId;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Stock must be at least 0")
    private Integer quantity;

    @NotNull(message = "Subtotal is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Price must not exceed 1,000,000")
    private BigDecimal subtotal;


    private List<Long> modifierOptionIds;


    @Size(max = 500, message = "Special instructions must not exceed 500 characters")
    private String specialInstructions;


    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getCatalogId() {
        return catalogId;
    }

    public void setCatalogId(Long catalogId) {
        this.catalogId = catalogId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }


    public List<Long> getModifierOptionIds() {
        return modifierOptionIds;
    }

    public void setModifierOptionIds(List<Long> modifierOptionIds) {
        this.modifierOptionIds = modifierOptionIds;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public Long getComboId() {
        return comboId;
    }

    public void setComboId(Long comboId) {
        this.comboId = comboId;
    }
}
