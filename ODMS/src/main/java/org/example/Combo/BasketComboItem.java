package org.example.Combo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.example.Basket.Basket;
import org.example.Catalog.Catalog;
import org.example.ModifierOption.ModifierOption;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "basket_combo_item")
public class BasketComboItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long basketComboItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "basket_id", nullable = false)
    private Basket basket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    private Catalog catalog;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(nullable = false)
    private Integer quantity;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "basket_combo_item_modifier_options",
            joinColumns = @JoinColumn(name = "basket_combo_item_id"),
            inverseJoinColumns = @JoinColumn(name = "modifier_option_id")
    )
    private List<ModifierOption> modifierOptions = new ArrayList<>();

    public BasketComboItem() {
    }

    public Long getBasketComboItemId() {
        return basketComboItemId;
    }

    public void setBasketComboItemId(Long basketComboItemId) {
        this.basketComboItemId = basketComboItemId;
    }

    public Basket getBasket() {
        return basket;
    }

    public void setBasket(Basket basket) {
        this.basket = basket;
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

    public List<ModifierOption> getModifierOptions() {
        return modifierOptions;
    }

    public void setModifierOptions(List<ModifierOption> modifierOptions) {
        this.modifierOptions = modifierOptions;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BasketComboItem)) return false;
        BasketComboItem that = (BasketComboItem) o;
        return basketComboItemId != null &&
                basketComboItemId.equals(that.basketComboItemId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
