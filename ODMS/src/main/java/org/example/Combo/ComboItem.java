package org.example.Combo;

import jakarta.persistence.*;
import org.example.Catalog.Catalog;

import java.util.Objects;

@Entity
@Table(name = "combo_items")
public class ComboItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long comboItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "combo_id", nullable = false)
    private Combo combo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    private Catalog catalog;

    @Column(nullable = false)
    private Integer quantity;


    // Required by JPA
    public ComboItem() {
    }


    // Constructor
    public ComboItem(
            Long comboItemId,
            Combo combo,
            Catalog catalog,
            Integer quantity
    ) {
        this.comboItemId = comboItemId;
        this.combo = combo;
        this.catalog = catalog;
        this.quantity = quantity;
    }


    public Long getComboItemId() {
        return comboItemId;
    }

    public void setComboItemId(Long comboItemId) {
        this.comboItemId = comboItemId;
    }


    public Combo getCombo() {
        return combo;
    }

    public void setCombo(Combo combo) {
        this.combo = combo;
    }


    public Catalog getCatalog() {
        return catalog;
    }

    public void setCatalog(Catalog catalog) {
        this.catalog = catalog;
    }


    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }


    @Override
    public boolean equals(Object o) {

        if (this == o) {
            return true;
        }

        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ComboItem comboItem = (ComboItem) o;

        return Objects.equals(comboItemId, comboItem.comboItemId);
    }


    @Override
    public int hashCode() {
        return Objects.hash(comboItemId);
    }


    @Override
    public String toString() {
        return "ComboItem{" +
                "comboItemId=" + comboItemId +
                ", catalog=" +
                (catalog != null ? catalog.getCatalogId() : null) +
                ", quantity=" + quantity +
                '}';
    }
}