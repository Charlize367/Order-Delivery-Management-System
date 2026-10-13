package org.example.Basket;

import org.example.Catalog.CatalogResponse;
import org.example.Combo.ComboResponse;
import org.example.ModifierOption.ModifierOptionResponse;
import org.example.Users.UserResponse;

import java.math.BigDecimal;
import java.util.List;

public class BasketResponse {

    private Long basketId;
    private UserResponse customer;

    private CatalogResponse catalog;
    private ComboResponse combo;

    private Integer quantity;
    private BigDecimal subtotal;
    private String specialInstructions;

    private List<ModifierOptionResponse> modifierOptions;
    private List<BasketComboItemResponse> comboItems;


    public Long getBasketId() {
        return basketId;
    }

    public void setBasketId(Long basketId) {
        this.basketId = basketId;
    }

    public UserResponse getCustomer() {
        return customer;
    }

    public void setCustomer(UserResponse customer) {
        this.customer = customer;
    }

    public CatalogResponse getCatalog() {
        return catalog;
    }

    public void setCatalog(CatalogResponse catalog) {
        this.catalog = catalog;
    }

    public ComboResponse getCombo() {
        return combo;
    }

    public void setCombo(ComboResponse combo) {
        this.combo = combo;
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

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public List<ModifierOptionResponse> getModifierOptions() {
        return modifierOptions;
    }

    public void setModifierOptions(List<ModifierOptionResponse> modifierOptions) {
        this.modifierOptions = modifierOptions;
    }

    public List<BasketComboItemResponse> getComboItems() {
        return comboItems;
    }

    public void setComboItems(List<BasketComboItemResponse> comboItems) {
        this.comboItems = comboItems;
    }
}