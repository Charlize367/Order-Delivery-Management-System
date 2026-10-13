package org.example.Basket;

import org.example.Catalog.CatalogResponse;
import org.example.ModifierOption.ModifierOptionResponse;

import java.util.List;

public class BasketComboItemResponse {

    private Long comboItemId;
    private CatalogResponse catalog;
    private Integer quantity;
    private List<ModifierOptionResponse> modifierOptions;


    public Long getComboItemId() {
        return comboItemId;
    }

    public void setComboItemId(Long comboItemId) {
        this.comboItemId = comboItemId;
    }

    public CatalogResponse getCatalog() {
        return catalog;
    }

    public void setCatalog(CatalogResponse catalog) {
        this.catalog = catalog;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public List<ModifierOptionResponse> getModifierOptions() {
        return modifierOptions;
    }

    public void setModifierOptions(List<ModifierOptionResponse> modifierOptions) {
        this.modifierOptions = modifierOptions;
    }
}