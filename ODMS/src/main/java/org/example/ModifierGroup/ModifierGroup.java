package org.example.ModifierGroup;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.example.Catalog.Catalog;
import org.example.Category.Category;
import org.example.ModifierOption.ModifierOption;
import org.example.Orders.Orders;

import java.util.List;
import java.util.Objects;

@Entity
public class ModifierGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long modifierGroupId;

    @NotBlank(message = "Name cannot be blank")
    @Size(min = 1, max = 50, message = "Name must have at least 1-50 characters")
    private String name;

    private boolean required;

    @NotNull(message = "Minimum selections is required")
    @Min(value = 0, message = "Minimum selections cannot be negative")
    @Max(value = 1000, message = "Minimum selections is too large")
    private Integer minSelections;

    @NotNull(message = "Maximum selections is required")
    @Min(value = 1, message = "Maximum selections must be at least 1")
    @Max(value = 1000, message = "Maximum selections is too large")
    private Integer maxSelections;

    @ManyToOne( fetch=FetchType.LAZY)
    @JoinColumn(name = "catalog_ID")
    private Catalog catalog;

    @OneToMany(mappedBy = "modifierGroup", fetch=FetchType.LAZY)
    private List<ModifierOption> modifierOptions;

    private boolean active;


    public ModifierGroup(Long modifierGroupId, String name, boolean required, Integer minSelections, Integer maxSelections, Catalog catalog, List<ModifierOption> modifierOptions, boolean active) {
        this.modifierGroupId = modifierGroupId;
        this.name = name;
        this.required = required;
        this.minSelections = minSelections;
        this.maxSelections = maxSelections;
        this.catalog = catalog;
        this.modifierOptions = modifierOptions;
        this.active = active;
    }

    public ModifierGroup(){}

    public Long getModifierGroupId() {
        return modifierGroupId;
    }

    public void setModifierGroupId(Long modifierGroupId) {
        this.modifierGroupId = modifierGroupId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    public Integer getMinSelections() {
        return minSelections;
    }

    public void setMinSelections(Integer minSelections) {
        this.minSelections = minSelections;
    }

    public Integer getMaxSelections() {
        return maxSelections;
    }

    public void setMaxSelections(Integer maxSelections) {
        this.maxSelections = maxSelections;
    }

    public Catalog getCatalog() {
        return catalog;
    }

    public void setCatalog(Catalog catalog) {
        this.catalog = catalog;
    }

    public List<ModifierOption> getModifierOptions() {
        return modifierOptions;
    }

    public void setModifierOptions(List<ModifierOption> modifierOptions) {
        this.modifierOptions = modifierOptions;
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
        ModifierGroup that = (ModifierGroup) o;
        return required == that.required && active == that.active && Objects.equals(modifierGroupId, that.modifierGroupId) && Objects.equals(name, that.name) && Objects.equals(minSelections, that.minSelections) && Objects.equals(maxSelections, that.maxSelections) && Objects.equals(catalog, that.catalog) && Objects.equals(modifierOptions, that.modifierOptions);
    }

    @Override
    public int hashCode() {
        return Objects.hash(modifierGroupId, name, required, minSelections, maxSelections, catalog, modifierOptions, active);
    }
}
