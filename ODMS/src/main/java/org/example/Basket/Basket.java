package org.example.Basket;


import jakarta.persistence.*;
import org.example.Catalog.Catalog;
import org.example.Users.Users;

import java.util.Objects;

@Entity
public class Basket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long basketId;

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name = "user_ID", nullable = false)
    private Users customer;

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name = "catalog_ID", nullable = false)
    private Catalog catalog;

    private Integer quantity;

    private Double subtotal;


    public Basket(Long basketId, Users customer, Catalog catalog, Integer quantity, Double subtotal) {
        this.basketId = basketId;
        this.customer = customer;
        this.catalog = catalog;
        this.quantity = quantity;
        this.subtotal = subtotal;
    }


    public Basket(){}


    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Long getBasketId() {
        return basketId;
    }

    public void setBasketId(Long basketId) {
        this.basketId = basketId;
    }

    public Catalog getCatalog() {
        return catalog;
    }

    public void setCatalog(Catalog catalog) {
        this.catalog = catalog;
    }

    public Users getCustomer() {
        return customer;
    }

    public void setCustomer(Users customer) {
        this.customer = customer;
    }
    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Basket basket = (Basket) o;
        return Objects.equals(basketId, basket.basketId) && Objects.equals(customer, basket.customer) && Objects.equals(catalog, basket.catalog) && Objects.equals(quantity, basket.quantity) && Objects.equals(subtotal, basket.subtotal);
    }

    @Override
    public int hashCode() {
        return Objects.hash(basketId, customer, catalog, quantity, subtotal);
    }


}
