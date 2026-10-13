package org.example.Combo;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "combos")
public class Combo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long comboId;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal bundlePrice;

    @Column(nullable = false)
    private boolean active;

    @OneToMany(
            mappedBy = "combo",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ComboItem> comboItems = new ArrayList<>();


    // No-argument constructor required by JPA
    public Combo() {
    }


    // Constructor
    public Combo(
            Long comboId,
            String name,
            String description,
            BigDecimal bundlePrice,
            boolean active,
            List<ComboItem> comboItems
    ) {
        this.comboId = comboId;
        this.name = name;
        this.description = description;
        this.bundlePrice = bundlePrice;
        this.active = active;
        this.comboItems = comboItems;
    }


    public Long getComboId() {
        return comboId;
    }

    public void setComboId(Long comboId) {
        this.comboId = comboId;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public BigDecimal getBundlePrice() {
        return bundlePrice;
    }

    public void setBundlePrice(BigDecimal bundlePrice) {
        this.bundlePrice = bundlePrice;
    }


    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }


    public List<ComboItem> getComboItems() {
        return comboItems;
    }

    public void setComboItems(List<ComboItem> comboItems) {
        this.comboItems = comboItems;
    }


    // Convenience method
    public void addComboItem(ComboItem comboItem) {
        comboItems.add(comboItem);
        comboItem.setCombo(this);
    }


    public void removeComboItem(ComboItem comboItem) {
        comboItems.remove(comboItem);
        comboItem.setCombo(null);
    }


    @Override
    public boolean equals(Object o) {

        if (this == o) {
            return true;
        }

        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        Combo combo = (Combo) o;

        return Objects.equals(comboId, combo.comboId);
    }


    @Override
    public int hashCode() {
        return Objects.hash(comboId);
    }


    @Override
    public String toString() {
        return "Combo{" +
                "comboId=" + comboId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", bundlePrice=" + bundlePrice +
                ", active=" + active +
                '}';
    }
}