package org.example.ModifierOption;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.example.Catalog.Catalog;
import org.example.ModifierGroup.ModifierGroup;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Entity
public class ModifierOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long modifierOptionId;

    @NotBlank(message = "Name cannot be blank")
    @Size(min = 1, max = 50, message = "Name must have at least 1-50 characters")
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    @DecimalMax(value = "1000000.00", message = "Price adjustment must not exceed 1,000,000")
    private BigDecimal priceAdjustment;

    @ManyToOne( fetch=FetchType.LAZY)
    @JoinColumn(name = "modifier_group_ID")
    private ModifierGroup modifierGroup;

    private boolean active;

    public ModifierOption(){}
    public ModifierOption(Long modifierOptionId, String name, BigDecimal priceAdjustment, ModifierGroup modifierGroup, boolean active) {
        this.modifierOptionId = modifierOptionId;
        this.name = name;
        this.priceAdjustment = priceAdjustment;
        this.modifierGroup = modifierGroup;
        this.active = active;
    }


    public Long getModifierOptionId() {
        return modifierOptionId;
    }

    public void setModifierOptionId(Long modifierOptionId) {
        this.modifierOptionId = modifierOptionId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPriceAdjustment() {
        return priceAdjustment;
    }

    public void setPriceAdjustment(BigDecimal priceAdjustment) {
        this.priceAdjustment = priceAdjustment;
    }

    public ModifierGroup getModifierGroup() {
        return modifierGroup;
    }

    public void setModifierGroup(ModifierGroup modifierGroup) {
        this.modifierGroup = modifierGroup;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        ModifierOption that = (ModifierOption) o;
        return active == that.active && Objects.equals(modifierOptionId, that.modifierOptionId) && Objects.equals(name, that.name) && Objects.equals(priceAdjustment, that.priceAdjustment) && Objects.equals(modifierGroup, that.modifierGroup);
    }

    @Override
    public int hashCode() {
        return Objects.hash(modifierOptionId, name, priceAdjustment, modifierGroup, active);
    }
}
