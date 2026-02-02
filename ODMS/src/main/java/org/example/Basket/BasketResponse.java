package org.example.Basket;

import org.example.Catalog.CatalogResponse;
import org.example.Users.UserResponse;

public class BasketResponse {

    private Long basketId;
    private UserResponse customer;
    private CatalogResponse catalog;
    private Integer quantity;
    private Double subtotal;


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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }
}
